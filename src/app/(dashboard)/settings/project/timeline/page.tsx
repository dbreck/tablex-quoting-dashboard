"use client";

import { useMemo } from "react";
import {
  PROJECT_PHASES,
  WORKSTREAMS,
  DELIVERABLES,
  MILESTONES,
  TOTAL_WEEKS,
  getDeliverablesByPhase,
} from "@/data/project-phase2";
import { Diamond, CheckCircle2, Clock, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

// Derive which weeks each workstream spans based on its deliverables' phases
function getWorkstreamWeekRange(workstreamId: string) {
  const deliverables = DELIVERABLES.filter((d) => d.workstream === workstreamId);
  const phases = [...new Set(deliverables.map((d) => d.phase))];
  const matchedPhases = PROJECT_PHASES.filter((p) => phases.includes(p.id));
  if (matchedPhases.length === 0) return { start: 1, end: 1 };
  const start = Math.min(...matchedPhases.map((p) => p.startWeek));
  const end = Math.max(...matchedPhases.map((p) => p.startWeek + p.durationWeeks - 1));
  return { start, end };
}

const statusConfig = {
  complete: { icon: CheckCircle2, label: "Complete", className: "text-emerald-600" },
  "in-progress": { icon: Clock, label: "In Progress", className: "text-amber-500" },
  planned: { icon: Circle, label: "Planned", className: "text-gray-400" },
};

export default function TimelinePage() {
  const weeks = useMemo(() => Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1), []);

  const workstreamRanges = useMemo(
    () =>
      WORKSTREAMS.map((ws) => ({
        ...ws,
        ...getWorkstreamWeekRange(ws.id),
      })),
    []
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Phase 2 — Timeline</h1>
        <p className="mt-1 text-sm text-gray-500">
          {TOTAL_WEEKS}-week project plan across {WORKSTREAMS.length} workstreams
        </p>
      </div>

      {/* Gantt Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Week Headers */}
          <div className="flex items-end mb-3">
            <div className="w-40 shrink-0 text-xs font-medium text-gray-500 pr-3">Week</div>
            <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${TOTAL_WEEKS}, 1fr)` }}>
              {weeks.map((w) => (
                <div
                  key={w}
                  className="text-center text-xs font-medium text-gray-400"
                >
                  {w}
                </div>
              ))}
            </div>
          </div>

          {/* Phase Bars */}
          <div className="space-y-1.5 mb-6">
            {PROJECT_PHASES.map((phase) => (
              <div key={phase.id} className="flex items-center">
                <div className="w-40 shrink-0 text-sm font-medium text-gray-700 pr-3 truncate">
                  {phase.name}
                </div>
                <div
                  className="flex-1 grid relative"
                  style={{ gridTemplateColumns: `repeat(${TOTAL_WEEKS}, 1fr)` }}
                >
                  {/* Background grid lines */}
                  {weeks.map((w) => (
                    <div key={w} className="border-l border-gray-100 h-8" />
                  ))}
                  {/* Phase bar overlay */}
                  <div
                    className="absolute top-0.5 h-7 rounded-md flex items-center justify-center text-white text-xs font-semibold shadow-sm"
                    style={{
                      backgroundColor: phase.color,
                      gridColumnStart: phase.startWeek,
                      gridColumnEnd: phase.startWeek + phase.durationWeeks,
                      left: `${((phase.startWeek - 1) / TOTAL_WEEKS) * 100}%`,
                      width: `${(phase.durationWeeks / TOTAL_WEEKS) * 100}%`,
                    }}
                  >
                    {phase.name}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4" />

          {/* Workstream Bars */}
          <div className="space-y-1.5 mb-6">
            {workstreamRanges.map((ws) => {
              const Icon = ws.icon;
              const span = ws.end - ws.start + 1;
              return (
                <div key={ws.id} className="flex items-center">
                  <div className="w-40 shrink-0 flex items-center gap-2 pr-3">
                    <Icon className="h-4 w-4 shrink-0" style={{ color: ws.color }} />
                    <span className="text-sm font-medium text-gray-700 truncate">{ws.name}</span>
                  </div>
                  <div
                    className="flex-1 grid relative"
                    style={{ gridTemplateColumns: `repeat(${TOTAL_WEEKS}, 1fr)` }}
                  >
                    {weeks.map((w) => (
                      <div key={w} className="border-l border-gray-100 h-8" />
                    ))}
                    <div
                      className="absolute top-1 h-6 rounded-full opacity-80"
                      style={{
                        backgroundColor: ws.color,
                        left: `${((ws.start - 1) / TOTAL_WEEKS) * 100}%`,
                        width: `${(span / TOTAL_WEEKS) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4" />

          {/* Milestones */}
          <div className="flex items-center">
            <div className="w-40 shrink-0 text-sm font-medium text-gray-700 pr-3">Milestones</div>
            <div
              className="flex-1 grid relative h-10"
              style={{ gridTemplateColumns: `repeat(${TOTAL_WEEKS}, 1fr)` }}
            >
              {weeks.map((w) => (
                <div key={w} className="border-l border-gray-100 h-10" />
              ))}
              {MILESTONES.map((ms) => {
                const phase = PROJECT_PHASES.find((p) => p.id === ms.phase);
                const color = phase?.color ?? "#6b7280";
                return (
                  <div
                    key={ms.id}
                    className="absolute top-0 flex flex-col items-center"
                    style={{
                      left: `${((ms.week - 0.5) / TOTAL_WEEKS) * 100}%`,
                    }}
                    title={`Week ${ms.week}: ${ms.name}`}
                  >
                    <Diamond
                      className="h-4 w-4 -ml-2 shrink-0"
                      style={{ color, fill: color }}
                    />
                    <span
                      className="text-[10px] font-medium whitespace-nowrap -ml-2 mt-0.5"
                      style={{ color }}
                    >
                      {ms.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Phase Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROJECT_PHASES.map((phase) => {
          const deliverables = getDeliverablesByPhase(phase.id);
          const totalHours = deliverables.reduce((sum, d) => sum + d.estimatedHours, 0);
          const completedCount = deliverables.filter((d) => d.status === "complete").length;

          return (
            <div
              key={phase.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: phase.color }}
                />
                <h3 className="text-base font-semibold text-gray-900">{phase.name}</h3>
                <span className="ml-auto text-xs text-gray-500">
                  Weeks {phase.startWeek}–{phase.startWeek + phase.durationWeeks - 1}
                </span>
              </div>
              <div className="flex gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Deliverables: </span>
                  <span className="font-medium text-gray-900">{deliverables.length}</span>
                </div>
                <div>
                  <span className="text-gray-500">Hours: </span>
                  <span className="font-medium text-gray-900">{totalHours}</span>
                </div>
                <div>
                  <span className="text-gray-500">Complete: </span>
                  <span className="font-medium text-gray-900">
                    {completedCount}/{deliverables.length}
                  </span>
                </div>
              </div>
              <ul className="space-y-2">
                {deliverables.map((d) => {
                  const statusInfo = statusConfig[d.status];
                  const StatusIcon = statusInfo.icon;
                  const ws = WORKSTREAMS.find((w) => w.id === d.workstream);
                  return (
                    <li key={d.id} className="flex items-start gap-2 text-sm">
                      <StatusIcon
                        className={cn("h-4 w-4 mt-0.5 shrink-0", statusInfo.className)}
                      />
                      <div className="min-w-0">
                        <span className="font-medium text-gray-800">{d.name}</span>
                        {ws && (
                          <span
                            className="ml-2 inline-block text-xs px-1.5 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: `${ws.color}15`,
                              color: ws.color,
                            }}
                          >
                            {ws.name}
                          </span>
                        )}
                        <span className="ml-2 text-xs text-gray-400">{d.estimatedHours}h</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
