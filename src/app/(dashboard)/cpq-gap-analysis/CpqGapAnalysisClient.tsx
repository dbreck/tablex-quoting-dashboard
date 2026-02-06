"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BookOpen,
  Briefcase,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Cog,
  Database,
  AlertTriangle,
  Check,
  Lightbulb,
  Palette,
  Rocket,
  Shield,
  User,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  summary,
  architectureDecision,
  personas,
  staffInsight,
  ruleCategories,
  dataGaps,
  archGaps,
  buildableNow,
  decisions,
  type RuleStatus,
  type Priority,
  type RuleCategory,
} from "@/data/cpq-gap-analysis";

// ── Color maps ──────────────────────────────────────────────────────

const statusBadge: Record<RuleStatus, "success" | "warning" | "secondary"> = {
  done: "success",
  partial: "warning",
  missing: "secondary",
};

const statusLabel: Record<RuleStatus, string> = {
  done: "DONE",
  partial: "PARTIAL",
  missing: "MISSING",
};

const priorityBadge: Record<Priority, "error" | "warning" | "secondary"> = {
  high: "error",
  medium: "warning",
  low: "secondary",
};

const personaIcons: Record<string, React.ReactNode> = {
  Palette: <Palette className="h-5 w-5" />,
  Briefcase: <Briefcase className="h-5 w-5" />,
  User: <User className="h-5 w-5" />,
};

// ── Chart colors ────────────────────────────────────────────────────

const DONE_COLOR = "#10b981";
const PARTIAL_COLOR = "#f59e0b";
const MISSING_COLOR = "#94a3b8";

// ── Derived chart data ──────────────────────────────────────────────

const donutData = [
  { name: "Done", value: summary.done, color: DONE_COLOR },
  { name: "Partial", value: summary.partial, color: PARTIAL_COLOR },
  { name: "Missing", value: summary.missing, color: MISSING_COLOR },
];

const barData = ruleCategories.map((cat) => ({
  name: cat.name,
  Done: cat.rules.filter((r) => r.status === "done").length,
  Partial: cat.rules.filter((r) => r.status === "partial").length,
  Missing: cat.rules.filter((r) => r.status === "missing").length,
}));

// ── Main component ──────────────────────────────────────────────────

export default function CpqGapAnalysisClient() {
  return (
    <div>
      <Header
        title="CPQ Gap Analysis"
        subtitle="Rules matrix, data gaps, architecture decisions, and action plan"
      />

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Rules Matrix</TabsTrigger>
          <TabsTrigger value="data-arch">Data & Architecture</TabsTrigger>
          <TabsTrigger value="action">Action Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="rules">
          <RulesMatrixTab />
        </TabsContent>
        <TabsContent value="data-arch">
          <DataArchTab />
        </TabsContent>
        <TabsContent value="action">
          <ActionPlanTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Tab 1: Overview
// ═══════════════════════════════════════════════════════════════════

function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  CPQ Rules
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {summary.totalRules}
                </p>
                <div className="flex gap-1.5 mt-2">
                  <Badge variant="success" className="text-[10px]">
                    {summary.done} done
                  </Badge>
                  <Badge variant="warning" className="text-[10px]">
                    {summary.partial} partial
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {summary.missing} missing
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-green/10">
                <ClipboardCheck className="h-6 w-6 text-brand-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Data Requests
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {summary.dataRequests}
                </p>
                <div className="flex gap-1.5 mt-2">
                  <Badge variant="error" className="text-[10px]">
                    2 HIGH
                  </Badge>
                  <Badge variant="warning" className="text-[10px]">
                    2 MED
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    3 LOW
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-100">
                <Database className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Architecture Gaps
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {summary.archGaps}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Major systems to build
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100">
                <Cog className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Decisions Pending
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {summary.decisions}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Blocking architecture choices
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100">
                <Lightbulb className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Architecture Decision Card */}
      <Card className="border-brand-navy/20 bg-brand-navy/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-navy" />
            Core Decision: Rules-Driven CPQ, NOT SKU-Driven
          </CardTitle>
        </CardHeader>
        <CardContent>
          <blockquote className="border-l-4 border-brand-navy/30 pl-4 italic text-sm text-slate-600 mb-4">
            &ldquo;{architectureDecision.brianQuote}&rdquo;
            <span className="block text-xs text-slate-400 mt-1 not-italic">
              — Brian Craig, Feb 6, 2026
            </span>
          </blockquote>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-emerald-700 mb-2">
                Keep from current system
              </h4>
              <ul className="space-y-1">
                {architectureDecision.keep.map((item, i) => (
                  <li
                    key={i}
                    className="text-sm text-slate-600 flex items-start gap-2"
                  >
                    <span className="text-emerald-500 mt-0.5">+</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-red-700 mb-2">
                Must replace or rework
              </h4>
              <ul className="space-y-1">
                {architectureDecision.change.map((item, i) => (
                  <li
                    key={i}
                    className="text-sm text-slate-600 flex items-start gap-2"
                  >
                    <span className="text-red-500 mt-0.5">&rarr;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Persona Cards */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          User Personas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {personas.map((p) => (
            <Card key={p.role} hover>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green">
                    {personaIcons[p.icon]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{p.role}</p>
                    <p className="text-xs text-slate-500">{p.goal}</p>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">
                    Pricing visibility
                  </p>
                  <p className="text-sm text-slate-700">{p.pricing}</p>
                </div>
                <blockquote className="border-l-2 border-slate-200 pl-3 text-xs italic text-slate-500">
                  &ldquo;{p.quote}&rdquo;
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Staff Insight Callout */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-800">
              Insight: Root Cause of Slow Quoting is Fear of Mistakes
            </p>
            <p className="text-sm text-amber-700 mt-2 font-medium">
              {staffInsight.implication}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Tab 2: Rules Matrix
// ═══════════════════════════════════════════════════════════════════

function RulesMatrixTab() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const completionPct = (
    ((summary.done + summary.partial * 0.5) / summary.totalRules) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Top row: donut + stacked bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Overall Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} rules`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    {completionPct}%
                  </p>
                  <p className="text-xs text-slate-500">Complete</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {donutData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-slate-600">
                    {d.name} ({d.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stacked bar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Rules by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
              >
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Bar
                  dataKey="Done"
                  stackId="a"
                  fill={DONE_COLOR}
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="Partial"
                  stackId="a"
                  fill={PARTIAL_COLOR}
                />
                <Bar
                  dataKey="Missing"
                  stackId="a"
                  fill={MISSING_COLOR}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Collapsible category sections */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">
          Rule Details by Category
        </h3>
        {ruleCategories.map((cat) => (
          <CategorySection
            key={cat.id}
            category={cat}
            isExpanded={expanded.has(cat.id)}
            onToggle={() => toggle(cat.id)}
          />
        ))}
      </div>
    </div>
  );
}

function CategorySection({
  category,
  isExpanded,
  onToggle,
}: {
  category: RuleCategory;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const done = category.rules.filter((r) => r.status === "done").length;
  const partial = category.rules.filter((r) => r.status === "partial").length;
  const missing = category.rules.filter((r) => r.status === "missing").length;

  return (
    <Card>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
          <span className="font-semibold text-slate-900">
            {category.name}
          </span>
          <span className="text-xs text-slate-400">
            {category.rules.length} rules
          </span>
        </div>
        <div className="flex gap-1.5">
          {done > 0 && (
            <Badge variant="success" className="text-[10px]">
              {done}
            </Badge>
          )}
          {partial > 0 && (
            <Badge variant="warning" className="text-[10px]">
              {partial}
            </Badge>
          )}
          {missing > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {missing}
            </Badge>
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="border-t border-slate-100 pt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 uppercase tracking-wider">
                  <th className="text-left pb-2 w-24">Status</th>
                  <th className="text-left pb-2">Rule</th>
                  <th className="text-left pb-2 hidden sm:table-cell">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {category.rules.map((rule) => (
                  <tr
                    key={rule.id}
                    className="border-t border-slate-50"
                  >
                    <td className="py-2 pr-3">
                      <Badge
                        variant={statusBadge[rule.status]}
                        className="text-[10px]"
                      >
                        {statusLabel[rule.status]}
                      </Badge>
                    </td>
                    <td className="py-2 pr-3 text-slate-900">
                      {rule.title}
                      <span className="block sm:hidden text-xs text-slate-500 mt-0.5">
                        {rule.notes}
                      </span>
                    </td>
                    <td className="py-2 text-slate-500 hidden sm:table-cell">
                      {rule.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Tab 3: Data & Architecture
// ═══════════════════════════════════════════════════════════════════

function DataArchTab() {
  return (
    <div className="space-y-8">
      {/* Data Gap Tracker */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Data Gap Tracker
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dataGaps.map((gap) => (
            <Card key={gap.id} hover>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">
                      #{gap.id}
                    </span>
                    <p className="font-semibold text-slate-900">{gap.title}</p>
                  </div>
                  <Badge
                    variant={priorityBadge[gap.priority]}
                    className="text-[10px] shrink-0"
                  >
                    {gap.priority.toUpperCase()}
                  </Badge>
                </div>
                <Badge variant="outline" className="text-[10px] mb-3">
                  {gap.status}
                </Badge>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold mb-1">
                      Can build without
                    </p>
                    <p className="text-xs text-slate-600">{gap.canBuild}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-red-600 font-semibold mb-1">
                      Blocked by this
                    </p>
                    <p className="text-xs text-slate-600">{gap.blocked}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Architecture Gaps */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Architecture Gaps
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {archGaps.map((gap) => (
            <Card key={gap.id} hover>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Cog className="h-4 w-4 text-slate-400" />
                  <p className="font-semibold text-slate-900">
                    {gap.component}
                  </p>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      Current
                    </p>
                    <p className="text-slate-600">{gap.currentState}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      Needed
                    </p>
                    <p className="text-slate-700">{gap.needed}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                      Options
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {gap.options.map((opt, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {opt}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Tab 4: Action Plan
// ═══════════════════════════════════════════════════════════════════

const STORAGE_KEY_COMPLETED = "cpq-gap-completed";
const STORAGE_KEY_DECISIONS = "cpq-gap-decisions";

function usePersistedSet(key: string): [Set<number>, (id: number) => void] {
  const [items, setItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) setItems(new Set(JSON.parse(stored)));
    } catch {}
  }, [key]);

  const toggle = useCallback(
    (id: number) => {
      setItems((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        localStorage.setItem(key, JSON.stringify([...next]));
        return next;
      });
    },
    [key]
  );

  return [items, toggle];
}

function usePersistedMap(
  key: string
): [Record<number, string>, (id: number, value: string) => void] {
  const [items, setItems] = useState<Record<number, string>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, [key]);

  const select = useCallback(
    (id: number, value: string) => {
      setItems((prev) => {
        const next = { ...prev };
        if (next[id] === value) delete next[id];
        else next[id] = value;
        localStorage.setItem(key, JSON.stringify(next));
        return next;
      });
    },
    [key]
  );

  return [items, select];
}

function ActionPlanTab() {
  const [completed, toggleCompleted] = usePersistedSet(STORAGE_KEY_COMPLETED);
  const [selectedDecisions, selectDecision] =
    usePersistedMap(STORAGE_KEY_DECISIONS);

  const completedCount = completed.size;
  const decidedCount = Object.keys(selectedDecisions).length;

  return (
    <div className="space-y-8">
      {/* What We Can Build Now */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold text-slate-900">
            What We Can Build Now
          </h3>
          {completedCount > 0 && (
            <Badge variant="success" className="text-xs">
              {completedCount} / {buildableNow.length} done
            </Badge>
          )}
        </div>
        <p className="text-sm text-slate-500 mb-4">
          {buildableNow.length} items ready to start before data arrives
          — click to mark complete
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buildableNow.map((item) => {
            const isDone = completed.has(item.id);
            return (
              <Card
                key={item.id}
                hover
                className={cn(
                  "cursor-pointer transition-all",
                  isDone && "opacity-60 border-emerald-200 bg-emerald-50/30"
                )}
              >
                <CardContent className="p-5">
                  <button
                    onClick={() => toggleCompleted(item.id)}
                    className="w-full text-left flex items-start gap-3"
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg shrink-0 text-sm font-bold transition-colors",
                        isDone
                          ? "bg-emerald-500 text-white"
                          : "bg-brand-green/10 text-brand-green"
                      )}
                    >
                      {isDone ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        item.id
                      )}
                    </div>
                    <div>
                      <p
                        className={cn(
                          "font-semibold text-sm",
                          isDone
                            ? "text-slate-400 line-through"
                            : "text-slate-900"
                        )}
                      >
                        {item.title}
                      </p>
                      <p
                        className={cn(
                          "text-xs mt-1",
                          isDone ? "text-slate-400" : "text-slate-500"
                        )}
                      >
                        {item.description}
                      </p>
                      <div className="flex gap-1.5 mt-2">
                        {isDone ? (
                          <Badge variant="success" className="text-[10px]">
                            Complete
                          </Badge>
                        ) : item.deps.length === 0 ? (
                          <Badge variant="success" className="text-[10px]">
                            Ready
                          </Badge>
                        ) : (
                          item.deps.map((dep, i) => (
                            <Badge
                              key={i}
                              variant="warning"
                              className="text-[10px]"
                            >
                              Depends on #{dep}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Decisions Needed */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold text-slate-900">
            Decisions Needed
          </h3>
          {decidedCount > 0 && (
            <Badge variant="success" className="text-xs">
              {decidedCount} / {decisions.length} decided
            </Badge>
          )}
        </div>
        <p className="text-sm text-slate-500 mb-4">
          {decisions.length} questions that will shape the architecture
          — click an option to select it
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decisions.map((d) => {
            const selected = selectedDecisions[d.id];
            const isDecided = !!selected;
            return (
              <Card
                key={d.id}
                hover
                className={cn(
                  "transition-all",
                  isDecided && "border-emerald-200 bg-emerald-50/30"
                )}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-full shrink-0 mt-0.5 text-[10px] font-bold transition-colors",
                        isDecided
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-400"
                      )}
                    >
                      {isDecided ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        d.id
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={cn(
                          "font-semibold text-sm",
                          isDecided ? "text-slate-600" : "text-slate-900"
                        )}
                      >
                        {d.question}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {d.options.map((opt, i) => {
                          const isSelected = selected === opt;
                          return (
                            <button
                              key={i}
                              onClick={() => selectDecision(d.id, opt)}
                              className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium transition-all border cursor-pointer",
                                isSelected
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400"
                                  : selected
                                  ? "bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300"
                                  : "bg-white text-slate-700 border-slate-200 hover:border-brand-green hover:text-brand-green"
                              )}
                            >
                              {isSelected && (
                                <Check className="h-2.5 w-2.5 mr-1" />
                              )}
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {d.impact.map((imp, i) => (
                          <Badge
                            key={i}
                            variant="info"
                            className="text-[10px]"
                          >
                            {imp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
