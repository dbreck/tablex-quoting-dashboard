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

/** Read helper: find a column value on a Monday item by column id. */
export function findColumnValue(
  columnValues: Array<{ id: string; text: string | null; value: string | null }>,
  columnId: string,
): { text: string | null; value: string | null } | null {
  const cv = columnValues.find((c) => c.id === columnId);
  return cv ? { text: cv.text, value: cv.value } : null;
}

/** Read the External ID column off a Monday item or subitem. */
export function readExternalIdValue(
  columnValues: Array<{ id: string; text: string | null }> | undefined,
  columnsByTitle: ColumnsByTitle,
  titleKey: string,
): string | null {
  const colId = columnsByTitle[titleKey];
  if (!colId || !columnValues) return null;
  const cv = columnValues.find((c) => c.id === colId);
  return cv?.text?.trim() || null;
}

/**
 * Compute a patch of TableX Task fields from a Monday subitem. Returns only
 * the fields that the subitem expresses (status, dueDate, priority, labels) —
 * the caller merges over the existing task. Returns null if no recognizable
 * column values are present.
 */
export function mondaySubitemToTaskPatch(
  subitem: {
    name: string;
    column_values?: Array<{ id: string; text: string | null; value: string | null }>;
  },
  columnsByTitle: ColumnsByTitle,
): Partial<Task> {
  const patch: Partial<Task> = {};
  const cvs = subitem.column_values ?? [];

  // Title (subitem name).
  if (subitem.name) {
    patch.title = subitem.name;
  }

  const statusId = columnsByTitle[SUBITEM_COLUMN_TITLES.status];
  if (statusId) {
    const cv = cvs.find((c) => c.id === statusId);
    const label = cv?.text?.trim();
    if (label && MONDAY_STATUS_TO_TASKCOLUMN[label]) {
      patch.column = MONDAY_STATUS_TO_TASKCOLUMN[label];
    }
  }

  const dueId = columnsByTitle[SUBITEM_COLUMN_TITLES.due];
  if (dueId) {
    const cv = cvs.find((c) => c.id === dueId);
    const text = cv?.text?.trim();
    // Monday's date column text is YYYY-MM-DD when set, empty when cleared.
    if (text) {
      patch.dueDate = text;
    } else if (cv) {
      // Explicit clear in Monday → drop the dueDate.
      patch.dueDate = undefined;
    }
  }

  const priorityId = columnsByTitle[SUBITEM_COLUMN_TITLES.priority];
  if (priorityId) {
    const cv = cvs.find((c) => c.id === priorityId);
    const label = cv?.text?.trim();
    if (label && MONDAY_LABEL_TO_PRIORITY[label]) {
      patch.priority = MONDAY_LABEL_TO_PRIORITY[label];
    }
  }

  const labelsId = columnsByTitle[SUBITEM_COLUMN_TITLES.labels];
  if (labelsId) {
    const cv = cvs.find((c) => c.id === labelsId);
    const text = cv?.text?.trim() ?? "";
    // Monday returns labels comma-joined in `text`; empty string means "no labels".
    patch.labels = text ? text.split(",").map((s) => s.trim()).filter(Boolean) : [];
  }

  return patch;
}

/**
 * Compute a patch of DeliverableOverride fields from a Monday item. Mirrors
 * the forward path in `deliverableToMondayColumnValues`: maps Status →
 * manualStatus, Rationale → rationale, Days → daysOverride, Baseline Days →
 * baselineDays.
 */
export function mondayItemToOverridePatch(
  item: {
    column_values?: Array<{ id: string; text: string | null; value: string | null }>;
  },
  columnsByTitle: ColumnsByTitle,
): Partial<DeliverableOverride> {
  const patch: Partial<DeliverableOverride> = {};
  const cvs = item.column_values ?? [];

  const statusId = columnsByTitle[DELIVERABLE_COLUMN_TITLES.status];
  if (statusId) {
    const cv = cvs.find((c) => c.id === statusId);
    const label = cv?.text?.trim();
    if (label && MONDAY_LABEL_TO_SCOPE_STATUS[label]) {
      patch.manualStatus = MONDAY_LABEL_TO_SCOPE_STATUS[label];
    }
  }

  const rationaleId = columnsByTitle[DELIVERABLE_COLUMN_TITLES.rationale];
  if (rationaleId) {
    const cv = cvs.find((c) => c.id === rationaleId);
    const text = cv?.text?.trim();
    patch.rationale = text || undefined;
  }

  const daysId = columnsByTitle[DELIVERABLE_COLUMN_TITLES.days];
  if (daysId) {
    const cv = cvs.find((c) => c.id === daysId);
    const num = cv?.text ? Number(cv.text) : null;
    if (num != null && Number.isFinite(num)) {
      patch.daysOverride = num;
    }
  }

  const baselineId = columnsByTitle[DELIVERABLE_COLUMN_TITLES.baselineDays];
  if (baselineId) {
    const cv = cvs.find((c) => c.id === baselineId);
    const text = cv?.text?.trim();
    if (text === "" || text == null) {
      patch.baselineDays = null;
    } else {
      const num = Number(text);
      if (Number.isFinite(num)) patch.baselineDays = num;
    }
  }

  return patch;
}

void hoursToDays;
