"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Pencil,
  Play,
  CheckCircle2,
  CircleDashed,
  Trash2,
  ChevronDown,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  useSprintStore,
  useSprint,
  useBurndownSeries,
} from "@/store/sprint-store";
import { useProjectTrackerStore } from "@/store/project-tracker-store";
import {
  computeSprintStats,
  type Sprint,
  type SprintStatus,
  type BurndownSnapshot,
} from "@/data/sprint";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { TaskRow } from "@/components/project/TaskRow";
import { TaskDetailSheet } from "@/components/project/TaskDetailSheet";
import { FilterBar } from "@/components/project/FilterBar";
import { cn } from "@/lib/utils";
import {
  filterTasks,
  compareTasksByDueDate,
  type Task,
} from "@/data/project-tracker";

const statusChip: Record<SprintStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  upcoming: "bg-blue-50 text-blue-700 border-blue-200",
  complete: "bg-gray-50 text-gray-500 border-gray-200",
};

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function SprintDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const sprintId = params.id;

  const sprint = useSprint(sprintId);
  const tasks = useProjectTrackerStore((s) => s.tasks);
  const filters = useProjectTrackerStore((s) => s.filters);
  const updateSprint = useSprintStore((s) => s.updateSprint);
  const deleteSprint = useSprintStore((s) => s.deleteSprint);
  const loadBurndown = useSprintStore((s) => s.loadBurndownForSprint);
  const series = useBurndownSeries(sprintId);
  const { isAdmin } = useAuth();

  const [openTask, setOpenTask] = useState<Task | null>(null);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState("");

  useEffect(() => {
    if (sprintId) {
      void loadBurndown(sprintId);
    }
  }, [sprintId, loadBurndown]);

  const sprintTasks = useMemo(
    () => tasks.filter((t) => t.sprintId === sprintId),
    [tasks, sprintId],
  );

  /**
   * Visible tasks = in-sprint tasks passed through the shared filter bar,
   * sorted by due date. We override `sprint: "all"` so the global sprint
   * filter (if set from elsewhere) doesn't zero out this page.
   */
  const visibleTasks = useMemo(() => {
    const filtered = filterTasks(sprintTasks, { ...filters, sprint: "all" });
    return [...filtered].sort(compareTasksByDueDate);
  }, [sprintTasks, filters]);

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

  const stats = computeSprintStats(sprint, tasks);

  function handleStatus(status: SprintStatus) {
    updateSprint(sprint!.id, { status });
  }

  function handleDelete() {
    if (!isAdmin) return;
    if (!confirm(`Delete ${sprint!.name}? Tasks in this sprint will be unassigned.`)) {
      return;
    }
    deleteSprint(sprint!.id);
    router.push("/project/sprints");
  }

  function startEditingGoal() {
    setGoalDraft(sprint!.goal ?? "");
    setEditingGoal(true);
  }

  function commitGoal() {
    const next = goalDraft.trim();
    updateSprint(sprint!.id, { goal: next.length > 0 ? next : undefined });
    setEditingGoal(false);
  }

  return (
    <div className="space-y-6">
      <Link
        href="/project/sprints"
        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3 w-3" /> Back to sprints
      </Link>

      <SprintHeader
        sprint={sprint}
        stats={stats}
        editingGoal={editingGoal}
        goalDraft={goalDraft}
        onStartEditGoal={startEditingGoal}
        onChangeGoal={setGoalDraft}
        onCommitGoal={commitGoal}
        onCancelGoal={() => setEditingGoal(false)}
        onStatusChange={handleStatus}
        onDelete={isAdmin ? handleDelete : undefined}
      />

      <BurndownPanel sprint={sprint} series={series} stats={stats} />

      <TasksPanel
        tasks={visibleTasks}
        totalCount={sprintTasks.length}
        onOpenDetail={(task) => setOpenTask(task)}
      />

      <TaskDetailSheet task={openTask} onClose={() => setOpenTask(null)} />
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

interface SprintHeaderProps {
  sprint: Sprint;
  stats: ReturnType<typeof computeSprintStats>;
  editingGoal: boolean;
  goalDraft: string;
  onStartEditGoal: () => void;
  onChangeGoal: (v: string) => void;
  onCommitGoal: () => void;
  onCancelGoal: () => void;
  onStatusChange: (status: SprintStatus) => void;
  onDelete?: () => void;
}

function SprintHeader({
  sprint,
  stats,
  editingGoal,
  goalDraft,
  onStartEditGoal,
  onChangeGoal,
  onCommitGoal,
  onCancelGoal,
  onStatusChange,
  onDelete,
}: SprintHeaderProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{sprint.name}</h1>
            <span
              className={cn(
                "inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border",
                statusChip[sprint.status],
              )}
            >
              {sprint.status}
            </span>
          </div>

          {editingGoal ? (
            <div className="mt-2 flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={goalDraft}
                onChange={(e) => onChangeGoal(e.target.value)}
                placeholder="One-line objective"
                className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onCommitGoal();
                  if (e.key === "Escape") onCancelGoal();
                }}
              />
              <Button size="sm" onClick={onCommitGoal}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancelGoal}>
                Cancel
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onStartEditGoal}
              className="mt-1 group flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 text-left"
            >
              <span>{sprint.goal ?? "Add a goal..."}</span>
              <Pencil className="h-3 w-3 text-slate-300 group-hover:text-slate-500" />
            </button>
          )}

          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}
            </span>
            <span>
              {stats.completedTasks}/{stats.totalTasks} tasks
              {stats.totalTasks > 0 && (
                <span className="ml-1 text-slate-400">({stats.percentComplete}%)</span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/project/sprints/${sprint.id}/timeline`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Timeline
            </Button>
          </Link>
          {sprint.status !== "active" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange("active")}
            >
              <Play className="h-3.5 w-3.5" />
              Mark active
            </Button>
          )}
          {sprint.status !== "complete" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange("complete")}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Mark complete
            </Button>
          )}
          {sprint.status !== "upcoming" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange("upcoming")}
            >
              <CircleDashed className="h-3.5 w-3.5" />
              Mark upcoming
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Burndown ────────────────────────────────────────────────────────────────

interface BurndownPanelProps {
  sprint: Sprint;
  series: BurndownSnapshot[] | null;
  stats: ReturnType<typeof computeSprintStats>;
}

function BurndownPanel({ sprint, series, stats }: BurndownPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const chartData = useMemo(() => {
    if (!series || series.length === 0) return [];
    const total = stats.totalTasks;
    return series.map((s) => ({
      date: s.snapshotDate.slice(5), // MM-DD
      completed: s.completedTasks,
      remaining: Math.max(total - s.completedTasks, 0),
    }));
  }, [series, stats.totalTasks]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-baseline justify-between gap-3 group"
      >
        <span className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
          )}
          <h2 className="text-sm font-semibold text-slate-900">Burndown</h2>
        </span>
        <span className="text-[11px] text-slate-400">
          Snapshots run nightly at 23:59 UTC for active sprints.
        </span>
      </button>
      {!expanded ? null : chartData.length === 0 ? (
        <div className="mt-4 h-48 flex items-center justify-center text-xs text-slate-400">
          {sprint.status === "upcoming"
            ? "Burndown will start once this sprint is active."
            : "No snapshots yet for this sprint."}
        </div>
      ) : (
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ left: 0, right: 16, top: 8, bottom: 8 }}
            >
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {stats.totalTasks > 0 && (
                <ReferenceLine
                  y={stats.totalTasks}
                  stroke="#cbd5e1"
                  strokeDasharray="4 4"
                  label={{
                    value: "Total",
                    position: "right",
                    fontSize: 10,
                    fill: "#94a3b8",
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Completed"
              />
              <Line
                type="monotone"
                dataKey="remaining"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Remaining"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── Tasks panel ─────────────────────────────────────────────────────────────

interface TasksPanelProps {
  tasks: Task[];
  totalCount: number;
  onOpenDetail: (task: Task) => void;
}

function TasksPanel({ tasks, totalCount, onOpenDetail }: TasksPanelProps) {
  const isFiltered = tasks.length !== totalCount;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-slate-900">
          Tasks ({isFiltered ? `${tasks.length} of ${totalCount}` : totalCount})
        </h2>
        <span className="text-[11px] text-slate-400">
          Assign tasks to this sprint from the Tasks or Board view.
        </span>
      </div>

      <FilterBar hideSprint />

      {totalCount === 0 ? (
        <p className="py-6 text-center text-xs text-slate-400">
          No tasks in this sprint yet.
        </p>
      ) : tasks.length === 0 ? (
        <p className="py-6 text-center text-xs text-slate-400">
          No tasks match the current filters.
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onOpenDetail={onOpenDetail}
              showWorkstream
            />
          ))}
        </div>
      )}
    </div>
  );
}
