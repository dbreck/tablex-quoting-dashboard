// Pure snake_case ↔ camelCase converters for launch_milestones.
// No supabase client coupling — reusable from route handlers if needed later.

import type {
  LaunchMilestone,
  LaneId,
  OwnerId,
  StatusId,
} from "@/data/launch-timeline";

export interface LaunchMilestoneRow {
  id: string;
  lane: LaneId;
  title: string;
  owner: OwnerId;
  start_date: string;
  end_date: string;
  status: StatusId;
  note: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ─── Row → TS ────────────────────────────────────────────────────────────────

export function rowToMilestone(row: LaunchMilestoneRow): LaunchMilestone {
  return {
    id: row.id,
    lane: row.lane,
    title: row.title,
    owner: row.owner,
    start: row.start_date,
    end: row.end_date,
    status: row.status,
    note: row.note ?? "",
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── TS → Row ────────────────────────────────────────────────────────────────

export function milestoneToInsertRow(
  m: Omit<LaunchMilestone, "createdAt" | "updatedAt">,
): Omit<LaunchMilestoneRow, "created_at" | "updated_at"> {
  return {
    id: m.id,
    lane: m.lane,
    title: m.title,
    owner: m.owner,
    start_date: m.start,
    end_date: m.end,
    status: m.status,
    note: m.note ? m.note : null,
    sort_order: m.sortOrder,
  };
}

export function milestoneUpdatesToRow(
  updates: Partial<Omit<LaunchMilestone, "id" | "createdAt" | "updatedAt">>,
): Partial<Omit<LaunchMilestoneRow, "id" | "created_at" | "updated_at">> {
  const row: Partial<Omit<LaunchMilestoneRow, "id" | "created_at" | "updated_at">> = {};
  if (updates.lane !== undefined) row.lane = updates.lane;
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.owner !== undefined) row.owner = updates.owner;
  if (updates.start !== undefined) row.start_date = updates.start;
  if (updates.end !== undefined) row.end_date = updates.end;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.note !== undefined) row.note = updates.note ? updates.note : null;
  if (updates.sortOrder !== undefined) row.sort_order = updates.sortOrder;
  return row;
}
