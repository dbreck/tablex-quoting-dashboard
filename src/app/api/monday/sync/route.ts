import { NextResponse } from "next/server";
import { reconcile } from "@/lib/monday/reconcile";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  rowToTask,
  rowToOverride,
  rowToSyncLink,
  rowToTeamMember,
  taskUpdatesToRow,
  overrideToUpsertRow,
  syncLinkToUpsertRow,
  syncLogEntryToInsertRow,
  type TaskRow,
  type DeliverableOverrideRow,
  type SyncLinkRow,
  type TeamMemberRow,
  type SyncLink,
} from "@/lib/supabase/tracker-converters";
import type { Task, TeamMember, DeliverableOverride } from "@/data/project-tracker";

export const dynamic = "force-dynamic";

/**
 * POST /api/monday/sync
 *
 * Server-driven Monday reconcile. Body is ignored — the route reads the
 * current TableX state from Supabase, runs reconcile(), and writes any
 * pulled patches / link updates / log entries back to Supabase.
 *
 * The client refetches via `fetchAllTrackerData()` afterwards (Realtime is
 * the bonus path).
 *
 * Auth: any authenticated user with can_access_proposal = true.
 */
export async function POST() {
  // ── Auth: caller must be authenticated AND have can_access_proposal = true.
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("can_access_proposal")
    .eq("id", user.id)
    .single();
  if (profileError || !profile?.can_access_proposal) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── Load the current snapshot from Supabase (admin client; RLS bypass).
  let tasks: Task[];
  let deliverableOverrides: Record<string, DeliverableOverride>;
  let syncState: Record<string, SyncLink>;
  let teamMembers: Record<string, TeamMember>;
  try {
    const [tasksRes, overridesRes, linksRes, membersRes] = await Promise.all([
      admin.from("project_tasks").select("*"),
      admin.from("deliverable_overrides").select("*"),
      admin.from("sync_links").select("*"),
      admin.from("team_members").select("*"),
    ]);
    for (const res of [tasksRes, overridesRes, linksRes, membersRes]) {
      if (res.error) throw res.error;
    }

    tasks = (tasksRes.data as TaskRow[]).map(rowToTask);

    deliverableOverrides = {};
    for (const row of overridesRes.data as DeliverableOverrideRow[]) {
      deliverableOverrides[row.deliverable_id] = rowToOverride(row);
    }

    syncState = {};
    for (const row of linksRes.data as SyncLinkRow[]) {
      syncState[row.table_x_id] = rowToSyncLink(row);
    }

    teamMembers = {};
    for (const row of membersRes.data as TeamMemberRow[]) {
      teamMembers[row.id] = rowToTeamMember(row);
    }
  } catch (err) {
    return NextResponse.json(
      { error: `Snapshot load failed: ${(err as Error).message}` },
      { status: 500 },
    );
  }

  // ── Reconcile (pure function of inputs + Monday board state).
  let result;
  try {
    result = await reconcile({
      tasks,
      deliverableOverrides,
      syncState,
      teamMembers,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Reconcile failed" },
      { status: 500 },
    );
  }

  // ── Write reconcile output back to Supabase.
  //
  // No transaction: Supabase JS has no client-side tx support, so we accept
  // a best-effort consistency window. Order matches the old applySyncPatches
  // in the store — task patches → override patches → sync link touches →
  // log entries.
  const { syncedAt } = result;
  const writeErrors: string[] = [];

  // Pulled task patches: bump updated_at to syncedAt so the next reconcile
  // sees the row as in-sync rather than locally edited. (Requires the
  // updated_at trigger to skip when the column is explicitly set — see
  // migration 015.)
  for (const { taskId, patch } of result.taskPatches) {
    const row = {
      ...taskUpdatesToRow(patch),
      updated_at: syncedAt,
    };
    const { error } = await admin
      .from("project_tasks")
      .update(row)
      .eq("id", taskId);
    if (error) {
      writeErrors.push(`Update task ${taskId} failed: ${error.message}`);
    }
  }

  // Pulled override patches: upsert merged override.
  for (const { deliverableId, patch } of result.overridePatches) {
    const merged: DeliverableOverride = {
      ...(deliverableOverrides[deliverableId] ?? { deliverableId }),
      ...patch,
    };
    const { error } = await admin
      .from("deliverable_overrides")
      .upsert(overrideToUpsertRow(merged), { onConflict: "deliverable_id" });
    if (error) {
      writeErrors.push(
        `Upsert override ${deliverableId} failed: ${error.message}`,
      );
    }
  }

  // Sync-link touches. Mirrors applySyncPatches in the old store: every
  // pulled / pushed / linked record gets its lastSyncedAt + lastMondayUpdatedAt
  // refreshed. Pushed records use syncedAt as the Monday-side timestamp
  // (we don't refetch Monday after push); next pull reconciles it.
  const linkUpdates = new Map<
    string,
    { mondayItemId: string; mondayUpdatedAt: string | null }
  >();
  const recordTouch = (
    tableXId: string,
    mondayItemId: string,
    mondayUpdatedAt: string | null,
  ) => {
    linkUpdates.set(tableXId, { mondayItemId, mondayUpdatedAt });
  };

  for (const p of result.taskPatches) {
    recordTouch(p.taskId, p.mondayItemId, p.mondayUpdatedAt);
  }
  for (const p of result.overridePatches) {
    recordTouch(p.deliverableId, p.mondayItemId, p.mondayUpdatedAt);
  }
  for (const l of result.linkUpdates) {
    recordTouch(l.tableXId, l.mondayItemId, l.mondayUpdatedAt);
  }
  // Pushed records: pull mondayItemId from the existing sync link or from a
  // freshly recorded touch (auto-created tasks land in linkUpdates above).
  const resolveMondayItemId = (tableXId: string): string | null =>
    linkUpdates.get(tableXId)?.mondayItemId ??
    syncState[tableXId]?.mondayItemId ??
    null;

  for (const taskId of result.pushedTaskIds) {
    const mondayItemId = resolveMondayItemId(taskId);
    if (mondayItemId) recordTouch(taskId, mondayItemId, syncedAt);
  }
  for (const deliverableId of result.pushedDeliverableIds) {
    const mondayItemId = resolveMondayItemId(deliverableId);
    if (mondayItemId) recordTouch(deliverableId, mondayItemId, syncedAt);
  }

  if (linkUpdates.size > 0) {
    const rows = Array.from(linkUpdates.entries()).map(([tableXId, v]) => {
      const existing = syncState[tableXId];
      const link: SyncLink = {
        mondayItemId: v.mondayItemId,
        lastSyncedAt: syncedAt,
        lastMondayUpdatedAt:
          v.mondayUpdatedAt ?? existing?.lastMondayUpdatedAt ?? syncedAt,
      };
      return syncLinkToUpsertRow(tableXId, link);
    });
    const { error } = await admin
      .from("sync_links")
      .upsert(rows, { onConflict: "table_x_id" });
    if (error) {
      writeErrors.push(`Upsert sync_links failed: ${error.message}`);
    }
  }

  // Log entries: append-only; trim trigger keeps the table at <=500 rows.
  if (result.log.length > 0) {
    const { error } = await admin
      .from("sync_log")
      .insert(result.log.map(syncLogEntryToInsertRow));
    if (error) {
      writeErrors.push(`Insert sync_log failed: ${error.message}`);
    }
  }

  // ── Shrunk response shape: client refetches the slices, doesn't apply patches.
  const summary = {
    pulled: result.taskPatches.length + result.overridePatches.length,
    pushed: result.pushedTaskIds.length + result.pushedDeliverableIds.length,
    errors: result.errors.length + writeErrors.length,
  };
  return NextResponse.json({
    syncedAt,
    summary,
    errors: [...result.errors, ...writeErrors],
  });
}
