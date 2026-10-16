"use client";

/**
 * /project/order-workflow — meeting page for the 2026-10-08 sales-order
 * workflow call. Brian's three 10/07 emails, what tablex.com does today,
 * the after-accept round trip, the build plan, decisions and questions.
 * Same pattern as /project/launch-status: content in ./data.ts, visuals in
 * ./sections.tsx, shared primitives from ../launch-status/components.
 */

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MEETING } from "./data";
import {
  AskSection,
  BuildSection,
  ChallengesSection,
  AnswersSection,
  RoundTripSection,
  TodaySection,
} from "./sections";
import { AskedAnswered } from "./archive";
import { BrianHomework, MarkHomework, PattyHomework, SamHomework } from "./homework";
import { TimelineSection } from "./timeline";

/** The planning record: picked from the "Plan" dropdown. */
const PLAN_TABS = [
  { key: "ask", label: "Brian's Ask", component: AskSection },
  { key: "today", label: "What Exists Today", component: TodaySection },
  { key: "round", label: "After Accept: the Round Trip", component: RoundTripSection },
  { key: "build", label: "The Build", component: BuildSection },
  { key: "challenges", label: "Challenges & Decisions", component: ChallengesSection },
  { key: "answers", label: "Answers & Rulings", component: AnswersSection },
  { key: "archive", label: "Asked & Answered", component: AskedAnswered },
] as const;

/** Always visible as their own tabs. */
const TOP_TABS = [
  { key: "timeline", label: "Timeline", component: TimelineSection },
  { key: "hw-brian", label: "Brian", component: BrianHomework },
  { key: "hw-mark", label: "Mark", component: MarkHomework },
  { key: "hw-sam", label: "Sam", component: SamHomework },
  { key: "hw-patty", label: "Patty", component: PattyHomework },
] as const;

const TABS = [...PLAN_TABS, ...TOP_TABS];
type TabKey = (typeof TABS)[number]["key"];
type PlanKey = (typeof PLAN_TABS)[number]["key"];

const isPlanKey = (k: TabKey): k is PlanKey => PLAN_TABS.some((t) => t.key === k);

const tabCls = (on: boolean) =>
  `whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
    on ? "border-brand-green font-semibold text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
  }`;

const isTabKey = (k: string | null): k is TabKey => TABS.some((t) => t.key === k);

/** `?tab=hw-mark` opens a tab directly (the links in the homework emails). */
export default function OrderWorkflowPage() {
  return (
    <Suspense fallback={null}>
      <OrderWorkflowInner />
    </Suspense>
  );
}

function OrderWorkflowInner() {
  const params = useSearchParams();
  const fromUrl = params.get("tab");
  const [active, setActiveState] = useState<TabKey>(isTabKey(fromUrl) ? fromUrl : "ask");
  const [lastPlan, setLastPlan] = useState<PlanKey>(isTabKey(fromUrl) && isPlanKey(fromUrl) ? fromUrl : "ask");
  const setActive = (k: TabKey) => {
    setActiveState(k);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", k);
      window.history.replaceState(window.history.state, "", url);
    }
  };
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const ActiveSection = TABS.find((t) => t.key === active)!.component;
  const planActive = isPlanKey(active);
  const planLabel = PLAN_TABS.find((t) => t.key === (planActive ? active : lastPlan))!.label;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pickPlan = (k: PlanKey) => {
    setLastPlan(k);
    setActive(k);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{MEETING.title}</h1>
        <p className="mt-1 max-w-3xl text-sm text-gray-500">
          From quote to paid invoice: what Brian asked for, what tablex.com does today, and what we
          would build. {MEETING.attendees}. Updated {MEETING.updated}.
        </p>
      </div>

      <div className="sticky top-0 z-10 -mx-1 border-b border-gray-200 bg-gray-50/95 px-1 backdrop-blur">
        <nav className="flex flex-wrap gap-1" aria-label="Workflow sections">
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => (planActive ? setOpen((o) => !o) : setOpen(true))}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-current={planActive ? "page" : undefined}
              className={`${tabCls(planActive)} inline-flex items-center gap-1.5`}
            >
              <span className="text-gray-400">Plan ·</span> {planLabel}
              <svg aria-hidden viewBox="0 0 20 20" className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>
            {open && (
              <div role="menu" className="absolute left-0 top-full z-20 mt-1 w-72 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                {PLAN_TABS.map((t, i) => (
                  <button
                    key={t.key}
                    type="button"
                    role="menuitem"
                    onClick={() => pickPlan(t.key)}
                    className={`flex w-full items-center gap-3 px-3.5 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                      active === t.key ? "font-semibold text-gray-900" : "text-gray-700"
                    }`}
                  >
                    <span className="w-4 text-xs tabular-nums text-gray-400">{i + 1}</span>
                    {t.label}
                    {active === t.key && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-green" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          {TOP_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setOpen(false);
                setActive(t.key);
              }}
              aria-current={active === t.key ? "page" : undefined}
              className={tabCls(active === t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <ActiveSection />
    </div>
  );
}
