// Browser-side CRUD helpers for sprints + burndown_snapshots.
//
// All calls go through `createClient()` and rely on RLS for authorization
// (`can_access_proposal` for read/write, admin for delete). The store calls
// these as fire-and-forget after applying the optimistic local update.

import { createClient } from "@/lib/supabase/client";
import type { Sprint, BurndownSnapshot } from "@/data/sprint";
import {
  rowToSprint,
  rowToBurndownSnapshot,
  sprintToInsertRow,
  sprintUpdatesToRow,
  type SprintRow,
  type BurndownSnapshotRow,
} from "@/lib/supabase/sprint-converters";

// ─── Reads ───────────────────────────────────────────────────────────────────

export async function fetchAllSprints(): Promise<Sprint[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sprints")
    .select("*")
    .order("start_date", { ascending: true });
  if (error) throw error;
  return (data as SprintRow[]).map(rowToSprint);
}

export async function fetchBurndownSnapshots(
  sprintId: string,
): Promise<BurndownSnapshot[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("burndown_snapshots")
    .select("*")
    .eq("sprint_id", sprintId)
    .order("snapshot_date", { ascending: true });
  if (error) throw error;
  return (data as BurndownSnapshotRow[]).map(rowToBurndownSnapshot);
}

// ─── Writes ──────────────────────────────────────────────────────────────────

export async function createSprint(
  sprint: Omit<Sprint, "createdAt" | "updatedAt">,
): Promise<Sprint> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sprints")
    .insert(sprintToInsertRow(sprint))
    .select("*")
    .single();
  if (error) throw error;
  return rowToSprint(data as SprintRow);
}

export async function updateSprint(
  id: string,
  patch: Partial<Omit<Sprint, "id" | "createdAt" | "updatedAt">>,
): Promise<void> {
  const supabase = createClient();
  const row = sprintUpdatesToRow(patch);
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("sprints").update(row).eq("id", id);
  if (error) throw error;
}

/** Admin-only via RLS — surfaces an error to non-admin callers. */
export async function deleteSprint(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("sprints").delete().eq("id", id);
  if (error) throw error;
}

export async function bulkCreateSprints(sprints: Sprint[]): Promise<void> {
  if (sprints.length === 0) return;
  const supabase = createClient();
  const rows = sprints.map((s) =>
    sprintToInsertRow({
      id: s.id,
      name: s.name,
      goal: s.goal,
      startDate: s.startDate,
      endDate: s.endDate,
      status: s.status,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }),
  );
  const { error } = await supabase.from("sprints").insert(rows);
  if (error) throw error;
}
