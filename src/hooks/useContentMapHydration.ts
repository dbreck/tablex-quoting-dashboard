"use client";

// Loads the content map snapshot (nodes + edges) from Supabase into the store.
// Idempotent — skips the network round-trip if already initialized.

import { useEffect, useState } from "react";
import { useContentMapStore } from "@/store/content-map-store";
import { fetchAllContentMap } from "@/lib/supabase/content-map-client";

export interface HydrationError {
  message: string;
  code?: string;
  hint?: string;
  details?: string;
  /** True when the error is a missing-table / missing-publication error from Postgres. */
  migrationMissing: boolean;
}

interface HydrationResult {
  isInitialized: boolean;
  error: HydrationError | null;
}

function normalizeError(err: unknown): HydrationError {
  // Supabase PostgrestError shape: { message, details, hint, code } (plain object).
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    const message = typeof e.message === "string" ? e.message : String(err);
    const code = typeof e.code === "string" ? e.code : undefined;
    const hint = typeof e.hint === "string" ? e.hint : undefined;
    const details = typeof e.details === "string" ? e.details : undefined;
    // Match the two shapes we see when the migration hasn't been applied:
    //   - 42P01 (Postgres undefined_table, direct driver)
    //   - PGRST205 (PostgREST schema-cache miss — what the supabase-js client returns)
    //   - Fallback text match for either error surface.
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

export function useContentMapHydration(): HydrationResult {
  const isInitialized = useContentMapStore((s) => s.isInitialized);
  const [error, setError] = useState<HydrationError | null>(null);

  useEffect(() => {
    if (useContentMapStore.getState().isInitialized) return;

    let cancelled = false;
    fetchAllContentMap()
      .then((snapshot) => {
        if (cancelled) return;
        useContentMapStore.getState().hydrate(snapshot);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[useContentMapHydration] fetch failed", err);
        setError(normalizeError(err));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { isInitialized, error };
}
