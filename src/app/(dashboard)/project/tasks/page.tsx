"use client";

import { useCallback, useState } from "react";
import { useProjectTrackerStore } from "@/store/project-tracker-store";
import { type Task } from "@/data/project-tracker";
import { WORKSTREAMS, DELIVERABLES } from "@/data/project-phase2";
import { FilterBar } from "@/components/project/FilterBar";
import { TasksToolbar, type GroupBy } from "@/components/project/TasksToolbar";
import { TasksListView } from "@/components/project/TasksListView";
import { TaskDetailSheet } from "@/components/project/TaskDetailSheet";

export default function TasksPage() {
  const tasks = useProjectTrackerStore((s) => s.tasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>("workstream");
  const [showCompleted, setShowCompleted] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const handleToggleGroup = useCallback((id: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    setCollapsedGroups(new Set());
  }, []);

  const handleCollapseAll = useCallback(() => {
    const allIds = new Set<string>();
    if (groupBy === "workstream") {
      WORKSTREAMS.forEach((ws) => allIds.add(`ws-${ws.id}`));
      DELIVERABLES.forEach((d) => allIds.add(`d-${d.id}`));
    } else {
      // For flat modes, collapse all group headers
      if (groupBy === "assignee") {
        ["danny", "kayla", "arabella", "unassigned"].forEach((id) => allIds.add(`g-${id}`));
      } else if (groupBy === "status") {
        ["backlog", "in-progress", "in-review", "done"].forEach((id) => allIds.add(`g-${id}`));
      } else {
        ["critical", "high", "medium", "low"].forEach((id) => allIds.add(`g-${id}`));
      }
    }
    setCollapsedGroups(allIds);
  }, [groupBy]);

  // Keep selected task in sync with store
  const syncedTask = selectedTask ? tasks.find((t) => t.id === selectedTask.id) ?? null : null;

  const doneCount = tasks.filter((t) => t.column === "done").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage tasks by workstream and deliverable. Click a task to edit, check to mark done.
        </p>
      </div>

      {/* Filters */}
      <FilterBar />

      {/* Toolbar */}
      <TasksToolbar
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        showCompleted={showCompleted}
        onShowCompletedChange={setShowCompleted}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        taskCount={tasks.length}
        doneCount={doneCount}
      />

      {/* Task list */}
      <TasksListView
        groupBy={groupBy}
        showCompleted={showCompleted}
        onOpenDetail={setSelectedTask}
        collapsedGroups={collapsedGroups}
        onToggleGroup={handleToggleGroup}
      />

      {/* Detail sheet */}
      <TaskDetailSheet task={syncedTask} onClose={() => setSelectedTask(null)} />
    </div>
  );
}
