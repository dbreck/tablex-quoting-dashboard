"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { workflowSteps } from "@/data/workflow-steps";
import metrics from "@/data/quote-queue-metrics.json";
import queueData from "@/data/quote-queue.json";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  AlertTriangle,
  Clock,
  RefreshCw,
  Users,
  TrendingDown,
  Zap,
  FileText,
  Calculator,
  FileOutput,
  Send,
  ShoppingCart,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Target,
  Timer,
  Repeat,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

type QueueRow = (typeof queueData)[number];

const stepIcons = [FileText, Calculator, FileOutput, Send, ShoppingCart];

// Colors
const BRAND_GREEN = "#8dc63f";
const BRAND_NAVY = "#1a3c5c";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const BLUE = "#3b82f6";
const EMERALD = "#10b981";

// Severity config for pain points
const severityConfig = {
  high: { color: "bg-red-500", text: "text-red-700", bg: "bg-red-50", border: "border-red-200", badge: "error" as const },
  medium: { color: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", badge: "warning" as const },
  low: { color: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", badge: "secondary" as const },
};

export default function WorkflowPage() {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  // All pain points flattened with step context
  const allPainPoints = useMemo(() => {
    return workflowSteps.flatMap((step) =>
      step.painPoints.map((pp) => ({ ...pp, stepName: step.name, stepId: step.id }))
    );
  }, []);

  const highCount = allPainPoints.filter((p) => p.severity === "high").length;
  const mediumCount = allPainPoints.filter((p) => p.severity === "medium").length;
  const lowCount = allPainPoints.filter((p) => p.severity === "low").length;

  // Turnaround by year (exclude 2026 incomplete)
  const turnaroundByYear = metrics.turnaroundTimes.byYear
    .filter((y) => y.year <= 2025)
    .map((y) => ({
      year: y.year.toString(),
      median: Math.round(y.medianHours * 10) / 10,
      average: Math.round(y.averageHours * 10) / 10,
      count: y.count,
    }));

  // Staff workload radar data
  const staffRadar = metrics.staffDistribution.slice(0, 4).map((s) => ({
    staff: s.staff,
    total: s.total,
    specialPct: s.specialPercent,
    standard: s.standard,
    special: s.special,
  }));

  // Quarterly seasonality
  const quarterlyData = metrics.peakAnalysis.quarterly.map((q) => ({
    quarter: q.quarter,
    count: q.count,
    percent: q.percent,
  }));

  // Day of week data
  const dayData = metrics.peakAnalysis.dayOfWeek.filter((d) => d.count > 50);

  // Monthly heatmap values
  const monthlyData = metrics.peakAnalysis.month;

  // Data re-entry flow
  const reEntryData = metrics.dataReEntryAnalysis;

  // Bottleneck severity by step
  const stepSeverityData = workflowSteps.map((step, i) => {
    const high = step.painPoints.filter((p) => p.severity === "high").length;
    const medium = step.painPoints.filter((p) => p.severity === "medium").length;
    const low = step.painPoints.filter((p) => p.severity === "low").length;
    return {
      step: step.name.replace("Quote ", "").replace("Price ", ""),
      high,
      medium,
      low,
      total: step.painPoints.length,
    };
  });

  // Revision rate data for pie
  const revisionPie = [
    { name: "First attempt", value: metrics.revisions.totalQuotesWithNumbers - metrics.revisions.quotesWithRevisions },
    { name: "Revised", value: metrics.revisions.quotesWithRevisions },
  ];

  return (
    <div>
      <Header
        title="Workflow Analysis"
        subtitle="Deep-dive into quoting process bottlenecks, inefficiencies, and improvement opportunities"
      />

      {/* Impact Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">{highCount}</p>
                <p className="text-xs text-slate-400">{mediumCount} medium, {lowCount} low</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100">
                <Repeat className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Manual Re-Entries</p>
                <p className="text-2xl font-bold text-slate-900">{formatNumber(reEntryData.totalManualDataEntryEvents)}</p>
                <p className="text-xs text-slate-400">{reEntryData.averagePerQuote.toFixed(1)}x per quote</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                <Timer className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Wasted Hours</p>
                <p className="text-2xl font-bold text-slate-900">{reEntryData.estimatedTimeSpent.totalHours}</p>
                <p className="text-xs text-slate-400">{reEntryData.estimatedTimeSpent.workWeeks} work weeks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
                <RefreshCw className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Revision Rate</p>
                <p className="text-2xl font-bold text-slate-900">{metrics.revisions.revisionRate}%</p>
                <p className="text-xs text-slate-400">{metrics.revisions.quotesWithRevisions} of {formatNumber(metrics.revisions.totalQuotesWithNumbers)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AS-IS Process Flow — Expanded Swimlane */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>AS-IS Process Flow</CardTitle>
          <CardDescription>
            Current quoting workflow across 5 disconnected spreadsheets — click any step for details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {workflowSteps.map((step, i) => {
              const Icon = stepIcons[i];
              const isExpanded = expandedStep === step.id;
              const high = step.painPoints.filter((p) => p.severity === "high").length;
              const medium = step.painPoints.filter((p) => p.severity === "medium").length;

              return (
                <div key={step.id}>
                  {/* Connection arrow */}
                  {i > 0 && (
                    <div className="flex items-center gap-3 py-1 pl-8">
                      <ArrowDown className="h-4 w-4 text-slate-300" />
                      <Badge variant="error" className="text-[9px]">Manual re-entry</Badge>
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
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${
                          isExpanded ? "bg-brand-green text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{step.name}</p>
                          <p className="text-xs text-slate-400">{step.tool}</p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-600 flex-1 hidden md:block">{step.description}</p>

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
                          <div key={j} className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.border} ${cfg.bg}`}>
                            <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.text}`} />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-slate-900">{pp.title}</p>
                                <Badge variant={cfg.badge} className="text-[9px]">{pp.severity}</Badge>
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

      <Tabs defaultValue="bottlenecks">
        <TabsList className="mb-6">
          <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
          <TabsTrigger value="turnaround">Turnaround</TabsTrigger>
          <TabsTrigger value="reentry">Data Re-Entry</TabsTrigger>
          <TabsTrigger value="seasonality">Seasonality</TabsTrigger>
        </TabsList>

        {/* Bottlenecks Tab */}
        <TabsContent value="bottlenecks">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Severity by Step */}
            <Card>
              <CardHeader>
                <CardTitle>Bottleneck Severity by Step</CardTitle>
                <CardDescription>Pain points categorized by process step and severity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stepSeverityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="step" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                    <Legend />
                    <Bar dataKey="high" name="Critical" stackId="a" fill={RED} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="medium" name="Medium" stackId="a" fill={AMBER} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="low" name="Low" stackId="a" fill="#94a3b8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Staff Specialization Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Staff Specialization Profile</CardTitle>
                <CardDescription>Quote volume and special quote percentage by staff member</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={staffRadar}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="staff" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis tick={{ fontSize: 10 }} />
                    <Radar name="Total Quotes" dataKey="total" stroke={BRAND_GREEN} fill={BRAND_GREEN} fillOpacity={0.2} />
                    <Radar name="Special Quotes" dataKey="special" stroke={BRAND_NAVY} fill={BRAND_NAVY} fillOpacity={0.2} />
                    <Legend />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                  </RadarChart>
                </ResponsiveContainer>

                {/* Key insight */}
                <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-800">
                    <strong>Insight:</strong> MAF handles 46% special quotes vs SS at 10%. MAF is the specialist — a key-person dependency risk.
                    SS processes 64% of all volume, creating a single point of failure.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Revision Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Quote Revision Rate</CardTitle>
                <CardDescription>13.3% of quotes require at least one revision — each revision is another manual re-entry cycle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-8">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie
                        data={revisionPie}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        <Cell fill={BRAND_GREEN} />
                        <Cell fill={RED} />
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-brand-green" />
                      <span className="text-sm text-slate-700">{formatNumber(revisionPie[0].value)} first-attempt</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-slate-700">{formatNumber(revisionPie[1].value)} required revision</span>
                    </div>
                    <div className="mt-2 p-2 rounded bg-red-50 border border-red-200">
                      <p className="text-xs text-red-700">
                        Each revision = ~9 min additional work (3 min x 3 spreadsheets)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Year-over-Year */}
            <Card>
              <CardHeader>
                <CardTitle>Volume Trend</CardTitle>
                <CardDescription>Quote volume declining 7.8% CAGR despite stable market</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={metrics.yearOverYearGrowth.filter((y) => y.year <= 2025)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                    <Bar dataKey="quotes" name="Quotes" radius={[4, 4, 0, 0]}>
                      {metrics.yearOverYearGrowth.filter((y) => y.year <= 2025).map((_, i) => (
                        <Cell key={i} fill={i === 0 ? BRAND_GREEN : i === 1 ? BRAND_GREEN + "cc" : BRAND_GREEN + "88"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <TrendingDown className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800">
                    <strong>Concern:</strong> Volume dropped from 1,250 to 1,062 quotes (-15% over 2 years).
                    Manual process friction may be causing dealers to seek faster competitors.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Turnaround Tab */}
        <TabsContent value="turnaround">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Turnaround by year */}
            <Card>
              <CardHeader>
                <CardTitle>Median Turnaround by Year</CardTitle>
                <CardDescription>Hours from quote request to completion (median removes outliers)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={turnaroundByYear}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" />
                    <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                    <Legend />
                    <Bar dataKey="median" name="Median (hrs)" fill={BRAND_GREEN} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <Zap className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-emerald-800">
                    <strong>Positive trend:</strong> Median turnaround improved from 45h (2023) to 23h (2025) —
                    staff is getting faster despite the manual process. Automation could push this under 1 hour.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Special vs Standard */}
            <Card>
              <CardHeader>
                <CardTitle>Special vs Standard Turnaround</CardTitle>
                <CardDescription>Surprising finding: special quotes are processed faster</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { label: "Standard Quotes", data: metrics.turnaroundTimes.standard, color: BRAND_GREEN },
                    { label: "Special Quotes", data: metrics.turnaroundTimes.special, color: BRAND_NAVY },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900">{item.label}</p>
                        <Badge variant="secondary">{formatNumber(item.data.count)} quotes</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-slate-50">
                          <p className="text-xs text-slate-500">Median</p>
                          <p className="text-lg font-bold" style={{ color: item.color }}>
                            {item.data.medianHours.toFixed(1)}h
                          </p>
                          <p className="text-xs text-slate-400">{item.data.medianDays.toFixed(1)} days</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50">
                          <p className="text-xs text-slate-500">Average</p>
                          <p className="text-lg font-bold" style={{ color: item.color }}>
                            {item.data.averageHours.toFixed(1)}h
                          </p>
                          <p className="text-xs text-slate-400">{item.data.averageDays.toFixed(1)} days</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-800">
                    <strong>Insight:</strong> Special quotes (median 22.7h) are processed faster than standard (25.2h).
                    This likely reflects that specials get immediate attention while standard quotes queue up.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Day of Week Distribution */}
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Quote Request Distribution by Day</CardTitle>
                <CardDescription>Mid-week peak (Wed) with sharp Friday dropoff — plan staffing accordingly</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dayData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                      formatter={(value) => [formatNumber(Number(value)), "Quotes"]}
                    />
                    <Bar dataKey="count" name="Quotes" radius={[4, 4, 0, 0]}>
                      {dayData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.day === "Wednesday" ? BRAND_GREEN : BRAND_GREEN + "88"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Re-Entry Tab */}
        <TabsContent value="reentry">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Re-entry Flow Visualization */}
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>The Data Re-Entry Problem</CardTitle>
                <CardDescription>Every quote requires the same data to be manually entered into multiple disconnected spreadsheets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {[
                    { label: "Quote Queue", desc: "Log the request", icon: FileText, entries: "3,595", color: BRAND_GREEN },
                    { label: "Quote Table", desc: "Look up pricing", icon: Calculator, entries: "3,595", color: BLUE },
                    { label: "Quote Template", desc: "Build the quote", icon: FileOutput, entries: "3,595", color: AMBER },
                    { label: "Revisions", desc: "Re-do template", icon: RefreshCw, entries: "475", color: RED },
                    { label: "Sales Order", desc: "If quote wins", icon: ShoppingCart, entries: "~1,078", color: BRAND_NAVY },
                  ].map((item, i) => (
                    <div key={i} className="relative">
                      <div className="p-4 rounded-xl border border-slate-200 bg-white text-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg mx-auto mb-2" style={{ backgroundColor: item.color + "15" }}>
                          <item.icon className="h-5 w-5" style={{ color: item.color }} />
                        </div>
                        <p className="text-sm font-medium text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                        <p className="text-lg font-bold mt-2" style={{ color: item.color }}>{item.entries}</p>
                        <p className="text-[10px] text-slate-400">entries</p>
                      </div>
                      {i < 4 && (
                        <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                          <ArrowRight className="h-4 w-4 text-slate-300" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center">
                    <p className="text-3xl font-bold text-red-600">{formatNumber(reEntryData.totalManualDataEntryEvents)}</p>
                    <p className="text-sm text-red-700 mt-1">Total manual entries</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                    <p className="text-3xl font-bold text-amber-600">{reEntryData.estimatedTimeSpent.totalHours}h</p>
                    <p className="text-sm text-amber-700 mt-1">Staff hours wasted</p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
                    <p className="text-3xl font-bold text-blue-600">{reEntryData.estimatedTimeSpent.workWeeks}</p>
                    <p className="text-sm text-blue-700 mt-1">Full work weeks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost of Inefficiency */}
            <Card>
              <CardHeader>
                <CardTitle>Cost of Inefficiency</CardTitle>
                <CardDescription>Estimated annual cost of manual data re-entry</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { rate: "$25/hr", cost: "$15,400", label: "Junior admin" },
                    { rate: "$40/hr", cost: "$24,700", label: "Mid-level staff" },
                    { rate: "$55/hr", cost: "$33,900", label: "Senior staff" },
                  ].map((tier) => (
                    <div key={tier.rate} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <div>
                        <p className="text-sm font-medium text-slate-900">At {tier.rate}</p>
                        <p className="text-xs text-slate-500">{tier.label}</p>
                      </div>
                      <p className="text-lg font-bold text-brand-navy">{tier.cost}/yr</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Based on {reEntryData.estimatedTimeSpent.totalHours} hours of manual re-entry work across {formatNumber(reEntryData.totalQuotes)} quotes
                </p>
              </CardContent>
            </Card>

            {/* Error Risk */}
            <Card>
              <CardHeader>
                <CardTitle>Error Risk Assessment</CardTitle>
                <CardDescription>Manual data entry error rates compound across touchpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-900">Industry avg error rate</p>
                      <Badge variant="warning">1-3% per entry</Badge>
                    </div>
                    <p className="text-xs text-slate-500">Human data entry averages 1-3% error rate per field</p>
                  </div>

                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm font-medium text-red-700 mb-1">With {reEntryData.averagePerQuote.toFixed(1)}x re-entry per quote:</p>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <p className="text-xs text-slate-500">At 1% error rate</p>
                        <p className="text-lg font-bold text-red-600">~123 errors</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">At 3% error rate</p>
                        <p className="text-lg font-bold text-red-600">~370 errors</p>
                      </div>
                    </div>
                    <p className="text-xs text-red-600 mt-2">Per year across {formatNumber(reEntryData.totalManualDataEntryEvents)} manual entries</p>
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <Target className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-emerald-800">
                      <strong>QuoteX eliminates this:</strong> Single data entry, automated flow between quote → order.
                      Error rate drops to near zero for transferred data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Seasonality Tab */}
        <TabsContent value="seasonality">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Monthly Distribution */}
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Quote Volume</CardTitle>
                <CardDescription>Spring surge (April peak) aligns with institutional procurement cycles</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                      formatter={(value) => [formatNumber(Number(value)), "Quotes"]}
                    />
                    <Bar dataKey="count" name="Quotes" radius={[4, 4, 0, 0]}>
                      {monthlyData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.month === "Apr" ? BRAND_GREEN : entry.count > 300 ? BRAND_GREEN + "cc" : BRAND_GREEN + "66"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quarterly Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Quarterly Pattern</CardTitle>
                <CardDescription>Q2 accounts for 31.4% of annual volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quarterlyData.map((q) => (
                    <div key={q.quarter} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900">{q.quarter}</p>
                        <span className="text-xs text-slate-500">{formatNumber(q.count)} ({q.percent}%)</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(q.count / 1119) * 100}%`,
                            backgroundColor: q.quarter === "Q2" ? BRAND_GREEN : BRAND_NAVY,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-800">
                    <strong>Staffing insight:</strong> Q2 volume is 47% higher than Q4. Consider seasonal staffing adjustments
                    or ensure QuoteX is live before the April surge.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Dealer Concentration */}
            <Card>
              <CardHeader>
                <CardTitle>Dealer Concentration Risk</CardTitle>
                <CardDescription>Highly fragmented — top 10 dealers = only 26% of volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {metrics.dealerConcentration.top10.dealers.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-4 text-right">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-xs font-medium text-slate-700 truncate max-w-[180px]">{d.name}</p>
                          <span className="text-xs text-slate-500">{d.count} ({d.percent}%)</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(d.count / 279) * 100}%`,
                              backgroundColor: i < 3 ? BRAND_GREEN : BRAND_NAVY,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 text-center">
                    <p className="text-xl font-bold text-slate-900">{metrics.dealerConcentration.totalUniqueDealers}</p>
                    <p className="text-xs text-slate-500">Unique dealers</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 text-center">
                    <p className="text-xl font-bold text-slate-900">73.7%</p>
                    <p className="text-xs text-slate-500">Long-tail (other)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* TO-BE Recommendations */}
      <Card className="mt-8 border-brand-green/30 bg-brand-green/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-brand-green" />
            TO-BE: Recommended Improvements
          </CardTitle>
          <CardDescription>How QuoteX eliminates each bottleneck identified above</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Unified Data Model",
                pain: "5 disconnected spreadsheets",
                fix: "Single database — enter data once, flows everywhere",
                impact: "Eliminates 12,338 manual re-entries/year",
              },
              {
                title: "Auto Price Lookup",
                pain: "Manual search through 9K rows",
                fix: "SKU-based instant pricing with tier auto-calculation",
                impact: "Price lookup: minutes → milliseconds",
              },
              {
                title: "Quote PDF Generation",
                pain: "Manual template filling + PDF export",
                fix: "One-click PDF generation from quote data",
                impact: "Eliminates template re-entry step entirely",
              },
              {
                title: "Quote → Order Flow",
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
            ].map((rec) => (
              <div key={rec.title} className="p-4 rounded-xl bg-white border border-brand-green/20">
                <p className="font-semibold text-slate-900 text-sm">{rec.title}</p>
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
                <Badge variant="success" className="mt-2 text-[10px]">{rec.impact}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
