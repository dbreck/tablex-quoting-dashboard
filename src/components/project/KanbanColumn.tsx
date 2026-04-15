"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { type Task, type KanbanColumn as KanbanColumnType, COLUMNS } from "@/data/project-tracker";
import { TaskCard } from "./TaskCard";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  columnId: KanbanColumnType;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: KanbanColumnType) => void;
}

export function KanbanColumn({ columnId, tasks, onTaskClick, onAddTask }: KanbanColumnProps) {
  const column = COLUMNS.find((c) => c.id === columnId)!;

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] flex-1">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
          <h3 className="text-sm font-semibold text-gray-700">{column.label}</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full font-medium">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(columnId)}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          title="Add task"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 space-y-2 rounded-lg p-2 min-h-[200px] transition-colors",
              snapshot.isDraggingOver ? "bg-brand-green/5 ring-1 ring-brand-green/20" : "bg-gray-50/50"
            )}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskCard
                      task={task}
                      onClick={() => onTaskClick(task)}
                      isDragging={snapshot.isDragging}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
