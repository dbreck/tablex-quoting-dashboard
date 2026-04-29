"use client";

// Loads sign-offs + revisions + notes from Supabase into the store. Idempotent.

import { useEffect, useState } from "react";
import { useSignOffsStore } from "@/store/sign-offs-store";
import {
  fetchAllSignOffs,
  fetchAllSignOffRevisions,
  fetchAllSignOffNotes,
} from "@/lib/supabase/sign-offs-client";

interface HydrationResult {
  isInitialized: boolean;
  error: Error | null;
}

export function useSignOffsHydration(): HydrationResult {
  const isInitialized = useSignOffsStore((s) => s.isInitialized);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (useSignOffsStore.getState().isInitialized) return;

    let cancelled = false;
    Promise.all([
      fetchAllSignOffs(),
      fetchAllSignOffRevisions(),
      fetchAllSignOffNotes(),
    ])
      .then(([signOffs, revisions, notes]) => {
        if (cancelled) return;
        useSignOffsStore.getState().hydrate({ signOffs, revisions, notes });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[useSignOffsHydration] fetch failed", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { isInitialized, error };
}
