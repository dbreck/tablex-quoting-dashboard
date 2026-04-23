import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  type Task,
  type TeamMember,
  type DeliverableOverride,
  seedTaskId,
} from "@/data/project-tracker";
import { DELIVERABLES } from "@/data/project-phase2";
import {
  type SyncLink,
  type SyncLogEntry,
  taskToInsertRow,
  teamMemberToInsertRow,
  overrideToUpsertRow,
  syncLinkToUpsertRow,
  syncLogEntryToInsertRow,
} from "@/lib/supabase/tracker-converters";

interface ImportPayload {
  tasks?: Task[];
  teamMembers?: Record<string, TeamMember>;
  deliverableOverrides?: Record<string, DeliverableOverride>;
  syncState?: Record<string, SyncLink>;
  syncLog?: SyncLogEntry[];
  baselinedAt?: string | null;
  isInitialized?: boolean;
}

export async function POST(request: Request) {
  // Auth: require a logged-in admin. The import route overwrites server state,
  // so it's gated more tightly than `can_access_proposal` reads/writes.
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const { data: callerProfile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || callerProfile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Parse payload (Zustand persist stores `{state, version}` — caller passes `state`).
  let payload: ImportPayload;
  try {
    payload = (await request.json()) as ImportPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const tasks = Array.isArray(payload.tasks) ? payload.tasks : [];
  const teamMembers = payload.teamMembers ?? {};
  const deliverableOverrides = payload.deliverableOverrides ?? {};
  const syncState = payload.syncState ?? {};
  const syncLog = Array.isArray(payload.syncLog) ? payload.syncLog : [];
  const baselinedAt = payload.baselinedAt ?? null;

  // ─── ID rewrite (mirrors v6 store migrate at project-tracker-store.ts:568-606) ──
  // For each task, if deliverableId matches a real deliverable AND title matches
  // one of `deliverable.requirements[i]`, rewrite task.id to seedTaskId(deliverableId, i).
  // Build a Map<oldId, newId>, then rewrite syncState keys in lock-step.
  // Tasks without a requirement match keep their existing id (user-created or renamed).
  const idRewrites = new Map<string, string>();
  const rewrittenTasks = tasks.map((task) => {
    const deliverable = DELIVERABLES.find((d) => d.id === task.deliverableId);
    if (!deliverable) return task;
    const idx = deliverable.requirements.indexOf(task.title);
    if (idx === -1) return task;
    const newId = seedTaskId(deliverable.id, idx);
    if (newId === task.id) return task;
    idRewrites.set(task.id, newId);
    return { ...task, id: newId };
  });

  let rewrittenSyncState: Record<string, SyncLink> = syncState;
  if (idRewrites.size > 0) {
    rewrittenSyncState = {};
    for (const [oldId, link] of Object.entries(syncState)) {
      rewrittenSyncState[idRewrites.get(oldId) ?? oldId] = link;
    }
  }

  // ─── Convert to row shapes via shared converters ────────────────────────────

  const teamMemberRows = Object.values(teamMembers).map(teamMemberToInsertRow);
  const taskRows = rewrittenTasks.map(taskToInsertRow);
  const overrideRows = Object.values(deliverableOverrides).map(overrideToUpsertRow);
  const syncLinkRows = Object.entries(rewrittenSyncState).map(([tableXId, link]) =>
    syncLinkToUpsertRow(tableXId, link),
  );
  const syncLogRows = syncLog.map(syncLogEntryToInsertRow);

  // ─── Upsert in dependency order ─────────────────────────────────────────────
  // Order matters: project_tasks.assignee FKs team_members(id), so team_members
  // must land first. Everything else is independent.

  const errors: Array<{ slice: string; message: string }> = [];

  if (teamMemberRows.length > 0) {
    const { error } = await adminClient
      .from("team_members")
      .upsert(teamMemberRows, { onConflict: "id" });
    if (error) errors.push({ slice: "team_members", message: error.message });
  }

  if (taskRows.length > 0) {
    const { error } = await adminClient
      .from("project_tasks")
      .upsert(taskRows, { onConflict: "id" });
    if (error) errors.push({ slice: "project_tasks", message: error.message });
  }

  if (overrideRows.length > 0) {
    const { error } = await adminClient
      .from("deliverable_overrides")
      .upsert(overrideRows, { onConflict: "deliverable_id" });
    if (error) errors.push({ slice: "deliverable_overrides", message: error.message });
  }

  if (syncLinkRows.length > 0) {
    const { error } = await adminClient
      .from("sync_links")
      .upsert(syncLinkRows, { onConflict: "table_x_id" });
    if (error) errors.push({ slice: "sync_links", message: error.message });
  }

  // sync_log is append-only audit; bigserial id assigned by DB.
  if (syncLogRows.length > 0) {
    const { error } = await adminClient.from("sync_log").insert(syncLogRows);
    if (error) errors.push({ slice: "sync_log", message: error.message });
  }

  if (baselinedAt) {
    const { error } = await adminClient.from("tracker_meta").upsert(
      { key: "baselinedAt", value: baselinedAt },
      { onConflict: "key" },
    );
    if (error) errors.push({ slice: "tracker_meta", message: error.message });
  }

  if (errors.length > 0) {
    return NextResponse.json(
      {
        error: "One or more slices failed to import",
        errors,
        partial: {
          teamMembers: teamMemberRows.length,
          tasks: taskRows.length,
          deliverableOverrides: overrideRows.length,
          syncLinks: syncLinkRows.length,
          syncLog: syncLogRows.length,
          idsRewritten: idRewrites.size,
        },
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    teamMembers: teamMemberRows.length,
    tasks: taskRows.length,
    deliverableOverrides: overrideRows.length,
    syncLinks: syncLinkRows.length,
    syncLog: syncLogRows.length,
    idsRewritten: idRewrites.size,
    baselinedAt: baselinedAt ? 1 : 0,
  });
}
