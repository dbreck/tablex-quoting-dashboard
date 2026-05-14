"use client";

import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import { useProjectTrackerStore } from "@/store/project-tracker-store";
import { type Task } from "@/data/project-tracker";
import { WORKSTREAMS, DELIVERABLES } from "@/data/project-phase2";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/project/FilterBar";
import { TasksToolbar, type GroupBy } from "@/components/project/TasksToolbar";
import { TasksListView } from "@/components/project/TasksListView";
import { TaskDetailSheet } from "@/components/project/TaskDetailSheet";
import { TaskCreateDialog } from "@/components/project/TaskCreateDialog";

function allGroupIdsFor(groupBy: GroupBy): Set<string> {
  const ids = new Set<string>();
  if (groupBy === "workstream") {
    WORKSTREAMS.forEach((ws) => ids.add(`ws-${ws.id}`));
    DELIVERABLES.forEach((d) => ids.add(`d-${d.id}`));
  } else if (groupBy === "assignee") {
    ["danny", "kayla", "arabella", "unassigned"].forEach((id) => ids.add(`g-${id}`));
  } else if (groupBy === "status") {
    ["backlog", "in-progress", "in-review", "done"].forEach((id) => ids.add(`g-${id}`));
  } else {
    ["critical", "high", "medium", "low"].forEach((id) => ids.add(`g-${id}`));
  }
  return ids;
}

export default function TasksPage() {
  const tasks = useProjectTrackerStore((s) => s.tasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>("workstream");
  const [showCompleted, setShowCompleted] = useState(true);
  const [blockedOnly, setBlockedOnly] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  // Default to all groups collapsed for a denser first view; user expands what they need.
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() =>
    allGroupIdsFor("workstream"),
  );

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
    setCollapsedGroups(allGroupIdsFor(groupBy));
  }, [groupBy]);

  // Keep selected task in sync with store
  const syncedTask = selectedTask ? tasks.find((t) => t.id === selectedTask.id) ?? null : null;

  const doneCount = tasks.filter((t) => t.column === "done").length;
  const blockedCount = tasks.filter((t) => Boolean(t.blockerReason)).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage tasks by workstream and deliverable. Click a task to edit, check to mark done.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <FilterBar />

      {/* Toolbar */}
      <TasksToolbar
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        showCompleted={showCompleted}
        onShowCompletedChange={setShowCompleted}
        blockedOnly={blockedOnly}
        onBlockedOnlyChange={setBlockedOnly}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        taskCount={tasks.length}
        doneCount={doneCount}
        blockedCount={blockedCount}
      />

      {/* Task list */}
      <TasksListView
        groupBy={groupBy}
        showCompleted={showCompleted}
        blockedOnly={blockedOnly}
        onOpenDetail={setSelectedTask}
        collapsedGroups={collapsedGroups}
        onToggleGroup={handleToggleGroup}
      />

      {/* Detail sheet */}
      <TaskDetailSheet task={syncedTask} onClose={() => setSelectedTask(null)} />

      {/* Create dialog */}
      <TaskCreateDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
