"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { MondaySyncIndicator } from "@/components/project/MondaySyncIndicator";
import { useTrackerHydration } from "@/hooks/useTrackerHydration";
import { useTrackerRealtime } from "@/hooks/useTrackerRealtime";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const { isInitialized, error } = useTrackerHydration();
  useTrackerRealtime();

  if (!profile?.can_access_proposal) return null;

  return (
    <>
      {/* Fixed to the viewport so it aligns with the comment toggle (which is
          also fixed top-4 right-4 z-50). Sits to its left with a small gap. */}
      <div className="fixed top-5 right-16 z-40">
        <MondaySyncIndicator />
      </div>
      {!isInitialized ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          {error ? (
            <div className="text-center text-sm text-red-400">
              <p className="font-medium">Failed to load tracker data.</p>
              <p className="mt-1 text-xs opacity-70">{error.message}</p>
            </div>
          ) : (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-[#95ff00]" />
          )}
        </div>
      ) : (
        children
      )}
    </>
  );
}
