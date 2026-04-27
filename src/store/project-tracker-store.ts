import { useMemo } from "react";
import { create } from "zustand";
import { nanoid } from "nanoid";
import {
  type Task,
  type Subtask,
  type AcceptanceCriterion,
  type KanbanColumn,
  type Priority,
  type TeamMember,
  type DeliverableOverride,
  type ScopeStatus,
  TEAM_COLORS,
  computeInitials,
  getDeliverableDays,
} from "@/data/project-tracker";
import { DELIVERABLES } from "@/data/project-phase2";
import * as trackerClient from "@/lib/supabase/tracker-client";
import {
  rowToTask,
  rowToTeamMember,
  rowToOverride,
  rowToSyncLink,
  type TaskRow,
  type TeamMemberRow,
  type DeliverableOverrideRow,
  type SyncLinkRow,
  type SyncLink,
  type SyncLogEntry,
} from "@/lib/supabase/tracker-converters";

// Re-export for backwards compatibility — historical consumers import these
// from the store. Source of truth is `tracker-converters.ts`.
export type { SyncLink, SyncLogEntry };

// ─── Types ────────────────────────────────────────────────────────────────────

interface Filters {
  assignee: string | "all";
  workstream: string | "all";
  priority: Priority | "all";
  /** "all" | sprint id | "none" (tasks without a sprint) */
  sprint: string | "all" | "none";
  search: string;
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

/** Snapshot from the Supabase fetch — passed to `hydrate()`. */
export interface TrackerHydrationSnapshot {
  tasks: Task[];
  teamMembers: Record<string, TeamMember>;
  deliverableOverrides: Record<string, DeliverableOverride>;
  syncLinks: Record<string, SyncLink>;
  syncLog: SyncLogEntry[];
  baselinedAt: string | null;
}

/** Tables that emit Realtime postgres_changes events for the tracker. */
export type RealtimeTable =
  | "project_tasks"
  | "deliverable_overrides"
  | "team_members"
  | "sync_links"
  | "tracker_meta";

export type RealtimeEventType = "INSERT" | "UPDATE" | "DELETE";

interface ProjectTrackerStore {
  tasks: Task[];
  teamMembers: Record<string, TeamMember>;
  deliverableOverrides: Record<string, DeliverableOverride>;
  syncState: Record<string, SyncLink>;
  syncStatus: SyncStatusState;
  syncLog: SyncLogEntry[];
  baselinedAt: string | null;
  isInitialized: boolean;

  // Hydration / Realtime / lifecycle
  hydrate: (snapshot: TrackerHydrationSnapshot) => void;
  mergeRealtimeChange: (
    table: RealtimeTable,
    eventType: RealtimeEventType,
    row: Record<string, unknown> | null,
    oldRow?: Record<string, unknown> | null,
  ) => void;
  clearLocal: () => void;

  // Task CRUD
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "sortOrder">) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, toColumn: KanbanColumn, newSortOrder: number) => void;
  duplicateTask: (sourceId: string, targetDeliverableId: string) => string | null;

  // Subtask operations
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  removeSubtask: (taskId: string, subtaskId: string) => void;

  // Acceptance criteria operations
  addAcceptanceCriterion: (taskId: string, label: string) => void;
  toggleAcceptanceCriterion: (taskId: string, criterionId: string) => void;
  removeAcceptanceCriterion: (taskId: string, criterionId: string) => void;

  // Blocker (set reason to null/empty to clear)
  setTaskBlocker: (taskId: string, reason: string | null) => void;

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
  sprint: "all",
  search: "",
};

// ─── Write-through error handler ──────────────────────────────────────────────

/**
 * Fire-and-forget wrapper used by every write-through mutation. Logs the
 * error and lets the next Realtime event or explicit refetch reconcile the
 * local state. We intentionally don't propagate failures to callers — the
 * action signatures stay synchronous-looking so existing components don't
 * change.
 */
function fireAndForget(label: string, p: Promise<unknown>): void {
  void p.catch((err) => {
    console.error(`[tracker-store] ${label} failed`, err);
  });
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useProjectTrackerStore = create<ProjectTrackerStore>()((set, get) => ({
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

  hydrate: (snapshot) => {
    set({
      tasks: snapshot.tasks,
      teamMembers: snapshot.teamMembers,
      deliverableOverrides: snapshot.deliverableOverrides,
      syncState: snapshot.syncLinks,
      syncLog: snapshot.syncLog,
      baselinedAt: snapshot.baselinedAt,
      isInitialized: true,
    });
  },

  mergeRealtimeChange: (table, eventType, row, oldRow) => {
    const state = get();

    if (table === "project_tasks") {
      const id =
        (row?.id as string | undefined) ??
        (oldRow?.id as string | undefined);
      if (!id) return;
      if (eventType === "DELETE") {
        set({ tasks: state.tasks.filter((t) => t.id !== id) });
        return;
      }
      if (!row) return;
      const incoming = rowToTask(row as unknown as TaskRow);
      const existing = state.tasks.find((t) => t.id === id);
      // If our local copy is newer (we just wrote), don't clobber.
      if (existing && existing.updatedAt && incoming.updatedAt) {
        if (Date.parse(existing.updatedAt) > Date.parse(incoming.updatedAt)) {
          return;
        }
      }
      if (existing) {
        set({
          tasks: state.tasks.map((t) => (t.id === id ? incoming : t)),
        });
      } else {
        set({ tasks: [...state.tasks, incoming] });
      }
      return;
    }

    if (table === "deliverable_overrides") {
      const deliverableId =
        (row?.deliverable_id as string | undefined) ??
        (oldRow?.deliverable_id as string | undefined);
      if (!deliverableId) return;
      const overrides = { ...state.deliverableOverrides };
      if (eventType === "DELETE") {
        delete overrides[deliverableId];
        set({ deliverableOverrides: overrides });
        return;
      }
      if (!row) return;
      overrides[deliverableId] = rowToOverride(
        row as unknown as DeliverableOverrideRow,
      );
      set({ deliverableOverrides: overrides });
      return;
    }

    if (table === "team_members") {
      const id =
        (row?.id as string | undefined) ??
        (oldRow?.id as string | undefined);
      if (!id) return;
      const members = { ...state.teamMembers };
      if (eventType === "DELETE") {
        delete members[id];
        set({
          teamMembers: members,
          // Postgres SET NULL handles the FK on the DB side; mirror in memory.
          tasks: state.tasks.map((t) =>
            t.assignee === id ? { ...t, assignee: null } : t,
          ),
        });
        return;
      }
      if (!row) return;
      members[id] = rowToTeamMember(row as unknown as TeamMemberRow);
      set({ teamMembers: members });
      return;
    }

    if (table === "sync_links") {
      const tableXId =
        (row?.table_x_id as string | undefined) ??
        (oldRow?.table_x_id as string | undefined);
      if (!tableXId) return;
      const links = { ...state.syncState };
      if (eventType === "DELETE") {
        delete links[tableXId];
        set({ syncState: links });
        return;
      }
      if (!row) return;
      links[tableXId] = rowToSyncLink(row as unknown as SyncLinkRow);
      set({ syncState: links });
      return;
    }

    if (table === "tracker_meta") {
      const key = (row?.key as string | undefined) ?? null;
      if (!key) return;
      if (key === "baselinedAt") {
        if (eventType === "DELETE") {
          set({ baselinedAt: null });
        } else {
          const value = row?.value;
          set({
            baselinedAt: typeof value === "string" ? (value as string) : null,
          });
        }
      }
      return;
    }
  },

  clearLocal: () => {
    set({
      tasks: [],
      teamMembers: {},
      deliverableOverrides: {},
      syncState: {},
      syncLog: [],
      baselinedAt: null,
      isInitialized: false,
      syncStatus: {
        status: "idle",
        lastSyncedAt: null,
        lastError: null,
        lastSummary: null,
      },
    });
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
    fireAndForget("insertTask", trackerClient.insertTask(task));
  },

  updateTask: (id, updates) => {
    const now = new Date().toISOString();
    const current = get().tasks.find((t) => t.id === id);
    // Auto-stamp startedAt on the first transition out of "backlog".
    const effective: Partial<Omit<Task, "id" | "createdAt">> =
      current &&
      updates.column &&
      updates.column !== "backlog" &&
      current.column === "backlog" &&
      !current.startedAt
        ? { ...updates, startedAt: now }
        : updates;
    set({
      tasks: get().tasks.map((t) =>
        t.id === id ? { ...t, ...effective, updatedAt: now } : t,
      ),
    });
    fireAndForget("updateTask", trackerClient.updateTask(id, effective));
  },

  deleteTask: (id) => {
    set({ tasks: get().tasks.filter((t) => t.id !== id) });
    fireAndForget("deleteTask", trackerClient.deleteTask(id));
  },

  duplicateTask: (sourceId, targetDeliverableId) => {
    const source = get().tasks.find((t) => t.id === sourceId);
    if (!source) return null;
    const now = new Date().toISOString();
    const tasks = get().tasks;
    const maxSort = tasks.reduce((max, t) => Math.max(max, t.sortOrder), 0);
    const clone: Task = {
      ...source,
      id: nanoid(10),
      deliverableId: targetDeliverableId,
      subtasks: source.subtasks.map((s) => ({ ...s, id: nanoid(8) })),
      acceptanceCriteria: (source.acceptanceCriteria ?? []).map((c) => ({
        ...c,
        id: nanoid(8),
      })),
      createdAt: now,
      updatedAt: now,
      sortOrder: maxSort + 1,
    };
    set({ tasks: [...tasks, clone] });
    fireAndForget("duplicateTask", trackerClient.insertTask(clone));
    return clone.id;
  },

  moveTask: (taskId, toColumn, newSortOrder) => {
    const now = new Date().toISOString();
    const current = get().tasks.find((t) => t.id === taskId);
    const updates: Partial<Task> = {
      column: toColumn,
      sortOrder: newSortOrder,
      completedAt: toColumn === "done" ? now : undefined,
    };
    // Auto-stamp startedAt on the first transition out of "backlog".
    if (
      current &&
      toColumn !== "backlog" &&
      current.column === "backlog" &&
      !current.startedAt
    ) {
      updates.startedAt = now;
    }
    set({
      tasks: get().tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates, updatedAt: now } : t,
      ),
    });
    fireAndForget("moveTask", trackerClient.updateTask(taskId, updates));
  },

  addSubtask: (taskId, title) => {
    const subtask: Subtask = { id: nanoid(8), title, completed: false };
    const now = new Date().toISOString();
    let nextSubtasks: Subtask[] = [];
    set({
      tasks: get().tasks.map((t) => {
        if (t.id !== taskId) return t;
        nextSubtasks = [...t.subtasks, subtask];
        return { ...t, subtasks: nextSubtasks, updatedAt: now };
      }),
    });
    fireAndForget(
      "addSubtask",
      trackerClient.persistSubtasks(taskId, nextSubtasks),
    );
  },

  toggleSubtask: (taskId, subtaskId) => {
    const now = new Date().toISOString();
    let nextSubtasks: Subtask[] = [];
    set({
      tasks: get().tasks.map((t) => {
        if (t.id !== taskId) return t;
        nextSubtasks = t.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s,
        );
        return { ...t, subtasks: nextSubtasks, updatedAt: now };
      }),
    });
    fireAndForget(
      "toggleSubtask",
      trackerClient.persistSubtasks(taskId, nextSubtasks),
    );
  },

  removeSubtask: (taskId, subtaskId) => {
    const now = new Date().toISOString();
    let nextSubtasks: Subtask[] = [];
    set({
      tasks: get().tasks.map((t) => {
        if (t.id !== taskId) return t;
        nextSubtasks = t.subtasks.filter((s) => s.id !== subtaskId);
        return { ...t, subtasks: nextSubtasks, updatedAt: now };
      }),
    });
    fireAndForget(
      "removeSubtask",
      trackerClient.persistSubtasks(taskId, nextSubtasks),
    );
  },

  addAcceptanceCriterion: (taskId, label) => {
    const criterion: AcceptanceCriterion = { id: nanoid(8), label, completed: false };
    const now = new Date().toISOString();
    let next: AcceptanceCriterion[] = [];
    set({
      tasks: get().tasks.map((t) => {
        if (t.id !== taskId) return t;
        next = [...(t.acceptanceCriteria ?? []), criterion];
        return { ...t, acceptanceCriteria: next, updatedAt: now };
      }),
    });
    fireAndForget(
      "addAcceptanceCriterion",
      trackerClient.persistAcceptanceCriteria(taskId, next),
    );
  },

  toggleAcceptanceCriterion: (taskId, criterionId) => {
    const now = new Date().toISOString();
    let next: AcceptanceCriterion[] = [];
    set({
      tasks: get().tasks.map((t) => {
        if (t.id !== taskId) return t;
        next = (t.acceptanceCriteria ?? []).map((c) =>
          c.id === criterionId ? { ...c, completed: !c.completed } : c,
        );
        return { ...t, acceptanceCriteria: next, updatedAt: now };
      }),
    });
    fireAndForget(
      "toggleAcceptanceCriterion",
      trackerClient.persistAcceptanceCriteria(taskId, next),
    );
  },

  removeAcceptanceCriterion: (taskId, criterionId) => {
    const now = new Date().toISOString();
    let next: AcceptanceCriterion[] = [];
    set({
      tasks: get().tasks.map((t) => {
        if (t.id !== taskId) return t;
        next = (t.acceptanceCriteria ?? []).filter((c) => c.id !== criterionId);
        return { ...t, acceptanceCriteria: next, updatedAt: now };
      }),
    });
    fireAndForget(
      "removeAcceptanceCriterion",
      trackerClient.persistAcceptanceCriteria(taskId, next),
    );
  },

  setTaskBlocker: (taskId, reason) => {
    const trimmed = reason?.trim() ?? "";
    const now = new Date().toISOString();
    const current = get().tasks.find((t) => t.id === taskId);
    if (!current) return;
    const isClearing = trimmed.length === 0;
    const updates: Partial<Task> = isClearing
      ? { blockerReason: null, blockedAt: null }
      : {
          blockerReason: trimmed,
          // Preserve the original blockedAt if already raised; only stamp on first raise.
          blockedAt: current.blockedAt ?? now,
        };
    set({
      tasks: get().tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates, updatedAt: now } : t,
      ),
    });
    fireAndForget("setTaskBlocker", trackerClient.updateTask(taskId, updates));
  },

  bulkUpdateTasks: (ids, updates) => {
    const now = new Date().toISOString();
    set({
      tasks: get().tasks.map((t) =>
        ids.includes(t.id) ? { ...t, ...updates, updatedAt: now } : t,
      ),
    });
    fireAndForget(
      "bulkUpdateTasks",
      trackerClient.bulkUpdateTasks(ids, updates),
    );
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
    fireAndForget("addTeamMember", trackerClient.addTeamMember(member));
    return id;
  },

  updateTeamMember: (id, updates) => {
    const current = get().teamMembers[id];
    if (!current) return;
    const next: TeamMember = { ...current, ...updates };
    if (updates.name && !updates.initials && current.initials === computeInitials(current.name)) {
      next.initials = computeInitials(updates.name);
    }
    set({ teamMembers: { ...get().teamMembers, [id]: next } });
    // Send the same delta we set locally (initials may have been auto-derived).
    const persistedUpdates: Partial<Omit<TeamMember, "id">> = { ...updates };
    if (next.initials !== current.initials && updates.initials === undefined) {
      persistedUpdates.initials = next.initials;
    }
    fireAndForget(
      "updateTeamMember",
      trackerClient.updateTeamMember(id, persistedUpdates),
    );
  },

  deleteTeamMember: (id) => {
    // Cascade: unassign any task referencing this member. Postgres mirrors
    // this server-side via ON DELETE SET NULL on the assignee FK.
    const now = new Date().toISOString();
    const { [id]: _removed, ...remainingMembers } = get().teamMembers;
    void _removed;
    set({
      teamMembers: remainingMembers,
      tasks: get().tasks.map((t) =>
        t.assignee === id ? { ...t, assignee: null, updatedAt: now } : t,
      ),
    });
    fireAndForget("deleteTeamMember", trackerClient.deleteTeamMember(id));
  },

  setRationale: (deliverableId, rationale) => {
    const overrides = get().deliverableOverrides;
    const current = overrides[deliverableId] ?? { deliverableId };
    const next = { ...current, rationale: rationale.trim() || undefined };
    set({
      deliverableOverrides: { ...overrides, [deliverableId]: next },
    });
    fireAndForget("setRationale", trackerClient.upsertOverride(next));
  },

  setDaysOverride: (deliverableId, days) => {
    const overrides = get().deliverableOverrides;
    const current = overrides[deliverableId] ?? { deliverableId };
    const next = { ...current, daysOverride: days };
    set({
      deliverableOverrides: { ...overrides, [deliverableId]: next },
    });
    fireAndForget("setDaysOverride", trackerClient.upsertOverride(next));
  },

  setManualStatus: (deliverableId, status) => {
    const overrides = get().deliverableOverrides;
    const current = overrides[deliverableId] ?? { deliverableId };
    const next = { ...current, manualStatus: status ?? undefined };
    set({
      deliverableOverrides: { ...overrides, [deliverableId]: next },
    });
    fireAndForget("setManualStatus", trackerClient.upsertOverride(next));
  },

  setBaseline: (deliverableId, days) => {
    const overrides = get().deliverableOverrides;
    const current = overrides[deliverableId] ?? { deliverableId };
    const next = { ...current, baselineDays: days };
    set({
      deliverableOverrides: { ...overrides, [deliverableId]: next },
    });
    fireAndForget("setBaseline", trackerClient.upsertOverride(next));
  },

  clearBaseline: (deliverableId) => {
    const overrides = get().deliverableOverrides;
    const current = overrides[deliverableId];
    if (!current) return;
    const next = { ...current, baselineDays: null };
    set({
      deliverableOverrides: { ...overrides, [deliverableId]: next },
    });
    fireAndForget("clearBaseline", trackerClient.upsertOverride(next));
  },

  saveAllBaselines: () => {
    const state = get();
    const overrides = { ...state.deliverableOverrides };
    const baselinedAt = new Date().toISOString();
    const updated: DeliverableOverride[] = [];
    for (const d of DELIVERABLES) {
      const override = overrides[d.id] ?? { deliverableId: d.id };
      const days = getDeliverableDays(d, override);
      const next = { ...override, baselineDays: days };
      overrides[d.id] = next;
      updated.push(next);
    }
    set({ deliverableOverrides: overrides, baselinedAt });
    fireAndForget(
      "saveAllBaselines",
      Promise.all([
        trackerClient.bulkUpsertOverrides(updated),
        trackerClient.setMeta("baselinedAt", baselinedAt),
      ]),
    );
  },

  clearAllBaselines: () => {
    const overrides = { ...get().deliverableOverrides };
    for (const id of Object.keys(overrides)) {
      overrides[id] = { ...overrides[id], baselineDays: null };
    }
    set({ deliverableOverrides: overrides, baselinedAt: null });
    fireAndForget(
      "clearAllBaselines",
      Promise.all([
        trackerClient.clearAllBaselines(),
        trackerClient.setMeta("baselinedAt", null),
      ]),
    );
  },

  setSyncLink: (tableXId, mondayItemId) => {
    const syncState = get().syncState;
    const current = syncState[tableXId] ?? {
      mondayItemId: null,
      lastSyncedAt: null,
      lastMondayUpdatedAt: null,
    };
    const next: SyncLink = {
      ...current,
      mondayItemId,
      lastSyncedAt: new Date().toISOString(),
    };
    set({
      syncState: { ...syncState, [tableXId]: next },
    });
    fireAndForget("setSyncLink", trackerClient.upsertSyncLink(tableXId, next));
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

    // Note: we don't write-through to Supabase from here — the new
    // server-driven sync route (task #1, owned by `sync` teammate) writes
    // patches/overrides/links/log entries directly via the admin client.
    // This action stays as the local-state applier for the in-flight client
    // (matching today's behavior). Realtime backfills any drift.
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
    const next: SyncLink = {
      ...current,
      lastSyncedAt: new Date().toISOString(),
      lastMondayUpdatedAt: mondayUpdatedAt,
    };
    set({
      syncState: { ...syncState, [tableXId]: next },
    });
    fireAndForget("recordSync", trackerClient.upsertSyncLink(tableXId, next));
  },

  setFilter: (key, value) => {
    set({ filters: { ...get().filters, [key]: value } });
  },

  resetFilters: () => {
    set({ filters: { ...defaultFilters } });
  },
}));

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
