"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PROJECT_PHASES,
  WORKSTREAMS,
  DELIVERABLES,
  MILESTONES,
  TOTAL_WEEKS,
  type Deliverable,
} from "@/data/project-phase2";
import { computeDeliverableStatus } from "@/data/project-tracker";
import { useProjectTrackerStore } from "@/store/project-tracker-store";
import { GanttChart, getWeekDate } from "@/components/project/GanttChart";
import { CalendarDays, ChevronDown, ChevronRight } from "lucide-react";

// ─── Dynamic Plan (12-week compressed) ─────────────────────────────────────

const DYN_TOTAL = 12;

const DYN_PHASES = [
  { id: "design", name: "Design", startWeek: 1, durationWeeks: 5, color: "#8b5cf6" },
  { id: "build", name: "Build", startWeek: 3, durationWeeks: 8, color: "#8dc63f" },
  { id: "qa-launch", name: "QA & Launch", startWeek: 10, durationWeeks: 3, color: "#f59e0b" },
];

const DYN_DELIVERABLES_BASE: Deliverable[] = [
  // Design track
  { id: "web-1", workstream: "website", name: "Information Architecture & Sitemap", description: "", requirements: [], phase: "design", startWeek: 1, endWeek: 1, estimatedHours: 16, hourlyRate: 150, status: "complete" },
  { id: "portal-1", workstream: "portal", name: "Requirements & Workflow Mapping", description: "", requirements: [], phase: "design", startWeek: 1, endWeek: 1, estimatedHours: 12, hourlyRate: 150, status: "complete" },
  { id: "crm-1", workstream: "crm", name: "CRM Data Model & Migration Plan", description: "", requirements: [], phase: "design", startWeek: 1, endWeek: 1, estimatedHours: 16, hourlyRate: 150, status: "complete" },
  { id: "cpq-1", workstream: "cpq", name: "CPQ Requirements & Pricing Rules", description: "", requirements: [], phase: "design", startWeek: 1, endWeek: 1, estimatedHours: 20, hourlyRate: 150, status: "complete" },
  { id: "xero-1", workstream: "xero", name: "Xero API Scoping & Auth Setup", description: "", requirements: [], phase: "design", startWeek: 1, endWeek: 1, estimatedHours: 6, hourlyRate: 150, status: "planned" },
  { id: "web-2a", workstream: "website", name: "Web Style Guide & Site Design", description: "", requirements: [], phase: "design", startWeek: 1, endWeek: 2, estimatedHours: 24, hourlyRate: 150, status: "planned" },
  { id: "crm-2", workstream: "crm", name: "CRM UI Design", description: "", requirements: [], phase: "design", startWeek: 2, endWeek: 2, estimatedHours: 16, hourlyRate: 150, status: "planned" },
  { id: "cpq-2", workstream: "cpq", name: "CPQ UI Design", description: "", requirements: [], phase: "design", startWeek: 2, endWeek: 3, estimatedHours: 16, hourlyRate: 150, status: "planned" },
  { id: "portal-2", workstream: "portal", name: "Portal UI Design", description: "", requirements: [], phase: "design", startWeek: 3, endWeek: 3, estimatedHours: 10, hourlyRate: 150, status: "planned" },
  { id: "xero-2", workstream: "xero", name: "Xero Sync Architecture", description: "", requirements: [], phase: "design", startWeek: 3, endWeek: 3, estimatedHours: 8, hourlyRate: 150, status: "planned" },
  { id: "web-2b", workstream: "website", name: "Web Feature Design", description: "", requirements: [], phase: "design", startWeek: 3, endWeek: 5, estimatedHours: 16, hourlyRate: 150, status: "planned" },
  { id: "web-2c", workstream: "website", name: "3D Configurator Design", description: "", requirements: [], phase: "design", startWeek: 3, endWeek: 5, estimatedHours: 16, hourlyRate: 150, status: "planned" },
  // Build track
  { id: "web-3", workstream: "website", name: "Frontend Development", description: "", requirements: [], phase: "build", startWeek: 3, endWeek: 4, estimatedHours: 40, hourlyRate: 185, status: "planned" },
  { id: "crm-3", workstream: "crm", name: "CRM Development", description: "", requirements: [], phase: "build", startWeek: 4, endWeek: 5, estimatedHours: 32, hourlyRate: 185, status: "planned" },
  { id: "cpq-3", workstream: "cpq", name: "CPQ Engine Development", description: "", requirements: [], phase: "build", startWeek: 5, endWeek: 8, estimatedHours: 80, hourlyRate: 185, status: "planned" },
  { id: "web-4", workstream: "website", name: "CMS Integration & Content Migration", description: "", requirements: [], phase: "build", startWeek: 7, endWeek: 8, estimatedHours: 16, hourlyRate: 185, status: "planned" },
  { id: "portal-3", workstream: "portal", name: "Portal Development", description: "", requirements: [], phase: "build", startWeek: 8, endWeek: 9, estimatedHours: 30, hourlyRate: 185, status: "planned" },
  { id: "xero-3", workstream: "xero", name: "Xero Integration Development", description: "", requirements: [], phase: "build", startWeek: 9, endWeek: 10, estimatedHours: 28, hourlyRate: 185, status: "planned" },
  // QA track
  { id: "crm-4", workstream: "crm", name: "CRM QA & Data Verification", description: "", requirements: [], phase: "qa-launch", startWeek: 10, endWeek: 10, estimatedHours: 5, hourlyRate: 150, status: "planned" },
  { id: "cpq-4", workstream: "cpq", name: "CPQ QA & Pricing Validation", description: "", requirements: [], phase: "qa-launch", startWeek: 10, endWeek: 11, estimatedHours: 7, hourlyRate: 150, status: "planned" },
  { id: "web-5", workstream: "website", name: "Website QA & Launch", description: "", requirements: [], phase: "qa-launch", startWeek: 10, endWeek: 11, estimatedHours: 8, hourlyRate: 150, status: "planned" },
  { id: "portal-4", workstream: "portal", name: "Portal QA", description: "", requirements: [], phase: "qa-launch", startWeek: 11, endWeek: 11, estimatedHours: 8, hourlyRate: 150, status: "planned" },
  { id: "xero-4", workstream: "xero", name: "Xero Integration QA", description: "", requirements: [], phase: "qa-launch", startWeek: 11, endWeek: 12, estimatedHours: 5, hourlyRate: 150, status: "planned" },
];

const DYN_MILESTONES = [
  { id: "dm-1", name: "Core Design Complete", week: 3, phase: "design", deliverableIds: ["web-2a", "crm-2", "cpq-2", "portal-2", "xero-2"] },
  { id: "dm-2", name: "Website Beta", week: 4, phase: "build", deliverableIds: ["web-3"] },
  { id: "dm-3", name: "CRM Ready", week: 5, phase: "build", deliverableIds: ["crm-3"] },
  { id: "dm-4", name: "Feature Design Done", week: 5, phase: "design", deliverableIds: ["web-2b", "web-2c"] },
  { id: "dm-5", name: "CPQ Engine Ready", week: 7, phase: "build", deliverableIds: ["cpq-3"] },
  { id: "dm-6", name: "CMS Complete", week: 8, phase: "build", deliverableIds: ["web-4"] },
  { id: "dm-7", name: "Portal Beta", week: 9, phase: "build", deliverableIds: ["portal-3"] },
  { id: "dm-8", name: "Integration Complete", week: 10, phase: "build", deliverableIds: ["xero-3"] },
  { id: "dm-9", name: "Launch", week: 12, phase: "qa-launch", deliverableIds: ["web-5", "portal-4", "crm-4", "cpq-4", "xero-4"] },
];

export default function TimelinePage() {
  const tasks = useProjectTrackerStore((s) => s.tasks);

  const [dynStartDate, setDynStartDate] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dynPlanStartDate") || "";
    }
    return "";
  });

  useEffect(() => {
    if (dynStartDate) {
      localStorage.setItem("dynPlanStartDate", dynStartDate);
    } else {
      localStorage.removeItem("dynPlanStartDate");
    }
  }, [dynStartDate]);

  const [showOriginal, setShowOriginal] = useState(false);

  // Compute end date
  const endDate = useMemo(() => {
    if (!dynStartDate) return null;
    const start = new Date(dynStartDate + "T00:00:00");
    const end = getWeekDate(start, DYN_TOTAL);
    end.setDate(end.getDate() + 4);
    return end.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }, [dynStartDate]);

  // Apply computed status from tasks to deliverables
  const dynDeliverables = useMemo(() => {
    return DYN_DELIVERABLES_BASE.map((d) => ({
      ...d,
      status: computeDeliverableStatus(d.id, tasks),
    }));
  }, [tasks]);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Timeline</h1>
        <p className="mt-1 text-sm text-gray-500">
          {WORKSTREAMS.length} workstreams. Click a phase to see deliverables. Status reflects task progress.
        </p>
      </div>

      {/* Dynamic Plan */}
      <div>
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="flex items-baseline gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Dynamic Plan</h2>
            <span className="text-xs text-gray-400">
              12 weeks · Designer + Developer in parallel · ~30 hrs/week each
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            <label htmlFor="start-date" className="text-xs font-medium text-gray-500">
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              value={dynStartDate}
              onChange={(e) => setDynStartDate(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green"
            />
            {endDate && (
              <span className="text-xs text-gray-500">→ {endDate}</span>
            )}
          </div>
        </div>
        <GanttChart
          phases={DYN_PHASES}
          deliverables={dynDeliverables}
          milestones={DYN_MILESTONES}
          workstreams={WORKSTREAMS}
          totalWeeks={DYN_TOTAL}
          showDetailCards={false}
          startDate={dynStartDate || null}
        />
      </div>

      {/* Phase Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DYN_PHASES.map((phase) => {
          const phaseDeliverables = dynDeliverables.filter((d) => d.phase === phase.id);
          const totalHours = phaseDeliverables.reduce((sum, d) => sum + d.estimatedHours, 0);
          const completedCount = phaseDeliverables.filter((d) => d.status === "complete").length;

          return (
            <div key={phase.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: phase.color }} />
                <h3 className="text-base font-semibold text-gray-900">{phase.name}</h3>
              </div>
              <div className="flex gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Deliverables: </span>
                  <span className="font-medium text-gray-900">{phaseDeliverables.length}</span>
                </div>
                <div>
                  <span className="text-gray-500">Hours: </span>
                  <span className="font-medium text-gray-900">{totalHours}</span>
                </div>
                <div>
                  <span className="text-gray-500">Complete: </span>
                  <span className="font-medium text-gray-900">{completedCount}/{phaseDeliverables.length}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 20 Week Plan (collapsible) */}
      <div className="border-t border-gray-200 pt-6">
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="flex items-center gap-2 mb-4 hover:bg-gray-50 rounded-lg px-2 py-1 -ml-2 transition-colors cursor-pointer"
        >
          {showOriginal ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
          <h2 className="text-lg font-semibold text-gray-900">20 Week Plan</h2>
          <span className="text-xs text-gray-400">Original scope timeline</span>
        </button>
        {showOriginal && (
          <GanttChart
            phases={PROJECT_PHASES}
            deliverables={DELIVERABLES}
            milestones={MILESTONES}
            workstreams={WORKSTREAMS}
            totalWeeks={TOTAL_WEEKS}
            showDetailCards={false}
          />
        )}
      </div>
    </div>
  );
}
