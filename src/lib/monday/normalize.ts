// Pure normalization functions between TableX domain objects and Monday
// column-value payloads. No I/O here — caller fetches the board's columns
// once and passes the columnsByTitle map in.

import type { Deliverable } from "@/data/project-phase2";
import {
  type DeliverableOverride,
  type Task,
  getDeliverableDays,
  hoursToDays,
  getScopeStatus,
} from "@/data/project-tracker";
import type { ColumnValueInput, ColumnValuesInput } from "./types";
import {
  DELIVERABLE_COLUMN_TITLES,
  MONDAY_LABEL_TO_PRIORITY,
  MONDAY_LABEL_TO_SCOPE_STATUS,
  MONDAY_STATUS_TO_TASKCOLUMN,
  PRIORITY_TO_MONDAY_LABEL,
  SCOPE_STATUS_TO_MONDAY_LABEL,
  SUBITEM_COLUMN_TITLES,
  TASKCOLUMN_TO_MONDAY_STATUS,
} from "./schema";

// ─── Column-id resolution ────────────────────────────────────────────────────

export type ColumnsByTitle = Record<string, string>;

function resolve(
  columnsByTitle: ColumnsByTitle,
  title: string,
): string | null {
  return columnsByTitle[title] ?? null;
}

function setIfResolved(
  values: ColumnValuesInput,
  columnsByTitle: ColumnsByTitle,
  title: string,
  value: ColumnValueInput | null | undefined,
): void {
  if (value === null || value === undefined) return;
  const id = resolve(columnsByTitle, title);
  if (id) values[id] = value;
}

// ─── Push: TableX → Monday ──────────────────────────────────────────────────

/**
 * Build the column_values payload for a deliverable. Pass the result directly
 * as the `column_values` variable (stringified by the caller) on `create_item`
 * or `change_multiple_column_values`.
 *
 * Fields mapped: Status, Dates, External ID, Hours, Days, Baseline Days,
 * Rationale. Owner is omitted — people-column mapping requires Monday user
 * ids we don't have yet (see plan's "TeamMember mapping" open question).
 */
export function deliverableToMondayColumnValues(
  deliverable: Deliverable,
  override: DeliverableOverride | undefined,
  columnsByTitle: ColumnsByTitle,
): ColumnValuesInput {
  const values: ColumnValuesInput = {};

  const scopeStatus = getScopeStatus(deliverable, override);
  setIfResolved(values, columnsByTitle, DELIVERABLE_COLUMN_TITLES.status, {
    label: SCOPE_STATUS_TO_MONDAY_LABEL[scopeStatus],
  });

  // Phase-2 deliverables use week numbers, not dates. For the Dates column we
  // leave the value blank on seed — dates will be back-filled from timeline
  // UX later. (Skip rather than push an invalid date.)

  setIfResolved(
    values,
    columnsByTitle,
    DELIVERABLE_COLUMN_TITLES.externalId,
    deliverable.id,
  );

  setIfResolved(
    values,
    columnsByTitle,
    DELIVERABLE_COLUMN_TITLES.hours,
    String(deliverable.estimatedHours),
  );

  const days = getDeliverableDays(deliverable, override);
  setIfResolved(
    values,
    columnsByTitle,
    DELIVERABLE_COLUMN_TITLES.days,
    String(days),
  );

  if (override?.baselineDays != null) {
    setIfResolved(
      values,
      columnsByTitle,
      DELIVERABLE_COLUMN_TITLES.baselineDays,
      String(override.baselineDays),
    );
  }

  if (override?.rationale) {
    setIfResolved(
      values,
      columnsByTitle,
      DELIVERABLE_COLUMN_TITLES.rationale,
      override.rationale,
    );
  }

  return values;
}

/**
 * Build the column_values payload for a task (subitem). Omits Owner for the
 * same reason as deliverables.
 */
export function taskToMondayColumnValues(
  task: Task,
  columnsByTitle: ColumnsByTitle,
): ColumnValuesInput {
  const values: ColumnValuesInput = {};

  setIfResolved(values, columnsByTitle, SUBITEM_COLUMN_TITLES.status, {
    label: TASKCOLUMN_TO_MONDAY_STATUS[task.column],
  });

  if (task.dueDate) {
    setIfResolved(values, columnsByTitle, SUBITEM_COLUMN_TITLES.due, {
      date: task.dueDate,
    });
  }

  setIfResolved(
    values,
    columnsByTitle,
    SUBITEM_COLUMN_TITLES.externalId,
    task.id,
  );

  setIfResolved(values, columnsByTitle, SUBITEM_COLUMN_TITLES.priority, {
    label: PRIORITY_TO_MONDAY_LABEL[task.priority],
  });

  if (task.labels.length > 0) {
    setIfResolved(values, columnsByTitle, SUBITEM_COLUMN_TITLES.labels, {
      labels: task.labels,
    });
  }

  return values;
}

// ─── Pull: Monday → TableX ───────────────────────────────────────────────────
//
// Stage 2 will add the full pull/reconcile pipeline (see
// plan-away-async-starfish.md). Only the column-lookup helper ships now;
// the patch-producers will land with pull.ts / reconcile.ts next to this file.

/** Read helper: find a column value on a Monday item by column id. */
export function findColumnValue(
  columnValues: Array<{ id: string; text: string | null; value: string | null }>,
  columnId: string,
): { text: string | null; value: string | null } | null {
  const cv = columnValues.find((c) => c.id === columnId);
  return cv ? { text: cv.text, value: cv.value } : null;
}

// Referenced so the imports stay live for the Stage 2 patch-producers below.
void hoursToDays;
void MONDAY_STATUS_TO_TASKCOLUMN;
void MONDAY_LABEL_TO_SCOPE_STATUS;
void MONDAY_LABEL_TO_PRIORITY;
void ({} as Task);
void ({} as DeliverableOverride);
