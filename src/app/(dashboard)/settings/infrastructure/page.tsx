"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import FinalStackView from "./views/FinalStackView";
import ResearchNotesView from "./views/ResearchNotesView";

// ── View definitions ─────────────────────────────────────────────────

type ViewId = "final" | "research-notes";

const views: { id: ViewId; label: string; description: string; isNew?: boolean }[] = [
  {
    id: "final",
    label: "Final Stack",
    description: "Decided April 2026 — what we're building on",
    isNew: true,
  },
  {
    id: "research-notes",
    label: "Research Notes (v1)",
    description: "Original exploration, alternatives, and JSI teardown",
  },
];

export default function InfrastructurePage() {
  const [currentView, setCurrentView] = useState<ViewId>("final");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeView = views.find((v) => v.id === currentView)!;

  return (
    <div>
      {/* Header with view selector */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Infrastructure &amp; Costs</h1>
          <p className="mt-1 text-sm text-slate-500">
            Platform services, hosting, and recurring costs for Phase 2 operations.
          </p>
        </div>
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="text-slate-400 text-xs mr-1.5">View:</span>
            {activeView.label}
            <ChevronDown className="h-3 w-3 ml-1.5" />
          </Button>
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl border border-slate-200 shadow-xl py-1 min-w-[280px]">
                {views.map((view) => (
                  <button
                    key={view.id}
                    onClick={() => {
                      setCurrentView(view.id);
                      setDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2.5 transition-colors flex items-start gap-3",
                      view.id === currentView
                        ? "bg-brand-green/5"
                        : "hover:bg-slate-50",
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center",
                        view.id === currentView
                          ? "border-brand-green bg-brand-green"
                          : "border-slate-300",
                      )}
                    >
                      {view.id === currentView && (
                        <Check className="h-2.5 w-2.5 text-white" />
                      )}
                    </div>
                    <div>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          view.id === currentView
                            ? "text-brand-green"
                            : "text-slate-700",
                        )}
                      >
                        {view.label}
                        {view.isNew && (
                          <Badge className="ml-2 bg-emerald-100 text-emerald-700 text-[9px]">
                            NEW
                          </Badge>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {view.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* View content */}
      {currentView === "final" && <FinalStackView />}
      {currentView === "research-notes" && <ResearchNotesView />}
    </div>
  );
}
