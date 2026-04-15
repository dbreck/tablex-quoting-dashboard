"use client";

import { type Task } from "@/data/project-tracker";
import { type WorkstreamMeta, type Deliverable } from "@/data/project-phase2";
import { ChevronDown, ChevronRight } from "lucide-react";

interface WorkstreamGroupProps {
  workstream: WorkstreamMeta;
  tasks: Task[];
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function WorkstreamGroup({ workstream, tasks, collapsed, onToggle, children }: WorkstreamGroupProps) {
  const Icon = workstream.icon;
  const done = tasks.filter((t) => t.column === "done").length;
  const total = tasks.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="mb-2">
      {/* Workstream header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
        )}

        <div
          className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
          style={{ backgroundColor: workstream.color + "15", color: workstream.color }}
        >
          <Icon className="w-4 h-4" />
        </div>

        <span className="text-sm font-semibold text-gray-900">{workstream.name}</span>

        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs text-gray-400">
            {done}/{total} tasks
          </span>
          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${percent}%`, backgroundColor: workstream.color }}
            />
          </div>
          <span className="text-xs font-medium text-gray-500 w-8 text-right">{percent}%</span>
        </div>
      </button>

      {/* Children (DeliverableGroups) */}
      {!collapsed && <div className="space-y-1">{children}</div>}
    </div>
  );
}
