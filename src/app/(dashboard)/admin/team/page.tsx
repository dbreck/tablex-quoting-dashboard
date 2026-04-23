"use client";

import { useState } from "react";
import { useProjectTrackerStore, useTeam } from "@/store/project-tracker-store";
import {
  type TeamMember,
  TEAM_COLORS,
  computeInitials,
} from "@/data/project-tracker";
import { cn } from "@/lib/utils";
import { Plus, Trash2, X, Check } from "lucide-react";
import { TrackerImportButton } from "@/components/admin/TrackerImportButton";

type DraftMember = Omit<TeamMember, "id">;

function emptyDraft(color: string): DraftMember {
  return { name: "", role: "", initials: "", color };
}

export default function AdminTeamPage() {
  const team = useTeam();
  const { tasks, addTeamMember, updateTeamMember, deleteTeamMember } = useProjectTrackerStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState<DraftMember | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const nextColor = () => {
    const used = new Set(team.map((m) => m.color));
    return TEAM_COLORS.find((c) => !used.has(c)) ?? TEAM_COLORS[team.length % TEAM_COLORS.length];
  };

  const startCreate = () => {
    setCreating(emptyDraft(nextColor()));
    setEditingId(null);
  };

  const handleCreate = () => {
    if (!creating) return;
    if (!creating.name.trim()) return;
    addTeamMember({
      name: creating.name.trim(),
      role: creating.role.trim(),
      color: creating.color,
      initials: creating.initials.trim() || computeInitials(creating.name),
      company: creating.company?.trim() || undefined,
      title: creating.title?.trim() || undefined,
      email: creating.email?.trim() || undefined,
      phone: creating.phone?.trim() || undefined,
      notes: creating.notes?.trim() || undefined,
    });
    setCreating(null);
  };

  const countTasksFor = (memberId: string) =>
    tasks.filter((t) => t.assignee === memberId).length;

  const confirmDelete = (id: string) => {
    deleteTeamMember(id);
    setConfirmDeleteId(null);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="mt-1 text-sm text-gray-500">
            Team members assignable to tasks. Deleting a member unassigns them from every task.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <TrackerImportButton />
          <button
            onClick={startCreate}
            disabled={creating !== null}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-green px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-green/90 disabled:opacity-40 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add team member
          </button>
        </div>
      </div>

      {/* Avatar grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {team.map((member) => {
          const isEditing = editingId === member.id;
          const taskCount = countTasksFor(member.id);
          if (isEditing) {
            return (
              <EditCard
                key={member.id}
                initialValue={member}
                onCancel={() => setEditingId(null)}
                onSave={(draft) => {
                  updateTeamMember(member.id, draft);
                  setEditingId(null);
                }}
                onRequestDelete={() => setConfirmDeleteId(member.id)}
                confirmingDelete={confirmDeleteId === member.id}
                onConfirmDelete={() => confirmDelete(member.id)}
                onCancelDelete={() => setConfirmDeleteId(null)}
                taskCount={taskCount}
              />
            );
          }
          return (
            <button
              key={member.id}
              onClick={() => {
                setEditingId(member.id);
                setCreating(null);
                setConfirmDeleteId(null);
              }}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm hover:border-gray-300 hover:shadow transition-all"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white shrink-0"
                style={{ backgroundColor: member.color }}
              >
                {member.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {member.role}
                  {member.title ? ` · ${member.title}` : ""}
                </p>
                {member.company && (
                  <p className="text-[11px] text-gray-400 truncate">{member.company}</p>
                )}
              </div>
              {taskCount > 0 && (
                <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                  {taskCount} {taskCount === 1 ? "task" : "tasks"}
                </span>
              )}
            </button>
          );
        })}

        {creating && (
          <EditCard
            initialValue={creating}
            onCancel={() => setCreating(null)}
            onSave={handleCreate}
            mode="create"
            onDraftChange={setCreating}
          />
        )}
      </div>

      {team.length === 0 && !creating && (
        <div className="text-sm text-gray-500 border border-dashed border-gray-200 rounded-xl px-6 py-10 text-center">
          No team members yet. Click <span className="font-medium">Add team member</span> to seed the list.
        </div>
      )}
    </div>
  );
}

// ─── EditCard ────────────────────────────────────────────────────────────────

interface EditCardProps {
  initialValue: DraftMember;
  onCancel: () => void;
  onSave: (draft: Partial<TeamMember>) => void;
  onRequestDelete?: () => void;
  confirmingDelete?: boolean;
  onConfirmDelete?: () => void;
  onCancelDelete?: () => void;
  taskCount?: number;
  mode?: "edit" | "create";
  onDraftChange?: (draft: DraftMember) => void;
}

function EditCard({
  initialValue,
  onCancel,
  onSave,
  onRequestDelete,
  confirmingDelete,
  onConfirmDelete,
  onCancelDelete,
  taskCount,
  mode = "edit",
  onDraftChange,
}: EditCardProps) {
  const [draft, setDraft] = useState<DraftMember>(initialValue);

  const update = <K extends keyof DraftMember>(key: K, value: DraftMember[K]) => {
    const next = { ...draft, [key]: value };
    setDraft(next);
    onDraftChange?.(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    if (mode === "create") {
      onSave(draft);
    } else {
      onSave({
        ...draft,
        initials: draft.initials.trim() || computeInitials(draft.name),
        company: draft.company?.trim() || undefined,
        title: draft.title?.trim() || undefined,
        email: draft.email?.trim() || undefined,
        phone: draft.phone?.trim() || undefined,
        notes: draft.notes?.trim() || undefined,
      });
    }
  };

  const displayInitials = draft.initials.trim() || computeInitials(draft.name || "?");

  return (
    <form
      onSubmit={handleSubmit}
      className="col-span-full rounded-xl border border-brand-green/40 bg-white p-4 shadow-sm space-y-3"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white shrink-0"
          style={{ backgroundColor: draft.color }}
        >
          {displayInitials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
            {mode === "create" ? "New team member" : "Edit team member"}
          </p>
          <p className="text-xs text-gray-400">
            {taskCount !== undefined && taskCount > 0
              ? `Currently assigned to ${taskCount} ${taskCount === 1 ? "task" : "tasks"}`
              : "No task assignments yet"}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded hover:bg-gray-100 text-gray-400"
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Name *" value={draft.name} onChange={(v) => update("name", v)} required autoFocus />
        <Field label="Role" value={draft.role} onChange={(v) => update("role", v)} placeholder="Developer, Designer, PM…" />
        <Field
          label="Initials"
          value={draft.initials}
          onChange={(v) => update("initials", v.toUpperCase().slice(0, 3))}
          placeholder={computeInitials(draft.name || "?")}
        />
        <Field label="Title" value={draft.title ?? ""} onChange={(v) => update("title", v)} placeholder="VP of Sales & Marketing" />
        <Field label="Company" value={draft.company ?? ""} onChange={(v) => update("company", v)} placeholder="TableX" />
        <Field label="Email" value={draft.email ?? ""} onChange={(v) => update("email", v)} placeholder="name@example.com" type="email" />
        <Field label="Phone" value={draft.phone ?? ""} onChange={(v) => update("phone", v)} placeholder="727-555-1212" />
        <Field label="Notes" value={draft.notes ?? ""} onChange={(v) => update("notes", v)} placeholder="Context, availability, links…" />
      </div>

      {/* Color picker */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
          Avatar color
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TEAM_COLORS.map((color) => {
            const active = draft.color === color;
            return (
              <button
                key={color}
                type="button"
                onClick={() => update("color", color)}
                className={cn(
                  "h-7 w-7 rounded-full transition-all",
                  active ? "ring-2 ring-offset-2 ring-gray-900" : "hover:scale-110"
                )}
                style={{ backgroundColor: color }}
                aria-label={`Color ${color}`}
                title={color}
              />
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
        {mode === "edit" && onRequestDelete && (
          <div className="flex items-center gap-2">
            {confirmingDelete ? (
              <>
                <span className="text-xs text-red-600">
                  Delete {draft.name}? {taskCount ? `${taskCount} task assignments will be cleared.` : ""}
                </span>
                <button
                  type="button"
                  onClick={onConfirmDelete}
                  className="inline-flex items-center gap-1 text-xs bg-red-500 text-white px-2.5 py-1 rounded-lg hover:bg-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={onCancelDelete}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onRequestDelete}
                className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            )}
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!draft.name.trim()}
            className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-brand-green text-white font-medium hover:bg-brand-green/90 disabled:opacity-40"
          >
            <Check className="h-4 w-4" />
            {mode === "create" ? "Add" : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  autoFocus,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green"
      />
    </div>
  );
}
