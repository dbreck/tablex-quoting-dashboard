"use client";

import { cn } from "@/lib/utils";
import { AlertOctagon, ChevronsDownUp, ChevronsUpDown, Eye, EyeOff } from "lucide-react";
import { useProjectTrackerStore } from "@/store/project-tracker-store";
import { useSprints } from "@/store/sprint-store";

export type GroupBy = "workstream" | "assignee" | "status" | "priority" | "sprint";

interface TasksToolbarProps {
  groupBy: GroupBy;
  onGroupByChange: (v: GroupBy) => void;
  showCompleted: boolean;
  onShowCompletedChange: (v: boolean) => void;
  blockedOnly: boolean;
  onBlockedOnlyChange: (v: boolean) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  taskCount: number;
  doneCount: number;
  blockedCount: number;
}

export function TasksToolbar({
  groupBy,
  onGroupByChange,
  showCompleted,
  onShowCompletedChange,
  blockedOnly,
  onBlockedOnlyChange,
  onExpandAll,
  onCollapseAll,
  taskCount,
  doneCount,
  blockedCount,
}: TasksToolbarProps) {
  const { filters, setFilter } = useProjectTrackerStore();
  const sprints = useSprints();

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Group by */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-500">Group by</span>
        <select
          value={groupBy}
          onChange={(e) => onGroupByChange(e.target.value as GroupBy)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/50"
        >
          <option value="workstream">Workstream</option>
          <option value="assignee">Assignee</option>
          <option value="status">Status</option>
          <option value="priority">Priority</option>
          <option value="sprint">Sprint</option>
        </select>
      </div>

      {/* Sprint filter */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-500">Sprint</span>
        <select
          value={filters.sprint}
          onChange={(e) => setFilter("sprint", e.target.value as typeof filters.sprint)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/50"
        >
          <option value="all">All sprints</option>
          <option value="none">Unassigned</option>
          {sprints.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Show completed */}
      <button
        onClick={() => onShowCompletedChange(!showCompleted)}
        className={cn(
          "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors",
          showCompleted
            ? "bg-white border-gray-200 text-gray-600"
            : "bg-gray-100 border-gray-200 text-gray-500"
        )}
      >
        {showCompleted ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        {showCompleted ? "Showing completed" : "Hiding completed"}
      </button>

      {/* Blocked only */}
      <button
        onClick={() => onBlockedOnlyChange(!blockedOnly)}
        disabled={blockedCount === 0 && !blockedOnly}
        className={cn(
          "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors",
          blockedOnly
            ? "bg-red-600 border-red-600 text-white"
            : "bg-white border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-600",
          blockedCount === 0 && !blockedOnly && "opacity-40 cursor-not-allowed hover:border-gray-200 hover:text-gray-600",
        )}
        title={blockedOnly ? "Showing only blocked tasks" : "Filter to blocked tasks"}
      >
        <AlertOctagon className="h-3.5 w-3.5" />
        Blocked {blockedCount > 0 && <span className="opacity-70">({blockedCount})</span>}
      </button>

      {/* Expand/Collapse all */}
      <div className="flex items-center gap-1">
        <button
          onClick={onExpandAll}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          title="Expand all"
        >
          <ChevronsUpDown className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onCollapseAll}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          title="Collapse all"
        >
          <ChevronsDownUp className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Task count */}
      <span className="text-xs text-gray-400 ml-auto">
        {doneCount}/{taskCount} complete
      </span>
    </div>
  );
}
