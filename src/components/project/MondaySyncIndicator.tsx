"use client";

// Manual Monday sync chip — the primary "Sync Now" surface. Renders one of
// four states:
//   - syncing: blue, spinner, "Syncing…"
//   - saved: green, brief flash after a clean sync
//   - error: red, click to retry
//   - idle (pending > 0): amber split button — "Sync N change(s)" syncs on click,
//     chevron opens a popover listing which tasks are pending.
//   - idle (pending 0): neutral "Synced Xm ago · Sync now" or "Sync now".
// Always clickable except while a sync is in flight.

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  Sparkles,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectTrackerStore } from "@/store/project-tracker-store";
import { useMondaySync } from "@/hooks/useMondaySync";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { DELIVERABLES } from "@/data/project-phase2";
import type { Task } from "@/data/project-tracker";

function formatRelative(iso: string | null): string {
  if (!iso) return "never";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "never";
  const diffMs = Date.now() - t;
  const sec = Math.round(diffMs / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
}

interface PendingTask {
  task: Task;
  isNew: boolean;
}

/** Tasks edited locally since their last successful sync, newest first. */
function usePendingTasks(): PendingTask[] {
  const tasks = useProjectTrackerStore((s) => s.tasks);
  const syncState = useProjectTrackerStore((s) => s.syncState);
  return useMemo(() => {
    const pending: PendingTask[] = [];
    for (const t of tasks) {
      const link = syncState[t.id];
      if (!link?.lastSyncedAt) {
        pending.push({ task: t, isNew: true });
        continue;
      }
      if (Date.parse(t.updatedAt) > Date.parse(link.lastSyncedAt)) {
        pending.push({ task: t, isNew: false });
      }
    }
    pending.sort((a, b) => b.task.updatedAt.localeCompare(a.task.updatedAt));
    return pending;
  }, [tasks, syncState]);
}

export function MondaySyncIndicator({ className }: { className?: string }) {
  const status = useProjectTrackerStore((s) => s.syncStatus);
  const pendingTasks = usePendingTasks();
  const pending = pendingTasks.length;
  const { syncNow } = useMondaySync();
  // Re-render every 30s so "Synced 2m ago" stays current.
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const baseChip =
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors";

  if (status.status === "syncing") {
    return (
      <span
        className={cn(
          baseChip,
          "border-blue-200 bg-blue-50 text-blue-700",
          className,
        )}
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        Syncing…
      </span>
    );
  }

  if (status.status === "error") {
    return (
      <button
        type="button"
        onClick={() => syncNow()}
        title={status.lastError ?? "Sync failed"}
        className={cn(
          baseChip,
          "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer",
          className,
        )}
      >
        <AlertCircle className="h-3 w-3" />
        Sync failed — retry
      </button>
    );
  }

  if (status.status === "saved") {
    return (
      <span
        className={cn(
          baseChip,
          "border-emerald-200 bg-emerald-50 text-emerald-700",
          className,
        )}
      >
        <CheckCircle2 className="h-3 w-3" />
        Saved
      </span>
    );
  }

  // idle — primary action surface.
  if (pending > 0) {
    return (
      <div
        className={cn(
          "inline-flex items-stretch rounded-full border border-amber-300 bg-amber-50 text-amber-800 text-xs font-medium overflow-hidden",
          className,
        )}
      >
        <button
          type="button"
          onClick={() => syncNow()}
          title="Push local edits to Monday and pull any remote changes"
          className="inline-flex items-center gap-1.5 pl-3 pr-2.5 py-1 hover:bg-amber-100 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" />
          Sync {pending} change{pending === 1 ? "" : "s"}
        </button>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Preview pending changes"
              aria-label="Preview pending changes"
              className="inline-flex items-center justify-center border-l border-amber-300 px-1.5 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0">
            <PendingPreview
              pending={pendingTasks}
              onSync={() => syncNow()}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => syncNow()}
      title="Sync with Monday.com"
      className={cn(
        baseChip,
        "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer",
        className,
      )}
    >
      <RefreshCw className="h-3 w-3" />
      {status.lastSyncedAt
        ? `Synced ${formatRelative(status.lastSyncedAt)} · Sync now`
        : "Sync now"}
    </button>
  );
}

// ─── Popover content ─────────────────────────────────────────────────────────

interface PendingPreviewProps {
  pending: PendingTask[];
  onSync: () => void;
}

function PendingPreview({ pending, onSync }: PendingPreviewProps) {
  const newCount = pending.filter((p) => p.isNew).length;
  const updatedCount = pending.length - newCount;

  return (
    <div className="flex flex-col max-h-96">
      <div className="px-4 pt-3 pb-2 border-b border-slate-200">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Pending changes
          </h3>
          <span className="text-xs text-slate-500 tabular-nums">
            {pending.length} total
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
          {newCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              {newCount} new
            </span>
          )}
          {updatedCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <Pencil className="h-3 w-3 text-amber-600" />
              {updatedCount} updated
            </span>
          )}
          <span className="ml-auto text-slate-400">
            Anyone&rsquo;s edits · whoever syncs pushes all
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {pending.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-slate-400">
            Nothing pending.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pending.slice(0, 50).map(({ task, isNew }) => {
              const deliverable = DELIVERABLES.find(
                (d) => d.id === task.deliverableId,
              );
              return (
                <li key={task.id} className="px-4 py-2">
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center shrink-0 text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded border mt-0.5",
                        isNew
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-800",
                      )}
                    >
                      {isNew ? "new" : "upd"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-900 truncate">
                        {task.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                        {deliverable && (
                          <span className="truncate">{deliverable.name}</span>
                        )}
                        <span className="ml-auto shrink-0 tabular-nums">
                          {formatRelative(task.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
            {pending.length > 50 && (
              <li className="px-4 py-2 text-[11px] text-slate-400 text-center">
                +{pending.length - 50} more
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50">
        <button
          type="button"
          onClick={onSync}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Sync all {pending.length} to Monday
        </button>
      </div>
    </div>
  );
}
