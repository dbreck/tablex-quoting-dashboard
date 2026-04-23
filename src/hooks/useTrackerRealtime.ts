"use client";

// Subscribes to Postgres changes on the five "live" tracker tables:
//   project_tasks, deliverable_overrides, team_members, sync_links, tracker_meta
//
// `sync_log` is intentionally excluded — it's an append-only audit table and
// not in the supabase_realtime publication. The store's syncLog slice is
// refreshed via explicit refetch (after a sync round) instead.
//
// Each event is forwarded to `mergeRealtimeChange()` which merges the row
// into the matching slice while respecting local optimistic updates.

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  useProjectTrackerStore,
  type RealtimeTable,
} from "@/store/project-tracker-store";

const TABLES: RealtimeTable[] = [
  "project_tasks",
  "deliverable_overrides",
  "team_members",
  "sync_links",
  "tracker_meta",
];

export function useTrackerRealtime(): void {
  const isInitialized = useProjectTrackerStore((s) => s.isInitialized);

  useEffect(() => {
    if (!isInitialized) return;

    const supabase = createClient();
    let channel = supabase.channel("tracker");

    for (const table of TABLES) {
      // Cast through `any` — Supabase's postgres_changes filter type is a
      // string-literal union we don't want to enumerate per-table.
      channel = channel.on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "*", schema: "public", table },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          useProjectTrackerStore
            .getState()
            .mergeRealtimeChange(
              table,
              payload.eventType,
              payload.new ?? null,
              payload.old ?? null,
            );
        },
      );
    }

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isInitialized]);
}
