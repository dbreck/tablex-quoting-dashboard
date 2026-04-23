// Minimal local Sprint + BurndownSnapshot types and converters for the PM API.
// If sprints-ui or task-integration teammates ship a canonical set in
// `src/lib/supabase/sprint-converters.ts` (or extend tracker-converters), swap
// imports here and delete this file — shapes are intentionally aligned with
// the schema in supabase/migrations/016_sprints_burndown.sql.

export type SprintStatus = "upcoming" | "active" | "complete";

export interface Sprint {
  id: string;
  name: string;
  goal: string | null;
  startDate: string; // ISO YYYY-MM-DD
  endDate: string;
  status: SprintStatus;
  createdAt: string;
  updatedAt: string;
}

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

export function rowToSprint(row: SprintRow): Sprint {
  return {
    id: row.id,
    name: row.name,
    goal: row.goal,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface BurndownSnapshot {
  id: number;
  sprintId: string;
  snapshotDate: string;
  totalTasks: number;
  completedTasks: number;
  totalHours: number;
  remainingHours: number;
  createdAt: string;
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

export function rowToBurndownSnapshot(row: BurndownSnapshotRow): BurndownSnapshot {
  return {
    id: row.id,
    sprintId: row.sprint_id,
    snapshotDate: row.snapshot_date,
    totalTasks: row.total_tasks,
    completedTasks: row.completed_tasks,
    totalHours: Number(row.total_hours),
    remainingHours: Number(row.remaining_hours),
    createdAt: row.created_at,
  };
}
