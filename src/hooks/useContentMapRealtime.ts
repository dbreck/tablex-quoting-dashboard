"use client";

// Subscribes to Postgres changes on content_nodes + content_edges. Both tables
// are in the supabase_realtime publication (migration 020).

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  useContentMapStore,
  type ContentMapRealtimeTable,
} from "@/store/content-map-store";

const TABLES: ContentMapRealtimeTable[] = ["content_nodes", "content_edges"];

export function useContentMapRealtime(): void {
  const isInitialized = useContentMapStore((s) => s.isInitialized);

  useEffect(() => {
    if (!isInitialized) return;

    const supabase = createClient();
    let channel = supabase.channel("content-map");

    for (const table of TABLES) {
      channel = channel.on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "*", schema: "public", table },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          useContentMapStore
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
