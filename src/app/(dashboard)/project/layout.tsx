"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { MondaySyncIndicator } from "@/components/project/MondaySyncIndicator";
import { useTrackerHydration } from "@/hooks/useTrackerHydration";
import { useTrackerRealtime } from "@/hooks/useTrackerRealtime";
import { useSprintHydration } from "@/hooks/useSprintHydration";
import { useSprintRealtime } from "@/hooks/useSprintRealtime";
import { useRisksDecisionsHydration } from "@/hooks/useRisksDecisionsHydration";
import { useRisksDecisionsRealtime } from "@/hooks/useRisksDecisionsRealtime";
import { useSignOffsHydration } from "@/hooks/useSignOffsHydration";
import { useSignOffsRealtime } from "@/hooks/useSignOffsRealtime";
import { useAssetsHydration } from "@/hooks/useAssetsHydration";
import { useAssetsRealtime } from "@/hooks/useAssetsRealtime";
import { useLaunchTimelineHydration } from "@/hooks/useLaunchTimelineHydration";
import { useLaunchTimelineRealtime } from "@/hooks/useLaunchTimelineRealtime";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const { isInitialized, error } = useTrackerHydration();
  useTrackerRealtime();
  useSprintHydration();
  useSprintRealtime();
  useRisksDecisionsHydration();
  useRisksDecisionsRealtime();
  useSignOffsHydration();
  useSignOffsRealtime();
  useAssetsHydration();
  useAssetsRealtime();
  useLaunchTimelineHydration();
  useLaunchTimelineRealtime();

  if (!profile?.can_access_proposal) return null;

  return (
    <>
      {/* Centered at top of viewport — comment toggle is hidden globally so
          we no longer need to dodge it on the right edge. */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-40">
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
