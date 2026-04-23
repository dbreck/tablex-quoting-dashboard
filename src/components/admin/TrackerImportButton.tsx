"use client";

import { useState, useSyncExternalStore } from "react";
import { Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const STORAGE_KEY = "tablex-project-tracker-v1";

interface PersistedShape {
  state?: Record<string, unknown>;
  version?: number;
}

interface PreviewCounts {
  tasks: number;
  teamMembers: number;
  overrides: number;
  syncLinks: number;
  syncLog: number;
}

function readLocalRaw(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

function parseLocal(raw: string | null): { state: Record<string, unknown>; counts: PreviewCounts } | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PersistedShape;
    const state = parsed?.state;
    if (!state || typeof state !== "object") return null;
    const tasks = Array.isArray(state.tasks) ? state.tasks.length : 0;
    const teamMembers =
      state.teamMembers && typeof state.teamMembers === "object"
        ? Object.keys(state.teamMembers as object).length
        : 0;
    const overrides =
      state.deliverableOverrides && typeof state.deliverableOverrides === "object"
        ? Object.keys(state.deliverableOverrides as object).length
        : 0;
    const syncLinks =
      state.syncState && typeof state.syncState === "object"
        ? Object.keys(state.syncState as object).length
        : 0;
    const syncLog = Array.isArray(state.syncLog) ? state.syncLog.length : 0;
    return { state, counts: { tasks, teamMembers, overrides, syncLinks, syncLog } };
  } catch {
    return null;
  }
}

function subscribeStorage(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function TrackerImportButton() {
  const raw = useSyncExternalStore(
    subscribeStorage,
    readLocalRaw,
    () => null, // SSR snapshot — render the "no data" branch on the server
  );
  const local = parseLocal(raw);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  if (!local) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <AlertCircle className="h-3.5 w-3.5" />
        No local tracker data found in this browser.
      </div>
    );
  }

  const handleImport = async () => {
    const c = local.counts;
    const ok = window.confirm(
      `Import ${c.tasks} tasks, ${c.teamMembers} team members, ${c.overrides} overrides, ${c.syncLinks} sync links, and ${c.syncLog} log entries from this browser's localStorage?\n\nExisting rows with matching IDs will be overwritten.`,
    );
    if (!ok) return;

    setStatus("loading");
    setMessage(null);

    try {
      const res = await fetch("/api/admin/tracker-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(local.state),
      });
      const body = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(body?.error ?? `Import failed (HTTP ${res.status})`);
        return;
      }
      setStatus("success");
      setMessage(
        `Imported ${body.tasks} tasks, ${body.teamMembers} team members, ${body.deliverableOverrides} overrides, ${body.syncLinks} sync links, ${body.syncLog} log entries${body.idsRewritten ? ` (${body.idsRewritten} task ids rewritten)` : ""}.`,
      );
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Import failed");
    }
  };

  const c = local.counts;

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleImport}
        disabled={status === "loading"}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
        title={`Local: ${c.tasks} tasks · ${c.teamMembers} members · ${c.overrides} overrides · ${c.syncLinks} sync links · ${c.syncLog} log entries`}
      >
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        Import local tracker → Supabase
      </button>

      {status === "success" && (
        <div className="flex items-start gap-1.5 text-xs text-emerald-700 max-w-xs text-right">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}
      {status === "error" && (
        <div className="flex items-start gap-1.5 text-xs text-red-600 max-w-xs text-right">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}
      {status === "idle" && (
        <p className="text-[11px] text-gray-400">
          Local: {c.tasks} tasks · {c.teamMembers} members · {c.overrides} overrides · {c.syncLinks} sync links
        </p>
      )}
    </div>
  );
}
