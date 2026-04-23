"use client";

// Loads the sprints snapshot from Supabase into the sprint store.
// Called once from `app/(dashboard)/project/layout.tsx` alongside the tracker
// hydration hook. Idempotent — skips the network round-trip if already
// initialized.

import { useEffect, useState } from "react";
import { useSprintStore } from "@/store/sprint-store";
import { fetchAllSprints } from "@/lib/supabase/sprint-client";

interface HydrationResult {
  isInitialized: boolean;
  error: Error | null;
}

export function useSprintHydration(): HydrationResult {
  const isInitialized = useSprintStore((s) => s.isInitialized);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (useSprintStore.getState().isInitialized) return;

    let cancelled = false;
    fetchAllSprints()
      .then((sprints) => {
        if (cancelled) return;
        useSprintStore.getState().hydrate({ sprints });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[useSprintHydration] fetch failed", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { isInitialized, error };
}
