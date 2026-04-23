import { useMemo } from "react";
import { create } from "zustand";
import { type Sprint, type BurndownSnapshot, getSprintForDate } from "@/data/sprint";
import * as sprintClient from "@/lib/supabase/sprint-client";
import {
  rowToSprint,
  rowToBurndownSnapshot,
  type SprintRow,
  type BurndownSnapshotRow,
} from "@/lib/supabase/sprint-converters";

// ─── Hydration + Realtime types ──────────────────────────────────────────────

export interface SprintHydrationSnapshot {
  sprints: Sprint[];
}

export type SprintRealtimeTable = "sprints" | "burndown_snapshots";
export type RealtimeEventType = "INSERT" | "UPDATE" | "DELETE";

// ─── Store shape ─────────────────────────────────────────────────────────────

interface SprintStore {
  sprints: Sprint[];
  burndownBySprint: Record<string, BurndownSnapshot[]>;
  isInitialized: boolean;

  // Lifecycle
  hydrate: (snapshot: SprintHydrationSnapshot) => void;
  mergeRealtimeChange: (
    table: SprintRealtimeTable,
    eventType: RealtimeEventType,
    row: Record<string, unknown> | null,
    oldRow?: Record<string, unknown> | null,
  ) => void;
  clearLocal: () => void;

  // CRUD
  addSprint: (sprint: Sprint) => void;
  updateSprint: (
    id: string,
    patch: Partial<Omit<Sprint, "id" | "createdAt" | "updatedAt">>,
  ) => void;
  deleteSprint: (id: string) => void;
  bulkCreateSprints: (sprints: Sprint[]) => void;

  // Burndown loaders
  loadBurndownForSprint: (sprintId: string) => Promise<void>;
}

// ─── Write-through error handler ──────────────────────────────────────────────

function fireAndForget(label: string, p: Promise<unknown>): void {
  void p.catch((err) => {
    console.error(`[sprint-store] ${label} failed`, err);
  });
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSprintStore = create<SprintStore>()((set, get) => ({
  sprints: [],
  burndownBySprint: {},
  isInitialized: false,

  hydrate: (snapshot) => {
    set({ sprints: snapshot.sprints, isInitialized: true });
  },

  mergeRealtimeChange: (table, eventType, row, oldRow) => {
    const state = get();

    if (table === "sprints") {
      const id =
        (row?.id as string | undefined) ?? (oldRow?.id as string | undefined);
      if (!id) return;
      if (eventType === "DELETE") {
        set({
          sprints: state.sprints.filter((s) => s.id !== id),
          // Drop cached burndown for the deleted sprint.
          burndownBySprint: Object.fromEntries(
            Object.entries(state.burndownBySprint).filter(([k]) => k !== id),
          ),
        });
        return;
      }
      if (!row) return;
      const incoming = rowToSprint(row as unknown as SprintRow);
      const existing = state.sprints.find((s) => s.id === id);
      if (existing && existing.updatedAt && incoming.updatedAt) {
        if (Date.parse(existing.updatedAt) > Date.parse(incoming.updatedAt)) {
          return;
        }
      }
      const next = existing
        ? state.sprints.map((s) => (s.id === id ? incoming : s))
        : [...state.sprints, incoming];
      // Keep ordered by startDate for stable consumers.
      next.sort((a, b) => a.startDate.localeCompare(b.startDate));
      set({ sprints: next });
      return;
    }

    if (table === "burndown_snapshots") {
      const sprintId =
        (row?.sprint_id as string | undefined) ??
        (oldRow?.sprint_id as string | undefined);
      if (!sprintId) return;
      const cached = state.burndownBySprint[sprintId];
      // Only mutate if we have a cached series for this sprint — otherwise
      // the detail page will load on demand and pick up the row then.
      if (!cached) return;

      const snapshotDate =
        (row?.snapshot_date as string | undefined) ??
        (oldRow?.snapshot_date as string | undefined);
      if (!snapshotDate) return;

      let nextSeries = cached;
      if (eventType === "DELETE") {
        nextSeries = cached.filter((s) => s.snapshotDate !== snapshotDate);
      } else if (row) {
        const incoming = rowToBurndownSnapshot(row as unknown as BurndownSnapshotRow);
        const idx = cached.findIndex((s) => s.snapshotDate === incoming.snapshotDate);
        if (idx >= 0) {
          nextSeries = cached.map((s, i) => (i === idx ? incoming : s));
        } else {
          nextSeries = [...cached, incoming].sort((a, b) =>
            a.snapshotDate.localeCompare(b.snapshotDate),
          );
        }
      }
      set({
        burndownBySprint: { ...state.burndownBySprint, [sprintId]: nextSeries },
      });
      return;
    }
  },

  clearLocal: () => {
    set({ sprints: [], burndownBySprint: {}, isInitialized: false });
  },

  addSprint: (sprint) => {
    set({
      sprints: [...get().sprints, sprint].sort((a, b) =>
        a.startDate.localeCompare(b.startDate),
      ),
    });
    fireAndForget(
      "addSprint",
      sprintClient.createSprint({
        id: sprint.id,
        name: sprint.name,
        goal: sprint.goal,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        status: sprint.status,
      }),
    );
  },

  updateSprint: (id, patch) => {
    const now = new Date().toISOString();
    set({
      sprints: get().sprints.map((s) =>
        s.id === id ? { ...s, ...patch, updatedAt: now } : s,
      ),
    });
    fireAndForget("updateSprint", sprintClient.updateSprint(id, patch));
  },

  deleteSprint: (id) => {
    const remaining = get().sprints.filter((s) => s.id !== id);
    const burndownBySprint = Object.fromEntries(
      Object.entries(get().burndownBySprint).filter(([k]) => k !== id),
    );
    set({ sprints: remaining, burndownBySprint });
    fireAndForget("deleteSprint", sprintClient.deleteSprint(id));
  },

  bulkCreateSprints: (sprints) => {
    if (sprints.length === 0) return;
    set({
      sprints: [...get().sprints, ...sprints].sort((a, b) =>
        a.startDate.localeCompare(b.startDate),
      ),
    });
    fireAndForget("bulkCreateSprints", sprintClient.bulkCreateSprints(sprints));
  },

  loadBurndownForSprint: async (sprintId) => {
    try {
      const series = await sprintClient.fetchBurndownSnapshots(sprintId);
      set({
        burndownBySprint: { ...get().burndownBySprint, [sprintId]: series },
      });
    } catch (err) {
      console.error(`[sprint-store] loadBurndownForSprint(${sprintId}) failed`, err);
    }
  },
}));

// ─── Derived selectors / hooks ───────────────────────────────────────────────

// Stable today-string at module scope so the memo key is consistent across
// renders within the same calendar day.
function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Returns the sprint whose [startDate, endDate] inclusive contains today.
 * Memoized on the sprints array reference + today's date.
 */
export function useActiveSprint(): Sprint | null {
  const sprints = useSprintStore((s) => s.sprints);
  const today = todayISO();
  return useMemo(() => getSprintForDate(sprints, today), [sprints, today]);
}

/** Cached burndown series for a sprint, or null if not yet loaded. */
export function useBurndownSeries(sprintId: string | null | undefined): BurndownSnapshot[] | null {
  return useSprintStore((s) => (sprintId ? s.burndownBySprint[sprintId] ?? null : null));
}

/** Look up a single sprint by id. Returns undefined if not found. */
export function useSprint(sprintId: string | null | undefined): Sprint | undefined {
  return useSprintStore((s) => {
    if (!sprintId) return undefined;
    return s.sprints.find((sp) => sp.id === sprintId);
  });
}

/** Sorted-by-startDate list of all sprints (stable ref via useMemo). */
export function useSprints(): Sprint[] {
  const sprints = useSprintStore((s) => s.sprints);
  return useMemo(
    () => [...sprints].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [sprints],
  );
}
