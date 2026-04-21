"use client";

import { useProjectTrackerStore, useTeam } from "@/store/project-tracker-store";
import { WORKSTREAMS, DELIVERABLES } from "@/data/project-phase2";
import { computeDeliverableStatus } from "@/data/project-tracker";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Circle, TrendingUp } from "lucide-react";

export function ProgressSummary() {
  const { tasks } = useProjectTrackerStore();
  const team = useTeam();

  // Overall stats
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.column === "done").length;
  const inProgressTasks = tasks.filter((t) => t.column === "in-progress" || t.column === "in-review").length;
  const overallPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Per-workstream progress
  const workstreamStats = WORKSTREAMS.map((ws) => {
    const wsDeliverables = DELIVERABLES.filter((d) => d.workstream === ws.id);
    const wsTasks = tasks.filter((t) => wsDeliverables.some((d) => d.id === t.deliverableId));
    const wsDone = wsTasks.filter((t) => t.column === "done").length;
    const wsTotal = wsTasks.length;
    const percent = wsTotal > 0 ? Math.round((wsDone / wsTotal) * 100) : 0;
    return { ...ws, done: wsDone, total: wsTotal, percent };
  });

  // Per-member task counts
  const memberStats = team.map((m) => {
    const memberTasks = tasks.filter((t) => t.assignee === m.id);
    const active = memberTasks.filter((t) => t.column === "in-progress" || t.column === "in-review").length;
    const done = memberTasks.filter((t) => t.column === "done").length;
    return { ...m, active, done, total: memberTasks.length };
  });

  return (
    <div className="space-y-6">
      {/* Top summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Overall Progress"
          value={`${overallPercent}%`}
          icon={TrendingUp}
          accent="text-brand-green"
          sub={`${doneTasks} of ${totalTasks} tasks`}
        />
        <StatCard
          label="Done"
          value={String(doneTasks)}
          icon={CheckCircle2}
          accent="text-emerald-500"
        />
        <StatCard
          label="In Progress"
          value={String(inProgressTasks)}
          icon={Clock}
          accent="text-amber-500"
        />
        <StatCard
          label="Backlog"
          value={String(totalTasks - doneTasks - inProgressTasks)}
          icon={Circle}
          accent="text-gray-400"
        />
      </div>

      {/* Workstream progress bars */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Workstream Progress</h3>
        <div className="space-y-3">
          {workstreamStats.map((ws) => (
            <div key={ws.id} className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-600 w-28 truncate">{ws.name}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${ws.percent}%`, backgroundColor: ws.color }}
                />
              </div>
              <span className="text-xs text-gray-500 w-14 text-right">
                {ws.done}/{ws.total}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Team members */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Team</h3>
        <div className="flex gap-4">
          {memberStats.map((m) => (
            <div key={m.id} className="flex items-center gap-3 flex-1">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: m.color }}
              >
                {m.initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{m.name}</p>
                <p className="text-[10px] text-gray-400">
                  {m.active} active · {m.done} done
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg bg-gray-50", accent)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
        </div>
      </div>
    </div>
  );
}
