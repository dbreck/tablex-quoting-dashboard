"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useSprint } from "@/store/sprint-store";
import { useProjectTrackerStore, useTeam } from "@/store/project-tracker-store";
import {
  getTaskStartDate,
  getWorkstreamForDeliverable,
  type Task,
} from "@/data/project-tracker";
import { DELIVERABLES } from "@/data/project-phase2";
import { TaskDetailSheet } from "@/components/project/TaskDetailSheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Date helpers ────────────────────────────────────────────────────────────

function parseISO(date: string): Date {
  return new Date(date + "T00:00:00");
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round(
    (parseISO(b).getTime() - parseISO(a).getTime()) / 86_400_000,
  );
}

function enumerateDays(startISO: string, endISO: string): string[] {
  const out: string[] = [];
  const start = parseISO(startISO);
  const total = daysBetween(startISO, endISO) + 1;
  for (let i = 0; i < total; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push(toISO(d));
  }
  return out;
}

function formatDayHeader(iso: string): { day: number; dow: string } {
  const d = parseISO(iso);
  return {
    day: d.getDate(),
    dow: d.toLocaleDateString("en-US", { weekday: "narrow" }),
  };
}

function isWeekend(iso: string): boolean {
  const d = parseISO(iso).getDay();
  return d === 0 || d === 6;
}

// ─── Color coding ────────────────────────────────────────────────────────────

type ColorMode = "member" | "workstream" | "deliverable";

const DELIVERABLE_PALETTE = [
  "#3b82f6", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6",
  "#ef4444", "#06b6d4", "#f97316", "#84cc16", "#64748b",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function deliverableColor(deliverableId: string): string {
  return DELIVERABLE_PALETTE[hashString(deliverableId) % DELIVERABLE_PALETTE.length];
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SprintTimelinePage() {
  const params = useParams<{ id: string }>();
  const sprintId = params.id;
  const sprint = useSprint(sprintId);
  const allTasks = useProjectTrackerStore((s) => s.tasks);
  const team = useTeam();

  const [colorMode, setColorMode] = useState<ColorMode>("member");
  const [fullscreen, setFullscreen] = useState(false);
  const [openTask, setOpenTask] = useState<Task | null>(null);

  // Re-sync openTask when store updates (status toggle, etc.)
  const syncedOpenTask = openTask
    ? allTasks.find((t) => t.id === openTask.id) ?? null
    : null;

  const sprintTasks = useMemo(
    () => allTasks.filter((t) => t.sprintId === sprintId),
    [allTasks, sprintId],
  );

  // Esc exits fullscreen
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  if (!sprint) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">Sprint not found.</p>
        <Link
          href="/project/sprints"
          className="mt-4 inline-flex items-center gap-1 text-sm text-brand-green hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sprints
        </Link>
      </div>
    );
  }

  const days = enumerateDays(sprint.startDate, sprint.endDate);
  const todayISO = toISO(new Date());

  const container = (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200 flex flex-col",
        fullscreen
          ? "fixed inset-0 z-50 rounded-none border-none"
          : "relative",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-slate-200">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/project/sprints/${sprintId}`}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 shrink-0"
          >
            <ArrowLeft className="h-3 w-3" /> Back
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-slate-900 truncate">
              Timeline — {sprint.name}
            </h1>
            <p className="text-[11px] text-slate-500 truncate">
              {sprint.startDate} – {sprint.endDate} · {sprintTasks.length} task
              {sprintTasks.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Color mode */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">Color</span>
            <select
              value={colorMode}
              onChange={(e) => setColorMode(e.target.value as ColorMode)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/50"
            >
              <option value="member">Member</option>
              <option value="workstream">Workstream</option>
              <option value="deliverable">Deliverable</option>
            </select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFullscreen((v) => !v)}
            className="gap-1.5"
            title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {fullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
            {fullscreen ? "Exit" : "Fullscreen"}
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <TimelineGrid
          days={days}
          todayISO={todayISO}
          tasks={sprintTasks}
          sprintStartDate={sprint.startDate}
          sprintEndDate={sprint.endDate}
          team={team}
          colorMode={colorMode}
          onBarClick={(task) => setOpenTask(task)}
        />
      </div>

      {/* Legend */}
      <div className="px-5 py-2.5 border-t border-slate-100 flex items-center gap-4 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-1.5 rounded-full bg-slate-300" />
          Not started
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-1.5 rounded-full bg-slate-600 opacity-40" />
          Done (dimmed)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-px h-3 bg-red-400" />
          Today
        </span>
        <span className="ml-auto">
          Click a bar for details · Hover for status
        </span>
      </div>
    </div>
  );

  return (
    <Tooltip.Provider delayDuration={150} skipDelayDuration={300}>
      {container}
      <TaskDetailSheet task={syncedOpenTask} onClose={() => setOpenTask(null)} />
    </Tooltip.Provider>
  );
}

// ─── Grid ────────────────────────────────────────────────────────────────────

interface TimelineGridProps {
  days: string[];
  todayISO: string;
  tasks: Task[];
  sprintStartDate: string;
  sprintEndDate: string;
  team: ReturnType<typeof useTeam>;
  colorMode: ColorMode;
  onBarClick: (task: Task) => void;
}

function TimelineGrid({
  days,
  todayISO,
  tasks,
  sprintStartDate,
  sprintEndDate,
  team,
  colorMode,
  onBarClick,
}: TimelineGridProps) {
  const sortedTasks = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        // Sort by computed start date, then due date, then title
        const aStart = getTaskStartDate(a, sprintStartDate) ?? sprintStartDate;
        const bStart = getTaskStartDate(b, sprintStartDate) ?? sprintStartDate;
        if (aStart !== bStart) return aStart.localeCompare(bStart);
        const aDue = a.dueDate ?? sprintEndDate;
        const bDue = b.dueDate ?? sprintEndDate;
        if (aDue !== bDue) return aDue.localeCompare(bDue);
        return a.title.localeCompare(b.title);
      }),
    [tasks, sprintStartDate, sprintEndDate],
  );

  return (
    <div className="min-w-[800px]">
      {/* Header row */}
      <div
        className="grid sticky top-0 z-10 bg-white border-b border-slate-200"
        style={{ gridTemplateColumns: `240px repeat(${days.length}, 1fr)` }}
      >
        <div className="px-3 py-2 text-[11px] font-medium text-slate-500 uppercase tracking-wider border-r border-slate-100">
          Task
        </div>
        {days.map((d) => {
          const h = formatDayHeader(d);
          const isToday = d === todayISO;
          return (
            <div
              key={d}
              className={cn(
                "py-2 text-center border-l border-slate-100",
                isWeekend(d) && "bg-slate-50",
                isToday && "bg-red-50",
              )}
            >
              <div className="text-[10px] text-slate-400 uppercase">{h.dow}</div>
              <div
                className={cn(
                  "text-xs font-semibold",
                  isToday ? "text-red-600" : "text-slate-700",
                )}
              >
                {h.day}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task rows */}
      <div>
        {sortedTasks.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            No tasks in this sprint.
          </div>
        ) : (
          sortedTasks.map((task) => (
            <TimelineRow
              key={task.id}
              task={task}
              days={days}
              sprintStartDate={sprintStartDate}
              sprintEndDate={sprintEndDate}
              todayISO={todayISO}
              team={team}
              colorMode={colorMode}
              onBarClick={onBarClick}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

interface TimelineRowProps {
  task: Task;
  days: string[];
  sprintStartDate: string;
  sprintEndDate: string;
  todayISO: string;
  team: ReturnType<typeof useTeam>;
  colorMode: ColorMode;
  onBarClick: (task: Task) => void;
}

function TimelineRow({
  task,
  days,
  sprintStartDate,
  sprintEndDate,
  todayISO,
  team,
  colorMode,
  onBarClick,
}: TimelineRowProps) {
  const deliverable = DELIVERABLES.find((d) => d.id === task.deliverableId);
  const workstream = getWorkstreamForDeliverable(task.deliverableId);
  const assignee = team.find((m) => m.id === task.assignee);
  const isDone = task.column === "done";

  // Compute clamped start/end indices
  const startISO = getTaskStartDate(task, sprintStartDate) ?? sprintStartDate;
  const endISO = task.dueDate ?? sprintEndDate;

  // Ensure start <= end, clamp to sprint window
  const clampedStart =
    startISO < sprintStartDate ? sprintStartDate : startISO > sprintEndDate ? sprintEndDate : startISO;
  const clampedEnd =
    endISO < sprintStartDate ? sprintStartDate : endISO > sprintEndDate ? sprintEndDate : endISO;
  const finalStart = clampedStart > clampedEnd ? clampedEnd : clampedStart;

  const startIdx = days.indexOf(finalStart);
  const endIdx = days.indexOf(clampedEnd);
  const span = Math.max(1, endIdx - startIdx + 1);

  const barColor =
    colorMode === "member"
      ? assignee?.color ?? "#cbd5e1"
      : colorMode === "workstream"
        ? workstream?.color ?? "#cbd5e1"
        : deliverableColor(task.deliverableId);

  const statusLabel = task.column.replace("-", " ");
  const subCompleted = task.subtasks.filter((s) => s.completed).length;
  const acCompleted = (task.acceptanceCriteria ?? []).filter((c) => c.completed).length;

  return (
    <div
      className="grid border-b border-slate-50 hover:bg-slate-50/40 group"
      style={{ gridTemplateColumns: `240px repeat(${days.length}, 1fr)` }}
    >
      {/* Label */}
      <div className="px-3 py-1.5 border-r border-slate-100 flex items-center gap-2 min-w-0">
        {assignee && (
          <div
            className="w-5 h-5 rounded-full text-[8px] font-bold text-white flex items-center justify-center shrink-0"
            style={{ backgroundColor: assignee.color }}
            title={assignee.name}
          >
            {assignee.initials}
          </div>
        )}
        <button
          onClick={() => onBarClick(task)}
          className={cn(
            "text-xs text-left truncate hover:text-slate-900 min-w-0 flex-1",
            isDone ? "line-through text-slate-400" : "text-slate-700",
          )}
          title={task.title}
        >
          {task.title}
        </button>
      </div>

      {/* Day cells (background for weekends + today) */}
      {days.map((d) => {
        const isToday = d === todayISO;
        return (
          <div
            key={d}
            className={cn(
              "border-l border-slate-100",
              isWeekend(d) && "bg-slate-50/60",
              isToday && "bg-red-50/40",
            )}
            style={{ gridColumn: "span 1" }}
          />
        );
      })}

      {/* Bar — positioned into the same row via grid-column */}
      <div
        className="relative flex items-center py-1.5"
        style={{
          gridColumn: `${startIdx + 2} / span ${span}`,
          gridRow: 1,
        }}
      >
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={() => onBarClick(task)}
              className={cn(
                "relative w-full h-5 rounded-full border border-white/40 shadow-sm flex items-center transition-all hover:brightness-110 hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-green/60",
                isDone && "opacity-40",
              )}
              style={{ backgroundColor: barColor }}
              aria-label={task.title}
            >
              <span className="px-2 text-[10px] font-medium text-white truncate">
                {span > 2 ? task.title : ""}
              </span>
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="top"
              sideOffset={6}
              collisionPadding={12}
              className="z-50 max-w-xs rounded-lg bg-white border border-slate-200 shadow-lg p-3 text-xs text-slate-700 animate-in fade-in-0 zoom-in-95"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-slate-900 leading-tight">
                    {task.title}
                  </span>
                  <span
                    className="inline-flex items-center shrink-0 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: barColor }}
                  >
                    {statusLabel}
                  </span>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11px]">
                  {assignee && (
                    <>
                      <span className="text-slate-400">Assignee</span>
                      <span className="text-slate-700">{assignee.name}</span>
                    </>
                  )}
                  {deliverable && (
                    <>
                      <span className="text-slate-400">Deliverable</span>
                      <span className="text-slate-700 truncate">{deliverable.name}</span>
                    </>
                  )}
                  {workstream && (
                    <>
                      <span className="text-slate-400">Workstream</span>
                      <span className="text-slate-700">{workstream.name}</span>
                    </>
                  )}
                  <span className="text-slate-400">Start</span>
                  <span className="text-slate-700">{finalStart}</span>
                  <span className="text-slate-400">Due</span>
                  <span className="text-slate-700">{task.dueDate ?? "—"}</span>
                  {task.subtasks.length > 0 && (
                    <>
                      <span className="text-slate-400">Subtasks</span>
                      <span className="text-slate-700">
                        {subCompleted}/{task.subtasks.length}
                      </span>
                    </>
                  )}
                  {(task.acceptanceCriteria ?? []).length > 0 && (
                    <>
                      <span className="text-slate-400">Acceptance</span>
                      <span className="text-slate-700">
                        {acCompleted}/{task.acceptanceCriteria.length}
                      </span>
                    </>
                  )}
                </div>
                <div className="pt-1 text-[10px] text-slate-400">
                  Click bar to open task
                </div>
              </div>
              <Tooltip.Arrow className="fill-white" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    </div>
  );
}
