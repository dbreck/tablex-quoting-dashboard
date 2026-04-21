// TypeScript shapes for the narrow slice of the Monday.com API we consume.
// These mirror the GraphQL response shapes from `client.ts` queries — not the
// full API surface. Keep them minimal; expand only when a field is actually
// read.

export interface MondayGroup {
  id: string;
  title: string;
}

export interface MondayColumn {
  id: string;
  title: string;
  type: string;
  settings_str?: string;
}

export interface MondayColumnValue {
  id: string;
  type: string;
  text: string | null;
  value: string | null;
}

export interface MondaySubitem {
  id: string;
  name: string;
  updated_at?: string;
  column_values?: MondayColumnValue[];
}

export interface MondayItem {
  id: string;
  name: string;
  updated_at?: string;
  group?: MondayGroup;
  column_values?: MondayColumnValue[];
  subitems?: MondaySubitem[];
}

export interface MondayItemsPage {
  cursor: string | null;
  items: MondayItem[];
}

export interface MondayBoard {
  id: string;
  name: string;
  columns?: MondayColumn[];
  groups?: MondayGroup[];
  items_page?: MondayItemsPage;
}

/**
 * Column value input for `change_multiple_column_values` and `create_item`.
 * The Monday API expects these as a STRINGIFIED JSON object — e.g.
 * `JSON.stringify({ status: { label: "Done" }, hours: "16" })`. Individual
 * column values can be strings, numbers, or nested objects depending on type.
 */
export type ColumnValueInput =
  | string
  | number
  | { label: string }
  | { labels: string[] }
  | { date: string; time?: string }
  | { personsAndTeams: Array<{ id: number | string; kind: "person" | "team" }> };

export type ColumnValuesInput = Record<string, ColumnValueInput>;

/** Seed result summary returned by `seedBoard()`. */
export interface SeedResult {
  groupsCreated: string[];
  columnsCreated: string[];
  itemsCreated: number;
  itemsUpdated: number;
  subitemsCreated: number;
  subitemsUpdated: number;
  /** Orphaned subitems cleaned up (external_id not in current task set). */
  subitemsDeleted?: number;
  errors: string[];
}
