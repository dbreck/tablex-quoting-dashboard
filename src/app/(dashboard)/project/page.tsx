"use client";

import { useEffect } from "react";
import { useProjectTrackerStore } from "@/store/project-tracker-store";
import { ProgressSummary } from "@/components/project/ProgressSummary";
import { DELIVERABLES, WORKSTREAMS } from "@/data/project-phase2";
import { computeDeliverableStatus, COLUMNS } from "@/data/project-tracker";
import Link from "next/link";
import { ArrowRight, KanbanSquare, GanttChart, ListChecks, Server } from "lucide-react";

export default function ProjectDashboard() {
  const { isInitialized, initializeFromDeliverables, tasks } = useProjectTrackerStore();

  useEffect(() => {
    if (!isInitialized) initializeFromDeliverables();
  }, [isInitialized, initializeFromDeliverables]);

  // Recent activity — last 5 tasks updated
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Project Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Phase 2 build — 1,000-foot view of where we are and where we&apos;re going.
        </p>
      </div>

      {/* Progress overview */}
      <ProgressSummary />

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickLink href="/project/board" icon={KanbanSquare} label="Board" desc="Kanban view" />
        <QuickLink href="/project/timeline" icon={GanttChart} label="Timeline" desc="Gantt chart" />
        <QuickLink href="/project/scope" icon={ListChecks} label="Scope" desc="Deliverables" />
        <QuickLink href="/project/infrastructure" icon={Server} label="Infra Setup" desc="Service tracker" />
      </div>

      {/* Recent activity */}
      {recentTasks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Recent Activity</h3>
            <Link href="/project/board" className="text-xs text-brand-green hover:underline flex items-center gap-1">
              View board <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentTasks.map((task) => {
              const col = COLUMNS.find((c) => c.id === task.column);
              return (
                <div key={task.id} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col?.color }} />
                  <span className="text-gray-700 flex-1 truncate">{task.title}</span>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {col?.label}
                  </span>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {new Date(task.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
  desc,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3.5 hover:border-brand-green/50 hover:shadow-md transition-all group"
    >
      <Icon className="h-5 w-5 text-gray-400 group-hover:text-brand-green transition-colors shrink-0" />
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-[10px] text-gray-400">{desc}</p>
      </div>
    </Link>
  );
}
