// Push side of the sync engine: write a single TableX record (deliverable
// override or task) to its corresponding Monday item/subitem. Pure single-
// record operations — the orchestrator in reconcile.ts decides which records
// to push.

import type { Deliverable } from "@/data/project-phase2";
import type {
  DeliverableOverride,
  ScopeStatus,
  Task,
} from "@/data/project-tracker";
import { mondayQuery } from "./client";
import {
  deliverableToMondayColumnValues,
  taskToMondayColumnValues,
  type ColumnsByTitle,
  type UserMaps,
} from "./normalize";
import { MONDAY_BOARD_ID } from "./schema";

const M_CHANGE_ITEM_VALUES = `
  mutation ($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
    change_multiple_column_values(
      board_id: $boardId
      item_id: $itemId
      column_values: $columnValues
      create_labels_if_missing: true
    ) { id }
  }
`;

const M_CREATE_SUBITEM = `
  mutation ($parentItemId: ID!, $name: String!, $columnValues: JSON) {
    create_subitem(
      parent_item_id: $parentItemId
      item_name: $name
      column_values: $columnValues
      create_labels_if_missing: true
    ) {
      id
      name
      board { id }
    }
  }
`;

/** Update a deliverable's Monday item with current TableX state. */
export async function pushDeliverableToMonday(args: {
  deliverable: Deliverable;
  override: DeliverableOverride | undefined;
  mondayItemId: string;
  itemColumnsByTitle: ColumnsByTitle;
  itemName?: string;
  /** Override the status (used by reconcile to push the rollup value). */
  statusOverride?: ScopeStatus;
}): Promise<void> {
  const values = deliverableToMondayColumnValues(
    args.deliverable,
    args.override,
    args.itemColumnsByTitle,
    { statusOverride: args.statusOverride },
  );

  const payload: Record<string, unknown> = { ...values };
  if (args.itemName && args.itemName !== args.deliverable.name) {
    payload.name = args.deliverable.name;
  }

  await mondayQuery(M_CHANGE_ITEM_VALUES, {
    boardId: MONDAY_BOARD_ID,
    itemId: args.mondayItemId,
    columnValues: JSON.stringify(payload),
  });
}

/** Update a task's Monday subitem with current TableX state. */
export async function pushTaskToMonday(args: {
  task: Task;
  mondaySubitemId: string;
  subitemBoardId: string;
  subitemColumnsByTitle: ColumnsByTitle;
  subitemName?: string;
  userMaps?: UserMaps;
}): Promise<void> {
  const values = taskToMondayColumnValues(
    args.task,
    args.subitemColumnsByTitle,
    args.userMaps,
  );

  const payload: Record<string, unknown> = { ...values };
  if (args.subitemName !== args.task.title) {
    payload.name = args.task.title;
  }

  await mondayQuery(M_CHANGE_ITEM_VALUES, {
    boardId: args.subitemBoardId,
    itemId: args.mondaySubitemId,
    columnValues: JSON.stringify(payload),
  });
}

/**
 * Create a new subitem on Monday for a TableX task that doesn't exist yet.
 * Returns the new subitem id so the caller can persist a sync link.
 */
export async function createTaskOnMonday(args: {
  task: Task;
  parentMondayItemId: string;
  subitemColumnsByTitle: ColumnsByTitle;
  userMaps?: UserMaps;
}): Promise<{ id: string }> {
  const values = taskToMondayColumnValues(
    args.task,
    args.subitemColumnsByTitle,
    args.userMaps,
  );
  const data = await mondayQuery<{ create_subitem: { id: string; board: { id: string } } }>(
    M_CREATE_SUBITEM,
    {
      parentItemId: args.parentMondayItemId,
      name: args.task.title,
      columnValues: JSON.stringify(values),
    },
  );
  return { id: data.create_subitem.id };
}
