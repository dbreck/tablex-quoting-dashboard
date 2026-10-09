"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import { shortDate, type FinancialsData } from "./_lib/aggregate";
import { Banner } from "./_lib/charts";
import OverviewView from "./views/OverviewView";
import CustomersView from "./views/CustomersView";
import ProductMixView from "./views/ProductMixView";
import QuotePipelineView from "./views/QuotePipelineView";
import WebsiteImpactView from "./views/WebsiteImpactView";
import DataHealthView from "./views/DataHealthView";

const views = [
  { id: "overview", label: "Overview" },
  { id: "customers", label: "Customers" },
  { id: "mix", label: "Product Mix" },
  { id: "pipeline", label: "Quote Pipeline" },
  { id: "impact", label: "Website Impact" },
  { id: "health", label: "Data Health" },
] as const;

type ViewId = (typeof views)[number]["id"];

export default function FinancialsClient({ data }: { data: FinancialsData }) {
  const [activeView, setActiveView] = useState<ViewId>("overview");

  return (
    <div>
      <Header
        title="TableX Financials"
        subtitle={`Sales and timelines from Xero (invoice detail Aug 2020 – Mar 2026, P&L after) and the tablex.com snapshot · as of ${shortDate(data.asOf)}`}
      />

      {data.errors.length > 0 && activeView !== "health" && (
        <div className="mb-4">
          <Banner tone="rose">
            {data.errors.length} dataset{data.errors.length === 1 ? "" : "s"} failed to load. See Data Health for details.
          </Banner>
        </div>
      )}

      <div className="mb-6 flex items-center gap-2">
        <div className="flex flex-wrap rounded-lg bg-gray-100 p-0.5">
          {views.map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => setActiveView(view.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                activeView === view.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700",
              )}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {activeView === "overview" ? (
        <OverviewView data={data} />
      ) : activeView === "customers" ? (
        <CustomersView data={data} />
      ) : activeView === "mix" ? (
        <ProductMixView data={data} />
      ) : activeView === "pipeline" ? (
        <QuotePipelineView data={data} />
      ) : activeView === "impact" ? (
        <WebsiteImpactView data={data} />
      ) : (
        <DataHealthView data={data} />
      )}
    </div>
  );
}
