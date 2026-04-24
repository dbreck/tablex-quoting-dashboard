// Pure snake_case ↔ camelCase converters for content_nodes + content_edges.
// Mirrors sprint-converters.ts. No supabase client coupling so server code
// can reuse these converters too.

export type ContentNodeKind = "root" | "section" | "page" | "utility" | "note";
export type ContentEdgeKind = "parent" | "link";
export type ContentAuthGate = "dealer" | "rep" | "admin";

export interface ContentNode {
  id: string;
  parentId: string | null;
  title: string;
  body: string | null;
  kind: ContentNodeKind;
  color: string | null;
  isNew: boolean;
  authGate: ContentAuthGate | null;
  positionX: number | null;
  positionY: number | null;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContentEdge {
  id: string;
  sourceId: string;
  targetId: string;
  kind: ContentEdgeKind;
  label: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Row shapes ─────────────────────────────────────────────────────────────

export interface ContentNodeRow {
  id: string;
  parent_id: string | null;
  title: string;
  body: string | null;
  kind: ContentNodeKind;
  color: string | null;
  is_new: boolean;
  auth_gate: ContentAuthGate | null;
  position_x: number | string | null;
  position_y: number | string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ContentEdgeRow {
  id: string;
  source_id: string;
  target_id: string;
  kind: ContentEdgeKind;
  label: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Row → TS ───────────────────────────────────────────────────────────────

function toNum(v: number | string | null): number | null {
  if (v === null || v === undefined) return null;
  return typeof v === "string" ? parseFloat(v) : v;
}

export function rowToContentNode(row: ContentNodeRow): ContentNode {
  return {
    id: row.id,
    parentId: row.parent_id,
    title: row.title,
    body: row.body,
    kind: row.kind,
    color: row.color,
    isNew: row.is_new,
    authGate: row.auth_gate,
    positionX: toNum(row.position_x),
    positionY: toNum(row.position_y),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToContentEdge(row: ContentEdgeRow): ContentEdge {
  return {
    id: row.id,
    sourceId: row.source_id,
    targetId: row.target_id,
    kind: row.kind,
    label: row.label,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── TS → Row (insert) ──────────────────────────────────────────────────────

export function nodeToInsertRow(
  node: Omit<ContentNode, "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  },
): Omit<ContentNodeRow, "created_at" | "updated_at"> & {
  created_at?: string;
  updated_at?: string;
} {
  return {
    id: node.id,
    parent_id: node.parentId,
    title: node.title,
    body: node.body,
    kind: node.kind,
    color: node.color,
    is_new: node.isNew,
    auth_gate: node.authGate,
    position_x: node.positionX,
    position_y: node.positionY,
    sort_order: node.sortOrder,
    created_at: node.createdAt,
    updated_at: node.updatedAt,
  };
}

export function edgeToInsertRow(
  edge: Omit<ContentEdge, "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  },
): Omit<ContentEdgeRow, "created_at" | "updated_at"> & {
  created_at?: string;
  updated_at?: string;
} {
  return {
    id: edge.id,
    source_id: edge.sourceId,
    target_id: edge.targetId,
    kind: edge.kind,
    label: edge.label,
    created_at: edge.createdAt,
    updated_at: edge.updatedAt,
  };
}

// ─── TS → Row (partial update) ──────────────────────────────────────────────

export function nodeUpdatesToRow(
  updates: Partial<Omit<ContentNode, "id" | "createdAt" | "updatedAt">>,
): Partial<Omit<ContentNodeRow, "id" | "created_at" | "updated_at">> {
  const row: Partial<Omit<ContentNodeRow, "id" | "created_at" | "updated_at">> = {};
  if (updates.parentId !== undefined) row.parent_id = updates.parentId;
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.body !== undefined) row.body = updates.body;
  if (updates.kind !== undefined) row.kind = updates.kind;
  if (updates.color !== undefined) row.color = updates.color;
  if (updates.isNew !== undefined) row.is_new = updates.isNew;
  if (updates.authGate !== undefined) row.auth_gate = updates.authGate;
  if (updates.positionX !== undefined) row.position_x = updates.positionX;
  if (updates.positionY !== undefined) row.position_y = updates.positionY;
  if (updates.sortOrder !== undefined) row.sort_order = updates.sortOrder;
  return row;
}

export function edgeUpdatesToRow(
  updates: Partial<Omit<ContentEdge, "id" | "createdAt" | "updatedAt">>,
): Partial<Omit<ContentEdgeRow, "id" | "created_at" | "updated_at">> {
  const row: Partial<Omit<ContentEdgeRow, "id" | "created_at" | "updated_at">> = {};
  if (updates.sourceId !== undefined) row.source_id = updates.sourceId;
  if (updates.targetId !== undefined) row.target_id = updates.targetId;
  if (updates.kind !== undefined) row.kind = updates.kind;
  if (updates.label !== undefined) row.label = updates.label;
  return row;
}
