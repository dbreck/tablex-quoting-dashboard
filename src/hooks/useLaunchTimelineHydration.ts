"use client";

// Loads the launch_milestones snapshot from Supabase into the Zustand store.
// Called once from `app/(dashboard)/project/layout.tsx`. Idempotent — skips
// the network round-trip if the store is already initialized.

import { useEffect, useState } from "react";
import { useLaunchTimelineStore } from "@/store/launch-timeline-store";
import { fetchAllLaunchMilestones } from "@/lib/supabase/launch-timeline-client";

interface HydrationResult {
  isInitialized: boolean;
  error: Error | null;
}

export function useLaunchTimelineHydration(): HydrationResult {
  const isInitialized = useLaunchTimelineStore((s) => s.isInitialized);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (useLaunchTimelineStore.getState().isInitialized) return;

    let cancelled = false;
    fetchAllLaunchMilestones()
      .then((milestones) => {
        if (cancelled) return;
        useLaunchTimelineStore.getState().hydrate(milestones);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[useLaunchTimelineHydration] fetch failed", err);
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        useLaunchTimelineStore.getState().setLoadError(e.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { isInitialized, error };
}
