"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PROJECT_PHASES,
  WORKSTREAMS,
  DELIVERABLES,
  MILESTONES,
  TOTAL_WEEKS,
  type ProjectPhase,
  type Deliverable,
  type Milestone,
  type WorkstreamMeta,
} from "@/data/project-phase2";
import { Diamond, CheckCircle2, Clock, Circle, ChevronDown, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Status config ──────────────────────────────────────────────────────────

const statusConfig = {
  complete: { icon: CheckCircle2, label: "Complete", className: "text-emerald-600" },
  "in-progress": { icon: Clock, label: "In Progress", className: "text-amber-500" },
  planned: { icon: Circle, label: "Planned", className: "text-gray-400" },
};

// ─── Reusable Gantt Chart ───────────────────────────────────────────────────

// Helper: get Monday date for a given week offset from a start date
function getWeekDate(startDate: Date, weekNum: number): Date {
  const d = new Date(startDate);
  d.setDate(d.getDate() + (weekNum - 1) * 7);
  return d;
}

function formatWeekDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface GanttProps {
  phases: ProjectPhase[];
  deliverables: Deliverable[];
  milestones: Milestone[];
  workstreams: WorkstreamMeta[];
  totalWeeks: number;
  showDetailCards?: boolean;
  startDate?: string | null; // ISO date string e.g. "2026-03-16"
}

function GanttChart({ phases, deliverables, milestones, workstreams, totalWeeks, showDetailCards = true, startDate }: GanttProps) {
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
                        const StatusIcon = statusInfo.icon;

                        const WsIcon = ws?.icon;

                        return (
                          <div key={d.id} className="flex items-center">
                            <div className="w-[calc(11rem-20px)] shrink-0 flex items-center gap-1.5 pr-2 py-1 pl-3">
                              {WsIcon ? (
                                <WsIcon className="h-3.5 w-3.5 shrink-0" style={{ color: ws?.color }} />
                              ) : (
                                <StatusIcon className={cn("h-3 w-3 shrink-0", statusInfo.className)} />
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

// ─── Dynamic Plan ───────────────────────────────────────────────────────────
// Two parallel resources @ ~30h/week:
//   Designer: all design work (wk 1-3)
//   Developer: all build + QA work (wk 2-12)
// Development starts per-workstream as soon as its design is complete.

const DYN_TOTAL = 12;

const DYN_PHASES: ProjectPhase[] = [
  { id: "design",    name: "Design",       startWeek: 1,  durationWeeks: 5, color: "#8b5cf6" },
  { id: "build",     name: "Build",        startWeek: 3,  durationWeeks: 8, color: "#8dc63f" },
  { id: "qa-launch", name: "QA & Launch",  startWeek: 10, durationWeeks: 3, color: "#f59e0b" },
];

// Deliverables with hours-based scheduling and dependency ordering
const DYN_DELIVERABLES: Deliverable[] = [
  // ── Design track (Designer) ────────────────────────────────────────────
  // Wk 1: Xero scoping (6h) + Style Guide & Site Design starts (24h)
  // Wk 2: Style Guide done + CRM UI (16h) + CPQ UI starts (16h)
  // Wk 3: CPQ UI done + Portal UI (10h) + Xero arch (8h)
  // Wk 3-5: Web Feature Design (16h) + 3D Configurator Design (16h) — overlap with dev

  // Complete discovery items (already paid for, shown faded)
  { id: "web-1",    workstream: "website", name: "Information Architecture & Sitemap", description: "Define page hierarchy, URL structure, navigation, and content taxonomy.", requirements: ["Sitemap document", "Navigation wireframes", "URL redirect plan"], phase: "design", startWeek: 1, endWeek: 1, estimatedHours: 16, hourlyRate: 150, status: "complete" },
  { id: "portal-1", workstream: "portal",  name: "Requirements & Workflow Mapping", description: "Document dealer and rep user journeys, role-based permission model, and feature priorities.", requirements: ["Dealer + rep persona profiles", "Feature priority matrix", "Role-based permission model"], phase: "design", startWeek: 1, endWeek: 1, estimatedHours: 12, hourlyRate: 150, status: "complete" },
  { id: "crm-1",   workstream: "crm",     name: "CRM Data Model & Migration Plan", description: "Finalize org/contact schema, rep-dealer hierarchy, and data migration from existing sources.", requirements: ["Schema documentation", "Migration scripts", "Data cleaning plan", "Hierarchy rules"], phase: "design", startWeek: 1, endWeek: 1, estimatedHours: 16, hourlyRate: 150, status: "complete" },
  { id: "cpq-1",   workstream: "cpq",     name: "CPQ Requirements & Pricing Rules", description: "Document pricing tiers, discount rules, approval workflows, and quote templates.", requirements: ["Pricing tier matrix", "Discount rules engine spec", "Approval workflow", "Quote template design"], phase: "design", startWeek: 1, endWeek: 1, estimatedHours: 20, hourlyRate: 150, status: "complete" },

  // Active design work
  { id: "xero-1",  workstream: "xero",    name: "Xero API Scoping & Auth Setup", description: "Evaluate Xero API capabilities, set up OAuth2 connection, and map data entities.", requirements: ["API capability assessment", "OAuth2 implementation", "Entity mapping document"], phase: "design", startWeek: 1, endWeek: 1, estimatedHours: 6, hourlyRate: 150, status: "planned" },
  { id: "web-2a",  workstream: "website", name: "Web Style Guide & Site Design", description: "Design system tokens, typography, color palette, high-fidelity page templates, and mobile breakpoints.", requirements: ["Design system tokens (colors, type, spacing)", "Figma designs for 8+ page templates", "Mobile-first responsive layouts", "Component library"], phase: "design", startWeek: 1, endWeek: 2, estimatedHours: 24, hourlyRate: 150, status: "planned" },
  { id: "crm-2",   workstream: "crm",     name: "CRM UI Design", description: "Design organization profiles, contact management, activity timeline, and pipeline views.", requirements: ["Org detail page", "Contact management", "Activity timeline", "Pipeline/funnel views"], phase: "design", startWeek: 2, endWeek: 2, estimatedHours: 16, hourlyRate: 150, status: "planned" },
  { id: "cpq-2",   workstream: "cpq",     name: "CPQ UI Design", description: "Design quote builder, line item editor, pricing calculator, and PDF output.", requirements: ["Quote builder flow", "Line item configuration", "Price breakdown views", "PDF template design"], phase: "design", startWeek: 2, endWeek: 3, estimatedHours: 16, hourlyRate: 150, status: "planned" },
  { id: "portal-2", workstream: "portal",  name: "Portal UI Design", description: "Design shared portal shell, dealer-specific views, and rep-specific management screens.", requirements: ["Shared dashboard + account wireframes", "Dealer: quote request flow, order tracking", "Rep: dealer roster, territory analytics, commissions"], phase: "design", startWeek: 3, endWeek: 3, estimatedHours: 10, hourlyRate: 150, status: "planned" },
  { id: "xero-2",  workstream: "xero",    name: "Xero Sync Architecture", description: "Design sync strategy — conflict resolution, retry logic, and data transformation layer.", requirements: ["Sync architecture doc", "Conflict resolution rules", "Error handling strategy"], phase: "design", startWeek: 3, endWeek: 3, estimatedHours: 8, hourlyRate: 150, status: "planned" },
  { id: "web-2b",  workstream: "website", name: "Web Feature Design", description: "Detailed designs for interactive features — dealer locator, blog, contact forms, search, and filtering.", requirements: ["Dealer locator UX + map integration", "Blog/news layout", "Contact & quote request forms", "Search & filtering patterns"], phase: "design", startWeek: 3, endWeek: 5, estimatedHours: 16, hourlyRate: 150, status: "planned" },
  { id: "web-2c",  workstream: "website", name: "3D Configurator Design", description: "UX design for the 3D table configurator — material swatches, viewer controls, mobile experience, and quote flow.", requirements: ["Configurator layout & controls", "Material/finish swatch presentation", "Mobile 3D viewer experience", "Configuration-to-quote flow"], phase: "design", startWeek: 3, endWeek: 5, estimatedHours: 16, hourlyRate: 150, status: "planned" },

  // ── Build track (Developer) ────────────────────────────────────────────
  // Sequenced by dependency chain. Dev starts once Style Guide is done.
  // Wk 3-4:  Website frontend (40h) — style guide done, backend can start; features designed in parallel
  // Wk 4-5:  CRM development (32h) — foundation for portal + CPQ orgs
  // Wk 5-7:  CPQ engine (80h) — longest item, needs CRM orgs/pricing
  // Wk 7-8:  CMS integration (16h) — needs website pages built
  // Wk 8-9:  Portal development (30h) — needs CRM + CPQ
  // Wk 9-10: Xero integration (28h) — needs CPQ invoices/orders

  { id: "web-3",    workstream: "website", name: "Frontend Development", description: "Build all pages with Next.js — product catalog, dealer locator, about, contact, blog.", requirements: ["Product listing & detail pages", "Dealer locator with map", "Blog/news section", "SEO optimization"], phase: "build", startWeek: 3, endWeek: 4, estimatedHours: 40, hourlyRate: 185, status: "planned" },
  { id: "crm-3",   workstream: "crm",     name: "CRM Development", description: "Build full CRM — org management, contact database, activity tracking, notes, and search.", requirements: ["Organization CRUD", "Contact management", "Activity/note logging", "Search & filtering", "Rep-dealer hierarchy management"], phase: "build", startWeek: 4, endWeek: 5, estimatedHours: 32, hourlyRate: 185, status: "planned" },
  { id: "cpq-3",   workstream: "cpq",     name: "CPQ Engine Development", description: "Build pricing engine, discount calculations, multi-line quotes, and quote-to-order workflow.", requirements: ["Pricing engine with tier support", "Multi-line quote builder", "Discount calculations (50/20/x)", "Quote → Order → Invoice flow", "PDF generation"], phase: "build", startWeek: 5, endWeek: 8, estimatedHours: 80, hourlyRate: 185, status: "planned" },
  { id: "web-4",   workstream: "website", name: "CMS Integration & Content Migration", description: "Headless CMS setup, content modeling, and migration of existing site content.", requirements: ["CMS content models", "Media library migration", "Editorial workflow"], phase: "build", startWeek: 7, endWeek: 8, estimatedHours: 16, hourlyRate: 185, status: "planned" },
  { id: "portal-3", workstream: "portal",  name: "Portal Development", description: "Build single authenticated portal with role-based routing — shared shell, dealer features, and rep management layers.", requirements: ["Auth + role-based routing", "Shared: dashboard, account management, notifications", "Dealer: configurator embed, quote requests, order/invoice history", "Rep: dealer roster, territory analytics, commission calculations, activity feed"], phase: "build", startWeek: 8, endWeek: 9, estimatedHours: 30, hourlyRate: 185, status: "planned" },
  { id: "xero-3",  workstream: "xero",    name: "Xero Integration Development", description: "Build two-way sync — invoices, payments, contacts, and chart of accounts.", requirements: ["Invoice sync (QuoteX → Xero)", "Payment sync (Xero → QuoteX)", "Contact sync", "Webhook listeners", "Sync status dashboard"], phase: "build", startWeek: 9, endWeek: 10, estimatedHours: 28, hourlyRate: 185, status: "planned" },

  // ── QA track (Developer) ──────────────────────────────────────────────
  // Wk 10-11: Test each workstream in dependency order
  // Wk 12: Buffer / launch prep

  { id: "crm-4",   workstream: "crm",     name: "CRM QA & Data Verification", description: "Validate data integrity, search accuracy, and hierarchy management workflows.", requirements: ["Data integrity checks", "Search accuracy testing", "Hierarchy validation"], phase: "qa-launch", startWeek: 10, endWeek: 10, estimatedHours: 5, hourlyRate: 150, status: "planned" },
  { id: "cpq-4",   workstream: "cpq",     name: "CPQ QA & Pricing Validation", description: "Validate pricing accuracy, discount calculations, and end-to-end quote workflow.", requirements: ["Pricing accuracy tests", "Discount tier validation", "End-to-end workflow test", "PDF output verification"], phase: "qa-launch", startWeek: 10, endWeek: 11, estimatedHours: 7, hourlyRate: 150, status: "planned" },
  { id: "web-5",   workstream: "website", name: "Website QA & Launch", description: "Cross-browser testing, performance optimization, DNS cutover, and launch support.", requirements: ["Lighthouse score 90+", "Cross-browser testing", "301 redirect verification", "Launch checklist"], phase: "qa-launch", startWeek: 10, endWeek: 11, estimatedHours: 8, hourlyRate: 150, status: "planned" },
  { id: "portal-4", workstream: "portal",  name: "Portal QA", description: "End-to-end testing of both roles — permission boundaries, data scoping, and workflow integrity.", requirements: ["Dealer workflow E2E tests", "Rep workflow E2E tests", "Permission boundary testing", "Role-scoped data validation"], phase: "qa-launch", startWeek: 11, endWeek: 11, estimatedHours: 8, hourlyRate: 150, status: "planned" },
  { id: "xero-4",  workstream: "xero",    name: "Xero Integration QA", description: "Test sync accuracy, error recovery, and edge cases with Xero sandbox.", requirements: ["Sandbox testing", "Sync accuracy validation", "Error recovery testing", "Rate limit handling"], phase: "qa-launch", startWeek: 11, endWeek: 12, estimatedHours: 5, hourlyRate: 150, status: "planned" },
];

const DYN_MILESTONES: Milestone[] = [
  { id: "dm-1", name: "Core Design Complete",  week: 3,  phase: "design",    deliverableIds: ["web-2a", "crm-2", "cpq-2", "portal-2", "xero-2"] },
  { id: "dm-2", name: "Website Beta",          week: 4,  phase: "build",     deliverableIds: ["web-3"] },
  { id: "dm-3", name: "CRM Ready",             week: 5,  phase: "build",     deliverableIds: ["crm-3"] },
  { id: "dm-4", name: "Feature Design Done",   week: 5,  phase: "design",    deliverableIds: ["web-2b", "web-2c"] },
  { id: "dm-5", name: "CPQ Engine Ready",      week: 7,  phase: "build",     deliverableIds: ["cpq-3"] },
  { id: "dm-6", name: "CMS Complete",          week: 8,  phase: "build",     deliverableIds: ["web-4"] },
  { id: "dm-7", name: "Portal Beta",           week: 9,  phase: "build",     deliverableIds: ["portal-3"] },
  { id: "dm-8", name: "Integration Complete",  week: 10, phase: "build",     deliverableIds: ["xero-3"] },
  { id: "dm-9", name: "Launch",                week: 12, phase: "qa-launch", deliverableIds: ["web-5", "portal-4", "crm-4", "cpq-4", "xero-4"] },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function TimelinePage() {
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

  // Compute end date for display
  const endDate = useMemo(() => {
    if (!dynStartDate) return null;
    const start = new Date(dynStartDate + "T00:00:00");
    const end = getWeekDate(start, DYN_TOTAL);
    end.setDate(end.getDate() + 4); // Friday of last week
    return end.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }, [dynStartDate]);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Phase 2 — Timeline</h1>
        <p className="mt-1 text-sm text-gray-500">
          {WORKSTREAMS.length} workstreams. Click a phase to see deliverables.
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
              <span className="text-xs text-gray-500">
                → {endDate}
              </span>
            )}
          </div>
        </div>
        <GanttChart
          phases={DYN_PHASES}
          deliverables={DYN_DELIVERABLES}
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
          const phaseDeliverables = DYN_DELIVERABLES.filter((d) => d.phase === phase.id);
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
                  const ws = WORKSTREAMS.find((w) => w.id === d.workstream);
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
