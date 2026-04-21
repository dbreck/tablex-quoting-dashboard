// Project Tracker — Task/Story layer on top of Deliverables
// Tasks reference deliverableId from project-phase2.ts

import { nanoid } from "nanoid";
import { DELIVERABLES, WORKSTREAMS, type Deliverable } from "./project-phase2";

// ─── Types ────────────────────────────────────────────────────────────────────

export type KanbanColumn = "backlog" | "in-progress" | "in-review" | "done";
export type Priority = "low" | "medium" | "high" | "critical";
export type TeamMember = "danny" | "kayla" | "arabella";

export interface Task {
  id: string;
  deliverableId: string;
  title: string;
  description?: string;
  column: KanbanColumn;
  priority: Priority;
  assignee: TeamMember | null;
  labels: string[];
  subtasks: Subtask[];
  /** ISO date (YYYY-MM-DD) */
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  sortOrder: number;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const TEAM_MEMBERS: { id: TeamMember; name: string; role: string; initials: string; color: string }[] = [
  { id: "danny", name: "Danny", role: "Developer", initials: "DB", color: "#3b82f6" },
  { id: "kayla", name: "Kayla", role: "Designer", initials: "KS", color: "#ec4899" },
  { id: "arabella", name: "Arabella", role: "PM", initials: "AH", color: "#f59e0b" },
];

export const LABELS = [
  { id: "frontend", name: "Frontend", color: "#3b82f6" },
  { id: "backend", name: "Backend", color: "#8b5cf6" },
  { id: "design", name: "Design", color: "#ec4899" },
  { id: "devops", name: "DevOps", color: "#f59e0b" },
  { id: "content", name: "Content", color: "#06b6d4" },
  { id: "bug", name: "Bug", color: "#ef4444" },
  { id: "blocked", name: "Blocked", color: "#6b7280" },
];

export const COLUMNS: { id: KanbanColumn; label: string; color: string }[] = [
  { id: "backlog", label: "Backlog", color: "#6b7280" },
  { id: "in-progress", label: "In Progress", color: "#f59e0b" },
  { id: "in-review", label: "In Review", color: "#8b5cf6" },
  { id: "done", label: "Done", color: "#10b981" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Infer labels from deliverable workstream and phase */
function inferLabels(d: Deliverable): string[] {
  const labels: string[] = [];
  // Design-phase deliverables get "design" label
  if (d.phase === "design" && d.hourlyRate === 150) labels.push("design");
  // Build-phase deliverables get "frontend" or "backend" based on name
  if (d.phase === "build") {
    if (d.name.toLowerCase().includes("frontend") || d.name.toLowerCase().includes("ui")) {
      labels.push("frontend");
    } else {
      labels.push("backend");
    }
  }
  if (d.workstream === "xero") labels.push("backend");
  if (d.name.toLowerCase().includes("content") || d.name.toLowerCase().includes("cms")) labels.push("content");
  return labels;
}

/** Infer default assignee from deliverable phase */
function inferAssignee(d: Deliverable): TeamMember | null {
  if (d.phase === "design" && d.hourlyRate === 150) return "kayla";
  if (d.phase === "build") return "danny";
  if (d.phase === "discovery") return null; // shared
  return null;
}

/** Infer priority from deliverable phase/position */
function inferPriority(d: Deliverable): Priority {
  if (d.status === "complete") return "low";
  if (d.phase === "discovery") return "high";
  if (d.phase === "design") return "high";
  if (d.phase === "build") return "medium";
  return "low";
}

/** Map deliverable status to kanban column */
function statusToColumn(d: Deliverable): KanbanColumn {
  if (d.status === "complete") return "done";
  if (d.status === "in-progress") return "in-progress";
  return "backlog";
}

/** Generate initial tasks from deliverable requirements */
export function generateInitialTasks(): Task[] {
  const now = new Date().toISOString();
  const tasks: Task[] = [];
  let sortOrder = 0;

  for (const d of DELIVERABLES) {
    // Create one task per requirement
    for (const req of d.requirements) {
      tasks.push({
        id: nanoid(10),
        deliverableId: d.id,
        title: req,
        column: statusToColumn(d),
        priority: inferPriority(d),
        assignee: inferAssignee(d),
        labels: inferLabels(d),
        subtasks: [],
        createdAt: now,
        updatedAt: now,
        completedAt: d.status === "complete" ? now : undefined,
        sortOrder: sortOrder++,
      });
    }
  }

  return tasks;
}

/** Compute deliverable status from its tasks */
export function computeDeliverableStatus(
  deliverableId: string,
  tasks: Task[]
): "planned" | "in-progress" | "complete" {
  const deliverableTasks = tasks.filter((t) => t.deliverableId === deliverableId);
  if (deliverableTasks.length === 0) {
    // Fall back to original status
    const original = DELIVERABLES.find((d) => d.id === deliverableId);
    return original?.status ?? "planned";
  }
  if (deliverableTasks.every((t) => t.column === "done")) return "complete";
  if (deliverableTasks.some((t) => t.column === "in-progress" || t.column === "in-review")) return "in-progress";
  return "planned";
}

/** Get workstream for a deliverable ID */
export function getWorkstreamForDeliverable(deliverableId: string) {
  const d = DELIVERABLES.find((del) => del.id === deliverableId);
  if (!d) return null;
  return WORKSTREAMS.find((ws) => ws.id === d.workstream) ?? null;
}

/** Filter tasks by assignee, workstream, priority, and search */
export function filterTasks(
  tasks: Task[],
  filters: { assignee: string; workstream: string; priority: string; search: string }
): Task[] {
  return tasks.filter((t) => {
    if (filters.assignee !== "all" && t.assignee !== filters.assignee) return false;
    if (filters.priority !== "all" && t.priority !== filters.priority) return false;
    if (filters.workstream !== "all") {
      const deliverable = DELIVERABLES.find((d) => d.id === t.deliverableId);
      if (deliverable?.workstream !== filters.workstream) return false;
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (!t.title.toLowerCase().includes(search) && !t.description?.toLowerCase().includes(search)) return false;
    }
    return true;
  });
}

/** Classify a due date relative to today */
export type DueStatus = "overdue" | "due-soon" | "upcoming" | "none";

export function getDueStatus(task: Pick<Task, "dueDate" | "column">): DueStatus {
  if (!task.dueDate) return "none";
  if (task.column === "done") return "upcoming";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate + "T00:00:00");
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (diffDays < 0) return "overdue";
  if (diffDays <= 3) return "due-soon";
  return "upcoming";
}

/** Short display format for due dates (e.g. "May 15" or "May 15 '27" if not this year) */
export function formatDueDate(dueDate: string): string {
  const date = new Date(dueDate + "T00:00:00");
  const now = new Date();
  if (date.getFullYear() !== now.getFullYear()) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Get progress stats for a deliverable's tasks */
export function getDeliverableProgress(tasks: Task[], deliverableId: string) {
  const deliverableTasks = tasks.filter((t) => t.deliverableId === deliverableId);
  const done = deliverableTasks.filter((t) => t.column === "done").length;
  const total = deliverableTasks.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, percent };
}
