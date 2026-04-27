// Pure snake_case ↔ camelCase converters for project-tracker rows.
//
// Lives apart from `tracker-client.ts` so server-side route handlers (the
// import route, the Monday sync route) can reuse the same shape converters
// without pulling in the browser Supabase client.

import type {
  Task,
  Subtask,
  AcceptanceCriterion,
  KanbanColumn,
  Priority,
  TeamMember,
  DeliverableOverride,
} from "@/data/project-tracker";

// Sync slice types live here (and are re-exported from the store) so the
// converters/client modules don't have to import from the store, avoiding a
// circular ref since the store imports value-level helpers from this file.
export interface SyncLink {
  mondayItemId: string | null;
  lastSyncedAt: string | null;
  lastMondayUpdatedAt: string | null;
}

export interface SyncLogEntry {
  at: string;
  direction: "pulled" | "pushed" | "linked" | "skipped" | "error";
  kind: "task" | "deliverable";
  tableXId: string;
  detail?: string;
}

// ─── Row shapes (mirror Postgres columns) ────────────────────────────────────

export interface TaskRow {
  id: string;
  deliverable_id: string;
  title: string;
  description: string | null;
  column: KanbanColumn;
  priority: Priority;
  assignee: string | null;
  sprint_id: string | null;
  labels: string[];
  subtasks: Subtask[];
  acceptance_criteria: AcceptanceCriterion[];
  due_date: string | null;
  sort_order: number;
  started_at: string | null;
  blocker_reason: string | null;
  blocked_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMemberRow {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  company: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  profile_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliverableOverrideRow {
  deliverable_id: string;
  baseline_days: number | null;
  rationale: string | null;
  days_override: number | null;
  manual_status: "planned" | "in-progress" | "complete" | null;
  updated_at: string;
}

export interface SyncLinkRow {
  table_x_id: string;
  monday_item_id: string | null;
  last_synced_at: string | null;
  last_monday_updated_at: string | null;
}

export interface SyncLogRow {
  id: number;
  at: string;
  direction: "pulled" | "pushed" | "linked" | "skipped" | "error";
  kind: "task" | "deliverable";
  table_x_id: string;
  detail: string | null;
}

export interface TrackerMetaRow {
  key: string;
  value: unknown;
  updated_at: string;
}

// ─── Row → TS ────────────────────────────────────────────────────────────────

export function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    deliverableId: row.deliverable_id,
    title: row.title,
    description: row.description ?? undefined,
    column: row.column,
    priority: row.priority,
    assignee: row.assignee,
    sprintId: row.sprint_id ?? null,
    labels: row.labels ?? [],
    subtasks: row.subtasks ?? [],
    acceptanceCriteria: row.acceptance_criteria ?? [],
    dueDate: row.due_date ?? undefined,
    startedAt: row.started_at ?? undefined,
    blockerReason: row.blocker_reason,
    blockedAt: row.blocked_at,
    sortOrder: row.sort_order,
    completedAt: row.completed_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToTeamMember(row: TeamMemberRow): TeamMember {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    initials: row.initials,
    color: row.color,
    company: row.company ?? undefined,
    title: row.title ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export function rowToOverride(row: DeliverableOverrideRow): DeliverableOverride {
  return {
    deliverableId: row.deliverable_id,
    baselineDays: row.baseline_days,
    rationale: row.rationale ?? undefined,
    daysOverride: row.days_override ?? undefined,
    manualStatus: row.manual_status ?? undefined,
  };
}

export function rowToSyncLink(row: SyncLinkRow): SyncLink {
  return {
    mondayItemId: row.monday_item_id,
    lastSyncedAt: row.last_synced_at,
    lastMondayUpdatedAt: row.last_monday_updated_at,
  };
}

export function rowToSyncLogEntry(row: SyncLogRow): SyncLogEntry {
  return {
    at: row.at,
    direction: row.direction,
    kind: row.kind,
    tableXId: row.table_x_id,
    detail: row.detail ?? undefined,
  };
}

// ─── TS → Row (for inserts / upserts) ────────────────────────────────────────

/**
 * Build the column payload for inserting a task. created_at/updated_at are
 * left to the DB defaults unless caller passed them in (preserving them is
 * useful for the import path where we want to retain the original timestamps).
 */
export function taskToInsertRow(task: Task): Omit<TaskRow, "created_at" | "updated_at"> & {
  created_at?: string;
  updated_at?: string;
} {
  return {
    id: task.id,
    deliverable_id: task.deliverableId,
    title: task.title,
    description: task.description ?? null,
    column: task.column,
    priority: task.priority,
    assignee: task.assignee,
    sprint_id: task.sprintId ?? null,
    labels: task.labels ?? [],
    subtasks: task.subtasks ?? [],
    acceptance_criteria: task.acceptanceCriteria ?? [],
    due_date: task.dueDate ?? null,
    started_at: task.startedAt ?? null,
    blocker_reason: task.blockerReason ?? null,
    blocked_at: task.blockedAt ?? null,
    sort_order: task.sortOrder,
    completed_at: task.completedAt ?? null,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
  };
}

/**
 * Partial update for an existing task. Only fields present in `updates` are
 * mapped. updated_at is touched by a DB trigger, so we don't send it.
 */
export function taskUpdatesToRow(
  updates: Partial<Omit<Task, "id" | "createdAt">>,
): Partial<Omit<TaskRow, "id" | "created_at" | "updated_at">> {
  const row: Partial<Omit<TaskRow, "id" | "created_at" | "updated_at">> = {};
  if (updates.deliverableId !== undefined) row.deliverable_id = updates.deliverableId;
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.description !== undefined) row.description = updates.description ?? null;
  if (updates.column !== undefined) row.column = updates.column;
  if (updates.priority !== undefined) row.priority = updates.priority;
  if (updates.assignee !== undefined) row.assignee = updates.assignee;
  if (updates.sprintId !== undefined) row.sprint_id = updates.sprintId ?? null;
  if (updates.labels !== undefined) row.labels = updates.labels;
  if (updates.subtasks !== undefined) row.subtasks = updates.subtasks;
  if (updates.acceptanceCriteria !== undefined)
    row.acceptance_criteria = updates.acceptanceCriteria;
  if (updates.dueDate !== undefined) row.due_date = updates.dueDate ?? null;
  if (updates.startedAt !== undefined) row.started_at = updates.startedAt ?? null;
  if (updates.blockerReason !== undefined) row.blocker_reason = updates.blockerReason ?? null;
  if (updates.blockedAt !== undefined) row.blocked_at = updates.blockedAt ?? null;
  if (updates.sortOrder !== undefined) row.sort_order = updates.sortOrder;
  if (updates.completedAt !== undefined) row.completed_at = updates.completedAt ?? null;
  return row;
}

export function teamMemberToInsertRow(
  member: TeamMember,
): Omit<TeamMemberRow, "created_at" | "updated_at" | "profile_id"> & {
  profile_id?: string | null;
} {
  return {
    id: member.id,
    name: member.name,
    role: member.role,
    initials: member.initials,
    color: member.color,
    company: member.company ?? null,
    title: member.title ?? null,
    email: member.email ?? null,
    phone: member.phone ?? null,
    notes: member.notes ?? null,
  };
}

export function teamMemberUpdatesToRow(
  updates: Partial<Omit<TeamMember, "id">>,
): Partial<Omit<TeamMemberRow, "id" | "created_at" | "updated_at">> {
  const row: Partial<Omit<TeamMemberRow, "id" | "created_at" | "updated_at">> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.role !== undefined) row.role = updates.role;
  if (updates.initials !== undefined) row.initials = updates.initials;
  if (updates.color !== undefined) row.color = updates.color;
  if (updates.company !== undefined) row.company = updates.company ?? null;
  if (updates.title !== undefined) row.title = updates.title ?? null;
  if (updates.email !== undefined) row.email = updates.email ?? null;
  if (updates.phone !== undefined) row.phone = updates.phone ?? null;
  if (updates.notes !== undefined) row.notes = updates.notes ?? null;
  return row;
}

export function overrideToUpsertRow(
  override: DeliverableOverride,
): Omit<DeliverableOverrideRow, "updated_at"> {
  return {
    deliverable_id: override.deliverableId,
    baseline_days: override.baselineDays ?? null,
    rationale: override.rationale ?? null,
    days_override: override.daysOverride ?? null,
    manual_status: override.manualStatus ?? null,
  };
}

export function syncLinkToUpsertRow(tableXId: string, link: SyncLink): SyncLinkRow {
  return {
    table_x_id: tableXId,
    monday_item_id: link.mondayItemId,
    last_synced_at: link.lastSyncedAt,
    last_monday_updated_at: link.lastMondayUpdatedAt,
  };
}

export function syncLogEntryToInsertRow(
  entry: SyncLogEntry,
): Omit<SyncLogRow, "id"> {
  return {
    at: entry.at,
    direction: entry.direction,
    kind: entry.kind,
    table_x_id: entry.tableXId,
    detail: entry.detail ?? null,
  };
}
