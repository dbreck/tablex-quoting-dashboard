"use client";

// Loads the project tracker snapshot from Supabase into the Zustand store.
// Called once from `app/(dashboard)/project/layout.tsx`. Idempotent — skips
// the network round-trip if the store is already initialized.

import { useEffect, useState } from "react";
import { useProjectTrackerStore } from "@/store/project-tracker-store";
import { fetchAllTrackerData } from "@/lib/supabase/tracker-client";

interface HydrationResult {
  isInitialized: boolean;
  error: Error | null;
}

export function useTrackerHydration(): HydrationResult {
  const isInitialized = useProjectTrackerStore((s) => s.isInitialized);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (useProjectTrackerStore.getState().isInitialized) return;

    let cancelled = false;
    fetchAllTrackerData()
      .then((snapshot) => {
        if (cancelled) return;
        useProjectTrackerStore.getState().hydrate(snapshot);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[useTrackerHydration] fetch failed", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { isInitialized, error };
}
