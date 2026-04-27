"use client";

import { useState } from "react";
import { useProjectTrackerStore, useTeam } from "@/store/project-tracker-store";
import {
  type Task,
  type KanbanColumn,
  LABELS,
  COLUMNS,
  getWorkstreamForDeliverable,
  getDueStatus,
  formatDueDate,
} from "@/data/project-tracker";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, ChevronDown, ChevronRight, Calendar, AlertOctagon } from "lucide-react";
import { TaskRowExpanded } from "./TaskRowExpanded";
import { SprintBadge } from "./SprintBadge";

const priorityDot: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-400",
  medium: "bg-yellow-400",
  low: "bg-gray-300",
};

type DueChipMode = "unset" | "done" | "overdue" | "due-soon" | "upcoming";

const dueChipStyle: Record<DueChipMode, string> = {
  unset: "bg-gray-50 text-gray-400 border-gray-200 border-dashed",
  done: "bg-gray-50 text-gray-400 border-gray-200",
  overdue: "bg-red-50 text-red-600 border-red-200",
  "due-soon": "bg-amber-50 text-amber-700 border-amber-200",
  upcoming: "bg-gray-50 text-gray-500 border-gray-200",
};

interface TaskRowProps {
  task: Task;
  onOpenDetail: (task: Task) => void;
  selected?: boolean;
  onSelect?: (taskId: string, shiftKey: boolean) => void;
  showWorkstream?: boolean;
}

export function TaskRow({ task, onOpenDetail, selected, onSelect, showWorkstream }: TaskRowProps) {
  const { updateTask } = useProjectTrackerStore();
  const team = useTeam();
  const [expanded, setExpanded] = useState(false);
  const isDone = task.column === "done";
  const workstream = showWorkstream ? getWorkstreamForDeliverable(task.deliverableId) : null;
  const assignee = team.find((m) => m.id === task.assignee);
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  const toggleDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateTask(task.id, {
      column: isDone ? "backlog" : "done",
      completedAt: isDone ? undefined : new Date().toISOString(),
    });
  };

  const dueChipMode: DueChipMode = !task.dueDate
    ? "unset"
    : isDone
      ? "done"
      : (getDueStatus(task) as "overdue" | "due-soon" | "upcoming");

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors group cursor-pointer",
          selected ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50 border border-transparent",
          isDone && "opacity-90"
        )}
        onClick={(e) => {
          if (onSelect) {
            onSelect(task.id, e.shiftKey);
          }
        }}
      >
        {/* Expand chevron — far left, always visible */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="shrink-0 p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          title={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>

        {/* Checkbox */}
        <button
          onClick={toggleDone}
          className="shrink-0 p-0.5"
        >
          {isDone ? (
            <CheckCircle2 className="h-4 w-4 text-brand-green" />
          ) : (
            <Circle className="h-4 w-4 text-gray-300 hover:text-gray-400 transition-colors" />
          )}
        </button>

        {/* Title */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(task);
          }}
          className={cn(
            "flex-1 text-left text-sm font-medium truncate min-w-0",
            isDone ? "line-through text-gray-400" : "text-gray-800 hover:text-gray-900"
          )}
          title={task.title}
        >
          {task.title}
        </button>

        {/* Workstream badge (shown in flat group-by modes) */}
        {workstream && (
          <span
            className="text-[9px] font-medium px-1.5 py-0.5 rounded shrink-0"
            style={{ backgroundColor: workstream.color + "15", color: workstream.color }}
          >
            {workstream.name}
          </span>
        )}

        {/* Label dots */}
        {task.labels.length > 0 && (
          <div className="flex gap-0.5 shrink-0">
            {task.labels.slice(0, 3).map((labelId) => {
              const label = LABELS.find((l) => l.id === labelId);
              return label ? (
                <span
                  key={labelId}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: label.color }}
                  title={label.name}
                />
              ) : null;
            })}
          </div>
        )}

        {/* Subtask count */}
        {totalSubtasks > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-gray-400 shrink-0">
            <CheckCircle2 className="h-3 w-3" />
            {completedSubtasks}/{totalSubtasks}
          </span>
        )}

        {/* Blocker chip — only when blocked, click opens detail sheet */}
        {task.blockerReason && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(task);
            }}
            className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border bg-red-50 text-red-700 border-red-200 shrink-0 hover:bg-red-100 transition-colors"
            title={`Blocked: ${task.blockerReason}`}
          >
            <AlertOctagon className="h-2.5 w-2.5" />
            Blocked
          </button>
        )}

        {/* Sprint badge — hidden for tasks not in a sprint */}
        <SprintBadge sprintId={task.sprintId} />

        {/* Due date chip — always visible, click opens native date picker */}
        <div
          className="relative shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <span
            className={cn(
              "flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border",
              dueChipStyle[dueChipMode]
            )}
            title={task.dueDate ? `Due ${formatDueDate(task.dueDate)}` : "Set due date"}
          >
            <Calendar className="h-2.5 w-2.5" />
            {task.dueDate ? formatDueDate(task.dueDate) : "Due"}
          </span>
          <input
            type="date"
            value={task.dueDate ?? ""}
            onChange={(e) =>
              updateTask(task.id, { dueDate: e.target.value || undefined })
            }
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Due date"
          />
        </div>

        {/* Priority dot */}
        <span
          className={cn("w-2 h-2 rounded-full shrink-0", priorityDot[task.priority])}
          title={task.priority}
        />

        {/* Status dropdown */}
        <select
          value={task.column}
          onChange={(e) => {
            e.stopPropagation();
            const col = e.target.value as KanbanColumn;
            updateTask(task.id, {
              column: col,
              completedAt: col === "done" ? new Date().toISOString() : undefined,
            });
          }}
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] border border-gray-200 rounded px-1.5 py-0.5 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-green/50 shrink-0 w-24"
        >
          {COLUMNS.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>

        {/* Assignee chip */}
        <select
          value={task.assignee ?? ""}
          onChange={(e) => {
            e.stopPropagation();
            updateTask(task.id, { assignee: e.target.value || null });
          }}
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] border border-gray-200 rounded px-1.5 py-0.5 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-green/50 shrink-0 w-20"
        >
          <option value="">—</option>
          {team.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

      </div>

      {/* Inline expanded detail */}
      {expanded && <TaskRowExpanded task={task} />}
    </div>
  );
}
