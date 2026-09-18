"use client";

/**
 * /project/launch-status — the tablex.com go-live plan (Monday 2026-09-21),
 * built as a tabbed mini-site so no single view is overwhelming. Content lives
 * in ./data.ts; visuals in ./components.tsx + ./sections.tsx.
 *
 * Rewritten 2026-09-18 from the July functionality report. The old Site Map /
 * Spex 3D / Resources / Xero / Quotes & CRM tabs were retired — that work is
 * shipped and lives in the site itself now.
 */

import { useState } from "react";
import { GO_LIVE } from "./data";
import {
  DnsSection,
  OpenItemsSection,
  OverviewSection,
  RollbackSection,
  RunbookSection,
  TeamSection,
} from "./sections";

const TABS = [
  { key: "overview", label: "Overview", component: OverviewSection },
  { key: "runbook", label: "Cutover Runbook", component: RunbookSection },
  { key: "dns", label: "Cloudflare DNS", component: DnsSection },
  { key: "rollback", label: "Rollback", component: RollbackSection },
  { key: "team", label: "Team & Comms", component: TeamSection },
  { key: "open", label: "Open Items", component: OpenItemsSection },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function LaunchStatusPage() {
  const [active, setActive] = useState<TabKey>("overview");
  const ActiveSection = TABS.find((t) => t.key === active)!.component;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Launch Status</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Go-live plan for tablex.com — the switch, the rollback, who does what, and what is still
          open. Updated {GO_LIVE.updated}.
        </p>
      </div>

      <div className="sticky top-0 z-10 -mx-1 border-b border-gray-200 bg-gray-50/95 px-1 backdrop-blur">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Plan sections">
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
