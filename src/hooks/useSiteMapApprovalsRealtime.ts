"use client";

// Subscribes to Postgres changes on site_map_approvals and feeds them to
// the store's mergeRealtimeChange. Local-newer guard lives inside the merge
// so optimistic updates aren't clobbered by their own echoes.

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  useApprovalsStore,
  type ApprovalsRealtimeTable,
} from "@/store/site-map-approvals-store";

const TABLE: ApprovalsRealtimeTable = "site_map_approvals";

export function useSiteMapApprovalsRealtime(): void {
  const isInitialized = useApprovalsStore((s) => s.isInitialized);

  useEffect(() => {
    if (!isInitialized) return;

    const supabase = createClient();
    const channel = supabase
      .channel("site-map-approvals")
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "*", schema: "public", table: TABLE },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          useApprovalsStore
            .getState()
            .mergeRealtimeChange(
              TABLE,
              payload.eventType,
              payload.new ?? null,
              payload.old ?? null,
            );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isInitialized]);
}
