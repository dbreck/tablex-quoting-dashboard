// Idempotent seeder: takes the TableX Phase 2 scope (DELIVERABLES +
// generateInitialTasks()) and mirrors it onto Monday board MONDAY_BOARD_ID.
//
// Flow:
//   1. Fetch current groups + item-board columns.
//   2. Ensure 5 workstream groups exist by title (create any missing).
//   3. Ensure all item-level columns exist by title (create any missing).
//   4. Ensure the subitem board exists (create a throwaway subitem if it
//      doesn't) and seed its columns.
//   5. Fetch existing items (paginated) once — index by External ID.
//   6. For each DELIVERABLE: upsert item. On update, compare name + column
//      values to skip no-op mutations.
//   7. For each TASK (from generateInitialTasks()): upsert subitem under
//      the parent deliverable's item.
//
// Re-running this is safe: creates only fill missing rows, updates only
// re-assert the current state.

import { DELIVERABLES } from "@/data/project-phase2";
import type { Task } from "@/data/project-tracker";
import { mondayQuery, MondayApiError } from "./client";
import {
  deliverableToMondayColumnValues,
  taskToMondayColumnValues,
  type ColumnsByTitle,
} from "./normalize";
import {
  DELIVERABLE_COLUMN_SPECS,
  DELIVERABLE_COLUMN_TITLES,
  MONDAY_BOARD_ID,
  SUBITEM_COLUMN_SPECS,
  SUBITEM_COLUMN_TITLES,
  WORKSTREAM_GROUP_NAMES,
} from "./schema";
import type {
  MondayColumn,
  MondayGroup,
  MondayItem,
  SeedResult,
} from "./types";

// ─── Queries & mutations ─────────────────────────────────────────────────────

const Q_BOARD_STRUCTURE = `
  query ($boardId: [ID!]!) {
    boards(ids: $boardId) {
      id
      name
      groups { id title }
      columns { id title type settings_str }
    }
  }
`;

const Q_BOARD_ITEMS_PAGE = `
  query ($boardId: [ID!]!, $cursor: String, $limit: Int!) {
    boards(ids: $boardId) {
      items_page(limit: $limit, cursor: $cursor) {
        cursor
        items {
          id
          name
          group { id title }
          column_values {
            id
            type
            text
            value
          }
          subitems {
            id
            name
            column_values {
              id
              type
              text
              value
            }
          }
        }
      }
    }
  }
`;

const Q_BOARD_COLUMNS = `
  query ($boardId: [ID!]!) {
    boards(ids: $boardId) {
      columns { id title type }
    }
  }
`;

const M_CREATE_GROUP = `
  mutation ($boardId: ID!, $name: String!) {
    create_group(board_id: $boardId, group_name: $name) {
      id
      title
    }
  }
`;

const M_CREATE_COLUMN = `
  mutation ($boardId: ID!, $title: String!, $type: ColumnType!) {
    create_column(
      board_id: $boardId
      title: $title
      column_type: $type
    ) {
      id
      title
      type
    }
  }
`;

const M_CREATE_ITEM = `
  mutation ($boardId: ID!, $groupId: String!, $name: String!, $columnValues: JSON) {
    create_item(
      board_id: $boardId
      group_id: $groupId
      item_name: $name
      column_values: $columnValues
      create_labels_if_missing: true
    ) {
      id
      name
    }
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

const M_CHANGE_ITEM_VALUES = `
  mutation ($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
    change_multiple_column_values(
      board_id: $boardId
      item_id: $itemId
      column_values: $columnValues
      create_labels_if_missing: true
    ) {
      id
    }
  }
`;

const M_DELETE_ITEM = `
  mutation ($itemId: ID!) {
    delete_item(item_id: $itemId) {
      id
    }
  }
`;

/**
 * Build task-shaped records for seeding with deterministic external ids. The
 * client-side `generateInitialTasks()` uses nanoid so every call produces new
 * ids — unusable for an idempotent server seed. We build a stable shape here:
 * `{deliverableId}-r{requirementIndex}` survives re-seeds and lets Stage 2
 * sync find each Monday subitem. Minimal fields — priority/labels stay default
 * because seed is a baseline; users edit from Monday or TableX after.
 */
function buildSeedTasks(): Task[] {
  const now = new Date().toISOString();
  const tasks: Task[] = [];
  let sortOrder = 0;

  for (const d of DELIVERABLES) {
    const column =
      d.status === "complete"
        ? "done"
        : d.status === "in-progress"
          ? "in-progress"
          : "backlog";
    d.requirements.forEach((req, idx) => {
      tasks.push({
        id: `${d.id}-r${idx}`,
        deliverableId: d.id,
        title: req,
        column,
        priority: "medium",
        assignee: null,
        labels: [],
        subtasks: [],
        createdAt: now,
        updatedAt: now,
        sortOrder: sortOrder++,
      });
    });
  }

  return tasks;
}

/** Run an async mapper over items in batches of `size`, sequentially per batch. */
async function inBatches<T, R>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    const batch = items.slice(i, i + size);
    const results = await Promise.all(batch.map(fn));
    out.push(...results);
  }
  return out;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface BoardStructure {
  groups: MondayGroup[];
  columns: MondayColumn[];
}

async function fetchBoardStructure(): Promise<BoardStructure> {
  const data = await mondayQuery<{
    boards: Array<{ groups: MondayGroup[]; columns: MondayColumn[] }>;
  }>(Q_BOARD_STRUCTURE, { boardId: [MONDAY_BOARD_ID] });
  const board = data.boards?.[0];
  if (!board) {
    throw new MondayApiError(`Board ${MONDAY_BOARD_ID} not found`);
  }
  return { groups: board.groups ?? [], columns: board.columns ?? [] };
}

async function fetchBoardColumns(boardId: string): Promise<MondayColumn[]> {
  const data = await mondayQuery<{ boards: Array<{ columns: MondayColumn[] }> }>(
    Q_BOARD_COLUMNS,
    { boardId: [boardId] },
  );
  return data.boards?.[0]?.columns ?? [];
}

async function fetchAllItems(): Promise<MondayItem[]> {
  const items: MondayItem[] = [];
  let cursor: string | null = null;
  do {
    const data: {
      boards: Array<{ items_page: { cursor: string | null; items: MondayItem[] } }>;
    } = await mondayQuery(Q_BOARD_ITEMS_PAGE, {
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

function buildColumnsByTitle(columns: MondayColumn[]): ColumnsByTitle {
  const map: ColumnsByTitle = {};
  for (const c of columns) map[c.title] = c.id;
  return map;
}

async function ensureGroups(
  current: MondayGroup[],
  errors: string[],
): Promise<{ groupsByWorkstream: Record<string, string>; created: string[] }> {
  const currentByTitle = new Map(current.map((g) => [g.title, g.id]));
  const created: string[] = [];
  const groupsByWorkstream: Record<string, string> = {};

  for (const [workstreamId, groupTitle] of Object.entries(
    WORKSTREAM_GROUP_NAMES,
  )) {
    const existingId = currentByTitle.get(groupTitle);
    if (existingId) {
      groupsByWorkstream[workstreamId] = existingId;
      continue;
    }
    try {
      const data = await mondayQuery<{
        create_group: { id: string; title: string };
      }>(M_CREATE_GROUP, { boardId: MONDAY_BOARD_ID, name: groupTitle });
      groupsByWorkstream[workstreamId] = data.create_group.id;
      created.push(groupTitle);
    } catch (err) {
      errors.push(
        `Failed to create group "${groupTitle}": ${(err as Error).message}`,
      );
    }
  }

  return { groupsByWorkstream, created };
}

interface ColumnDefaults {
  title: string;
  columnType: string;
}

// Status + dropdown label sets are NOT seeded via `defaults` on create_column.
// Monday's `defaults` JSON shape is version-sensitive and brittle — instead we
// rely on `create_labels_if_missing: true` on every create_item /
// create_subitem / change_multiple_column_values mutation, so labels are
// minted on first write and Monday maintains them afterwards. That means a
// seed run pre-populates the label set as a side-effect of upserting the
// first item/subitem in each status.

async function ensureColumns(
  boardId: string,
  current: MondayColumn[],
  specs: ColumnDefaults[],
  isSubitem: boolean,
  errors: string[],
): Promise<{ columnsByTitle: ColumnsByTitle; created: string[] }> {
  const byTitle = buildColumnsByTitle(current);
  const created: string[] = [];

  for (const spec of specs) {
    if (byTitle[spec.title]) continue;
    try {
      const data = await mondayQuery<{
        create_column: { id: string; title: string };
      }>(M_CREATE_COLUMN, {
        boardId,
        title: spec.title,
        type: spec.columnType,
      });
      byTitle[spec.title] = data.create_column.id;
      created.push(`${isSubitem ? "subitem:" : "item:"}${spec.title}`);
    } catch (err) {
      errors.push(
        `Failed to create column "${spec.title}" (${spec.columnType}) on board ${boardId}: ${(err as Error).message}`,
      );
    }
  }

  return { columnsByTitle: byTitle, created };
}

/**
 * Parse the `subtasks` column settings_str to extract the subitem board id.
 * Monday stores this as `{"boardIds": ["<subitem_board_id>"]}` (stringified).
 */
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

/**
 * Ensure the subitem board exists and return its id. If it doesn't, create
 * the first subitem under any existing item to auto-provision the subitem
 * board, then re-fetch the main board's columns.
 */
async function ensureSubitemBoardId(
  existingItems: MondayItem[],
  mainColumns: MondayColumn[],
  errors: string[],
): Promise<{ boardId: string | null; updatedMainColumns: MondayColumn[] }> {
  let subitemBoardId = extractSubitemBoardId(mainColumns);
  if (subitemBoardId) return { boardId: subitemBoardId, updatedMainColumns: mainColumns };

  // No subitems column yet. We need at least one item on the main board to
  // hang a throwaway subitem off of.
  const anyParent = existingItems[0];
  if (!anyParent) {
    // No items yet — the outer flow will create deliverable items first; we
    // can only resolve the subitem board after that step. Return null and let
    // the caller retry.
    return { boardId: null, updatedMainColumns: mainColumns };
  }

  try {
    const data = await mondayQuery<{
      create_subitem: { id: string; board: { id: string } };
    }>(M_CREATE_SUBITEM, {
      parentItemId: anyParent.id,
      name: "__seed_probe__",
      columnValues: JSON.stringify({}),
    });
    subitemBoardId = data.create_subitem.board?.id ?? null;
    // Re-fetch main board columns to pick up the auto-created `subtasks`
    // column (which now carries boardIds in settings_str).
    const updatedMainColumns = await fetchBoardColumns(MONDAY_BOARD_ID);
    if (!subitemBoardId) {
      subitemBoardId = extractSubitemBoardId(updatedMainColumns);
    }
    return { boardId: subitemBoardId, updatedMainColumns };
  } catch (err) {
    errors.push(
      `Failed to provision subitem board via throwaway subitem: ${(err as Error).message}`,
    );
    return { boardId: null, updatedMainColumns: mainColumns };
  }
}

/** Find the External ID column value on an item. */
function readExternalId(
  item: MondayItem,
  columnsByTitle: ColumnsByTitle,
  titleKey: string,
): string | null {
  const colId = columnsByTitle[titleKey];
  if (!colId) return null;
  const cv = item.column_values?.find((c) => c.id === colId);
  return cv?.text?.trim() || null;
}

// ─── Main entry ──────────────────────────────────────────────────────────────

export async function seedBoard(): Promise<SeedResult> {
  const result: SeedResult = {
    groupsCreated: [],
    columnsCreated: [],
    itemsCreated: 0,
    itemsUpdated: 0,
    subitemsCreated: 0,
    subitemsUpdated: 0,
    errors: [],
  };

  // 1. Fetch board structure.
  const structure = await fetchBoardStructure();

  // 2. Ensure groups.
  const { groupsByWorkstream, created: groupsCreated } = await ensureGroups(
    structure.groups,
    result.errors,
  );
  result.groupsCreated = groupsCreated;

  // 3. Ensure item columns.
  const { columnsByTitle: itemColumnsByTitle, created: itemColumnsCreated } =
    await ensureColumns(
      MONDAY_BOARD_ID,
      structure.columns,
      DELIVERABLE_COLUMN_SPECS,
      /* isSubitem */ false,
      result.errors,
    );
  result.columnsCreated.push(...itemColumnsCreated);

  // 4. Fetch existing items and index by External ID.
  const existingItems = await fetchAllItems();
  const itemsByExternalId = new Map<string, MondayItem>();
  for (const item of existingItems) {
    const ext = readExternalId(
      item,
      itemColumnsByTitle,
      DELIVERABLE_COLUMN_TITLES.externalId,
    );
    if (ext) itemsByExternalId.set(ext, item);
  }

  // 5. Upsert deliverable items.
  // Keep track of deliverableId → mondayItemId for subitem wiring.
  const deliverableItemIds = new Map<string, string>();

  for (const deliverable of DELIVERABLES) {
    const groupId = groupsByWorkstream[deliverable.workstream];
    if (!groupId) {
      result.errors.push(
        `No Monday group for workstream "${deliverable.workstream}" — skipping deliverable ${deliverable.id}`,
      );
      continue;
    }

    const override = undefined; // Overrides are client-side only; seed pushes
    // the static scope. Post-seed client sync will layer overrides on top.
    const columnValues = deliverableToMondayColumnValues(
      deliverable,
      override,
      itemColumnsByTitle,
    );

    const existing = itemsByExternalId.get(deliverable.id);
    if (existing) {
      deliverableItemIds.set(deliverable.id, existing.id);
      // Include name in the update so a TableX rename propagates.
      // change_multiple_column_values with a `name` key updates the item name.
      const payload: Record<string, unknown> = { ...columnValues };
      if (existing.name !== deliverable.name) {
        payload.name = deliverable.name;
      }
      try {
        await mondayQuery(M_CHANGE_ITEM_VALUES, {
          boardId: MONDAY_BOARD_ID,
          itemId: existing.id,
          columnValues: JSON.stringify(payload),
        });
        result.itemsUpdated++;
      } catch (err) {
        result.errors.push(
          `Failed to update item "${deliverable.id}" (${existing.id}): ${(err as Error).message}`,
        );
      }
      continue;
    }

    try {
      const data = await mondayQuery<{ create_item: { id: string } }>(
        M_CREATE_ITEM,
        {
          boardId: MONDAY_BOARD_ID,
          groupId,
          name: deliverable.name,
          columnValues: JSON.stringify(columnValues),
        },
      );
      deliverableItemIds.set(deliverable.id, data.create_item.id);
      result.itemsCreated++;
    } catch (err) {
      result.errors.push(
        `Failed to create item for deliverable "${deliverable.id}": ${(err as Error).message}`,
      );
    }
  }

  // 6. Resolve the subitem board and ensure its columns. At this point at
  //    least one item must exist on the main board, so we can auto-provision
  //    the subitem board by creating a throwaway subitem if needed.
  const {
    boardId: subitemBoardId,
    updatedMainColumns: _updatedMainColumns,
  } = await ensureSubitemBoardId(
    // Re-use the fresh list of items we just upserted. If existingItems was
    // empty we need a post-insert fetch, but create_item returns ids so
    // deliverableItemIds has enough for an upsert path — we just need *any*
    // parent to sit on. Prefer existingItems; fall back to first created id.
    existingItems.length > 0
      ? existingItems
      : Array.from(deliverableItemIds.values()).map((id) => ({
          id,
          name: "",
        })),
    structure.columns,
    result.errors,
  );
  void _updatedMainColumns;

  let subitemColumnsByTitle: ColumnsByTitle = {};

  if (!subitemBoardId) {
    result.errors.push(
      "Could not resolve subitem board id — skipping task subitem seeding.",
    );
  } else {
    const subitemColumns = await fetchBoardColumns(subitemBoardId);
    const { columnsByTitle, created: subitemColumnsCreated } =
      await ensureColumns(
        subitemBoardId,
        subitemColumns,
        SUBITEM_COLUMN_SPECS,
        /* isSubitem */ true,
        result.errors,
      );
    subitemColumnsByTitle = columnsByTitle;
    result.columnsCreated.push(...subitemColumnsCreated);
  }

  // 7. Seed task subitems — with cleanup of orphans from earlier bad runs.
  if (subitemBoardId) {
    const tasks = buildSeedTasks();
    const validIds = new Set(tasks.map((t) => t.id));

    // Refetch items WITH subitems so we can reconcile.
    const itemsWithSubitems = await fetchAllItems();
    const subitemsByExternalId = new Map<
      string,
      { id: string; parentId: string }
    >();
    const orphans: { id: string; parentId: string; externalId: string | null }[] = [];

    const extColId = subitemColumnsByTitle[SUBITEM_COLUMN_TITLES.externalId];
    for (const parent of itemsWithSubitems) {
      for (const sub of parent.subitems ?? []) {
        const cv = extColId
          ? sub.column_values?.find((c) => c.id === extColId)
          : undefined;
        const ext = cv?.text?.trim() || null;
        if (ext && validIds.has(ext)) {
          subitemsByExternalId.set(ext, { id: sub.id, parentId: parent.id });
        } else {
          // Either no external_id, or a stale one from a prior broken run.
          orphans.push({ id: sub.id, parentId: parent.id, externalId: ext });
        }
      }
    }

    // 7a. Delete orphans in parallel batches. `delete_item` works on subitems
    // (they are items on the subitem board).
    if (orphans.length > 0) {
      await inBatches(orphans, 10, async (orphan) => {
        try {
          await mondayQuery(M_DELETE_ITEM, { itemId: orphan.id });
          result.subitemsDeleted = (result.subitemsDeleted ?? 0) + 1;
        } catch (err) {
          result.errors.push(
            `Failed to delete orphan subitem ${orphan.id} (ext=${orphan.externalId ?? "none"}): ${(err as Error).message}`,
          );
        }
      });
    }

    // 7b. Upsert each task as a subitem — 10 in parallel to stay under Monday's
    // concurrent-request ceiling. Keeps the full seed under a dev-server
    // headers timeout window (was exceeding 60s serial, dropping the
    // connection and masquerading as a hanging request).
    await inBatches(tasks, 10, async (task) => {
      const parentItemId = deliverableItemIds.get(task.deliverableId);
      if (!parentItemId) {
        result.errors.push(
          `No Monday item for deliverable "${task.deliverableId}" — skipping task ${task.id}`,
        );
        return;
      }

      const columnValues = taskToMondayColumnValues(task, subitemColumnsByTitle);
      const existing = subitemsByExternalId.get(task.id);

      if (existing) {
        try {
          await mondayQuery(M_CHANGE_ITEM_VALUES, {
            boardId: subitemBoardId,
            itemId: existing.id,
            columnValues: JSON.stringify(columnValues),
          });
          result.subitemsUpdated++;
        } catch (err) {
          result.errors.push(
            `Failed to update subitem "${task.id}" (${existing.id}): ${(err as Error).message}`,
          );
        }
        return;
      }

      try {
        await mondayQuery<{ create_subitem: { id: string } }>(M_CREATE_SUBITEM, {
          parentItemId,
          name: task.title,
          columnValues: JSON.stringify(columnValues),
        });
        result.subitemsCreated++;
      } catch (err) {
        result.errors.push(
          `Failed to create subitem for task "${task.id}": ${(err as Error).message}`,
        );
      }
    });
  }

  return result;
}
