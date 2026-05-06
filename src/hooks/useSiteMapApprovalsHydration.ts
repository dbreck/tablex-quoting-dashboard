"use client";

// Loads site-map approvals from Supabase into the store. Idempotent.
// Returns a HydrationError with a `migrationMissing` flag when the
// `site_map_approvals` table hasn't been created yet, so the layout can
// surface a clear "apply migration 025" card (mirrors the Content Map pattern).

import { useEffect, useState } from "react";
import { useApprovalsStore } from "@/store/site-map-approvals-store";
import { fetchAllApprovals } from "@/lib/supabase/site-map-approvals-client";

export interface HydrationError {
  message: string;
  code?: string;
  hint?: string;
  details?: string;
  migrationMissing: boolean;
}

interface HydrationResult {
  isInitialized: boolean;
  error: HydrationError | null;
}

function normalizeError(err: unknown): HydrationError {
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    const message = typeof e.message === "string" ? e.message : String(err);
    const code = typeof e.code === "string" ? e.code : undefined;
    const hint = typeof e.hint === "string" ? e.hint : undefined;
    const details = typeof e.details === "string" ? e.details : undefined;
    const migrationMissing =
      code === "42P01" ||
      code === "PGRST205" ||
      /does not exist|could not find the table|schema cache/i.test(message);
    return { message, code, hint, details, migrationMissing };
  }
  return {
    message: typeof err === "string" ? err : "Unknown error",
    migrationMissing: false,
  };
}

export function useSiteMapApprovalsHydration(): HydrationResult {
  const isInitialized = useApprovalsStore((s) => s.isInitialized);
  const [error, setError] = useState<HydrationError | null>(null);

  useEffect(() => {
    if (useApprovalsStore.getState().isInitialized) return;

    let cancelled = false;
    fetchAllApprovals()
      .then((records) => {
        if (cancelled) return;
        useApprovalsStore.getState().hydrate({ records });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[useSiteMapApprovalsHydration] fetch failed", err);
        setError(normalizeError(err));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { isInitialized, error };
}
