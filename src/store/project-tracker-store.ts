import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import {
  type Task,
  type Subtask,
  type KanbanColumn,
  type Priority,
  type TeamMember,
  type DeliverableOverride,
  type ScopeStatus,
  DEFAULT_TEAM_MEMBERS,
  TEAM_COLORS,
  computeInitials,
  generateInitialTasks,
  hoursToDays,
  getDeliverableDays,
} from "@/data/project-tracker";
import { DELIVERABLES } from "@/data/project-phase2";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Filters {
  assignee: string | "all";
  workstream: string | "all";
  priority: Priority | "all";
  search: string;
}

export interface SyncLink {
  mondayItemId: string | null;
  lastSyncedAt: string | null;
  lastMondayUpdatedAt: string | null;
}

export interface SyncLogEntry {
  at: string;
  direction: "pulled" | "pushed" | "linked" | "skipped" | "error";
  kind: "task" | "deliverable";
  tableXId: string;
  detail?: string;
}

export type SyncStatus = "idle" | "syncing" | "saved" | "error";

export interface SyncStatusState {
  status: SyncStatus;
  lastSyncedAt: string | null;
  lastError: string | null;
  lastSummary: { pulled: number; pushed: number; errors: number } | null;
}

export interface ApplySyncPatchesArgs {
  syncedAt: string;
  taskPatches: Array<{
    taskId: string;
    patch: Partial<Task>;
    mondayItemId: string;
    mondayUpdatedAt: string;
  }>;
  overridePatches: Array<{
    deliverableId: string;
    patch: Partial<DeliverableOverride>;
    mondayItemId: string;
    mondayUpdatedAt: string;
  }>;
  pushedTaskIds: string[];
  pushedDeliverableIds: string[];
  linkUpdates: Array<{
    tableXId: string;
    mondayItemId: string;
    mondayUpdatedAt: string | null;
  }>;
}

interface ProjectTrackerStore {
  tasks: Task[];
  teamMembers: Record<string, TeamMember>;
  deliverableOverrides: Record<string, DeliverableOverride>;
  syncState: Record<string, SyncLink>;
  syncStatus: SyncStatusState;
  syncLog: SyncLogEntry[];
  baselinedAt: string | null;
  isInitialized: boolean;

  // Initialization
  initializeFromDeliverables: () => void;

  // Task CRUD
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "sortOrder">) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, toColumn: KanbanColumn, newSortOrder: number) => void;

  // Subtask operations
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  removeSubtask: (taskId: string, subtaskId: string) => void;

  // Bulk operations
  bulkUpdateTasks: (ids: string[], updates: Partial<Omit<Task, "id" | "createdAt">>) => void;

  // Team CRUD
  addTeamMember: (partial: Omit<TeamMember, "id" | "initials" | "color"> & Partial<Pick<TeamMember, "initials" | "color">>) => string;
  updateTeamMember: (id: string, updates: Partial<Omit<TeamMember, "id">>) => void;
  deleteTeamMember: (id: string) => void;

  // Deliverable overrides (scope layer)
  setRationale: (deliverableId: string, rationale: string) => void;
  setDaysOverride: (deliverableId: string, days: number | undefined) => void;
  setManualStatus: (deliverableId: string, status: ScopeStatus | null) => void;
  setBaseline: (deliverableId: string, days: number) => void;
  clearBaseline: (deliverableId: string) => void;
  saveAllBaselines: () => void;
  clearAllBaselines: () => void;

  // Monday.com sync links + status
  setSyncLink: (tableXId: string, mondayItemId: string) => void;
  recordSync: (tableXId: string, mondayUpdatedAt: string | null) => void;
  applySyncPatches: (args: ApplySyncPatchesArgs) => void;
  setSyncStatus: (updates: Partial<SyncStatusState>) => void;
  appendSyncLog: (entries: SyncLogEntry[]) => void;

  // Filters (transient)
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  resetFilters: () => void;
}

// ─── Default Filters ──────────────────────────────────────────────────────────

const defaultFilters: Filters = {
  assignee: "all",
  workstream: "all",
  priority: "all",
  search: "",
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useProjectTrackerStore = create<ProjectTrackerStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      teamMembers: {},
      deliverableOverrides: {},
      syncState: {},
      syncStatus: {
        status: "idle",
        lastSyncedAt: null,
        lastError: null,
        lastSummary: null,
      },
      syncLog: [],
      baselinedAt: null,
      isInitialized: false,
      filters: { ...defaultFilters },

      initializeFromDeliverables: () => {
        // Backfill-on-hydrate: runs on every call, seeds only missing top-level
        // slices. Returning users keep their edits; new slices introduced in
        // later versions (teamMembers, deliverableOverrides) can be seeded here
        // without tripping the full reset path.
        const state = get();
        const updates: Partial<ProjectTrackerStore> = {};

        if (!state.isInitialized) {
          updates.tasks = generateInitialTasks();
          updates.isInitialized = true;
        }

        if (!state.teamMembers || Object.keys(state.teamMembers).length === 0) {
          updates.teamMembers = { ...DEFAULT_TEAM_MEMBERS };
        }

        if (!state.deliverableOverrides) {
          updates.deliverableOverrides = {};
        }

        if (!state.syncState) {
          updates.syncState = {};
        }

        if (!state.syncLog) {
          updates.syncLog = [];
        }

        if (!state.syncStatus) {
          updates.syncStatus = {
            status: "idle",
            lastSyncedAt: null,
            lastError: null,
            lastSummary: null,
          };
        }

        if (Object.keys(updates).length > 0) {
          set(updates);
        }
      },

      addTask: (taskData) => {
        const now = new Date().toISOString();
        const tasks = get().tasks;
        const maxSort = tasks.reduce((max, t) => Math.max(max, t.sortOrder), 0);
        const task: Task = {
          ...taskData,
          id: nanoid(10),
          createdAt: now,
          updatedAt: now,
          sortOrder: maxSort + 1,
        };
        set({ tasks: [...tasks, task] });
      },

      updateTask: (id, updates) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === id
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t
          ),
        });
      },

      deleteTask: (id) => {
        set({ tasks: get().tasks.filter((t) => t.id !== id) });
      },

      moveTask: (taskId, toColumn, newSortOrder) => {
        const now = new Date().toISOString();
        set({
          tasks: get().tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  column: toColumn,
                  sortOrder: newSortOrder,
                  updatedAt: now,
                  completedAt: toColumn === "done" ? now : undefined,
                }
              : t
          ),
        });
      },

      addSubtask: (taskId, title) => {
        const subtask: Subtask = { id: nanoid(8), title, completed: false };
        set({
          tasks: get().tasks.map((t) =>
            t.id === taskId
              ? { ...t, subtasks: [...t.subtasks, subtask], updatedAt: new Date().toISOString() }
              : t
          ),
        });
      },

      toggleSubtask: (taskId, subtaskId) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: t.subtasks.map((s) =>
                    s.id === subtaskId ? { ...s, completed: !s.completed } : s
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        });
      },

      removeSubtask: (taskId, subtaskId) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        });
      },

      bulkUpdateTasks: (ids, updates) => {
        const now = new Date().toISOString();
        set({
          tasks: get().tasks.map((t) =>
            ids.includes(t.id) ? { ...t, ...updates, updatedAt: now } : t
          ),
        });
      },

      addTeamMember: (partial) => {
        const id = nanoid(8);
        const existing = Object.values(get().teamMembers);
        const usedColors = new Set(existing.map((m) => m.color));
        const nextColor =
          partial.color ??
          TEAM_COLORS.find((c) => !usedColors.has(c)) ??
          TEAM_COLORS[existing.length % TEAM_COLORS.length];
        const member: TeamMember = {
          id,
          name: partial.name,
          role: partial.role,
          initials: partial.initials ?? computeInitials(partial.name),
          color: nextColor,
          company: partial.company,
          title: partial.title,
          email: partial.email,
          phone: partial.phone,
          notes: partial.notes,
        };
        set({ teamMembers: { ...get().teamMembers, [id]: member } });
        return id;
      },

      updateTeamMember: (id, updates) => {
        const current = get().teamMembers[id];
        if (!current) return;
        // Auto-update initials if name changed and initials weren't manually set.
        const next: TeamMember = { ...current, ...updates };
        if (updates.name && !updates.initials && current.initials === computeInitials(current.name)) {
          next.initials = computeInitials(updates.name);
        }
        set({ teamMembers: { ...get().teamMembers, [id]: next } });
      },

      deleteTeamMember: (id) => {
        // Cascade: unassign any task referencing this member.
        const now = new Date().toISOString();
        const { [id]: _removed, ...remainingMembers } = get().teamMembers;
        set({
          teamMembers: remainingMembers,
          tasks: get().tasks.map((t) =>
            t.assignee === id ? { ...t, assignee: null, updatedAt: now } : t
          ),
        });
      },

      setRationale: (deliverableId, rationale) => {
        const overrides = get().deliverableOverrides;
        const current = overrides[deliverableId] ?? { deliverableId };
        set({
          deliverableOverrides: {
            ...overrides,
            [deliverableId]: { ...current, rationale: rationale.trim() || undefined },
          },
        });
      },

      setDaysOverride: (deliverableId, days) => {
        const overrides = get().deliverableOverrides;
        const current = overrides[deliverableId] ?? { deliverableId };
        set({
          deliverableOverrides: {
            ...overrides,
            [deliverableId]: { ...current, daysOverride: days },
          },
        });
      },

      setManualStatus: (deliverableId, status) => {
        const overrides = get().deliverableOverrides;
        const current = overrides[deliverableId] ?? { deliverableId };
        set({
          deliverableOverrides: {
            ...overrides,
            [deliverableId]: { ...current, manualStatus: status ?? undefined },
          },
        });
      },

      setBaseline: (deliverableId, days) => {
        const overrides = get().deliverableOverrides;
        const current = overrides[deliverableId] ?? { deliverableId };
        set({
          deliverableOverrides: {
            ...overrides,
            [deliverableId]: { ...current, baselineDays: days },
          },
        });
      },

      clearBaseline: (deliverableId) => {
        const overrides = get().deliverableOverrides;
        const current = overrides[deliverableId];
        if (!current) return;
        set({
          deliverableOverrides: {
            ...overrides,
            [deliverableId]: { ...current, baselineDays: null },
          },
        });
      },

      saveAllBaselines: () => {
        const state = get();
        const overrides = { ...state.deliverableOverrides };
        for (const d of DELIVERABLES) {
          const override = overrides[d.id] ?? { deliverableId: d.id };
          const days = getDeliverableDays(d, override);
          overrides[d.id] = { ...override, baselineDays: days };
        }
        set({
          deliverableOverrides: overrides,
          baselinedAt: new Date().toISOString(),
        });
      },

      clearAllBaselines: () => {
        const overrides = { ...get().deliverableOverrides };
        for (const id of Object.keys(overrides)) {
          overrides[id] = { ...overrides[id], baselineDays: null };
        }
        set({ deliverableOverrides: overrides, baselinedAt: null });
      },

      setSyncLink: (tableXId, mondayItemId) => {
        const syncState = get().syncState;
        const current = syncState[tableXId] ?? {
          mondayItemId: null,
          lastSyncedAt: null,
          lastMondayUpdatedAt: null,
        };
        set({
          syncState: {
            ...syncState,
            [tableXId]: {
              ...current,
              mondayItemId,
              lastSyncedAt: new Date().toISOString(),
            },
          },
        });
      },

      applySyncPatches: ({
        syncedAt,
        taskPatches,
        overridePatches,
        pushedTaskIds,
        pushedDeliverableIds,
        linkUpdates,
      }) => {
        const state = get();

        // Apply pulled task patches WITHOUT bumping updatedAt to "now" — use
        // syncedAt so the next reconcile sees the task as already in sync.
        const tasksById = new Map(state.tasks.map((t) => [t.id, t]));
        for (const { taskId, patch } of taskPatches) {
          const current = tasksById.get(taskId);
          if (!current) continue;
          tasksById.set(taskId, { ...current, ...patch, updatedAt: syncedAt });
        }
        const tasks = Array.from(tasksById.values());

        // Apply pulled override patches.
        const overrides = { ...state.deliverableOverrides };
        for (const { deliverableId, patch } of overridePatches) {
          const current = overrides[deliverableId] ?? { deliverableId };
          overrides[deliverableId] = { ...current, ...patch };
        }

        // Build the merged syncState. Touch every record we either pulled,
        // pushed, or just linked — set lastSyncedAt to syncedAt and
        // lastMondayUpdatedAt to whatever we just observed.
        const syncState = { ...state.syncState };
        const touch = (
          tableXId: string,
          mondayItemId: string,
          mondayUpdatedAt: string | null,
        ) => {
          const current = syncState[tableXId] ?? {
            mondayItemId: null,
            lastSyncedAt: null,
            lastMondayUpdatedAt: null,
          };
          syncState[tableXId] = {
            ...current,
            mondayItemId,
            lastSyncedAt: syncedAt,
            lastMondayUpdatedAt:
              mondayUpdatedAt ?? current.lastMondayUpdatedAt ?? syncedAt,
          };
        };

        for (const p of taskPatches) {
          touch(p.taskId, p.mondayItemId, p.mondayUpdatedAt);
        }
        for (const p of overridePatches) {
          touch(p.deliverableId, p.mondayItemId, p.mondayUpdatedAt);
        }
        for (const l of linkUpdates) {
          touch(l.tableXId, l.mondayItemId, l.mondayUpdatedAt);
        }
        // Pushed records: we don't have a fresh Monday updated_at without a
        // re-fetch, so approximate with syncedAt. Next pull aligns it.
        for (const taskId of pushedTaskIds) {
          const link = syncState[taskId];
          if (link?.mondayItemId) touch(taskId, link.mondayItemId, syncedAt);
        }
        for (const deliverableId of pushedDeliverableIds) {
          const link = syncState[deliverableId];
          if (link?.mondayItemId) {
            touch(deliverableId, link.mondayItemId, syncedAt);
          }
        }

        set({ tasks, deliverableOverrides: overrides, syncState });
      },

      setSyncStatus: (updates) => {
        set({ syncStatus: { ...get().syncStatus, ...updates } });
      },

      appendSyncLog: (entries) => {
        if (entries.length === 0) return;
        const merged = [...entries, ...get().syncLog].slice(0, 50);
        set({ syncLog: merged });
      },

      recordSync: (tableXId, mondayUpdatedAt) => {
        const syncState = get().syncState;
        const current = syncState[tableXId] ?? {
          mondayItemId: null,
          lastSyncedAt: null,
          lastMondayUpdatedAt: null,
        };
        set({
          syncState: {
            ...syncState,
            [tableXId]: {
              ...current,
              lastSyncedAt: new Date().toISOString(),
              lastMondayUpdatedAt: mondayUpdatedAt,
            },
          },
        });
      },

      setFilter: (key, value) => {
        set({ filters: { ...get().filters, [key]: value } });
      },

      resetFilters: () => {
        set({ filters: { ...defaultFilters } });
      },
    }),
    {
      name: "tablex-project-tracker-v1",
      version: 5,
      partialize: (state) => ({
        tasks: state.tasks,
        teamMembers: state.teamMembers,
        deliverableOverrides: state.deliverableOverrides,
        syncState: state.syncState,
        syncLog: state.syncLog,
        baselinedAt: state.baselinedAt,
        isInitialized: state.isInitialized,
        // syncStatus is intentionally NOT persisted — transient UI state.
      }),
      migrate: (persistedState, _version) => {
        // Shape-preserving migration. New slices are seeded by the backfill-on-hydrate
        // path in initializeFromDeliverables — migrate is only for renaming or
        // transforming existing fields.
        return persistedState;
      },
    }
  )
);

// ─── Derived selectors / hooks ────────────────────────────────────────────────

// IMPORTANT: selectors passed to useProjectTrackerStore must return stable
// references — returning a fresh array/object every call triggers an infinite
// render loop (React error #185). Read the raw slice and derive with useMemo.

/** Flat array of team members, sorted alphabetically by name. */
export function useTeam(): TeamMember[] {
  const map = useProjectTrackerStore((s) => s.teamMembers);
  return useMemo(
    () => Object.values(map).sort((a, b) => a.name.localeCompare(b.name)),
    [map],
  );
}

/** Look up a single team member by id. Returns undefined if not found. */
export function useTeamMember(id: string | null | undefined): TeamMember | undefined {
  return useProjectTrackerStore((s) => (id ? s.teamMembers[id] : undefined));
}

/** Full overrides map keyed by deliverable id. */
export function useDeliverableOverrides(): Record<string, DeliverableOverride> {
  return useProjectTrackerStore((s) => s.deliverableOverrides);
}
