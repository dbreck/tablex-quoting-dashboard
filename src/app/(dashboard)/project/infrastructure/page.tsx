"use client";

import SetupTrackerView from "./views/SetupTrackerView";

export default function ProjectInfrastructurePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Infra Setup</h1>
        <p className="mt-1 text-sm text-gray-500">
          Service signup progress, checklists, and handoff tracking.
        </p>
      </div>
      <SetupTrackerView />
    </div>
  );
}
