"use client";

import { useState } from "react";
import { useProjectTrackerStore } from "@/store/project-tracker-store";
import {
  type KanbanColumn,
  type Priority,
  type TeamMember,
  TEAM_MEMBERS,
  COLUMNS,
} from "@/data/project-tracker";
import { DELIVERABLES, WORKSTREAMS } from "@/data/project-phase2";
import { X } from "lucide-react";

interface TaskCreateDialogProps {
  open: boolean;
  onClose: () => void;
  defaultColumn?: KanbanColumn;
  defaultDeliverableId?: string;
}

export function TaskCreateDialog({ open, onClose, defaultColumn = "backlog", defaultDeliverableId }: TaskCreateDialogProps) {
  const { addTask } = useProjectTrackerStore();
  const [title, setTitle] = useState("");
  const [deliverableId, setDeliverableId] = useState(defaultDeliverableId ?? "");
  const [column, setColumn] = useState<KanbanColumn>(defaultColumn);
  const [priority, setPriority] = useState<Priority>("medium");
  const [assignee, setAssignee] = useState<TeamMember | "">("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deliverableId) return;
    addTask({
      deliverableId,
      title: title.trim(),
      column,
      priority,
      assignee: assignee || null,
      labels: [],
      subtasks: [],
    });
    // Reset
    setTitle("");
    setDeliverableId(defaultDeliverableId ?? "");
    setColumn(defaultColumn);
    setPriority("medium");
    setAssignee("");
    onClose();
  };

  // Group deliverables by workstream for the dropdown
  const grouped = WORKSTREAMS.map((ws) => ({
    ...ws,
    deliverables: DELIVERABLES.filter((d) => d.workstream === ws.id),
  }));

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">New Task</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4">
            {/* Title */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                autoFocus
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green"
              />
            </div>

            {/* Deliverable */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Deliverable *</label>
              <select
                value={deliverableId}
                onChange={(e) => setDeliverableId(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/50"
              >
                <option value="">Select deliverable...</option>
                {grouped.map((ws) => (
                  <optgroup key={ws.id} label={ws.name}>
                    {ws.deliverables.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Row: Column + Priority + Assignee */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                <select
                  value={column}
                  onChange={(e) => setColumn(e.target.value as KanbanColumn)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/50"
                >
                  {COLUMNS.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/50"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Assignee</label>
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value as TeamMember | "")}
                  className="w-full text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/50"
                >
                  <option value="">None</option>
                  {TEAM_MEMBERS.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !deliverableId}
              className="text-sm px-4 py-2 rounded-lg bg-brand-green text-white font-medium hover:bg-brand-green/90 disabled:opacity-30 transition-colors"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
