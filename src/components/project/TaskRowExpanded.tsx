"use client";

import { useState } from "react";
import { useProjectTrackerStore } from "@/store/project-tracker-store";
import { type Task, LABELS } from "@/data/project-tracker";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Plus, X } from "lucide-react";

interface TaskRowExpandedProps {
  task: Task;
}

export function TaskRowExpanded({ task }: TaskRowExpandedProps) {
  const {
    updateTask,
    addSubtask,
    toggleSubtask,
    removeSubtask,
    addAcceptanceCriterion,
    toggleAcceptanceCriterion,
    removeAcceptanceCriterion,
  } = useProjectTrackerStore();
  const [newSubtask, setNewSubtask] = useState("");
  const [newCriterion, setNewCriterion] = useState("");

  const criteria = task.acceptanceCriteria ?? [];

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    addSubtask(task.id, newSubtask.trim());
    setNewSubtask("");
  };

  const handleAddCriterion = () => {
    if (!newCriterion.trim()) return;
    addAcceptanceCriterion(task.id, newCriterion.trim());
    setNewCriterion("");
  };

  return (
    <div className="ml-9 mr-3 mb-2 p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
      {/* Description */}
      <div>
        <textarea
          value={task.description ?? ""}
          onChange={(e) => updateTask(task.id, { description: e.target.value })}
          placeholder="Add a description..."
          rows={2}
          className="w-full text-xs text-gray-700 border border-gray-200 rounded-md px-2.5 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-brand-green/50 bg-white"
        />
      </div>

      {/* Acceptance criteria */}
      <div>
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
          Acceptance criteria ({criteria.filter((c) => c.completed).length}/{criteria.length})
        </p>
        <div className="space-y-1">
          {criteria.map((c) => (
            <div key={c.id} className="flex items-center gap-2 group/ac">
              <button onClick={() => toggleAcceptanceCriterion(task.id, c.id)} className="shrink-0">
                {c.completed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-green" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-gray-300 group-hover/ac:text-gray-400" />
                )}
              </button>
              <span className={cn("text-xs flex-1", c.completed && "line-through text-gray-400")}>
                {c.label}
              </span>
              <button
                onClick={() => removeAcceptanceCriterion(task.id, c.id)}
                className="opacity-0 group-hover/ac:opacity-100 p-0.5 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <input
            type="text"
            value={newCriterion}
            onChange={(e) => setNewCriterion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCriterion()}
            placeholder="Add criterion..."
            className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-green/50 bg-white"
          />
          <button
            onClick={handleAddCriterion}
            disabled={!newCriterion.trim()}
            className="p-1 rounded bg-brand-green/10 text-brand-green hover:bg-brand-green/20 disabled:opacity-30 transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Subtasks */}
      <div>
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
          Subtasks ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
        </p>
        <div className="space-y-1">
          {task.subtasks.map((sub) => (
            <div key={sub.id} className="flex items-center gap-2 group/sub">
              <button onClick={() => toggleSubtask(task.id, sub.id)} className="shrink-0">
                {sub.completed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-green" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-gray-300 group-hover/sub:text-gray-400" />
                )}
              </button>
              <span className={cn("text-xs flex-1", sub.completed && "line-through text-gray-400")}>
                {sub.title}
              </span>
              <button
                onClick={() => removeSubtask(task.id, sub.id)}
                className="opacity-0 group-hover/sub:opacity-100 p-0.5 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <input
            type="text"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
            placeholder="Add subtask..."
            className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-green/50 bg-white"
          />
          <button
            onClick={handleAddSubtask}
            disabled={!newSubtask.trim()}
            className="p-1 rounded bg-brand-green/10 text-brand-green hover:bg-brand-green/20 disabled:opacity-30 transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Labels */}
      <div>
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Labels</p>
        <div className="flex flex-wrap gap-1.5">
          {LABELS.map((label) => {
            const active = task.labels.includes(label.id);
            return (
              <button
                key={label.id}
                onClick={() => {
                  const newLabels = active
                    ? task.labels.filter((l) => l !== label.id)
                    : [...task.labels, label.id];
                  updateTask(task.id, { labels: newLabels });
                }}
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors border",
                  active
                    ? "text-white border-transparent"
                    : "text-gray-400 border-gray-200 hover:border-gray-300"
                )}
                style={active ? { backgroundColor: label.color } : undefined}
              >
                {label.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
