"use client";

import { type Task, getDeliverableProgress, compareTasksByDueDate } from "@/data/project-tracker";
import { useTeam } from "@/store/project-tracker-store";
import { type Deliverable, PROJECT_PHASES } from "@/data/project-phase2";
import { ChevronDown, ChevronRight } from "lucide-react";
import { TaskRow } from "./TaskRow";
import { InlineTaskAdd } from "./InlineTaskAdd";

interface DeliverableGroupProps {
  deliverable: Deliverable;
  tasks: Task[];
  allTasks: Task[];
  collapsed: boolean;
  onToggle: () => void;
  onOpenDetail: (task: Task) => void;
  selectedIds: Set<string>;
  onSelect: (taskId: string, shiftKey: boolean) => void;
  wsColor: string;
}

export function DeliverableGroup({
  deliverable,
  tasks,
  allTasks,
  collapsed,
  onToggle,
  onOpenDetail,
  selectedIds,
  onSelect,
  wsColor,
}: DeliverableGroupProps) {
  const progress = getDeliverableProgress(allTasks, deliverable.id);
  const phase = PROJECT_PHASES.find((p) => p.id === deliverable.phase);
  const team = useTeam();

  // Unique assignees on this deliverable's tasks
  const assigneeIds = [...new Set(tasks.filter((t) => t.assignee).map((t) => t.assignee!))];
  const assignees = assigneeIds.map((id) => team.find((m) => m.id === id)).filter(Boolean);

  return (
    <div className="ml-4">
      {/* Deliverable header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        )}

        {/* Color accent */}
        <div className="w-1 h-5 rounded-full shrink-0" style={{ backgroundColor: wsColor }} />

        <span className="text-sm font-medium text-gray-800 truncate">{deliverable.name}</span>

        {/* Phase badge */}
        {phase && (
          <span
            className="text-[9px] font-medium px-1.5 py-0.5 rounded text-white shrink-0"
            style={{ backgroundColor: phase.color }}
          >
            {phase.name}
          </span>
        )}

        {/* Progress */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {/* Assignee dots */}
          <div className="flex -space-x-1">
            {assignees.slice(0, 3).map((m) => (
              <div
                key={m!.id}
                className="w-5 h-5 rounded-full text-[8px] font-bold text-white flex items-center justify-center border-2 border-white"
                style={{ backgroundColor: m!.color }}
                title={m!.name}
              >
                {m!.initials}
              </div>
            ))}
          </div>

          <span className="text-[10px] text-gray-400 w-16 text-right">
            {progress.done}/{progress.total} tasks
          </span>

          {/* Mini progress bar */}
          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress.percent}%`, backgroundColor: wsColor }}
            />
          </div>
        </div>
      </button>

      {/* Tasks */}
      {!collapsed && (
        <div className="ml-2 space-y-0.5">
          {[...tasks]
            .sort(compareTasksByDueDate)
            .map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onOpenDetail={onOpenDetail}
                selected={selectedIds.has(task.id)}
                onSelect={onSelect}
              />
            ))}
          <InlineTaskAdd deliverableId={deliverable.id} />
        </div>
      )}
    </div>
  );
}
