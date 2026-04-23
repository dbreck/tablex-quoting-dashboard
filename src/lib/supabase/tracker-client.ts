// Browser-side CRUD helpers for the project tracker.
//
// All calls go through `createClient()` from `lib/supabase/client.ts` and
// rely on RLS for authorization (`can_access_proposal` for read/write, admin
// for delete). The store calls these as fire-and-forget after applying the
// optimistic local update.
//
// Snake_case ↔ camelCase converters live in `tracker-converters.ts` so
// server-side code (the import + sync routes) can reuse them without
// pulling the browser supabase client.

import { createClient } from "@/lib/supabase/client";
import type {
  Task,
  TeamMember,
  DeliverableOverride,
} from "@/data/project-tracker";
import {
  rowToTask,
  rowToTeamMember,
  rowToOverride,
  rowToSyncLink,
  rowToSyncLogEntry,
  taskToInsertRow,
  taskUpdatesToRow,
  teamMemberToInsertRow,
  teamMemberUpdatesToRow,
  overrideToUpsertRow,
  syncLinkToUpsertRow,
  syncLogEntryToInsertRow,
  type TaskRow,
  type TeamMemberRow,
  type DeliverableOverrideRow,
  type SyncLinkRow,
  type SyncLogRow,
  type TrackerMetaRow,
  type SyncLink,
  type SyncLogEntry,
} from "@/lib/supabase/tracker-converters";

// ─── Snapshot fetch ──────────────────────────────────────────────────────────

export interface TrackerSnapshot {
  tasks: Task[];
  teamMembers: Record<string, TeamMember>;
  deliverableOverrides: Record<string, DeliverableOverride>;
  syncLinks: Record<string, SyncLink>;
  syncLog: SyncLogEntry[];
  baselinedAt: string | null;
}

export async function fetchAllTrackerData(): Promise<TrackerSnapshot> {
  const supabase = createClient();
  const [tasksRes, membersRes, overridesRes, linksRes, logRes, metaRes] =
    await Promise.all([
      supabase.from("project_tasks").select("*").order("sort_order", { ascending: true }),
      supabase.from("team_members").select("*"),
      supabase.from("deliverable_overrides").select("*"),
      supabase.from("sync_links").select("*"),
      supabase.from("sync_log").select("*").order("at", { ascending: false }).limit(50),
      supabase.from("tracker_meta").select("*"),
    ]);

  for (const res of [tasksRes, membersRes, overridesRes, linksRes, logRes, metaRes]) {
    if (res.error) throw res.error;
  }

  const tasks = (tasksRes.data as TaskRow[]).map(rowToTask);

  const teamMembers: Record<string, TeamMember> = {};
  for (const row of membersRes.data as TeamMemberRow[]) {
    teamMembers[row.id] = rowToTeamMember(row);
  }

  const deliverableOverrides: Record<string, DeliverableOverride> = {};
  for (const row of overridesRes.data as DeliverableOverrideRow[]) {
    deliverableOverrides[row.deliverable_id] = rowToOverride(row);
  }

  const syncLinks: Record<string, SyncLink> = {};
  for (const row of linksRes.data as SyncLinkRow[]) {
    syncLinks[row.table_x_id] = rowToSyncLink(row);
  }

  const syncLog = (logRes.data as SyncLogRow[]).map(rowToSyncLogEntry);

  const meta: Record<string, unknown> = {};
  for (const row of metaRes.data as TrackerMetaRow[]) {
    meta[row.key] = row.value;
  }
  const baselinedAt =
    typeof meta.baselinedAt === "string" ? (meta.baselinedAt as string) : null;

  return { tasks, teamMembers, deliverableOverrides, syncLinks, syncLog, baselinedAt };
}

// ─── Single-row refetchers (used by error-recovery refetch in the store) ─────

export async function refetchTask(id: string): Promise<Task | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("project_tasks")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToTask(data as TaskRow) : null;
}

export async function refetchOverride(
  deliverableId: string,
): Promise<DeliverableOverride | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("deliverable_overrides")
    .select("*")
    .eq("deliverable_id", deliverableId)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToOverride(data as DeliverableOverrideRow) : null;
}

export async function refetchTeamMember(id: string): Promise<TeamMember | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToTeamMember(data as TeamMemberRow) : null;
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export async function insertTask(task: Task): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("project_tasks").insert(taskToInsertRow(task));
  if (error) throw error;
}

export async function updateTask(
  id: string,
  updates: Partial<Omit<Task, "id" | "createdAt">>,
): Promise<void> {
  const supabase = createClient();
  const row = taskUpdatesToRow(updates);
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("project_tasks").update(row).eq("id", id);
  if (error) throw error;
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("project_tasks").delete().eq("id", id);
  if (error) throw error;
}

export async function bulkUpdateTasks(
  ids: string[],
  updates: Partial<Omit<Task, "id" | "createdAt">>,
): Promise<void> {
  if (ids.length === 0) return;
  const supabase = createClient();
  const row = taskUpdatesToRow(updates);
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("project_tasks").update(row).in("id", ids);
  if (error) throw error;
}

// ─── Subtasks (inline jsonb on the parent task row) ──────────────────────────

/**
 * Persist the full subtasks array for a task. The store has already updated
 * its local copy; we just sync the new array into the jsonb column.
 */
export async function persistSubtasks(
  taskId: string,
  subtasks: Task["subtasks"],
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("project_tasks")
    .update({ subtasks })
    .eq("id", taskId);
  if (error) throw error;
}

// ─── Deliverable overrides ───────────────────────────────────────────────────

export async function upsertOverride(override: DeliverableOverride): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("deliverable_overrides")
    .upsert(overrideToUpsertRow(override), { onConflict: "deliverable_id" });
  if (error) throw error;
}

export async function bulkUpsertOverrides(
  overrides: DeliverableOverride[],
): Promise<void> {
  if (overrides.length === 0) return;
  const supabase = createClient();
  const { error } = await supabase
    .from("deliverable_overrides")
    .upsert(overrides.map(overrideToUpsertRow), { onConflict: "deliverable_id" });
  if (error) throw error;
}

/**
 * Clear all baseline_days values. Done as a single UPDATE for atomicity.
 * Rationale + manual_status + days_override are preserved.
 */
export async function clearAllBaselines(): Promise<void> {
  const supabase = createClient();
  // .neq filter on a non-null deliverable_id matches every row.
  const { error } = await supabase
    .from("deliverable_overrides")
    .update({ baseline_days: null })
    .neq("deliverable_id", "");
  if (error) throw error;
}

// ─── Team members ────────────────────────────────────────────────────────────

export async function addTeamMember(member: TeamMember): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("team_members")
    .insert(teamMemberToInsertRow(member));
  if (error) throw error;
}

export async function updateTeamMember(
  id: string,
  updates: Partial<Omit<TeamMember, "id">>,
): Promise<void> {
  const supabase = createClient();
  const row = teamMemberUpdatesToRow(updates);
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("team_members").update(row).eq("id", id);
  if (error) throw error;
}

/**
 * Delete a team member. The DB schema has `assignee REFERENCES team_members(id)
 * ON DELETE SET NULL` so Postgres will null assignees automatically — but we
 * also unassign client-side in the store for instant UI feedback.
 */
export async function deleteTeamMember(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) throw error;
}

// ─── Sync links + log + meta ─────────────────────────────────────────────────

export async function upsertSyncLink(tableXId: string, link: SyncLink): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("sync_links")
    .upsert(syncLinkToUpsertRow(tableXId, link), { onConflict: "table_x_id" });
  if (error) throw error;
}

export async function bulkUpsertSyncLinks(
  links: Array<{ tableXId: string; link: SyncLink }>,
): Promise<void> {
  if (links.length === 0) return;
  const supabase = createClient();
  const rows = links.map(({ tableXId, link }) => syncLinkToUpsertRow(tableXId, link));
  const { error } = await supabase
    .from("sync_links")
    .upsert(rows, { onConflict: "table_x_id" });
  if (error) throw error;
}

export async function appendSyncLogEntries(entries: SyncLogEntry[]): Promise<void> {
  if (entries.length === 0) return;
  const supabase = createClient();
  const { error } = await supabase
    .from("sync_log")
    .insert(entries.map(syncLogEntryToInsertRow));
  if (error) throw error;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("tracker_meta")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) throw error;
}
