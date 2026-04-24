"use client";

// Subscribes to Postgres changes on risks + decisions tables.

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  useRisksDecisionsStore,
  type RisksDecisionsRealtimeTable,
} from "@/store/risks-decisions-store";

const TABLES: RisksDecisionsRealtimeTable[] = ["risks", "decisions"];

export function useRisksDecisionsRealtime(): void {
  const isInitialized = useRisksDecisionsStore((s) => s.isInitialized);

  useEffect(() => {
    if (!isInitialized) return;

    const supabase = createClient();
    let channel = supabase.channel("risks-decisions");

    for (const table of TABLES) {
      channel = channel.on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "*", schema: "public", table },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          useRisksDecisionsStore
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
