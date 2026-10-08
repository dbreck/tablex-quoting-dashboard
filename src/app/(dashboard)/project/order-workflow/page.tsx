"use client";

/**
 * /project/order-workflow — meeting page for the 2026-10-08 sales-order
 * workflow call. Brian's three 10/07 emails, what tablex.com does today,
 * the after-accept round trip, the build plan, decisions and questions.
 * Same pattern as /project/launch-status: content in ./data.ts, visuals in
 * ./sections.tsx, shared primitives from ../launch-status/components.
 */

import { useState } from "react";
import { MEETING } from "./data";
import {
  AskSection,
  BuildSection,
  ChallengesSection,
  QuestionsSection,
  RoundTripSection,
  TodaySection,
} from "./sections";
import { BrianHomework, MarkHomework, PattyHomework, SamHomework } from "./homework";

const TABS = [
  { key: "ask", label: "Brian's Ask", component: AskSection },
  { key: "today", label: "What Exists Today", component: TodaySection },
  { key: "round", label: "After Accept: the Round Trip", component: RoundTripSection },
  { key: "build", label: "The Build", component: BuildSection },
  { key: "challenges", label: "Challenges & Decisions", component: ChallengesSection },
  { key: "questions", label: "Questions for the Call", component: QuestionsSection },
  { key: "hw-brian", label: "Brian", component: BrianHomework },
  { key: "hw-mark", label: "Mark", component: MarkHomework },
  { key: "hw-sam", label: "Sam", component: SamHomework },
  { key: "hw-patty", label: "Patty", component: PattyHomework },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function OrderWorkflowPage() {
  const [active, setActive] = useState<TabKey>("ask");
  const ActiveSection = TABS.find((t) => t.key === active)!.component;

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
        <nav className="flex gap-1 overflow-x-auto" aria-label="Workflow sections">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              aria-current={active === t.key ? "page" : undefined}
              className={`whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
                active === t.key
                  ? "border-brand-green font-semibold text-gray-900"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
              }`}
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
