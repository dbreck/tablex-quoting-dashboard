// Sprints — fixed 2-week iteration windows orthogonal to Deliverable.phase.
// Tasks reference sprints via nullable sprint_id; sprints don't reference tasks.
// Burndown snapshots are captured nightly by pg_cron (see migration 016).

import { nanoid } from "nanoid";
import type { Task } from "@/data/project-tracker";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SprintStatus = "upcoming" | "active" | "complete";

export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  /** ISO date YYYY-MM-DD */
  startDate: string;
  /** ISO date YYYY-MM-DD (inclusive) */
  endDate: string;
  status: SprintStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BurndownSnapshot {
  sprintId: string;
  /** ISO date YYYY-MM-DD */
  snapshotDate: string;
  totalTasks: number;
  completedTasks: number;
  totalHours: number;
  remainingHours: number;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Two-week sprints. */
export const SPRINT_LENGTH_DAYS = 14;

function parseISODate(iso: string): Date {
  // Treat YYYY-MM-DD as a local-midnight date so day arithmetic stays stable
  // across timezones.
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  return new Date(y, m - 1, d);
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/**
 * Returns the next Monday on or after the given date. If the date is already
 * a Monday, returns it unchanged.
 */
export function nextMondayOnOrAfter(iso: string): string {
  const d = parseISODate(iso);
  const dow = d.getDay(); // Sun=0, Mon=1, ...
  const offset = dow === 1 ? 0 : (8 - dow) % 7;
  return addDays(iso, offset);
}

// ─── Generators ───────────────────────────────────────────────────────────────

/**
 * Generate N consecutive 2-week sprints starting at anchorDate. If anchorDate
 * isn't a Monday, the first sprint snaps forward to the next Monday.
 * Sprints are numbered "Sprint 1", "Sprint 2", ...
 */
export function generateUpcomingSprints(anchorDate: string, count: number): Sprint[] {
  const start0 = nextMondayOnOrAfter(anchorDate);
  const now = new Date().toISOString();
  const sprints: Sprint[] = [];
  for (let i = 0; i < count; i++) {
    const startDate = addDays(start0, i * SPRINT_LENGTH_DAYS);
    const endDate = addDays(startDate, SPRINT_LENGTH_DAYS - 1);
    sprints.push({
      id: `sprint-${nanoid(6)}`,
      name: `Sprint ${i + 1}`,
      startDate,
      endDate,
      status: inferSprintStatus({ startDate, endDate }, toISODate(new Date())),
      createdAt: now,
      updatedAt: now,
    });
  }
  return sprints;
}

// ─── Lookups + status ─────────────────────────────────────────────────────────

/** Returns the sprint whose [startDate, endDate] inclusive contains `date`. */
export function getSprintForDate(sprints: Sprint[], date: string): Sprint | null {
  for (const s of sprints) {
    if (s.startDate <= date && date <= s.endDate) return s;
  }
  return null;
}

/** Pure inference — does not look at the persisted status field. */
export function inferSprintStatus(
  sprint: Pick<Sprint, "startDate" | "endDate">,
  today: string,
): SprintStatus {
  if (today < sprint.startDate) return "upcoming";
  if (today > sprint.endDate) return "complete";
  return "active";
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface SprintStats {
  totalTasks: number;
  completedTasks: number;
  percentComplete: number;
}

export function computeSprintStats(sprint: Sprint, tasks: Task[]): SprintStats {
  const inSprint = tasks.filter((t) => t.sprintId === sprint.id);
  const totalTasks = inSprint.length;
  const completedTasks = inSprint.filter((t) => t.column === "done").length;
  const percentComplete = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  return { totalTasks, completedTasks, percentComplete };
}
