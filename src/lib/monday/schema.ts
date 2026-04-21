// Monday.com board schema constants and TableX ↔ Monday value mappings.
//
// All identifiers here are the *only* Monday surface our code should touch.
// The token is workspace-scoped, but our code must behave as if it is
// board-scoped: every query/mutation passes MONDAY_BOARD_ID explicitly.

import type { KanbanColumn, Priority } from "@/data/project-tracker";
import type { ScopeStatus } from "@/data/project-tracker";

// ─── IDs ──────────────────────────────────────────────────────────────────────

export const MONDAY_BOARD_ID = "18409604004";
export const WORKSPACE_ID = "529680";

// ─── Groups (one per workstream) ──────────────────────────────────────────────

/**
 * Maps TableX workstream id → Monday group title. Groups are resolved by
 * title at seed time; the "Website" group already exists on the board.
 */
export const WORKSTREAM_GROUP_NAMES: Record<string, string> = {
  website: "Website",
  portal: "Dealer/Rep Portal",
  crm: "CRM",
  cpq: "CPQ / Spec Studio",
  xero: "Xero Integration",
};

// ─── Item columns (on deliverables) ──────────────────────────────────────────

/**
 * Titles for deliverable-level columns. Resolved to column ids at runtime via
 * a title → id map the caller builds from the board's `columns` query — so
 * a Monday-side rename of an id doesn't break sync, only a title rename.
 */
export interface ColumnSpec {
  title: string;
  /** Monday ColumnType. Values that apply here: text, long_text, status, date, numbers, people. */
  columnType: string;
}

export const DELIVERABLE_COLUMN_SPECS: ColumnSpec[] = [
  { title: "Owner", columnType: "people" },
  { title: "Status", columnType: "status" },
  { title: "Dates", columnType: "date" },
  { title: "External ID", columnType: "text" },
  { title: "Hours", columnType: "numbers" },
  { title: "Days", columnType: "numbers" },
  { title: "Baseline Days", columnType: "numbers" },
  { title: "Rationale", columnType: "long_text" },
];

/** Canonical title constants — use these in normalize.ts to avoid string typos. */
export const DELIVERABLE_COLUMN_TITLES = {
  owner: "Owner",
  status: "Status",
  dates: "Dates",
  externalId: "External ID",
  hours: "Hours",
  days: "Days",
  baselineDays: "Baseline Days",
  rationale: "Rationale",
} as const;

// ─── Subitem columns (on tasks) ──────────────────────────────────────────────
//
// NOTE: Subitems live on their own Monday board, which is auto-created when
// the first subitem is added under any parent item. Subitem columns must be
// created on that subitem board — the parent board's `subtasks` column has a
// `settings_str` containing `{"boardIds": [<subitem_board_id>]}`. Seed logic
// discovers that id from the `subtasks` column once the first subitem exists
// (or by creating a throwaway subitem if no subitems exist yet).

export const SUBITEM_COLUMN_SPECS: ColumnSpec[] = [
  { title: "Owner", columnType: "people" },
  { title: "Status", columnType: "status" },
  { title: "Due", columnType: "date" },
  { title: "External ID", columnType: "text" },
  { title: "Priority", columnType: "status" },
  { title: "Labels", columnType: "dropdown" },
];

export const SUBITEM_COLUMN_TITLES = {
  owner: "Owner",
  status: "Status",
  due: "Due",
  externalId: "External ID",
  priority: "Priority",
  labels: "Labels",
} as const;

// ─── Status label maps ───────────────────────────────────────────────────────

/** TableX Kanban column → Monday status label (on subitems). */
export const TASKCOLUMN_TO_MONDAY_STATUS: Record<KanbanColumn, string> = {
  backlog: "Backlog",
  "in-progress": "In Progress",
  "in-review": "In Review",
  done: "Done",
};

/** Inverse of TASKCOLUMN_TO_MONDAY_STATUS — used when pulling from Monday. */
export const MONDAY_STATUS_TO_TASKCOLUMN: Record<string, KanbanColumn> = {
  Backlog: "backlog",
  "In Progress": "in-progress",
  "In Review": "in-review",
  Done: "done",
};

/** TableX Scope status → Monday status label (on deliverables). */
export const SCOPE_STATUS_TO_MONDAY_LABEL: Record<ScopeStatus, string> = {
  planned: "Not Started",
  "in-progress": "In Progress",
  complete: "Done",
};

/** Inverse — used when pulling deliverable status back from Monday. */
export const MONDAY_LABEL_TO_SCOPE_STATUS: Record<string, ScopeStatus> = {
  "Not Started": "planned",
  "In Progress": "in-progress",
  Review: "in-progress",
  Done: "complete",
  Blocked: "in-progress",
};

/** Full label set for the deliverable-level Status column (created on seed). */
export const DELIVERABLE_STATUS_LABELS: string[] = [
  "Not Started",
  "In Progress",
  "Review",
  "Done",
  "Blocked",
];

/** Full label set for the subitem-level Status column (created on seed). */
export const SUBITEM_STATUS_LABELS: string[] = [
  "Backlog",
  "In Progress",
  "In Review",
  "Done",
];

// ─── Priority label map (subitems) ───────────────────────────────────────────

export const PRIORITY_TO_MONDAY_LABEL: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const MONDAY_LABEL_TO_PRIORITY: Record<string, Priority> = {
  Low: "low",
  Medium: "medium",
  High: "high",
  Critical: "critical",
};

export const PRIORITY_LABELS: string[] = ["Low", "Medium", "High", "Critical"];
