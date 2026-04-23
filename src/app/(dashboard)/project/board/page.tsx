"use client";

import { useState } from "react";
import { useProjectTrackerStore } from "@/store/project-tracker-store";
import { type Task, type KanbanColumn } from "@/data/project-tracker";
import { KanbanBoard } from "@/components/project/KanbanBoard";
import { FilterBar } from "@/components/project/FilterBar";
import { TaskDetailSheet } from "@/components/project/TaskDetailSheet";
import { TaskCreateDialog } from "@/components/project/TaskCreateDialog";
import { Plus } from "lucide-react";

export default function BoardPage() {
  const tasks = useProjectTrackerStore((s) => s.tasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createColumn, setCreateColumn] = useState<KanbanColumn>("backlog");

  const handleAddTask = (columnId: KanbanColumn) => {
    setCreateColumn(columnId);
    setCreateOpen(true);
  };

  // Keep selected task in sync with store
  const syncedTask = selectedTask ? tasks.find((t) => t.id === selectedTask.id) ?? null : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Board</h1>
          <p className="mt-1 text-sm text-gray-500">
            Drag tasks between columns to update status.
          </p>
        </div>
        <button
          onClick={() => {
            setCreateColumn("backlog");
            setCreateOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>

      {/* Filters */}
      <FilterBar />

      {/* Board */}
      <KanbanBoard onTaskClick={setSelectedTask} onAddTask={handleAddTask} />

      {/* Detail sheet */}
      <TaskDetailSheet task={syncedTask} onClose={() => setSelectedTask(null)} />

      {/* Create dialog */}
      <TaskCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultColumn={createColumn}
      />
    </div>
  );
}
