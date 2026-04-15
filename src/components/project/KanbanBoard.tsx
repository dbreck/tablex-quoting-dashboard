"use client";

import { useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useProjectTrackerStore } from "@/store/project-tracker-store";
import { type Task, type KanbanColumn as KanbanColumnType, COLUMNS, filterTasks } from "@/data/project-tracker";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: KanbanColumnType) => void;
}

export function KanbanBoard({ onTaskClick, onAddTask }: KanbanBoardProps) {
  const { tasks, filters, moveTask } = useProjectTrackerStore();

  const filteredTasks = filterTasks(tasks, filters);

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
