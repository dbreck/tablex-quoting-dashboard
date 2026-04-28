"use client";

import { useEffect, useMemo, useState } from "react";
import { Wifi, Database, RefreshCw, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useProjectTrackerStore } from "@/store/project-tracker-store";
import { useMondaySync } from "@/hooks/useMondaySync";
import { fetchAllTrackerData } from "@/lib/supabase/tracker-client";
import { DELIVERABLES } from "@/data/project-phase2";

function formatLogTime(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  const diffMs = Date.now() - t;
  const min = Math.round(diffMs / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(t).toLocaleDateString();
}

interface PingResult {
  boardName: string;
  groupCount: number;
  columnCount: number;
}

interface SeedResult {
  groupsCreated: string[];
  columnsCreated: string[];
  itemsCreated: number;
  itemsUpdated: number;
  subitemsCreated: number;
  subitemsUpdated: number;
  subitemsDeleted?: number;
  errors: string[];
}

export default function AdminMondayPage() {
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<PingResult | null>(null);
  const [pingError, setPingError] = useState<string | null>(null);

  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [seedConfirming, setSeedConfirming] = useState(false);

  const { syncNow } = useMondaySync();
  const syncStatus = useProjectTrackerStore((s) => s.syncStatus);
  const syncLog = useProjectTrackerStore((s) => s.syncLog);
  const tasks = useProjectTrackerStore((s) => s.tasks);
  const syncing = syncStatus.status === "syncing";

  const [refreshingLog, setRefreshingLog] = useState(false);
  const [logFilter, setLogFilter] = useState<
    "all" | "errors" | "pushed" | "pulled"
  >("all");

  // Resolve task ids → titles for friendlier log rows. Deliverables come from
  // the static DELIVERABLES catalog.
  const labelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of DELIVERABLES) map.set(d.id, d.name);
    for (const t of tasks) map.set(t.id, t.title);
    return map;
  }, [tasks]);

  const filteredLog = useMemo(() => {
    if (logFilter === "all") return syncLog;
    if (logFilter === "errors")
      return syncLog.filter((e) => e.direction === "error");
    return syncLog.filter((e) => e.direction === logFilter);
  }, [syncLog, logFilter]);

  const handleRefreshLog = async () => {
    setRefreshingLog(true);
    try {
      const snapshot = await fetchAllTrackerData();
      useProjectTrackerStore.setState({
        syncLog: snapshot.syncLog,
        // Pull tasks too so log labels resolve even when the user came
        // straight to /admin without visiting /project first.
        tasks: snapshot.tasks,
      });
    } catch (err) {
      console.error("[admin/monday] refresh sync log failed", err);
    } finally {
      setRefreshingLog(false);
    }
  };

  // Hydrate the log on mount — admin layout doesn't run tracker hydration,
  // so the user could land here with an empty syncLog.
  useEffect(() => {
    let cancelled = false;
    fetchAllTrackerData()
      .then((snapshot) => {
        if (cancelled) return;
        useProjectTrackerStore.setState({
          syncLog: snapshot.syncLog,
          tasks: snapshot.tasks,
        });
      })
      .catch((err) => {
        console.error("[admin/monday] initial sync log fetch failed", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePing = async () => {
    setPinging(true);
    setPingError(null);
    setPingResult(null);
    try {
      const res = await fetch("/api/monday/ping", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Connection failed");
      setPingResult(data);
    } catch (err) {
      setPingError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setPinging(false);
    }
  };

  const handleSeedConfirm = async () => {
    setSeedConfirming(false);
    setSeeding(true);
    setSeedError(null);
    setSeedResult(null);
    try {
      const res = await fetch("/api/monday/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Seed failed");
      setSeedResult(data);
    } catch (err) {
      setSeedError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Monday.com Integration</h1>
        <p className="mt-1 text-sm text-gray-500">
          Sync the Project Tracker with the TableX Monday board.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Test Connection */}
        <Button
          variant="outline"
          onClick={handlePing}
          disabled={pinging}
        >
          {pinging ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4" />}
          Test Connection
        </Button>

        {/* Seed Board */}
        {seedConfirming ? (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <span>
              This will create groups, columns, items, and subitems on the TableX Monday board.
              Safe to re-run. Continue?
            </span>
            <Button size="sm" onClick={handleSeedConfirm} disabled={seeding}>
              Confirm
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSeedConfirming(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setSeedConfirming(true)}
            disabled={seeding}
          >
            {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Seed Board
          </Button>
        )}

        {/* Sync Now — manual bidirectional reconcile */}
        <Button
          variant="outline"
          onClick={() => syncNow()}
          disabled={syncing}
          title="Reconcile TableX ↔ Monday now"
        >
          {syncing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Sync Now
        </Button>
      </div>

      {/* Sync status */}
      {(syncStatus.lastSyncedAt || syncStatus.lastError || syncStatus.lastSummary) && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700">
                Last Sync
              </CardTitle>
              {syncStatus.status === "error" && <Badge variant="error">Failed</Badge>}
              {syncStatus.status === "saved" && <Badge variant="success">Saved</Badge>}
              {syncStatus.status === "syncing" && <Badge>Syncing</Badge>}
              {syncStatus.status === "idle" && syncStatus.lastSyncedAt && (
                <Badge variant="success">Idle</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {syncStatus.lastSummary && (
              <dl className="grid grid-cols-3 gap-4 text-sm mb-3">
                <div>
                  <dt className="text-xs text-gray-500 uppercase tracking-wider">Pulled</dt>
                  <dd className="mt-0.5 font-medium text-gray-900">
                    {syncStatus.lastSummary.pulled}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 uppercase tracking-wider">Pushed</dt>
                  <dd className="mt-0.5 font-medium text-gray-900">
                    {syncStatus.lastSummary.pushed}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 uppercase tracking-wider">Errors</dt>
                  <dd
                    className={`mt-0.5 font-medium ${
                      syncStatus.lastSummary.errors > 0 ? "text-red-700" : "text-gray-900"
                    }`}
                  >
                    {syncStatus.lastSummary.errors}
                  </dd>
                </div>
              </dl>
            )}
            {syncStatus.lastError && (
              <p className="text-xs text-red-600 break-words">{syncStatus.lastError}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sync Log — full audit trail from sync_log table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Sync Log
              {syncLog.length > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-500 tabular-nums">
                  {filteredLog.length}
                  {logFilter !== "all" && ` of ${syncLog.length}`}
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <select
                value={logFilter}
                onChange={(e) =>
                  setLogFilter(
                    e.target.value as "all" | "errors" | "pushed" | "pulled",
                  )
                }
                className="rounded-md border border-gray-200 bg-white text-xs px-2 py-1"
              >
                <option value="all">All</option>
                <option value="errors">Errors only</option>
                <option value="pushed">Pushed</option>
                <option value="pulled">Pulled</option>
              </select>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRefreshLog}
                disabled={refreshingLog}
                title="Reload the latest entries from Supabase"
              >
                {refreshingLog ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {syncLog.length === 0 ? (
            <p className="text-xs text-gray-500">
              No sync activity yet. Run a sync to populate the log.
            </p>
          ) : filteredLog.length === 0 ? (
            <p className="text-xs text-gray-500">
              No entries match the current filter.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-[28rem] overflow-y-auto">
              {filteredLog.map((entry, idx) => {
                const label = labelById.get(entry.tableXId) ?? null;
                return (
                  <li
                    key={`${entry.at}-${entry.tableXId}-${idx}`}
                    className="py-2 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`inline-block shrink-0 px-1.5 py-0.5 rounded font-mono text-[10px] uppercase tracking-wider ${
                          entry.direction === "pulled"
                            ? "bg-blue-100 text-blue-700"
                            : entry.direction === "pushed"
                              ? "bg-emerald-100 text-emerald-700"
                              : entry.direction === "linked"
                                ? "bg-slate-100 text-slate-700"
                                : entry.direction === "error"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {entry.direction}
                      </span>
                      <span className="shrink-0 text-[11px] uppercase tracking-wider text-gray-400 mt-0.5">
                        {entry.kind}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-900 truncate">
                          {label ?? (
                            <span className="text-gray-500 italic">
                              (deleted)
                            </span>
                          )}
                          <span className="ml-2 font-mono text-[10px] text-gray-400">
                            {entry.tableXId}
                          </span>
                        </div>
                        {entry.detail && (
                          <div
                            className={`mt-0.5 text-[11px] ${
                              entry.direction === "error"
                                ? "text-red-600"
                                : "text-gray-500"
                            } break-words`}
                          >
                            {entry.detail}
                          </div>
                        )}
                      </div>
                      <time
                        className="shrink-0 text-[11px] text-gray-400 tabular-nums mt-0.5"
                        dateTime={entry.at}
                        title={new Date(entry.at).toLocaleString()}
                      >
                        {formatLogTime(entry.at)}
                      </time>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-3 text-[11px] text-gray-400">
            Last 50 entries. Older history is trimmed automatically.
          </p>
        </CardContent>
      </Card>

      {/* Ping result */}
      {(pingResult || pingError) && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700">Connection Test</CardTitle>
              {pingResult && <Badge variant="success">Connected</Badge>}
              {pingError && <Badge variant="error">Failed</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            {pingResult && (
              <dl className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-gray-500 uppercase tracking-wider">Board</dt>
                  <dd className="mt-0.5 font-medium text-gray-900">{pingResult.boardName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 uppercase tracking-wider">Groups</dt>
                  <dd className="mt-0.5 font-medium text-gray-900">{pingResult.groupCount}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 uppercase tracking-wider">Columns</dt>
                  <dd className="mt-0.5 font-medium text-gray-900">{pingResult.columnCount}</dd>
                </div>
              </dl>
            )}
            {pingError && (
              <p className="text-sm text-red-600">{pingError}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Seed result */}
      {(seedResult || seedError) && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700">Seed Summary</CardTitle>
              {seedResult && <Badge variant="success">Complete</Badge>}
              {seedError && <Badge variant="error">Failed</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            {seedResult && (
              <>
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <dt className="text-xs text-gray-500 uppercase tracking-wider">Groups Created</dt>
                    <dd className="mt-0.5 font-medium text-gray-900">{seedResult.groupsCreated.length}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 uppercase tracking-wider">Columns Created</dt>
                    <dd className="mt-0.5 font-medium text-gray-900">{seedResult.columnsCreated.length}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 uppercase tracking-wider">Items Created</dt>
                    <dd className="mt-0.5 font-medium text-gray-900">{seedResult.itemsCreated}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 uppercase tracking-wider">Items Updated</dt>
                    <dd className="mt-0.5 font-medium text-gray-900">{seedResult.itemsUpdated}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 uppercase tracking-wider">Subitems Created</dt>
                    <dd className="mt-0.5 font-medium text-gray-900">{seedResult.subitemsCreated}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 uppercase tracking-wider">Subitems Updated</dt>
                    <dd className="mt-0.5 font-medium text-gray-900">{seedResult.subitemsUpdated}</dd>
                  </div>
                  {seedResult.subitemsDeleted != null && seedResult.subitemsDeleted > 0 && (
                    <div>
                      <dt className="text-xs text-gray-500 uppercase tracking-wider">Orphans Deleted</dt>
                      <dd className="mt-0.5 font-medium text-amber-700">{seedResult.subitemsDeleted}</dd>
                    </div>
                  )}
                </dl>
                {seedResult.errors.length > 0 && (
                  <div className="mt-3 text-xs text-red-600">
                    {seedResult.errors.length} error{seedResult.errors.length === 1 ? "" : "s"} — first: {seedResult.errors[0]}
                  </div>
                )}
              </>
            )}
            {seedError && (
              <p className="text-sm text-red-600">{seedError}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Board link */}
      <div className="pt-2 border-t border-gray-100">
        <a
          href="https://clear-ph-design.monday.com/boards/18409604004"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-brand-green hover:underline"
        >
          View Monday board
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
