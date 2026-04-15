"use client";

import { useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useProjectTrackerStore } from "@/store/project-tracker-store";
import { type Task, type KanbanColumn as KanbanColumnType, COLUMNS } from "@/data/project-tracker";
import { DELIVERABLES } from "@/data/project-phase2";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: KanbanColumnType) => void;
}

export function KanbanBoard({ onTaskClick, onAddTask }: KanbanBoardProps) {
  const { tasks, filters, moveTask } = useProjectTrackerStore();

  // Apply filters
  const filteredTasks = tasks.filter((t) => {
    if (filters.assignee !== "all" && t.assignee !== filters.assignee) return false;
    if (filters.priority !== "all" && t.priority !== filters.priority) return false;
    if (filters.workstream !== "all") {
      const deliverable = DELIVERABLES.find((d) => d.id === t.deliverableId);
      if (deliverable?.workstream !== filters.workstream) return false;
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (!t.title.toLowerCase().includes(search) && !t.description?.toLowerCase().includes(search)) return false;
    }
    return true;
  });

  const getColumnTasks = useCallback(
    (columnId: KanbanColumnType) =>
      filteredTasks
        .filter((t) => t.column === columnId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [filteredTasks]
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      const { draggableId, destination } = result;
      const toColumn = destination.droppableId as KanbanColumnType;
      moveTask(draggableId, toColumn, destination.index);
    },
    [moveTask]
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            columnId={col.id}
            tasks={getColumnTasks(col.id)}
            onTaskClick={onTaskClick}
            onAddTask={onAddTask}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
