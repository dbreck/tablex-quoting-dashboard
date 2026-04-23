"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Calendar, CheckCircle2, CircleDashed, Zap, ArrowRight } from "lucide-react";
import { useSprintStore, useSprints } from "@/store/sprint-store";
import { useProjectTrackerStore } from "@/store/project-tracker-store";
import {
  generateUpcomingSprints,
  computeSprintStats,
  type Sprint,
  type SprintStatus,
} from "@/data/sprint";
import { Button } from "@/components/ui/button";
import { SprintCreateDialog } from "@/components/project/SprintCreateDialog";
import { cn } from "@/lib/utils";

const statusChip: Record<SprintStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  upcoming: "bg-blue-50 text-blue-700 border-blue-200",
  complete: "bg-gray-50 text-gray-500 border-gray-200",
};

const statusIcon: Record<SprintStatus, React.ComponentType<{ className?: string }>> = {
  active: Zap,
  upcoming: CircleDashed,
  complete: CheckCircle2,
};

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export default function SprintsPage() {
  const sprints = useSprints();
  const tasks = useProjectTrackerStore((s) => s.tasks);
  const bulkCreateSprints = useSprintStore((s) => s.bulkCreateSprints);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleSeed() {
    const today = new Date().toISOString().slice(0, 10);
    const generated = generateUpcomingSprints(today, 6);
    bulkCreateSprints(generated);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sprints</h1>
          <p className="mt-1 text-sm text-gray-500">
            Two-week iteration windows. Tasks are assigned to sprints from the
            Tasks or Board view.
          </p>
        </div>
        {sprints.length > 0 && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New sprint
          </Button>
        )}
      </div>

      {sprints.length === 0 ? (
        <EmptyState onSeed={handleSeed} onCreate={() => setDialogOpen(true)} />
      ) : (
        <div className="space-y-2">
          {sprints.map((sprint) => (
            <SprintRow key={sprint.id} sprint={sprint} tasks={tasks} />
          ))}
        </div>
      )}

      <SprintCreateDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}

interface EmptyStateProps {
  onSeed: () => void;
  onCreate: () => void;
}

function EmptyState({ onSeed, onCreate }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
      <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
      <h3 className="mt-3 text-base font-semibold text-slate-900">
        No sprints yet
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Generate the first 6 sprints (12 weeks) starting next Monday, or create
        one manually.
      </p>
      <div className="mt-5 flex items-center justify-center gap-2">
        <Button onClick={onSeed}>
          <Zap className="h-4 w-4" />
          Generate next 6 sprints
        </Button>
        <Button variant="outline" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          New sprint
        </Button>
      </div>
    </div>
  );
}

interface SprintRowProps {
  sprint: Sprint;
  tasks: ReturnType<typeof useProjectTrackerStore.getState>["tasks"];
}

function SprintRow({ sprint, tasks }: SprintRowProps) {
  const Icon = statusIcon[sprint.status];
  const stats = computeSprintStats(sprint, tasks);
  return (
    <Link
      href={`/project/sprints/${sprint.id}`}
      className="group block bg-white rounded-xl border border-slate-200 p-4 hover:border-brand-green hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center border",
            statusChip[sprint.status],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-900">{sprint.name}</h3>
            <span
              className={cn(
                "inline-flex items-center text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded border",
                statusChip[sprint.status],
              )}
            >
              {sprint.status}
            </span>
          </div>
          {sprint.goal && (
            <p className="mt-0.5 text-xs text-slate-500 truncate">{sprint.goal}</p>
          )}
          <div className="mt-1.5 flex items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDateRange(sprint.startDate, sprint.endDate)}
            </span>
            <span>
              {stats.completedTasks}/{stats.totalTasks} tasks
              {stats.totalTasks > 0 && (
                <span className="ml-1 text-slate-400">({stats.percentComplete}%)</span>
              )}
            </span>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-brand-green transition-colors" />
      </div>
    </Link>
  );
}
