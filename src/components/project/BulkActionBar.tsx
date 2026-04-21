"use client";

import { useState } from "react";
import { useProjectTrackerStore, useTeam } from "@/store/project-tracker-store";
import { type KanbanColumn, COLUMNS } from "@/data/project-tracker";
import { X, Trash2 } from "lucide-react";

interface BulkActionBarProps {
  selectedIds: Set<string>;
  onClearSelection: () => void;
}

export function BulkActionBar({ selectedIds, onClearSelection }: BulkActionBarProps) {
  const { bulkUpdateTasks, deleteTask } = useProjectTrackerStore();
  const team = useTeam();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const count = selectedIds.size;

  if (count < 2) return null;

  const ids = Array.from(selectedIds);

  const handleStatusChange = (column: KanbanColumn) => {
    bulkUpdateTasks(ids, {
      column,
      completedAt: column === "done" ? new Date().toISOString() : undefined,
    });
    onClearSelection();
  };

  const handleAssign = (assignee: string | null) => {
    bulkUpdateTasks(ids, { assignee });
    onClearSelection();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    ids.forEach((id) => deleteTask(id));
    setConfirmDelete(false);
    onClearSelection();
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-gray-900 text-white rounded-xl shadow-2xl px-5 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-200">
      <span className="text-sm font-medium">{count} tasks selected</span>

      <div className="w-px h-5 bg-white/20" />

      {/* Status */}
      <select
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) handleStatusChange(e.target.value as KanbanColumn);
          e.target.value = "";
        }}
        className="text-xs bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white focus:outline-none"
      >
        <option value="" disabled>Set status...</option>
        {COLUMNS.map((c) => (
          <option key={c.id} value={c.id} className="text-gray-900">{c.label}</option>
        ))}
      </select>

      {/* Assign */}
      <select
        defaultValue=""
        onChange={(e) => {
          handleAssign(e.target.value || null);
          e.target.value = "";
        }}
        className="text-xs bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white focus:outline-none"
      >
        <option value="" disabled>Assign to...</option>
        <option value="" className="text-gray-900">Unassigned</option>
        {team.map((m) => (
          <option key={m.id} value={m.id} className="text-gray-900">{m.name}</option>
        ))}
      </select>

      {/* Delete */}
      <button
        onClick={handleDelete}
        className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
          confirmDelete ? "bg-red-500 text-white" : "bg-white/10 text-white/70 hover:text-white hover:bg-white/20"
        }`}
      >
        <Trash2 className="h-3.5 w-3.5" />
        {confirmDelete ? "Confirm delete" : "Delete"}
      </button>

      <div className="w-px h-5 bg-white/20" />

      {/* Deselect */}
      <button
        onClick={() => {
          setConfirmDelete(false);
          onClearSelection();
        }}
        className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
