"use client";

// Subscribes to Postgres changes on project_assets.

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAssetsStore } from "@/store/assets-store";

export function useAssetsRealtime(): void {
  const isInitialized = useAssetsStore((s) => s.isInitialized);

  useEffect(() => {
    if (!isInitialized) return;

    const supabase = createClient();
    const channel = supabase
      .channel("project-assets")
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "project_assets" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          useAssetsStore
            .getState()
            .mergeRealtimeChange(
              "project_assets",
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
