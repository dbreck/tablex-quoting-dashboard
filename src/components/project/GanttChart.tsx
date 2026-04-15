"use client";

import { useMemo, useState } from "react";
import {
  type ProjectPhase,
  type Deliverable,
  type Milestone,
  type WorkstreamMeta,
} from "@/data/project-phase2";
import { Diamond, CheckCircle2, Clock, Circle, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Status config ──────────────────────────────────────────────────────────

const statusConfig = {
  complete: { icon: CheckCircle2, label: "Complete", className: "text-emerald-600" },
  "in-progress": { icon: Clock, label: "In Progress", className: "text-amber-500" },
  planned: { icon: Circle, label: "Planned", className: "text-gray-400" },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getWeekDate(startDate: Date, weekNum: number): Date {
  const d = new Date(startDate);
  d.setDate(d.getDate() + (weekNum - 1) * 7);
  return d;
}

function formatWeekDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Component ──────────────────────────────────────────────────────────────

export interface GanttChartProps {
  phases: ProjectPhase[];
  deliverables: Deliverable[];
  milestones: Milestone[];
  workstreams: WorkstreamMeta[];
  totalWeeks: number;
  showDetailCards?: boolean;
  startDate?: string | null;
}

export function GanttChart({ phases, deliverables, milestones, workstreams, totalWeeks, showDetailCards = true, startDate }: GanttChartProps) {
  const weeks = useMemo(() => Array.from({ length: totalWeeks }, (_, i) => i + 1), [totalWeeks]);
  const parsedStart = useMemo(() => startDate ? new Date(startDate + "T00:00:00") : null, [startDate]);
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});

  const togglePhase = (phaseId: string) =>
    setExpandedPhases((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));

  const getPhaseDeliverables = (phaseId: string) =>
    deliverables.filter((d) => d.phase === phaseId);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Week Headers */}
          <div className="flex items-end mb-3">
            <div className="w-44 shrink-0 text-xs font-medium text-gray-500 pr-3">Week</div>
            <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${totalWeeks}, 1fr)` }}>
              {weeks.map((w) => {
                const weekDate = parsedStart ? getWeekDate(parsedStart, w) : null;
                return (
                  <div key={w} className="text-center">
                    <div className="text-xs font-medium text-gray-400">{w}</div>
                    {weekDate && (
                      <div className="text-[9px] text-gray-400 leading-tight mt-0.5">
                        {formatWeekDate(weekDate)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phase Bars + Expanded Deliverables */}
          <div className="mb-6">
            {phases.map((phase) => {
              const isExpanded = expandedPhases[phase.id] ?? false;
              const phaseDeliverables = getPhaseDeliverables(phase.id);

              return (
                <div key={phase.id}>
                  <button
                    onClick={() => togglePhase(phase.id)}
                    className="w-full flex items-center hover:bg-gray-50/50 rounded transition-colors cursor-pointer"
                  >
                    <div className="w-44 shrink-0 flex items-center gap-1.5 pr-3 py-1">
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      )}
                      <span className="text-sm font-medium text-gray-700">{phase.name}</span>
                      <span className="text-[10px] text-gray-400 ml-auto mr-1">
                        {phaseDeliverables.length}
                      </span>
                    </div>
                    <div
                      className="flex-1 grid relative"
                      style={{ gridTemplateColumns: `repeat(${totalWeeks}, 1fr)` }}
                    >
                      {weeks.map((w) => (
                        <div key={w} className="border-l border-gray-100 h-8" />
                      ))}
                      <div
                        className="absolute top-0.5 h-7 rounded-md flex items-center text-white text-[11px] font-semibold shadow-sm overflow-hidden"
                        style={{
                          backgroundColor: phase.color,
                          left: `${((phase.startWeek - 1) / totalWeeks) * 100}%`,
                          width: `${(phase.durationWeeks / totalWeeks) * 100}%`,
                        }}
                      >
                        <span className="px-2 truncate flex-1 text-center">
                          {phase.name} (wk {phase.startWeek}–{phase.startWeek + phase.durationWeeks - 1})
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3 mr-1.5 shrink-0 opacity-70" />
                        ) : (
                          <ChevronRight className="h-3 w-3 mr-1.5 shrink-0 opacity-70" />
                        )}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="bg-gray-50/40 border-l-2 ml-5 rounded-r" style={{ borderColor: phase.color }}>
                      {phaseDeliverables.map((d) => {
                        const ws = workstreams.find((w) => w.id === d.workstream);
                        const span = d.endWeek - d.startWeek + 1;
                        const statusInfo = statusConfig[d.status];
                        const WsIcon = ws?.icon;

                        return (
                          <div key={d.id} className="flex items-center">
                            <div className="w-[calc(11rem-20px)] shrink-0 flex items-center gap-1.5 pr-2 py-1 pl-3">
                              {WsIcon ? (
                                <WsIcon className="h-3.5 w-3.5 shrink-0" style={{ color: ws?.color }} />
                              ) : (
                                <statusInfo.icon className={cn("h-3 w-3 shrink-0", statusInfo.className)} />
                              )}
                              <span className="text-xs font-medium truncate" style={{ color: ws?.color ?? "#4b5563" }} title={d.name}>
                                {d.name}
                              </span>
                            </div>
                            <div
                              className="flex-1 grid relative"
                              style={{ gridTemplateColumns: `repeat(${totalWeeks}, 1fr)` }}
                            >
                              {weeks.map((w) => (
                                <div key={w} className="border-l border-gray-100/60 h-7" />
                              ))}
                              <div
                                className={cn(
                                  "absolute top-1 h-5 rounded flex items-center px-2",
                                  d.status === "complete" ? "opacity-40" : "opacity-85"
                                )}
                                style={{
                                  backgroundColor: ws?.color ?? "#6b7280",
                                  left: `${((d.startWeek - 1) / totalWeeks) * 100}%`,
                                  width: `${(span / totalWeeks) * 100}%`,
                                }}
                              >
                                <span className="text-[10px] text-white font-medium truncate">
                                  {ws?.name} — wk {d.startWeek}–{d.endWeek}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 my-4" />

          {/* Milestones */}
          <div className="flex items-start">
            <div className="w-44 shrink-0 text-sm font-medium text-gray-700 pr-3 pt-1">Milestones</div>
            <div
              className="flex-1 grid relative"
              style={{
                gridTemplateColumns: `repeat(${totalWeeks}, 1fr)`,
                minHeight: "60px",
              }}
            >
              {weeks.map((w) => (
                <div key={w} className="border-l border-gray-100" style={{ minHeight: "60px" }} />
              ))}
              {milestones.map((ms, i) => {
                const phase = phases.find((p) => p.id === ms.phase);
                const color = phase?.color ?? "#6b7280";
                const topOffset = i % 2 === 0 ? 0 : 24;
                return (
                  <div
                    key={ms.id}
                    className="absolute flex flex-col items-center"
                    style={{
                      left: `${((ms.week - 0.5) / totalWeeks) * 100}%`,
                      top: `${topOffset}px`,
                      transform: "translateX(-50%)",
                    }}
                    title={`Week ${ms.week}: ${ms.name}`}
                  >
                    <Diamond className="h-3.5 w-3.5 shrink-0" style={{ color, fill: color }} />
                    <span className="text-[10px] font-medium whitespace-nowrap mt-0.5" style={{ color }}>
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
      {showDetailCards && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {phases.map((phase) => {
            const phaseDeliverables = getPhaseDeliverables(phase.id);
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
                <ul className="space-y-2">
                  {phaseDeliverables.map((d) => {
                    const statusInfo = statusConfig[d.status];
                    const StatusIcon = statusInfo.icon;
                    const ws = workstreams.find((w) => w.id === d.workstream);
                    return (
                      <li key={d.id} className="flex items-start gap-2 text-sm">
                        <StatusIcon className={cn("h-4 w-4 mt-0.5 shrink-0", statusInfo.className)} />
                        <div className="min-w-0">
                          <span className="font-medium text-gray-800">{d.name}</span>
                          {ws && (
                            <span
                              className="ml-2 inline-block text-xs px-1.5 py-0.5 rounded-full font-medium"
                              style={{ backgroundColor: `${ws.color}15`, color: ws.color }}
                            >
                              {ws.name}
                            </span>
                          )}
                          <span className="ml-2 text-xs text-gray-400">
                            {d.estimatedHours}h
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
