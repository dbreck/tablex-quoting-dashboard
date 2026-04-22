"use client";

// Standard "Saving / Saved / Error" indicator pattern (Google Docs / Notion).
// Reads the transient `syncStatus` slice and renders a small chip. Not
// interactive while syncing; clickable to retry on error or to force a sync
// when idle.

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectTrackerStore } from "@/store/project-tracker-store";
import { useMondaySync } from "@/hooks/useMondaySync";

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

export function MondaySyncIndicator({ className }: { className?: string }) {
  const status = useProjectTrackerStore((s) => s.syncStatus);
  const { syncNow } = useMondaySync();
  // Re-render every 30s so "Synced 2m ago" stays current.
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const baseChip =
    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors";

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
        Saving…
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

  // idle
  return (
    <button
      type="button"
      onClick={() => syncNow()}
      title="Sync with Monday.com now"
      className={cn(
        baseChip,
        "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer",
        className,
      )}
    >
      <RefreshCw className="h-3 w-3" />
      {status.lastSyncedAt
        ? `Synced ${formatRelative(status.lastSyncedAt)}`
        : "Not synced yet"}
    </button>
  );
}
