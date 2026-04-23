// Pure snake_case ↔ camelCase converters for sprints + burndown_snapshots.
// Mirrors the pattern in tracker-converters.ts. No supabase client coupling
// here so server-side code (REST API, MCP) can reuse the converters.

import type { Sprint, BurndownSnapshot, SprintStatus } from "@/data/sprint";

// ─── Row shapes (mirror Postgres columns) ────────────────────────────────────

export interface SprintRow {
  id: string;
  name: string;
  goal: string | null;
  start_date: string;
  end_date: string;
  status: SprintStatus;
  created_at: string;
  updated_at: string;
}

export interface BurndownSnapshotRow {
  id: number;
  sprint_id: string;
  snapshot_date: string;
  total_tasks: number;
  completed_tasks: number;
  total_hours: number | string;
  remaining_hours: number | string;
  created_at: string;
}

// ─── Row → TS ────────────────────────────────────────────────────────────────

export function rowToSprint(row: SprintRow): Sprint {
  return {
    id: row.id,
    name: row.name,
    goal: row.goal ?? undefined,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToBurndownSnapshot(row: BurndownSnapshotRow): BurndownSnapshot {
  return {
    sprintId: row.sprint_id,
    snapshotDate: row.snapshot_date,
    totalTasks: row.total_tasks,
    completedTasks: row.completed_tasks,
    totalHours: typeof row.total_hours === "string" ? parseFloat(row.total_hours) : row.total_hours,
    remainingHours:
      typeof row.remaining_hours === "string" ? parseFloat(row.remaining_hours) : row.remaining_hours,
  };
}

// ─── TS → Row (for inserts / upserts) ────────────────────────────────────────

/**
 * Build the column payload for inserting a sprint. created_at/updated_at are
 * left to the DB defaults unless caller passed them in.
 */
export function sprintToInsertRow(
  sprint: Omit<Sprint, "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  },
): Omit<SprintRow, "created_at" | "updated_at"> & {
  created_at?: string;
  updated_at?: string;
} {
  return {
    id: sprint.id,
    name: sprint.name,
    goal: sprint.goal ?? null,
    start_date: sprint.startDate,
    end_date: sprint.endDate,
    status: sprint.status,
    created_at: sprint.createdAt,
    updated_at: sprint.updatedAt,
  };
}

/**
 * Partial update for an existing sprint. Only fields present in `updates` are
 * mapped. updated_at is touched by the DB trigger.
 */
export function sprintUpdatesToRow(
  updates: Partial<Omit<Sprint, "id" | "createdAt" | "updatedAt">>,
): Partial<Omit<SprintRow, "id" | "created_at" | "updated_at">> {
  const row: Partial<Omit<SprintRow, "id" | "created_at" | "updated_at">> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.goal !== undefined) row.goal = updates.goal ?? null;
  if (updates.startDate !== undefined) row.start_date = updates.startDate;
  if (updates.endDate !== undefined) row.end_date = updates.endDate;
  if (updates.status !== undefined) row.status = updates.status;
  return row;
}
