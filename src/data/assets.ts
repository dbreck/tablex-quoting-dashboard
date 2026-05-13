// Types + helpers for the Asset Inventory system. Mirrors Postgres columns
// from migration 026. One AssetGroup row holds an inline list of AssetItem
// jsonb entries (mirrors the project_tasks.subtasks pattern).

export type AssetGroupStatus =
  | "requested"
  | "in_progress"
  | "partial"
  | "complete"
  | "blocked";

export type AssetItemStatus =
  | "outstanding"
  | "in_review"
  | "complete"
  | "rejected";

export interface AssetItem {
  id: string;
  name: string;
  status: AssetItemStatus;
  sourceUrl?: string;
  notes?: string;
  completedAt?: string;
}

export interface AssetGroup {
  id: string;
  name: string;
  category?: string;
  description?: string;
  status: AssetGroupStatus;
  items: AssetItem[];
  vendor?: string;
  sourceUrl?: string;
  spreadsheetUrl?: string;
  notes?: string;
  tags: string[];
  deliverableId?: string;
  sortOrder: number;
  deliveredAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Enum metadata for UI ────────────────────────────────────────────────────

export const ASSET_GROUP_STATUSES: { id: AssetGroupStatus; label: string }[] = [
  { id: "requested", label: "Requested" },
  { id: "in_progress", label: "In progress" },
  { id: "partial", label: "Partial" },
  { id: "complete", label: "Complete" },
  { id: "blocked", label: "Blocked" },
];

export const ASSET_GROUP_STATUS_LABEL: Record<AssetGroupStatus, string> = {
  requested: "Requested",
  in_progress: "In progress",
  partial: "Partial",
  complete: "Complete",
  blocked: "Blocked",
};

export const ASSET_ITEM_STATUSES: { id: AssetItemStatus; label: string }[] = [
  { id: "outstanding", label: "Outstanding" },
  { id: "in_review", label: "In review" },
  { id: "complete", label: "Complete" },
  { id: "rejected", label: "Rejected" },
];

export const ASSET_ITEM_STATUS_LABEL: Record<AssetItemStatus, string> = {
  outstanding: "Outstanding",
  in_review: "In review",
  complete: "Complete",
  rejected: "Rejected",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** True when the group status is manually held — rollup will not overwrite. */
export function isManualStatus(status: AssetGroupStatus): boolean {
  return status === "blocked";
}

/** `${complete} / ${total}` summary for progress bars. */
export function itemCounts(items: AssetItem[]): {
  total: number;
  complete: number;
  outstanding: number;
  inReview: number;
  rejected: number;
} {
  let complete = 0;
  let outstanding = 0;
  let inReview = 0;
  let rejected = 0;
  for (const it of items) {
    if (it.status === "complete") complete += 1;
    else if (it.status === "in_review") inReview += 1;
    else if (it.status === "rejected") rejected += 1;
    else outstanding += 1;
  }
  return { total: items.length, complete, outstanding, inReview, rejected };
}

/** Local prefixing so callers don't pull nanoid here. Items use `itm_` prefix. */
export function makeAssetItemId(nanoid10: string): string {
  return `itm_${nanoid10}`;
}
