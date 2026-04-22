"use client";

// Background poller for Monday sync. Mounted once in the project layout.
// Reconciles on mount, then every POLL_INTERVAL_MS while the tab is visible.
// Pauses while the tab is hidden, syncs again on focus.

import { useEffect, useRef } from "react";
import { useMondaySync } from "@/hooks/useMondaySync";

const POLL_INTERVAL_MS = 60_000;

export function MondaySyncPoller() {
  const { syncNow } = useMondaySync();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSyncRef = useRef(0);

  useEffect(() => {
    const tick = () => {
      // Cheap belt-and-suspenders: avoid double-firing if visibility flips
      // rapidly while a sync is in flight (the hook also guards this).
      const now = Date.now();
      if (now - lastSyncRef.current < 5_000) return;
      lastSyncRef.current = now;
      syncNow();
    };

    const start = () => {
      if (intervalRef.current) return;
      tick();
      intervalRef.current = setInterval(tick, POLL_INTERVAL_MS);
    };

    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [syncNow]);

  return null;
}
