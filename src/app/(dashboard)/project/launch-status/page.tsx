"use client";

/**
 * /project/launch-status — Brian-facing functionality report, built as a
 * tabbed mini-site so no single view is overwhelming. Content lives in
 * ./data.ts; visuals in ./components.tsx + ./sections.tsx.
 *
 * Scope: website FUNCTIONALITY only — no design workstream, no testing items.
 */

import { useState } from "react";
import {
  NeedsSection,
  OverviewSection,
  QuotesCrmSection,
  ResourcesSection,
  SiteMapSection,
  SpexSection,
  XeroSection,
} from "./sections";

const TABS = [
  { key: "overview", label: "Overview", component: OverviewSection },
  { key: "site-map", label: "Site Map", component: SiteMapSection },
  { key: "spex-3d", label: "Spex 3D Assets", component: SpexSection },
  { key: "resources", label: "Resources", component: ResourcesSection },
  { key: "xero", label: "Xero", component: XeroSection },
  { key: "quotes-crm", label: "Quotes & CRM", component: QuotesCrmSection },
  { key: "needs", label: "What We Need", component: NeedsSection },
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
          Website functionality report — what&rsquo;s built, what&rsquo;s left before go-live, and
          what we need from TableX. Updated July 16, 2026.
        </p>
      </div>

      <div className="sticky top-0 z-10 -mx-1 border-b border-gray-200 bg-gray-50/95 px-1 backdrop-blur">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Report sections">
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
