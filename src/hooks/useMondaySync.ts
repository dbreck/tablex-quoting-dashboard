"use client";

// Single source of truth for triggering a Monday reconcile from the client.
//
// Server-driven model: the route reads the current snapshot from Supabase,
// runs reconcile(), and writes patches back to Supabase itself. The hook
// POSTs an empty body and refetches the three slices that may have changed
// (`tasks`, `deliverableOverrides`, `syncLinks`). Realtime is the bonus
// path; this refetch keeps the UI deterministic on slow / dropped Realtime
// channels.

import { useCallback, useRef } from "react";
import { useProjectTrackerStore } from "@/store/project-tracker-store";
import { fetchAllTrackerData } from "@/lib/supabase/tracker-client";

export interface SyncSummary {
  pulled: number;
  pushed: number;
  errors: number;
}

export interface SyncResponse {
  syncedAt: string;
  summary: SyncSummary;
  errors: string[];
}

const SAVED_FLASH_MS = 2_500;

export function useMondaySync() {
  const inflight = useRef(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncNow = useCallback(async (): Promise<SyncResponse | null> => {
    if (inflight.current) return null;
    inflight.current = true;

    const store = useProjectTrackerStore.getState();
    store.setSyncStatus({ status: "syncing", lastError: null });

    try {
      const res = await fetch("/api/monday/sync", {
        method: "POST",
      });

      const data = (await res.json()) as SyncResponse & { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? `Sync HTTP ${res.status}`);
      }

      // Refetch the slices that may have changed and merge them into the
      // store. We refetch the full snapshot rather than just the three sync
      // slices — it's a single round-trip via Promise.all and keeps any
      // other concurrent edits visible. Realtime fires on top of this.
      try {
        const snapshot = await fetchAllTrackerData();
        useProjectTrackerStore.setState({
          tasks: snapshot.tasks,
          deliverableOverrides: snapshot.deliverableOverrides,
          syncState: snapshot.syncLinks,
          // Also pick up any sync_log inserts the route just made.
          syncLog: snapshot.syncLog,
        });
      } catch (err) {
        // Refetch failed but the sync itself succeeded server-side. Surface
        // a soft warning; Realtime / next nav will eventually reconcile.
        console.warn("[useMondaySync] post-sync refetch failed", err);
      }

      if (data.errors.length > 0) {
        store.setSyncStatus({
          status: "error",
          lastError: data.errors[0],
          lastSyncedAt: data.syncedAt,
          lastSummary: data.summary,
        });
      } else {
        store.setSyncStatus({
          status: "saved",
          lastSyncedAt: data.syncedAt,
          lastError: null,
          lastSummary: data.summary,
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
