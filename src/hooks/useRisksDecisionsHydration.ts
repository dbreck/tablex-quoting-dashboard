"use client";

// Loads risks + decisions from Supabase into the store. Idempotent.

import { useEffect, useState } from "react";
import { useRisksDecisionsStore } from "@/store/risks-decisions-store";
import {
  fetchAllRisks,
  fetchAllDecisions,
} from "@/lib/supabase/risks-decisions-client";

interface HydrationResult {
  isInitialized: boolean;
  error: Error | null;
}

export function useRisksDecisionsHydration(): HydrationResult {
  const isInitialized = useRisksDecisionsStore((s) => s.isInitialized);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (useRisksDecisionsStore.getState().isInitialized) return;

    let cancelled = false;
    Promise.all([fetchAllRisks(), fetchAllDecisions()])
      .then(([risks, decisions]) => {
        if (cancelled) return;
        useRisksDecisionsStore.getState().hydrate({ risks, decisions });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[useRisksDecisionsHydration] fetch failed", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { isInitialized, error };
}
