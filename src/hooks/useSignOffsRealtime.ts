"use client";

// Subscribes to Postgres changes on sign-offs + revisions + notes.

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  useSignOffsStore,
  type SignOffsRealtimeTable,
} from "@/store/sign-offs-store";

const TABLES: SignOffsRealtimeTable[] = [
  "sign_offs",
  "sign_off_revisions",
  "sign_off_notes",
];

export function useSignOffsRealtime(): void {
  const isInitialized = useSignOffsStore((s) => s.isInitialized);

  useEffect(() => {
    if (!isInitialized) return;

    const supabase = createClient();
    let channel = supabase.channel("sign-offs");

    for (const table of TABLES) {
      channel = channel.on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "*", schema: "public", table },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          useSignOffsStore
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
