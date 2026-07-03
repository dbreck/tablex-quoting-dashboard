"use client";

import {
  type Task,
  LABELS,
  getWorkstreamForDeliverable,
  getDueStatus,
  formatDueDate,
} from "@/data/project-tracker";
import { useTeam } from "@/store/project-tracker-store";
import { cn } from "@/lib/utils";
import { CheckCircle2, Calendar, AlertOctagon } from "lucide-react";
import { SprintBadge } from "./SprintBadge";

const priorityDot: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-400",
  medium: "bg-yellow-400",
  low: "bg-gray-300",
};

const dueChipStyle: Record<string, string> = {
  overdue: "bg-red-50 text-red-600 border-red-200",
  "due-soon": "bg-amber-50 text-amber-700 border-amber-200",
  upcoming: "bg-gray-50 text-gray-500 border-gray-200",
};

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const team = useTeam();
  const workstream = getWorkstreamForDeliverable(task.deliverableId);
  const assignee = team.find((m) => m.id === task.assignee);
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

      {/* Blocker banner — full-width row when blocked */}
      {task.blockerReason && (
        <div
          className="flex items-start gap-1.5 text-[10px] text-red-700 bg-red-50 border border-red-200 rounded px-1.5 py-1 mb-2"
          title={task.blockerReason}
        >
          <AlertOctagon className="h-3 w-3 mt-px shrink-0" />
          <span className="font-medium shrink-0">Blocked:</span>
          <span className="line-clamp-1">{task.blockerReason}</span>
        </div>
      )}

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

          {/* Sprint badge */}
          <SprintBadge sprintId={task.sprintId} />

          {/* Due date chip — hidden for done tasks and tasks with no due date */}
          {task.dueDate && getDueStatus(task) !== "none" && (
            <span
              className={cn(
                "flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border",
                dueChipStyle[getDueStatus(task)]
              )}
              title={`Due ${formatDueDate(task.dueDate)}`}
            >
              <Calendar className="h-2.5 w-2.5" />
              {formatDueDate(task.dueDate)}
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
