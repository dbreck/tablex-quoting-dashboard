"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { quoteProcessSteps } from "@/data/quote-process-steps";
import {
  BarChart3,
  Package,
  Clock,
  Unlink,
  AlertTriangle,
  Users,
  Mail,
  Hash,
  Globe,
  BookOpen,
  Calculator,
  FileText,
  FileOutput,
  Send,
  ArrowDown,
  Lightbulb,
} from "lucide-react";

const stepIcons = [Mail, Hash, Globe, BookOpen, Calculator, FileText, FileOutput, Send];

const stepColors = [
  "bg-blue-500",
  "bg-slate-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-brand-green",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-rose-500",
];

const ownerColors: Record<string, string> = {
  Mark: "bg-blue-100 text-blue-700",
  "Sam/Patty": "bg-purple-100 text-purple-700",
};

const severityConfig = {
  high: { border: "border-red-300", bg: "bg-red-50", text: "text-red-500", badge: "error" as const },
  medium: { border: "border-amber-300", bg: "bg-amber-50", text: "text-amber-500", badge: "warning" as const },
  low: { border: "border-slate-200", bg: "bg-slate-50", text: "text-slate-400", badge: "secondary" as const },
};

const people = [
  {
    name: "Mark",
    role: "VP of Operations",
    description: "Manages quote queue, assigns work, final review before sending to warehouse.",
    badge: "Queue Manager",
    badgeVariant: "info" as const,
    initials: "M",
    color: "bg-blue-500",
  },
  {
    name: "Samantha (SS)",
    role: "Quote Specialist",
    description: "Processes ~64% of all quotes. Handles standard quoting workflow day-to-day.",
    badge: "Primary Quoter",
    badgeVariant: "default" as const,
    initials: "SS",
    color: "bg-brand-green",
  },
  {
    name: "Patty Wleman",
    role: "Quote Specialist",
    description: "Handles specialty and custom quotes alongside Sam.",
    badge: "Specialty Quotes",
    badgeVariant: "warning" as const,
    initials: "PW",
    color: "bg-purple-500",
  },
  {
    name: "Brian Craig",
    role: "GM (6 weeks in as of Feb 2026)",
    description: "Strategic direction, new leadership. Corrected earlier architectural assumption.",
    badge: "Leadership",
    badgeVariant: "secondary" as const,
    initials: "BC",
    color: "bg-slate-600",
  },
];

export function HowItWorksTodayTab() {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  return (
    <div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card hover className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Total Quotes</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">3,637</p>
                <p className="text-xs text-slate-400 mt-1">Feb 2023 -- Present</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-green/10">
                <BarChart3 className="h-6 w-6 text-brand-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Product SKUs</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">~9,068</p>
                <p className="text-xs text-slate-400 mt-1">In Quote Table catalog</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Avg Turnaround</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">~4h</p>
                <p className="text-xs text-slate-400 mt-1">Request to quote sent</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Disconnected Touchpoints</p>
                <p className="text-3xl font-bold text-red-600 mt-1">6+</p>
                <p className="text-xs text-slate-400 mt-1">No automated links</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-100">
                <Unlink className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Finding Callout */}
      <Card className="mb-8 border-brand-navy/20 bg-brand-navy/5">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-navy/10 shrink-0">
            <AlertTriangle className="h-5 w-5 text-brand-navy" />
          </div>
          <div>
            <p className="font-semibold text-brand-navy">Key Finding</p>
            <p className="text-sm text-slate-600 mt-1">
              None of the 6+ touchpoints (Quote Queue, Quote Table, Quote Template, NET Template,
              Sales Order, Sage ERP, email, PDF exports) are linked to each other. Every quote
              requires manual data entry across multiple disconnected systems, creating significant
              inefficiency and error risk.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key People */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-600" />
            <CardTitle>Key People</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {people.map((person) => (
              <div
                key={person.name}
                className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${person.color} text-white text-sm font-bold shrink-0`}
                >
                  {person.initials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{person.name}</p>
                  <p className="text-xs text-slate-500">{person.role}</p>
                  <p className="text-xs text-slate-600 mt-1">{person.description}</p>
                  <Badge variant={person.badgeVariant} className="mt-2 text-[10px]">
                    {person.badge}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 8-Step Quote Process Swimlane */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>8-Step Quote Process</CardTitle>
          <CardDescription>
            Current quoting workflow from request intake to delivery -- click any step for pain point details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {quoteProcessSteps.map((step, i) => {
              const Icon = stepIcons[i];
              const isExpanded = expandedStep === step.id;
              const painCount = step.painPoints.length;
              const high = step.painPoints.filter((p) => p.severity === "high").length;
              const medium = step.painPoints.filter((p) => p.severity === "medium").length;

              return (
                <div key={step.id}>
                  {/* Connection arrow with Manual badge */}
                  {i > 0 && (
                    <div className="flex items-center gap-3 py-1 pl-8">
                      <ArrowDown className="h-4 w-4 text-slate-300" />
                      <Badge variant="error" className="text-[9px]">Manual</Badge>
                    </div>
                  )}

                  <button
                    onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                    className={`w-full text-left rounded-xl p-4 transition-all cursor-pointer ${
                      isExpanded
                        ? "bg-brand-green/5 ring-2 ring-brand-green/30"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Step number + icon */}
                      <div className="flex items-center gap-3 min-w-[240px]">
                        <div
                          className={`relative flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
                            isExpanded ? "bg-brand-green text-white" : `${stepColors[i]} text-white`
                          }`}
                        >
                          <span className="text-xs font-bold absolute -top-1 -left-1 w-5 h-5 rounded-full bg-white text-slate-700 flex items-center justify-center shadow-sm border border-slate-200">
                            {i + 1}
                          </span>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{step.name}</p>
                          <p className="text-xs text-slate-400">{step.tool}</p>
                        </div>
                      </div>

                      {/* Owner badge */}
                      <Badge
                        className={`text-[10px] shrink-0 ${ownerColors[step.owner] || "bg-slate-100 text-slate-700"}`}
                      >
                        {step.owner}
                      </Badge>

                      {/* Time estimate */}
                      <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0 hidden sm:flex">
                        <Clock className="h-3 w-3" />
                        {step.timeEstimate}
                      </div>

                      {/* Spacer */}
                      <div className="flex-1" />

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

                      {/* Pain point count circle */}
                      {painCount > 0 && (
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-[10px] font-bold shrink-0">
                          {painCount}
                        </div>
                      )}
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
                            <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.text}`} />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-slate-900">{pp.title}</p>
                                <Badge variant={cfg.badge} className="text-[9px]">
                                  {pp.severity}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">{pp.description}</p>
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

      {/* Insight Callouts */}
      <div className="space-y-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-5 flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700">
              Staff skip the website configurator -- they go straight to product books and price lists
              because the configurator doesn&apos;t show dealer pricing.
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-5 flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700">
              90%+ of website visitors are dealers, not end consumers -- the site functions primarily
              as a dealer tool.
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-5 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700">
              Tribal knowledge is a key pricing input -- not all rules are documented. When staff
              leave, institutional knowledge leaves with them.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
