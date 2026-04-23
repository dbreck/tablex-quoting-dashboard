"use client";

// Subscribes to Postgres changes on the sprint tables:
//   sprints, burndown_snapshots
//
// Both tables were added to the supabase_realtime publication in migration
// 017. Burndown snapshots only update the local cache when a series for the
// sprint has already been loaded (see store).

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  useSprintStore,
  type SprintRealtimeTable,
} from "@/store/sprint-store";

const TABLES: SprintRealtimeTable[] = ["sprints", "burndown_snapshots"];

export function useSprintRealtime(): void {
  const isInitialized = useSprintStore((s) => s.isInitialized);

  useEffect(() => {
    if (!isInitialized) return;

    const supabase = createClient();
    let channel = supabase.channel("sprints");

    for (const table of TABLES) {
      channel = channel.on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "*", schema: "public", table },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          useSprintStore
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
