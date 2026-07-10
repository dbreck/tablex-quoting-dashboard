"use client";

// Subscribes to Postgres changes on launch_milestones and merges each event
// into the store (respecting local optimistic updates via a last-write guard).

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLaunchTimelineStore } from "@/store/launch-timeline-store";

export function useLaunchTimelineRealtime(): void {
  const isInitialized = useLaunchTimelineStore((s) => s.isInitialized);

  useEffect(() => {
    if (!isInitialized) return;

    const supabase = createClient();
    const channel = supabase.channel("launch_timeline").on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "postgres_changes" as any,
      { event: "*", schema: "public", table: "launch_milestones" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (payload: any) => {
        useLaunchTimelineStore
          .getState()
          .mergeRealtimeChange(
            "launch_milestones",
            payload.eventType,
            payload.new ?? null,
            payload.old ?? null,
          );
      },
    );

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isInitialized]);
}
