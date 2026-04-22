"use client";

// Single source of truth for triggering a Monday reconcile from the client.
// Both the manual button and the background poller call into `syncNow()` so
// we get one place that handles the in-flight guard, status transitions, and
// log appends.

import { useCallback, useRef } from "react";
import { useProjectTrackerStore } from "@/store/project-tracker-store";

export interface SyncResult {
  syncedAt: string;
  taskPatches: Array<{
    taskId: string;
    patch: Record<string, unknown>;
    mondayItemId: string;
    mondayUpdatedAt: string;
  }>;
  overridePatches: Array<{
    deliverableId: string;
    patch: Record<string, unknown>;
    mondayItemId: string;
    mondayUpdatedAt: string;
  }>;
  pushedTaskIds: string[];
  pushedDeliverableIds: string[];
  linkUpdates: Array<{
    tableXId: string;
    mondayItemId: string;
    mondayUpdatedAt: string | null;
  }>;
  log: Array<{
    at: string;
    direction: "pulled" | "pushed" | "linked" | "skipped" | "error";
    kind: "task" | "deliverable";
    tableXId: string;
    detail?: string;
  }>;
  errors: string[];
}

const SAVED_FLASH_MS = 2_500;

export function useMondaySync() {
  const inflight = useRef(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncNow = useCallback(async (): Promise<SyncResult | null> => {
    if (inflight.current) return null;
    inflight.current = true;

    const store = useProjectTrackerStore.getState();
    store.setSyncStatus({ status: "syncing", lastError: null });

    try {
      const res = await fetch("/api/monday/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: store.tasks,
          deliverableOverrides: store.deliverableOverrides,
          syncState: store.syncState,
          // Sent for Owner column mapping (server resolves email → Monday user id).
          teamMembers: store.teamMembers,
        }),
      });

      const data = (await res.json()) as SyncResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? `Sync HTTP ${res.status}`);
      }

      // Apply all patches + link updates in a single store mutation.
      store.applySyncPatches({
        syncedAt: data.syncedAt,
        taskPatches: data.taskPatches as never,
        overridePatches: data.overridePatches as never,
        pushedTaskIds: data.pushedTaskIds,
        pushedDeliverableIds: data.pushedDeliverableIds,
        linkUpdates: data.linkUpdates,
      });
      store.appendSyncLog(data.log);

      const summary = {
        pulled: data.taskPatches.length + data.overridePatches.length,
        pushed: data.pushedTaskIds.length + data.pushedDeliverableIds.length,
        errors: data.errors.length,
      };

      if (data.errors.length > 0) {
        store.setSyncStatus({
          status: "error",
          lastError: data.errors[0],
          lastSyncedAt: data.syncedAt,
          lastSummary: summary,
        });
      } else {
        store.setSyncStatus({
          status: "saved",
          lastSyncedAt: data.syncedAt,
          lastError: null,
          lastSummary: summary,
        });
        // Flash "Saved" briefly, then settle to "idle" (which renders as
        // "Synced Xm ago"). Cancel any in-flight flash from a prior sync.
        if (savedTimer.current) clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => {
          useProjectTrackerStore.getState().setSyncStatus({ status: "idle" });
        }, SAVED_FLASH_MS);
      }

      return data;
    } catch (err) {
      const msg = (err as Error).message ?? "Sync failed";
      useProjectTrackerStore.getState().setSyncStatus({
        status: "error",
        lastError: msg,
      });
      return null;
    } finally {
      inflight.current = false;
    }
  }, []);

  return { syncNow };
}
