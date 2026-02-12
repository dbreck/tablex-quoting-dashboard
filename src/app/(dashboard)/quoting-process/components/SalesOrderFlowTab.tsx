"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { salesOrderSteps } from "@/data/sales-order-steps";
import {
  Mail,
  Printer,
  Database,
  ClipboardList,
  FileText,
  Send,
  UserCheck,
  Warehouse,
  ArrowDown,
  AlertTriangle,
  Info,
} from "lucide-react";

const stepIcons = [
  Mail,
  Printer,
  Database,
  ClipboardList,
  FileText,
  Send,
  UserCheck,
  Warehouse,
];

const severityConfig = {
  high: {
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "error" as const,
  },
  medium: {
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "warning" as const,
  },
  low: {
    text: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
    badge: "secondary" as const,
  },
};

export function SalesOrderFlowTab() {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Intro */}
      <Card className="border-brand-navy/20 bg-brand-navy/5">
        <CardContent className="flex items-start gap-3 pt-6">
          <Info className="h-5 w-5 text-brand-navy shrink-0 mt-0.5" />
          <p className="text-sm text-slate-700">
            What happens after a dealer accepts a quote — the production order
            process from PO receipt to warehouse handoff. This 8-step flow is
            where quote data gets manually re-entered into Sage ERP, creating
            the highest-risk point for pricing errors.
          </p>
        </CardContent>
      </Card>

      {/* 8-Step Sales Order Process */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Order Process Flow</CardTitle>
          <CardDescription>
            8 steps from PO receipt to warehouse handoff — click any step for
            pain point details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {salesOrderSteps.map((step, i) => {
              const Icon = stepIcons[i];
              const isExpanded = expandedStep === step.id;
              const high = step.painPoints.filter(
                (p) => p.severity === "high"
              ).length;
              const medium = step.painPoints.filter(
                (p) => p.severity === "medium"
              ).length;

              return (
                <div key={step.id}>
                  {/* Connection arrow */}
                  {i > 0 && (
                    <div className="flex items-center gap-3 py-1 pl-8">
                      <ArrowDown className="h-4 w-4 text-slate-300" />
                      {i === 2 && (
                        <Badge variant="error" className="text-[9px]">
                          Data re-entry begins
                        </Badge>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() =>
                      setExpandedStep(isExpanded ? null : step.id)
                    }
                    className={`w-full text-left rounded-xl p-4 transition-all cursor-pointer ${
                      isExpanded
                        ? "bg-brand-navy/5 ring-2 ring-brand-navy/30"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Step number + icon */}
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${
                            isExpanded
                              ? "bg-brand-navy text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {step.name}
                          </p>
                          <p className="text-xs text-slate-400">{step.tool}</p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-600 flex-1 hidden md:block">
                        {step.description}
                      </p>

                      {/* Owner + time */}
                      <div className="hidden lg:flex items-center gap-2 shrink-0">
                        <Badge variant="info" className="text-[10px]">
                          {step.owner}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {step.timeEstimate}
                        </span>
                      </div>

                      {/* Severity indicators */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {high > 0 && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                            {high} critical
                          </span>
                        )}
                        {medium > 0 && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                            {medium} medium
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded pain points */}
                  {isExpanded && (
                    <div className="ml-16 mt-2 mb-4 space-y-2 animate-fade-in">
                      {step.painPoints.map((pp, j) => {
                        const cfg = severityConfig[pp.severity];
                        return (
                          <div
                            key={j}
                            className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.border} ${cfg.bg}`}
                          >
                            <AlertTriangle
                              className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.text}`}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-slate-900">
                                  {pp.title}
                                </p>
                                <Badge
                                  variant={cfg.badge}
                                  className="text-[9px]"
                                >
                                  {pp.severity}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">
                                {pp.description}
                              </p>
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
        </CardContent>
      </Card>

      {/* Key Insight Callout */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-start gap-3 pt-6">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900 mb-1">
              Key Insight: Quote-to-Order Data Re-Entry
            </p>
            <p className="text-sm text-amber-800">
              The quote-to-order transition is the largest data re-entry event in
              the entire process. Every piece of quote data must be manually
              re-entered into Sage ERP — a process that takes 15-30 minutes per
              order and is the highest risk point for pricing errors.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
