"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import CostMatrixView from "./CostMatrixView";
import HarvestEstimateView from "./HarvestEstimateView";
import OrderWorkflowEstimateView from "./OrderWorkflowEstimateView";
import AiEstimateView from "./AiEstimateView";

const views = [
  { id: "ai", label: "AI-Assisted Estimate" },
  { id: "cost-matrix", label: "Cost Matrix" },
  { id: "harvest", label: "Harvest Estimate" },
  { id: "order-workflow", label: "Order Workflow Estimate" },
] as const;

type ViewId = typeof views[number]["id"];

export default function AdminEstimatePage() {
  const [activeView, setActiveView] = useState<ViewId>("ai");

  return (
    <div>
      {/* View switcher */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex rounded-lg bg-gray-100 p-0.5">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                activeView === view.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {activeView === "ai" ? (
        <AiEstimateView />
      ) : activeView === "cost-matrix" ? (
        <CostMatrixView />
      ) : activeView === "harvest" ? (
        <HarvestEstimateView />
      ) : (
        <OrderWorkflowEstimateView />
      )}
    </div>
  );
}
