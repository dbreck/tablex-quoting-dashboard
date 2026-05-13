"use client";

// Loads project_assets from Supabase into the store. Idempotent.

import { useEffect, useState } from "react";
import { useAssetsStore } from "@/store/assets-store";
import { fetchAllAssetGroups } from "@/lib/supabase/assets-client";

interface HydrationResult {
  isInitialized: boolean;
  error: Error | null;
}

export function useAssetsHydration(): HydrationResult {
  const isInitialized = useAssetsStore((s) => s.isInitialized);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (useAssetsStore.getState().isInitialized) return;

    let cancelled = false;
    fetchAllAssetGroups()
      .then((assetGroups) => {
        if (cancelled) return;
        useAssetsStore.getState().hydrate({ assetGroups });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[useAssetsHydration] fetch failed", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { isInitialized, error };
}
