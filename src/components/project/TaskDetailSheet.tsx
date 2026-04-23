"use client";

import { useState } from "react";
import { useProjectTrackerStore, useTeam } from "@/store/project-tracker-store";
import {
  type Task,
  type KanbanColumn,
  type Priority,
  LABELS,
  COLUMNS,
  getWorkstreamForDeliverable,
} from "@/data/project-tracker";
import { DELIVERABLES } from "@/data/project-phase2";
import { useSprints } from "@/store/sprint-store";
import { cn } from "@/lib/utils";
import {
  X,
  Trash2,
  Plus,
  CheckCircle2,
  Circle,
  ArrowRight,
  Copy,
} from "lucide-react";
import { WORKSTREAMS } from "@/data/project-phase2";

interface TaskDetailSheetProps {
  task: Task | null;
  onClose: () => void;
}

export function TaskDetailSheet({ task, onClose }: TaskDetailSheetProps) {
  const {
    updateTask,
    deleteTask,
    duplicateTask,
    addSubtask,
    toggleSubtask,
    removeSubtask,
    addAcceptanceCriterion,
    toggleAcceptanceCriterion,
    removeAcceptanceCriterion,
  } = useProjectTrackerStore();
  const team = useTeam();
  const sprints = useSprints();
  const [newSubtask, setNewSubtask] = useState("");
  const [newCriterion, setNewCriterion] = useState("");
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [duplicateTarget, setDuplicateTarget] = useState<string>("");

  if (!task) return null;

  const workstream = getWorkstreamForDeliverable(task.deliverableId);
  const deliverable = DELIVERABLES.find((d) => d.id === task.deliverableId);
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

  const handleDelete = () => {
    deleteTask(task.id);
    onClose();
  };

  const openDuplicate = () => {
    setDuplicateTarget(task.deliverableId);
    setDuplicateOpen(true);
  };

  const handleDuplicate = () => {
    if (!duplicateTarget) return;
    duplicateTask(task.id, duplicateTarget);
    setDuplicateOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-50" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {workstream && (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded"
                style={{ backgroundColor: workstream.color + "15", color: workstream.color }}
              >
                {workstream.name}
              </span>
            )}
            {deliverable && (
              <>
                <ArrowRight className="h-3 w-3 text-gray-300" />
                <span className="text-xs text-gray-500">{deliverable.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openDuplicate}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="Duplicate task"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Duplicate panel */}
        {duplicateOpen && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block">
              Duplicate to deliverable
            </label>
            <div className="flex items-center gap-2">
              <select
                value={duplicateTarget}
                onChange={(e) => setDuplicateTarget(e.target.value)}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/50"
              >
                {WORKSTREAMS.map((ws) => {
                  const opts = DELIVERABLES.filter((d) => d.workstream === ws.id);
                  if (opts.length === 0) return null;
                  return (
                    <optgroup key={ws.id} label={ws.name}>
                      {opts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                          {d.id === task.deliverableId ? " (current)" : ""}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
              <button
                onClick={handleDuplicate}
                disabled={!duplicateTarget}
                className="px-3 py-1.5 text-sm font-medium bg-brand-green text-white rounded-lg hover:bg-brand-green/90 disabled:opacity-40 transition-colors"
              >
                Duplicate
              </button>
              <button
                onClick={() => setDuplicateOpen(false)}
                className="px-2 py-1.5 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Title */}
          <input
            type="text"
            value={task.title}
            onChange={(e) => updateTask(task.id, { title: e.target.value })}
            className="text-lg font-semibold text-gray-900 w-full border-none outline-none focus:ring-0 p-0"
          />

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Description</label>
            <textarea
              value={task.description ?? ""}
              onChange={(e) => updateTask(task.id, { description: e.target.value })}
              placeholder="Add a description..."
              rows={3}
              className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 resize-y [field-sizing:content] min-h-[5.25rem] focus:outline-none focus:ring-2 focus:ring-brand-green/50"
            />
          </div>

          {/* Status / Column */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Status</label>
              <select
                value={task.column}
                onChange={(e) => updateTask(task.id, {
                  column: e.target.value as KanbanColumn,
                  completedAt: e.target.value === "done" ? new Date().toISOString() : undefined,
                })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/50"
              >
                {COLUMNS.map((col) => (
                  <option key={col.id} value={col.id}>{col.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Priority</label>
              <select
                value={task.priority}
                onChange={(e) => updateTask(task.id, { priority: e.target.value as Priority })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/50"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Assignee / Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Assignee</label>
              <select
                value={task.assignee ?? ""}
                onChange={(e) => updateTask(task.id, { assignee: e.target.value || null })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/50"
              >
                <option value="">Unassigned</option>
                {team.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Due date</label>
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={task.dueDate ?? ""}
                  onChange={(e) => updateTask(task.id, { dueDate: e.target.value || undefined })}
                  className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/50"
                />
                {task.dueDate && (
                  <button
                    type="button"
                    onClick={() => updateTask(task.id, { dueDate: undefined })}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    title="Clear due date"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sprint */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Sprint</label>
            <select
              value={task.sprintId ?? ""}
              onChange={(e) => updateTask(task.id, { sprintId: e.target.value || null })}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/50"
            >
              <option value="">No sprint</option>
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status})
                </option>
              ))}
            </select>
          </div>

          {/* Labels */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Labels</label>
            <div className="flex flex-wrap gap-2">
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
                      "text-xs px-2.5 py-1 rounded-full font-medium transition-colors border",
                      active
                        ? "text-white border-transparent"
                        : "text-gray-500 border-gray-200 hover:border-gray-300"
                    )}
                    style={active ? { backgroundColor: label.color } : undefined}
                  >
                    {label.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Acceptance criteria */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
              Acceptance criteria ({criteria.filter((c) => c.completed).length}/{criteria.length})
            </label>
            <div className="space-y-1.5">
              {criteria.map((c) => (
                <div key={c.id} className="flex items-center gap-2 group">
                  <button onClick={() => toggleAcceptanceCriterion(task.id, c.id)}>
                    {c.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-brand-green" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-300 group-hover:text-gray-400" />
                    )}
                  </button>
                  <span className={cn("text-sm flex-1", c.completed && "line-through text-gray-400")}>
                    {c.label}
                  </span>
                  <button
                    onClick={() => removeAcceptanceCriterion(task.id, c.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={newCriterion}
                onChange={(e) => setNewCriterion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCriterion()}
                placeholder="Add criterion..."
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-green/50"
              />
              <button
                onClick={handleAddCriterion}
                disabled={!newCriterion.trim()}
                className="p-1.5 rounded-lg bg-brand-green/10 text-brand-green hover:bg-brand-green/20 disabled:opacity-30 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
              Subtasks ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
            </label>
            <div className="space-y-1.5">
              {task.subtasks.map((sub) => (
                <div key={sub.id} className="flex items-center gap-2 group">
                  <button onClick={() => toggleSubtask(task.id, sub.id)}>
                    {sub.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-brand-green" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-300 group-hover:text-gray-400" />
                    )}
                  </button>
                  <span className={cn("text-sm flex-1", sub.completed && "line-through text-gray-400")}>
                    {sub.title}
                  </span>
                  <button
                    onClick={() => removeSubtask(task.id, sub.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                placeholder="Add subtask..."
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-green/50"
              />
              <button
                onClick={handleAddSubtask}
                disabled={!newSubtask.trim()}
                className="p-1.5 rounded-lg bg-brand-green/10 text-brand-green hover:bg-brand-green/20 disabled:opacity-30 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="text-[10px] text-gray-400 space-y-0.5 pt-4 border-t border-gray-100">
            <p>Created: {new Date(task.createdAt).toLocaleDateString()}</p>
            <p>Updated: {new Date(task.updatedAt).toLocaleDateString()}</p>
            {task.completedAt && <p>Completed: {new Date(task.completedAt).toLocaleDateString()}</p>}
          </div>
        </div>
      </div>
    </>
  );
}
