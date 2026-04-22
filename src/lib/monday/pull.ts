// Pull side of the sync engine: fetch the current Monday board state and
// produce a normalized snapshot keyed by external_id, ready for the reconcile
// orchestrator to diff against the TableX store.

import { mondayQuery, MondayApiError } from "./client";
import {
  DELIVERABLE_COLUMN_TITLES,
  MONDAY_BOARD_ID,
  SUBITEM_COLUMN_TITLES,
} from "./schema";
import type { ColumnsByTitle } from "./normalize";
import { readExternalIdValue } from "./normalize";
import type {
  MondayBoard,
  MondayColumn,
  MondayItem,
  MondaySubitem,
} from "./types";

const Q_BOARD_COLUMNS = `
  query ($boardId: [ID!]!) {
    boards(ids: $boardId) {
      id
      name
      columns { id title type settings_str }
    }
  }
`;

const Q_BOARD_ITEMS = `
  query ($boardId: [ID!]!, $cursor: String, $limit: Int!) {
    boards(ids: $boardId) {
      items_page(limit: $limit, cursor: $cursor) {
        cursor
        items {
          id
          name
          updated_at
          group { id title }
          column_values { id type text value }
          subitems {
            id
            name
            updated_at
            column_values { id type text value }
          }
        }
      }
    }
  }
`;

const Q_SUBITEM_BOARD_COLUMNS = `
  query ($boardId: [ID!]!) {
    boards(ids: $boardId) {
      columns { id title type }
    }
  }
`;

export interface MondayItemRecord {
  mondayItemId: string;
  externalId: string;
  name: string;
  mondayUpdatedAt: string | null;
  raw: MondayItem;
}

export interface MondaySubitemRecord {
  mondaySubitemId: string;
  parentMondayItemId: string;
  externalId: string;
  name: string;
  mondayUpdatedAt: string | null;
  raw: MondaySubitem;
}

export interface MondaySnapshot {
  itemColumnsByTitle: ColumnsByTitle;
  subitemColumnsByTitle: ColumnsByTitle;
  /** The subitem board id, or null if no subitems exist yet. */
  subitemBoardId: string | null;
  /** Items with a recognizable External ID, keyed by it. */
  itemsByExternalId: Map<string, MondayItemRecord>;
  /** Items keyed by Monday item id (used to find parent for unlinked subitems). */
  itemsById: Map<string, MondayItem>;
  /** Subitems with a recognizable External ID, keyed by it. */
  subitemsByExternalId: Map<string, MondaySubitemRecord>;
}

function buildColumnsByTitle(columns: MondayColumn[]): ColumnsByTitle {
  const map: ColumnsByTitle = {};
  for (const c of columns) map[c.title] = c.id;
  return map;
}

function extractSubitemBoardId(columns: MondayColumn[]): string | null {
  const subtasks = columns.find((c) => c.type === "subtasks");
  if (!subtasks?.settings_str) return null;
  try {
    const parsed = JSON.parse(subtasks.settings_str) as {
      boardIds?: Array<string | number>;
    };
    const id = parsed.boardIds?.[0];
    return id != null ? String(id) : null;
  } catch {
    return null;
  }
}

async function fetchBoard(): Promise<{
  columns: MondayColumn[];
  subitemBoardId: string | null;
}> {
  const data = await mondayQuery<{ boards: MondayBoard[] }>(Q_BOARD_COLUMNS, {
    boardId: [MONDAY_BOARD_ID],
  });
  const board = data.boards?.[0];
  if (!board) {
    throw new MondayApiError(`Board ${MONDAY_BOARD_ID} not found`);
  }
  const columns = board.columns ?? [];
  return { columns, subitemBoardId: extractSubitemBoardId(columns) };
}

async function fetchSubitemColumns(
  subitemBoardId: string,
): Promise<MondayColumn[]> {
  const data = await mondayQuery<{ boards: MondayBoard[] }>(
    Q_SUBITEM_BOARD_COLUMNS,
    { boardId: [subitemBoardId] },
  );
  return data.boards?.[0]?.columns ?? [];
}

async function fetchAllItems(): Promise<MondayItem[]> {
  const items: MondayItem[] = [];
  let cursor: string | null = null;
  do {
    const data: {
      boards: Array<{ items_page: { cursor: string | null; items: MondayItem[] } }>;
    } = await mondayQuery(Q_BOARD_ITEMS, {
      boardId: [MONDAY_BOARD_ID],
      cursor,
      limit: 100,
    });
    const page = data.boards?.[0]?.items_page;
    if (!page) break;
    items.push(...page.items);
    cursor = page.cursor;
  } while (cursor);
  return items;
}

/**
 * Fetch the current Monday board state and build lookup maps. Single
 * round-trip per call (one board query + one paginated items query +
 * one subitem-columns query). Cheap to run every minute.
 */
export async function snapshotMonday(): Promise<MondaySnapshot> {
  const { columns: itemColumns, subitemBoardId } = await fetchBoard();
  const itemColumnsByTitle = buildColumnsByTitle(itemColumns);

  const subitemColumns = subitemBoardId
    ? await fetchSubitemColumns(subitemBoardId)
    : [];
  const subitemColumnsByTitle = buildColumnsByTitle(subitemColumns);

  const items = await fetchAllItems();

  const itemsByExternalId = new Map<string, MondayItemRecord>();
  const itemsById = new Map<string, MondayItem>();
  const subitemsByExternalId = new Map<string, MondaySubitemRecord>();

  for (const item of items) {
    itemsById.set(item.id, item);

    const externalId = readExternalIdValue(
      item.column_values,
      itemColumnsByTitle,
      DELIVERABLE_COLUMN_TITLES.externalId,
    );
    if (externalId) {
      itemsByExternalId.set(externalId, {
        mondayItemId: item.id,
        externalId,
        name: item.name,
        mondayUpdatedAt: item.updated_at ?? null,
        raw: item,
      });
    }

    for (const sub of item.subitems ?? []) {
      const subExternalId = readExternalIdValue(
        sub.column_values,
        subitemColumnsByTitle,
        SUBITEM_COLUMN_TITLES.externalId,
      );
      if (subExternalId) {
        subitemsByExternalId.set(subExternalId, {
          mondaySubitemId: sub.id,
          parentMondayItemId: item.id,
          externalId: subExternalId,
          name: sub.name,
          mondayUpdatedAt: sub.updated_at ?? null,
          raw: sub,
        });
      }
    }
  }

  return {
    itemColumnsByTitle,
    subitemColumnsByTitle,
    subitemBoardId,
    itemsByExternalId,
    itemsById,
    subitemsByExternalId,
  };
}
