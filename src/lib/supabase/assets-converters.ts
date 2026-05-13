// Pure snake_case ↔ camelCase converters for project_assets.
// No supabase client coupling — reusable from route handlers if needed later.

import type {
  AssetGroup,
  AssetGroupStatus,
  AssetItem,
} from "@/data/assets";

export interface AssetGroupRow {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  status: AssetGroupStatus;
  items: AssetItem[] | null;
  vendor: string | null;
  source_url: string | null;
  spreadsheet_url: string | null;
  notes: string | null;
  tags: string[] | null;
  deliverable_id: string | null;
  sort_order: number;
  delivered_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Row → TS ────────────────────────────────────────────────────────────────

export function rowToAssetGroup(row: AssetGroupRow): AssetGroup {
  return {
    id: row.id,
    name: row.name,
    category: row.category ?? undefined,
    description: row.description ?? undefined,
    status: row.status,
    items: Array.isArray(row.items) ? row.items : [],
    vendor: row.vendor ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    spreadsheetUrl: row.spreadsheet_url ?? undefined,
    notes: row.notes ?? undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    deliverableId: row.deliverable_id ?? undefined,
    sortOrder: row.sort_order,
    deliveredAt: row.delivered_at ?? undefined,
    approvedAt: row.approved_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── TS → Row ────────────────────────────────────────────────────────────────

export function assetGroupToInsertRow(
  group: Omit<AssetGroup, "createdAt" | "updatedAt">,
): Omit<AssetGroupRow, "created_at" | "updated_at"> {
  return {
    id: group.id,
    name: group.name,
    category: group.category ?? null,
    description: group.description ?? null,
    status: group.status,
    items: group.items ?? [],
    vendor: group.vendor ?? null,
    source_url: group.sourceUrl ?? null,
    spreadsheet_url: group.spreadsheetUrl ?? null,
    notes: group.notes ?? null,
    tags: group.tags ?? [],
    deliverable_id: group.deliverableId ?? null,
    sort_order: group.sortOrder,
    delivered_at: group.deliveredAt ?? null,
    approved_at: group.approvedAt ?? null,
  };
}

export function assetGroupUpdatesToRow(
  updates: Partial<Omit<AssetGroup, "id" | "createdAt" | "updatedAt">>,
): Partial<Omit<AssetGroupRow, "id" | "created_at" | "updated_at">> {
  const row: Partial<Omit<AssetGroupRow, "id" | "created_at" | "updated_at">> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.category !== undefined) row.category = updates.category ?? null;
  if (updates.description !== undefined) row.description = updates.description ?? null;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.items !== undefined) row.items = updates.items;
  if (updates.vendor !== undefined) row.vendor = updates.vendor ?? null;
  if (updates.sourceUrl !== undefined) row.source_url = updates.sourceUrl ?? null;
  if (updates.spreadsheetUrl !== undefined)
    row.spreadsheet_url = updates.spreadsheetUrl ?? null;
  if (updates.notes !== undefined) row.notes = updates.notes ?? null;
  if (updates.tags !== undefined) row.tags = updates.tags;
  if (updates.deliverableId !== undefined)
    row.deliverable_id = updates.deliverableId ?? null;
  if (updates.sortOrder !== undefined) row.sort_order = updates.sortOrder;
  if (updates.deliveredAt !== undefined) row.delivered_at = updates.deliveredAt ?? null;
  if (updates.approvedAt !== undefined) row.approved_at = updates.approvedAt ?? null;
  return row;
}
