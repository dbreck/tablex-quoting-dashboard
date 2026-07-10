import { useMemo } from "react";
import { create } from "zustand";
import type { LaunchMilestone } from "@/data/launch-timeline";
import * as client from "@/lib/supabase/launch-timeline-client";
import {
  rowToMilestone,
  type LaunchMilestoneRow,
} from "@/lib/supabase/launch-timeline-converters";

// ─── Hydration + Realtime types ──────────────────────────────────────────────

export type LaunchTimelineRealtimeTable = "launch_milestones";
export type RealtimeEventType = "INSERT" | "UPDATE" | "DELETE";

// ─── Store shape ─────────────────────────────────────────────────────────────

interface LaunchTimelineStore {
  milestones: LaunchMilestone[];
  isInitialized: boolean;
  loadError: string | null;

  hydrate: (milestones: LaunchMilestone[]) => void;
  setLoadError: (message: string | null) => void;
  mergeRealtimeChange: (
    table: LaunchTimelineRealtimeTable,
    eventType: RealtimeEventType,
    row: Record<string, unknown> | null,
    oldRow?: Record<string, unknown> | null,
  ) => void;
  clearLocal: () => void;

  addMilestone: (milestone: LaunchMilestone) => Promise<void>;
  updateMilestone: (
    id: string,
    patch: Partial<Omit<LaunchMilestone, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
}

function toError(err: unknown, label: string): Error {
  if (err instanceof Error) return err;
  if (typeof err === "object" && err !== null) {
    const obj = err as { message?: string; details?: string; hint?: string; code?: string };
    const msg =
      obj.message ?? obj.details ?? obj.hint ?? (obj.code ? `Postgres error ${obj.code}` : null);
    if (msg) return new Error(msg);
  }
  return new Error(`${label} failed: ${String(err)}`);
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useLaunchTimelineStore = create<LaunchTimelineStore>()((set, get) => ({
  milestones: [],
  isInitialized: false,
  loadError: null,

  hydrate: (milestones) => {
    set({ milestones, isInitialized: true, loadError: null });
  },

  setLoadError: (message) => {
    set({ loadError: message });
  },

  mergeRealtimeChange: (table, eventType, row, oldRow) => {
    if (table !== "launch_milestones") return;
    const state = get();
    const id = (row?.id as string | undefined) ?? (oldRow?.id as string | undefined);
    if (!id) return;

    if (eventType === "DELETE") {
      set({ milestones: state.milestones.filter((m) => m.id !== id) });
      return;
    }
    if (!row) return;

    const incoming = rowToMilestone(row as unknown as LaunchMilestoneRow);
    const existing = state.milestones.find((m) => m.id === id);
    // Last-write-wins guard: ignore a realtime echo that's older than what we
    // already have locally (our own just-applied optimistic update).
    if (existing && Date.parse(existing.updatedAt) > Date.parse(incoming.updatedAt)) {
      return;
    }
    const next = existing
      ? state.milestones.map((m) => (m.id === id ? incoming : m))
      : [...state.milestones, incoming];
    set({ milestones: next });
  },

  clearLocal: () => {
    set({ milestones: [], isInitialized: false });
  },

  // ─── Mutations (optimistic local + write-through to Supabase) ───────────────

  addMilestone: async (milestone) => {
    const previous = get().milestones;
    set({ milestones: [...previous, milestone] });
    try {
      await client.createLaunchMilestone(milestone);
    } catch (err) {
      set({ milestones: previous });
      console.error("[launch-timeline-store] addMilestone failed", err);
      throw toError(err, "Add milestone");
    }
  },

  updateMilestone: async (id, patch) => {
    const now = new Date().toISOString();
    const previous = get().milestones;
    set({
      milestones: previous.map((m) => (m.id === id ? { ...m, ...patch, updatedAt: now } : m)),
    });
    try {
      await client.updateLaunchMilestone(id, patch);
    } catch (err) {
      set({ milestones: previous });
      console.error("[launch-timeline-store] updateMilestone failed", err);
      throw toError(err, "Update milestone");
    }
  },

  deleteMilestone: async (id) => {
    const previous = get().milestones;
    set({ milestones: previous.filter((m) => m.id !== id) });
    try {
      await client.deleteLaunchMilestone(id);
    } catch (err) {
      set({ milestones: previous });
      console.error("[launch-timeline-store] deleteMilestone failed", err);
      throw toError(err, "Delete milestone");
    }
  },
}));

// ─── Derived selectors (stable refs — derive in useMemo, per store invariant) ─

/** All milestones, sorted by start date then sort order. */
export function useLaunchMilestones(): LaunchMilestone[] {
  const milestones = useLaunchTimelineStore((s) => s.milestones);
  return useMemo(
    () =>
      [...milestones].sort(
        (a, b) => a.start.localeCompare(b.start) || a.sortOrder - b.sortOrder,
      ),
    [milestones],
  );
}

export function useLaunchTimelineInitialized(): boolean {
  return useLaunchTimelineStore((s) => s.isInitialized);
}
