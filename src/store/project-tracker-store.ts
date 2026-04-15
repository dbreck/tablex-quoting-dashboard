import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import {
  type Task,
  type Subtask,
  type KanbanColumn,
  type Priority,
  type TeamMember,
  generateInitialTasks,
} from "@/data/project-tracker";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Filters {
  assignee: TeamMember | "all";
  workstream: string | "all";
  priority: Priority | "all";
  search: string;
}

interface ProjectTrackerStore {
  tasks: Task[];
  isInitialized: boolean;

  // Initialization
  initializeFromDeliverables: () => void;

  // CRUD
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "sortOrder">) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, toColumn: KanbanColumn, newSortOrder: number) => void;

  // Subtask operations
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  removeSubtask: (taskId: string, subtaskId: string) => void;

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
      isInitialized: false,
      filters: { ...defaultFilters },

      initializeFromDeliverables: () => {
        if (get().isInitialized) return;
        const tasks = generateInitialTasks();
        set({ tasks, isInitialized: true });
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

      setFilter: (key, value) => {
        set({ filters: { ...get().filters, [key]: value } });
      },

      resetFilters: () => {
        set({ filters: { ...defaultFilters } });
      },
    }),
    {
      name: "tablex-project-tracker-v1",
      partialize: (state) => ({
        tasks: state.tasks,
        isInitialized: state.isInitialized,
      }),
    }
  )
);
