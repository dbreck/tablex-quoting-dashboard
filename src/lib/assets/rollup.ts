// Pure status-rollup function. Given a list of items and the current group
// status, returns the status the group should have. `blocked` is a manual
// override and is preserved untouched.

import type { AssetGroupStatus, AssetItem } from "@/data/assets";

export interface RollupResult {
  status: AssetGroupStatus;
  deliveredAt: string | null;
}

export function rollupAssetGroupStatus(
  items: AssetItem[],
  currentStatus: AssetGroupStatus,
  currentDeliveredAt?: string,
  nowIso: string = new Date().toISOString(),
): RollupResult {
  // Manual override: never overwrite a blocked group.
  if (currentStatus === "blocked") {
    return { status: "blocked", deliveredAt: currentDeliveredAt ?? null };
  }

  if (items.length === 0) {
    return { status: "requested", deliveredAt: null };
  }

  let completeCount = 0;
  let hasMotion = false;

  for (const item of items) {
    if (item.status === "complete") completeCount += 1;
    if (item.status === "in_review" || (item.sourceUrl && item.sourceUrl.length > 0)) {
      hasMotion = true;
    }
  }

  if (completeCount === items.length) {
    // First complete moment stamps deliveredAt; later writes preserve the original.
    return {
      status: "complete",
      deliveredAt: currentDeliveredAt ?? nowIso,
    };
  }

  if (completeCount > 0) {
    return { status: "partial", deliveredAt: null };
  }

  if (hasMotion) {
    return { status: "in_progress", deliveredAt: null };
  }

  return { status: "requested", deliveredAt: null };
}
