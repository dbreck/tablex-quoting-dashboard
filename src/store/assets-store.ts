import { useMemo } from "react";
import { create } from "zustand";
import type { AssetGroup, AssetGroupStatus, AssetItem } from "@/data/assets";
import * as assetsClient from "@/lib/supabase/assets-client";
import {
  rowToAssetGroup,
  type AssetGroupRow,
} from "@/lib/supabase/assets-converters";
import { rollupAssetGroupStatus } from "@/lib/assets/rollup";

// ─── Hydration + Realtime types ──────────────────────────────────────────────

export interface AssetsHydrationSnapshot {
  assetGroups: AssetGroup[];
}

export type AssetsRealtimeTable = "project_assets";
export type RealtimeEventType = "INSERT" | "UPDATE" | "DELETE";

// ─── Store shape ─────────────────────────────────────────────────────────────

interface AssetsStore {
  assetGroups: AssetGroup[];
  isInitialized: boolean;

  hydrate: (snapshot: AssetsHydrationSnapshot) => void;
  mergeRealtimeChange: (
    table: AssetsRealtimeTable,
    eventType: RealtimeEventType,
    row: Record<string, unknown> | null,
    oldRow?: Record<string, unknown> | null,
  ) => void;
  clearLocal: () => void;

  addAssetGroup: (group: AssetGroup) => Promise<void>;
  updateAssetGroup: (
    id: string,
    patch: Partial<Omit<AssetGroup, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<void>;
  deleteAssetGroup: (id: string) => Promise<void>;

  /**
   * Replace the items array on a group. Runs the rollup function and writes
   * status + deliveredAt alongside items in a single update.
   */
  setAssetItems: (id: string, items: AssetItem[]) => Promise<void>;

  /**
   * Toggle the manual `blocked` override. When already blocked, recomputes
   * status from items. When not blocked, flips to blocked.
   */
  toggleBlocked: (id: string) => Promise<void>;
}

function toError(err: unknown, label: string): Error {
  if (err instanceof Error) return err;
  if (typeof err === "object" && err !== null) {
    const obj = err as { message?: string; details?: string; hint?: string; code?: string };
    const msg =
      obj.message ??
      obj.details ??
      obj.hint ??
      (obj.code ? `Postgres error ${obj.code}` : null);
    if (msg) return new Error(msg);
  }
  return new Error(`${label} failed: ${String(err)}`);
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAssetsStore = create<AssetsStore>()((set, get) => ({
  assetGroups: [],
  isInitialized: false,

  hydrate: (snapshot) => {
    set({ assetGroups: snapshot.assetGroups, isInitialized: true });
  },

  mergeRealtimeChange: (table, eventType, row, oldRow) => {
    if (table !== "project_assets") return;
    const state = get();
    const id = (row?.id as string | undefined) ?? (oldRow?.id as string | undefined);
    if (!id) return;

    if (eventType === "DELETE") {
      set({ assetGroups: state.assetGroups.filter((g) => g.id !== id) });
      return;
    }
    if (!row) return;

    const incoming = rowToAssetGroup(row as unknown as AssetGroupRow);
    const existing = state.assetGroups.find((g) => g.id === id);
    if (existing && Date.parse(existing.updatedAt) > Date.parse(incoming.updatedAt)) {
      return;
    }
    const next = existing
      ? state.assetGroups.map((g) => (g.id === id ? incoming : g))
      : [...state.assetGroups, incoming];
    set({ assetGroups: next });
  },

  clearLocal: () => {
    set({ assetGroups: [], isInitialized: false });
  },

  // ─── Mutations ─────────────────────────────────────────────────────────────

  addAssetGroup: async (group) => {
    const previous = get().assetGroups;
    set({ assetGroups: [...previous, group] });
    try {
      await assetsClient.createAssetGroup({
        id: group.id,
        name: group.name,
        category: group.category,
        description: group.description,
        status: group.status,
        items: group.items,
        vendor: group.vendor,
        sourceUrl: group.sourceUrl,
        spreadsheetUrl: group.spreadsheetUrl,
        notes: group.notes,
        tags: group.tags,
        deliverableId: group.deliverableId,
        sortOrder: group.sortOrder,
        deliveredAt: group.deliveredAt,
        approvedAt: group.approvedAt,
      });
    } catch (err) {
      set({ assetGroups: previous });
      console.error("[assets-store] addAssetGroup failed", err);
      throw toError(err, "Save asset group");
    }
  },

  updateAssetGroup: async (id, patch) => {
    const now = new Date().toISOString();
    const previous = get().assetGroups;
    set({
      assetGroups: previous.map((g) =>
        g.id === id ? { ...g, ...patch, updatedAt: now } : g,
      ),
    });
    try {
      await assetsClient.updateAssetGroup(id, patch);
    } catch (err) {
      set({ assetGroups: previous });
      console.error("[assets-store] updateAssetGroup failed", err);
      throw toError(err, "Update asset group");
    }
  },

  deleteAssetGroup: async (id) => {
    const previous = get().assetGroups;
    set({ assetGroups: previous.filter((g) => g.id !== id) });
    try {
      await assetsClient.deleteAssetGroup(id);
    } catch (err) {
      set({ assetGroups: previous });
      console.error("[assets-store] deleteAssetGroup failed", err);
      throw toError(err, "Delete asset group");
    }
  },

  setAssetItems: async (id, items) => {
    const group = get().assetGroups.find((g) => g.id === id);
    if (!group) return;
    const result = rollupAssetGroupStatus(items, group.status, group.deliveredAt);
    await get().updateAssetGroup(id, {
      items,
      status: result.status,
      deliveredAt: result.deliveredAt ?? undefined,
    });
  },

  toggleBlocked: async (id) => {
    const group = get().assetGroups.find((g) => g.id === id);
    if (!group) return;
    if (group.status === "blocked") {
      // Un-block: recompute from items as if status were 'requested'.
      const result = rollupAssetGroupStatus(group.items, "requested", group.deliveredAt);
      await get().updateAssetGroup(id, {
        status: result.status,
        deliveredAt: result.deliveredAt ?? undefined,
      });
    } else {
      await get().updateAssetGroup(id, { status: "blocked" });
    }
  },
}));

// ─── Derived selectors ───────────────────────────────────────────────────────

/** All asset groups sorted by updatedAt desc. */
export function useAssetGroups(): AssetGroup[] {
  const groups = useAssetsStore((s) => s.assetGroups);
  return useMemo(
    () => [...groups].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [groups],
  );
}

export function useAssetGroup(id: string | null | undefined): AssetGroup | undefined {
  return useAssetsStore((s) => {
    if (!id) return undefined;
    return s.assetGroups.find((g) => g.id === id);
  });
}

/** Convenience: count groups in each status bucket. */
export function useAssetGroupStatusCounts(): Record<AssetGroupStatus, number> {
  const groups = useAssetsStore((s) => s.assetGroups);
  return useMemo(() => {
    const counts: Record<AssetGroupStatus, number> = {
      requested: 0,
      in_progress: 0,
      partial: 0,
      complete: 0,
      blocked: 0,
    };
    for (const g of groups) counts[g.status] += 1;
    return counts;
  }, [groups]);
}
