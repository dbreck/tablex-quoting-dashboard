// Browser-side CRUD for launch_milestones. Authz is RLS-enforced
// (can_access_proposal for read/write, admin for delete).

import { createClient } from "@/lib/supabase/client";
import type { LaunchMilestone } from "@/data/launch-timeline";
import {
  rowToMilestone,
  milestoneToInsertRow,
  milestoneUpdatesToRow,
  type LaunchMilestoneRow,
} from "@/lib/supabase/launch-timeline-converters";

// ─── Reads ───────────────────────────────────────────────────────────────────

export async function fetchAllLaunchMilestones(): Promise<LaunchMilestone[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("launch_milestones")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as LaunchMilestoneRow[]).map(rowToMilestone);
}

// ─── Writes ──────────────────────────────────────────────────────────────────

export async function createLaunchMilestone(
  milestone: Omit<LaunchMilestone, "createdAt" | "updatedAt">,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("launch_milestones")
    .insert(milestoneToInsertRow(milestone));
  if (error) throw error;
}

export async function updateLaunchMilestone(
  id: string,
  patch: Partial<Omit<LaunchMilestone, "id" | "createdAt" | "updatedAt">>,
): Promise<void> {
  const supabase = createClient();
  const row = milestoneUpdatesToRow(patch);
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("launch_milestones").update(row).eq("id", id);
  if (error) throw error;
}

export async function deleteLaunchMilestone(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("launch_milestones").delete().eq("id", id);
  if (error) throw error;
}
