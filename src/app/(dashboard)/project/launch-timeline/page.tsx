"use client";

import { LaunchTimeline } from "@/components/project/LaunchTimeline";
import { useLaunchTimelineStore } from "@/store/launch-timeline-store";

export default function LaunchTimelinePage() {
  const isInitialized = useLaunchTimelineStore((s) => s.isInitialized);
  const loadError = useLaunchTimelineStore((s) => s.loadError);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Launch Timeline</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Four workstreams on one calendar — website &amp; launch, the Lookbook, spec/price sheets,
          and the About-TableX video. Dates are estimates; drag a bar to reschedule, drag an edge to
          resize, or click it to edit. Edits save for everyone.
        </p>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p className="font-semibold">Couldn&apos;t load the launch timeline.</p>
          <p className="mt-1 text-red-600">{loadError}</p>
          <p className="mt-2 text-xs text-red-500">
            If this is a fresh setup, the <code>launch_milestones</code> table may not be migrated
            yet.
          </p>
        </div>
      ) : !isInitialized ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-brand-green" />
        </div>
      ) : (
        <LaunchTimeline />
      )}
    </div>
  );
}
