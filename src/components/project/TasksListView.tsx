"use client";

import { useState, useCallback, useMemo } from "react";
import { useProjectTrackerStore } from "@/store/project-tracker-store";
import { type Task, filterTasks, COLUMNS, TEAM_MEMBERS } from "@/data/project-tracker";
import { WORKSTREAMS, DELIVERABLES, getDeliverablesByWorkstream } from "@/data/project-phase2";
import { type GroupBy } from "./TasksToolbar";
import { WorkstreamGroup } from "./WorkstreamGroup";
import { DeliverableGroup } from "./DeliverableGroup";
import { TaskRow } from "./TaskRow";
import { BulkActionBar } from "./BulkActionBar";
import { ChevronDown, ChevronRight } from "lucide-react";

interface TasksListViewProps {
  groupBy: GroupBy;
  showCompleted: boolean;
  onOpenDetail: (task: Task) => void;
  collapsedGroups: Set<string>;
  onToggleGroup: (id: string) => void;
}

export function TasksListView({
  groupBy,
  showCompleted,
  onOpenDetail,
  collapsedGroups,
  onToggleGroup,
}: TasksListViewProps) {
  const { tasks, filters } = useProjectTrackerStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  // Apply filters + show/hide completed
  const filteredTasks = useMemo(() => {
    let result = filterTasks(tasks, filters);
    if (!showCompleted) {
      result = result.filter((t) => t.column !== "done");
    }
    return result;
  }, [tasks, filters, showCompleted]);

  // Selection handler
  const handleSelect = useCallback(
    (taskId: string, shiftKey: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (shiftKey && lastSelectedId) {
          // Range select
          const allIds = filteredTasks.map((t) => t.id);
          const startIdx = allIds.indexOf(lastSelectedId);
          const endIdx = allIds.indexOf(taskId);
          if (startIdx !== -1 && endIdx !== -1) {
            const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
            for (let i = from; i <= to; i++) next.add(allIds[i]);
          }
        } else {
          if (next.has(taskId)) next.delete(taskId);
          else next.add(taskId);
        }
        return next;
      });
      setLastSelectedId(taskId);
    },
    [filteredTasks, lastSelectedId]
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, []);

  // ─── Render by group mode ──────────────────────────────────────────────────

  if (groupBy === "workstream") {
    return (
      <>
        <div className="space-y-1">
          {WORKSTREAMS.map((ws) => {
            const wsDeliverables = getDeliverablesByWorkstream(ws.id);
            const wsTasks = filteredTasks.filter((t) =>
              wsDeliverables.some((d) => d.id === t.deliverableId)
            );
            if (wsTasks.length === 0 && !showCompleted) return null;

            const wsCollapsed = collapsedGroups.has(`ws-${ws.id}`);

            return (
              <WorkstreamGroup
                key={ws.id}
                workstream={ws}
                tasks={wsTasks}
                collapsed={wsCollapsed}
                onToggle={() => onToggleGroup(`ws-${ws.id}`)}
              >
                {wsDeliverables.map((d) => {
                  const dTasks = filteredTasks.filter((t) => t.deliverableId === d.id);
                  if (dTasks.length === 0 && !showCompleted) return null;

                  return (
                    <DeliverableGroup
                      key={d.id}
                      deliverable={d}
                      tasks={dTasks}
                      allTasks={tasks}
                      collapsed={collapsedGroups.has(`d-${d.id}`)}
                      onToggle={() => onToggleGroup(`d-${d.id}`)}
                      onOpenDetail={onOpenDetail}
                      selectedIds={selectedIds}
                      onSelect={handleSelect}
                      wsColor={ws.color}
                    />
                  );
                })}
              </WorkstreamGroup>
            );
          })}
        </div>
        <BulkActionBar selectedIds={selectedIds} onClearSelection={clearSelection} />
      </>
    );
  }

  // ─── Flat group modes (assignee, status, priority) ─────────────────────────

  const groups = useMemo(() => {
    if (groupBy === "assignee") {
      const memberGroups = TEAM_MEMBERS.map((m) => ({
        id: m.id,
        label: `${m.name} — ${m.role}`,
        color: m.color,
        tasks: filteredTasks.filter((t) => t.assignee === m.id),
      }));
      const unassigned = {
        id: "unassigned",
        label: "Unassigned",
        color: "#9ca3af",
        tasks: filteredTasks.filter((t) => !t.assignee),
      };
      return [...memberGroups, unassigned].filter((g) => g.tasks.length > 0);
    }

    if (groupBy === "status") {
      return COLUMNS.map((col) => ({
        id: col.id,
        label: col.label,
        color: col.color,
        tasks: filteredTasks.filter((t) => t.column === col.id),
      })).filter((g) => g.tasks.length > 0);
    }

    // priority
    const priorityOrder = [
      { id: "critical", label: "Critical", color: "#ef4444" },
      { id: "high", label: "High", color: "#f97316" },
      { id: "medium", label: "Medium", color: "#eab308" },
      { id: "low", label: "Low", color: "#9ca3af" },
    ];
    return priorityOrder.map((p) => ({
      ...p,
      tasks: filteredTasks.filter((t) => t.priority === p.id),
    })).filter((g) => g.tasks.length > 0);
  }, [groupBy, filteredTasks]);

  return (
    <>
      <div className="space-y-2">
        {groups.map((group) => {
          const isCollapsed = collapsedGroups.has(`g-${group.id}`);
          return (
            <div key={group.id}>
              <button
                onClick={() => onToggleGroup(`g-${group.id}`)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                <span className="text-sm font-semibold text-gray-900">{group.label}</span>
                <span className="text-xs text-gray-400 ml-auto">{group.tasks.length} tasks</span>
              </button>
              {!isCollapsed && (
                <div className="ml-4 space-y-0.5">
                  {group.tasks
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onOpenDetail={onOpenDetail}
                        selected={selectedIds.has(task.id)}
                        onSelect={handleSelect}
                        showWorkstream
                      />
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <BulkActionBar selectedIds={selectedIds} onClearSelection={clearSelection} />
    </>
  );
}
