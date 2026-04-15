"use client";

import { type Task, TEAM_MEMBERS, LABELS, getWorkstreamForDeliverable } from "@/data/project-tracker";
import { cn } from "@/lib/utils";
import { CheckCircle2, GripVertical, MessageSquare } from "lucide-react";

const priorityDot: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-400",
  medium: "bg-yellow-400",
  low: "bg-gray-300",
};

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const workstream = getWorkstreamForDeliverable(task.deliverableId);
  const assignee = TEAM_MEMBERS.find((m) => m.id === task.assignee);
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all group",
        isDragging && "shadow-lg border-brand-green/50 rotate-1"
      )}
    >
      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.map((labelId) => {
            const label = LABELS.find((l) => l.id === labelId);
            if (!label) return null;
            return (
              <span
                key={labelId}
                className="inline-block h-1.5 w-8 rounded-full"
                style={{ backgroundColor: label.color }}
                title={label.name}
              />
            );
          })}
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-medium text-gray-900 leading-snug mb-2">
        {task.title}
      </p>

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Priority dot */}
          <span
            className={cn("w-2 h-2 rounded-full", priorityDot[task.priority])}
            title={task.priority}
          />

          {/* Workstream badge */}
          {workstream && (
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ backgroundColor: workstream.color + "15", color: workstream.color }}
            >
              {workstream.name}
            </span>
          )}

          {/* Subtask progress */}
          {totalSubtasks > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <CheckCircle2 className="h-3 w-3" />
              {completedSubtasks}/{totalSubtasks}
            </span>
          )}
        </div>

        {/* Assignee avatar */}
        {assignee && (
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white"
            style={{ backgroundColor: assignee.color }}
            title={assignee.name}
          >
            {assignee.initials}
          </div>
        )}
      </div>
    </div>
  );
}
