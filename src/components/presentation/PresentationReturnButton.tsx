"use client";

import { useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// sessionStorage is an external store; same-tab writes don't fire "storage"
// events, so there is nothing to subscribe to — the snapshot is re-read on
// every render (navigation re-renders via usePathname, matching the previous
// effect-on-pathname behavior).
const emptySubscribe = () => () => {};

function readHasSession() {
  try {
    return sessionStorage.getItem("present-slide") !== null;
  } catch {
    return false; // privacy mode
  }
}

export function PresentationReturnButton() {
  const router = useRouter();
  const pathname = usePathname();
  // Server snapshot is false (hidden), matching the old initial state.
  const hasSession = useSyncExternalStore(
    emptySubscribe,
    readHasSession,
    () => false
  );
  // Only show on non-presentation pages when a presentation session is active
  const visible = hasSession && pathname !== "/present";

  if (!visible) return null;

  return (
    <button
      onClick={() => router.push("/present")}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-brand-navy px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-brand-navy-dark hover:shadow-xl"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Slides
    </button>
  );
}
