// Project Tracker — Task/Story layer on top of Deliverables
// Tasks reference deliverableId from project-phase2.ts

import { DELIVERABLES, WORKSTREAMS, type Deliverable } from "./project-phase2";

// ─── Types ────────────────────────────────────────────────────────────────────

export type KanbanColumn = "backlog" | "in-progress" | "in-review" | "done";
export type Priority = "low" | "medium" | "high" | "critical";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  company?: string;
  title?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface Task {
  id: string;
  deliverableId: string;
  title: string;
  description?: string;
  column: KanbanColumn;
  priority: Priority;
  /** TeamMember id. Null when unassigned. */
  assignee: string | null;
  /** Sprint id. Null/undefined when not in a sprint (backlog). */
  sprintId?: string | null;
  labels: string[];
  subtasks: Subtask[];
  acceptanceCriteria: AcceptanceCriterion[];
  /** ISO date (YYYY-MM-DD) */
  dueDate?: string;
  /**
   * ISO timestamp of the first transition out of "backlog". Never overwritten
   * once set. Used by the sprint timeline to draw Gantt bars. Not user-editable.
   */
  startedAt?: string;
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

export interface AcceptanceCriterion {
  id: string;
  label: string;
  completed: boolean;
}

/**
 * User-editable overrides for a static Deliverable from project-phase2.
 * Fixed facts (name, description, hourlyRate, phase, dates) stay in the
 * source file. Only fields that drift from the quote live here — baseline,
 * rationale, optional days override, manual status.
 */
export interface DeliverableOverride {
  deliverableId: string;
  /** Snapshot of "as quoted" days. Null until explicitly baselined. */
  baselineDays?: number | null;
  /** One-line explanation: "how did we arrive at this estimate?" */
  rationale?: string;
  /** Override the derived days (from hoursToDays). Optional — undefined means "use derived". */
  daysOverride?: number;
  /** Manual status override. When set, takes precedence over the static status. */
  manualStatus?: "planned" | "in-progress" | "complete" | null;
}

export type ScopeStatus = "planned" | "in-progress" | "complete";

// ─── Constants ────────────────────────────────────────────────────────────────

/** 10-color palette for team member avatars. */
export const TEAM_COLORS = [
  "#3b82f6", // blue
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#8b5cf6", // violet
  "#ef4444", // red
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
  "#64748b", // slate
] as const;

/** Compute initials from a full name. Handles single names, multi-part names. */
export function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Seed team keyed by id. Used by the store's backfill-on-hydrate path.
 *
 * The `email` field is how Monday Owner mapping resolves TableX assignees to
 * Monday workspace users — add an email to each member whose email is known
 * on the Monday side. Members without an email simply don't get mapped
 * (their sub-tasks will have Monday Owner blank; syncs stay non-destructive).
 */
export const DEFAULT_TEAM_MEMBERS: Record<string, TeamMember> = {
  danny: {
    id: "danny",
    name: "Danny",
    role: "Developer",
    initials: "DB",
    color: "#3b82f6",
    email: "danny@clearph.com",
  },
  kayla: { id: "kayla", name: "Kayla", role: "Designer", initials: "KS", color: "#ec4899" },
  arabella: { id: "arabella", name: "Arabella", role: "PM", initials: "AH", color: "#f59e0b" },
};

/** Back-compat: flat array view of the seed team. New consumers should use `useTeam()`. */
export const TEAM_MEMBERS: TeamMember[] = Object.values(DEFAULT_TEAM_MEMBERS);

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

/** Infer default assignee from deliverable phase. Returns a TeamMember id. */
function inferAssignee(d: Deliverable): string | null {
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

/**
 * Deterministic id for a seeded task. Matches the server-side Monday seed
 * id scheme (src/lib/monday/seed.ts → buildSeedTasks). Keeping both sides
 * on the same scheme means the External ID column on Monday lines up with
 * task.id from day one — no title-matching needed to bridge.
 */
export function seedTaskId(deliverableId: string, requirementIndex: number): string {
  return `${deliverableId}-r${requirementIndex}`;
}

/** Generate initial tasks from deliverable requirements */
export function generateInitialTasks(): Task[] {
  const now = new Date().toISOString();
  const tasks: Task[] = [];
  let sortOrder = 0;

  for (const d of DELIVERABLES) {
    // One task per requirement, id = deterministic pattern matching seed.
    d.requirements.forEach((req, idx) => {
      tasks.push({
        id: seedTaskId(d.id, idx),
        deliverableId: d.id,
        title: req,
        column: statusToColumn(d),
        priority: inferPriority(d),
        assignee: inferAssignee(d),
        labels: inferLabels(d),
        subtasks: [],
        acceptanceCriteria: [],
        startedAt: d.status !== "planned" ? now : undefined,
        createdAt: now,
        updatedAt: now,
        completedAt: d.status === "complete" ? now : undefined,
        sortOrder: sortOrder++,
      });
    });
  }

  return tasks;
}

/**
 * Compute the "majority assignee" for a deliverable from its child tasks —
 * used to populate the Item-level Owner column on Monday. Returns the
 * assignee id with the most task assignments under this deliverable, or
 * null if no tasks are assigned. Ties break on first-seen order so the
 * result is stable across unchanged inputs.
 */
export function computeDeliverableAssignee(
  deliverableId: string,
  tasks: Task[],
): string | null {
  const counts = new Map<string, number>();
  for (const t of tasks) {
    if (t.deliverableId !== deliverableId) continue;
    if (!t.assignee) continue;
    counts.set(t.assignee, (counts.get(t.assignee) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [id, n] of counts) {
    if (n > bestCount) {
      best = id;
      bestCount = n;
    }
  }
  return best;
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

/** Filter tasks by assignee, workstream, priority, sprint, and search */
export function filterTasks(
  tasks: Task[],
  filters: { assignee: string; workstream: string; priority: string; sprint?: string; search: string }
): Task[] {
  return tasks.filter((t) => {
    if (filters.assignee !== "all" && t.assignee !== filters.assignee) return false;
    if (filters.priority !== "all" && t.priority !== filters.priority) return false;
    if (filters.workstream !== "all") {
      const deliverable = DELIVERABLES.find((d) => d.id === t.deliverableId);
      if (deliverable?.workstream !== filters.workstream) return false;
    }
    if (filters.sprint && filters.sprint !== "all") {
      if (filters.sprint === "none") {
        if (t.sprintId) return false;
      } else if (t.sprintId !== filters.sprint) return false;
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (!t.title.toLowerCase().includes(search) && !t.description?.toLowerCase().includes(search)) return false;
    }
    return true;
  });
}

/**
 * Sort comparator: ascending by due date, tasks without a due date sort last,
 * ties broken by sortOrder for stability.
 */
export function compareTasksByDueDate(a: Task, b: Task): number {
  if (!a.dueDate && !b.dueDate) return a.sortOrder - b.sortOrder;
  if (!a.dueDate) return 1;
  if (!b.dueDate) return -1;
  const cmp = a.dueDate.localeCompare(b.dueDate);
  return cmp !== 0 ? cmp : a.sortOrder - b.sortOrder;
}

/** Classify a due date relative to today */
export type DueStatus = "overdue" | "due-soon" | "upcoming" | "none";

export function getDueStatus(task: Pick<Task, "dueDate" | "column">): DueStatus {
  if (!task.dueDate) return "none";
  // Completed tasks don't show a due chip — reduces visual noise on done rows.
  if (task.column === "done") return "none";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate + "T00:00:00");
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (diffDays < 0) return "overdue";
  if (diffDays <= 3) return "due-soon";
  return "upcoming";
}

/** 8 hours = 1 billable day. Days display is rounded to 0.5. */
export function hoursToDays(hours: number): number {
  return Math.round((hours / 8) * 2) / 2;
}

/** Inverse of hoursToDays. */
export function daysToHours(days: number): number {
  return days * 8;
}

/**
 * Effective days for a deliverable — respects `daysOverride` if set,
 * otherwise derives from `estimatedHours`.
 */
export function getDeliverableDays(
  deliverable: { estimatedHours: number },
  override?: DeliverableOverride
): number {
  if (override?.daysOverride !== undefined) return override.daysOverride;
  return hoursToDays(deliverable.estimatedHours);
}

/**
 * Scope-layer status for a deliverable. Reads the manual override first,
 * falls back to the static status from project-phase2. Does NOT read tasks —
 * that's the working-reality layer (see `computeDeliverableStatus`).
 */
export function getScopeStatus(
  deliverable: { status: ScopeStatus },
  override?: DeliverableOverride
): ScopeStatus {
  if (override?.manualStatus) return override.manualStatus;
  return deliverable.status;
}

/**
 * Baseline variance classification for visual styling.
 * - `neutral` — no baseline, or within ±10% of baseline
 * - `over` — current days ≥ 10% over baseline
 * - `under` — current days ≤ 10% under baseline
 */
export type VarianceTone = "neutral" | "over" | "under";

export function getVariance(
  currentDays: number,
  baselineDays: number | null | undefined
): { tone: VarianceTone; percent: number | null } {
  if (baselineDays == null || baselineDays === 0) return { tone: "neutral", percent: null };
  const diff = currentDays - baselineDays;
  const percent = Math.round((diff / baselineDays) * 100);
  if (percent >= 10) return { tone: "over", percent };
  if (percent <= -10) return { tone: "under", percent };
  return { tone: "neutral", percent };
}

/**
 * Derived "start date" for a task for Gantt-style rendering:
 *
 * - No sprint → null (task shouldn't appear on any sprint timeline)
 * - In sprint, still in backlog → the sprint's start date
 * - In sprint, ever left backlog → the stamped `startedAt` timestamp
 *
 * Returns an ISO YYYY-MM-DD date, or null. Does NOT clamp; callers should
 * clamp to their display window as needed.
 */
export function getTaskStartDate(
  task: Pick<Task, "sprintId" | "startedAt" | "column">,
  sprintStartDate: string | null | undefined,
): string | null {
  if (!task.sprintId || !sprintStartDate) return null;
  if (task.startedAt) return task.startedAt.slice(0, 10);
  return sprintStartDate;
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
