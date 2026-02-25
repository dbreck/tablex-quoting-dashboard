"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  CheckCircle2,
  XCircle,
  Target,
  Clock,
  Timer,
  TrendingUp,
  AlertTriangle,
  Info,
  Lightbulb,
} from "lucide-react";

const recommendations = [
  {
    title: "Unified Data Model",
    pain: "5 disconnected spreadsheets",
    fix: "Single database \u2014 enter data once, flows everywhere",
    impact: "Eliminates 12,338 manual re-entries/year",
  },
  {
    title: "Auto Price Lookup",
    pain: "Manual search through 9K rows",
    fix: "SKU-based instant pricing with tier auto-calculation",
    impact: "Price lookup: minutes \u2192 milliseconds",
  },
  {
    title: "Quote PDF Generation",
    pain: "Manual template filling + PDF export",
    fix: "One-click PDF generation from quote data",
    impact: "Eliminates template re-entry step entirely",
  },
  {
    title: "Quote \u2192 Order Flow",
    pain: "Complete re-entry of all quote data",
    fix: "Convert quote to order with one click",
    impact: "Eliminates the highest-severity bottleneck",
  },
  {
    title: "Revision Tracking",
    pain: "13.3% revision rate = manual rework",
    fix: "Version history with diff view, instant re-quote",
    impact: "Saves 475+ revision cycles per year",
  },
  {
    title: "Dealer Portal",
    pain: "Email-based requests in varying formats",
    fix: "Standardized web form with required fields",
    impact: "Eliminates intake formatting issues",
  },
];

const corrections = [
  {
    title: "SKU-based, not rules-only",
    description:
      "Brian\u2019s Feb 6 statement corrected Feb 10: the system IS SKU-driven with rules layered on top",
    badge: "Corrected",
  },
  {
    title: "8 steps, not 5",
    description:
      "Samantha\u2019s walkthrough revealed 3 additional steps not previously documented",
    badge: "New Finding",
  },
  {
    title: "Sage ERP is a critical touchpoint",
    description:
      "Not previously identified as part of the quoting ecosystem",
    badge: "New Finding",
  },
  {
    title: "6+ touchpoints, not 5 spreadsheets",
    description:
      "The process spans more systems than originally mapped",
    badge: "Corrected",
  },
];

const kpis = [
  {
    label: "Time-to-Quote (TTQ)",
    current: "~4h",
    target: "<24h (SLA target)",
    stretch: "<1h (QuoteX goal)",
    icon: Clock,
  },
  {
    label: "PO → Work Order",
    current: "Manual (untracked)",
    target: "<24h (SLA target)",
    icon: Zap,
  },
  {
    label: "Quote-to-Order Conversion",
    current: "Untracked",
    target: "Real-time dashboard",
    icon: TrendingUp,
  },
  {
    label: "Pricing Accuracy",
    current: "Error-prone (manual)",
    target: "99.9% (automated)",
    icon: CheckCircle2,
  },
  {
    label: "Full Cycle Time",
    current: "Days (email dependent)",
    target: "Hours (self-service)",
    icon: Timer,
  },
];

export function WhatNeedsToChangeTab() {
  return (
    <div className="space-y-8">
      {/* Section 1: TO-BE Recommendation Cards */}
      <Card className="border-brand-green/30 bg-brand-green/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-brand-green" />
            TO-BE: Recommended Improvements
          </CardTitle>
          <CardDescription>
            How QuoteX eliminates each bottleneck identified in the current
            process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
              <div
                key={rec.title}
                className="p-4 rounded-xl bg-white border border-brand-green/20"
              >
                <p className="font-semibold text-slate-900 text-sm">
                  {rec.title}
                </p>
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-start gap-1.5">
                    <XCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-500">{rec.pain}</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-green mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-700">{rec.fix}</p>
                  </div>
                </div>
                <Badge variant="success" className="mt-2 text-[10px]">
                  {rec.impact}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Key Corrections */}
      <Card className="border-amber-300/50 bg-amber-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-amber-600" />
            What the Interviews Revealed
          </CardTitle>
          <CardDescription>
            Key corrections and new findings from stakeholder interviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {corrections.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 p-3 rounded-lg bg-white border border-amber-200/60"
              >
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-slate-900">
                      {item.title}
                    </p>
                    <Badge
                      variant={
                        item.badge === "Corrected" ? "warning" : "info"
                      }
                      className="text-[10px]"
                    >
                      {item.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Proposed KPIs */}
      <Card className="border-brand-navy/20 bg-brand-navy/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-brand-navy" />
            Proposed KPIs for QuoteX
          </CardTitle>
          <CardDescription>
            Measurable targets to track the impact of process improvements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={kpi.label}
                  className="p-4 rounded-xl bg-white border border-brand-navy/15"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-4 w-4 text-brand-navy" />
                    <p className="font-semibold text-sm text-slate-900">
                      {kpi.label}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 w-14">
                        Current
                      </span>
                      <Badge variant="error" className="text-[10px]">
                        {kpi.current}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 w-14">
                        Target
                      </span>
                      <Badge variant="success" className="text-[10px]">
                        {kpi.target}
                      </Badge>
                    </div>
                    {"stretch" in kpi && kpi.stretch && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 w-14">
                          Stretch
                        </span>
                        <Badge variant="info" className="text-[10px]">
                          {kpi.stretch}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
