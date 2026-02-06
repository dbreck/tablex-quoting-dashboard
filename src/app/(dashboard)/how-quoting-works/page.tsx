"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import profitData from "@/data/profit-analysis.json";
import { discountTierLabels } from "@/lib/pricing";
import { freightZones } from "@/data/freight-zones";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  ArrowDown,
  Layers,
  Factory,
  Percent,
  Tag,
  Truck,
  DollarSign,
  ChevronRight,
  Info,
  Calculator,
} from "lucide-react";

type ProfitRow = (typeof profitData)[number];

// --- Component cost breakdown for the interactive diagram ---
interface CostComponent {
  key: string;
  label: string;
  description: string;
  color: string;
  icon: string;
}

const costComponents: CostComponent[] = [
  {
    key: "topCost",
    label: "Table Top",
    description: "Surface material — laminate, solid surface, or wood veneer",
    color: "#ef4444",
    icon: "surface",
  },
  {
    key: "baseCost",
    label: "Base / Legs",
    description: "Pedestal, quad legs, or custom base frame",
    color: "#f97316",
    icon: "base",
  },
  {
    key: "routeCost",
    label: "Edge Routing",
    description: "CNC edge profiling — optional per SKU",
    color: "#eab308",
    icon: "edge",
  },
  {
    key: "assemblyCost",
    label: "Assembly Labor",
    description: "Labor to assemble top + base into finished unit",
    color: "#a855f7",
    icon: "labor",
  },
  {
    key: "freightInCost",
    label: "Freight In",
    description: "Inbound shipping of raw materials to factory",
    color: "#6366f1",
    icon: "truck",
  },
  {
    key: "packagingCost",
    label: "Packaging",
    description: "Box, crate, or pallet wrapping for shipment",
    color: "#0ea5e9",
    icon: "box",
  },
];

// --- Stepped flow data ---
interface FlowStep {
  number: number;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const flowSteps: FlowStep[] = [
  {
    number: 1,
    title: "Cost Buildup",
    subtitle: "Sum all manufacturing components",
    color: "#ef4444",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    number: 2,
    title: "List Price",
    subtitle: "Apply gross profit margin",
    color: "#8dc63f",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  {
    number: 3,
    title: "Trade Discount",
    subtitle: "Chained dealer discount tiers",
    color: "#3b82f6",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    number: 4,
    title: "Commission",
    subtitle: "Sales rep percentage deduction",
    color: "#a855f7",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    number: 5,
    title: "Freight",
    subtitle: "Delivery cost by zone & order size",
    color: "#f59e0b",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    number: 6,
    title: "Final Quote",
    subtitle: "Net price + freight = what the dealer pays",
    color: "#1a3c5c",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
  },
];

export default function HowQuotingWorksPage() {
  const [selectedSku, setSelectedSku] = useState<string>(
    profitData[0]?.sku || ""
  );
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedZone, setSelectedZone] = useState<number>(1);

  const row = useMemo(
    () =>
      (profitData.find((r: ProfitRow) => r.sku === selectedSku) ||
        profitData[0]) as ProfitRow,
    [selectedSku]
  );

  // Compute derived values
  const totalCost = row.totalCost || 0;
  const gpm = row.gpm || 0;
  const listPrice = row.listPrice || 0;
  const commissionRate = row.commission || 0;

  // Cost component values
  const costBreakdown = costComponents.map((comp) => ({
    ...comp,
    value: (row as unknown as Record<string, number | null>)[comp.key] || 0,
  }));
  const assemblySubtotal =
    (row.assemblyCost || 0) -
    (row.topCost || 0) -
    (row.baseCost || 0) -
    (row.routeCost || 0);

  // Discount tier values
  const tierValues = discountTierLabels.map((tier) => ({
    ...tier,
    price:
      ((row as unknown as Record<string, number>)[tier.key] as number) || 0,
    savings:
      listPrice -
      (((row as unknown as Record<string, number>)[tier.key] as number) || 0),
    savingsPercent:
      listPrice > 0
        ? ((listPrice -
            (((row as unknown as Record<string, number>)[tier.key] as number) ||
              0)) /
            listPrice) *
          100
        : 0,
  }));

  // Default to 50/20 tier for commission & profit calc
  const net5020 = row.price_50_20 || 0;
  const commissionAmount = net5020 * commissionRate;
  const netProfit = net5020 - commissionAmount - totalCost;

  // Freight zone
  const zone = freightZones.find((z) => z.zone === selectedZone)!;

  return (
    <div>
      <Header
        title="How Quoting Works"
        subtitle="The complete calculation pipeline — from raw material costs to what the dealer pays"
      />

      {/* Product Selector */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-navy/5 shrink-0">
              <Calculator className="h-5 w-5 text-brand-navy" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Walk through with a real product
              </label>
              <select
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
                className="flex h-10 w-full max-w-xl rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green"
              >
                {profitData.map((r: ProfitRow) => (
                  <option key={`${r.sku}-${r.tag}`} value={r.sku}>
                    {r.sku} — List: {formatCurrency(r.listPrice || 0)} | GPM:{" "}
                    {((r.gpm || 0) * 100).toFixed(0)}%
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Pipeline — Horizontal Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {flowSteps.map((step, i) => (
            <div key={step.number} className="flex items-center">
              <button
                onClick={() => setActiveStep(step.number)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeStep === step.number
                    ? `${step.bgColor} ${step.borderColor} border-2 shadow-sm`
                    : "hover:bg-slate-50 border-2 border-transparent"
                }`}
              >
                <div
                  className="flex items-center justify-center w-7 h-7 rounded-lg text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: step.color }}
                >
                  {step.number}
                </div>
                <div className="text-left">
                  <p
                    className={`text-sm font-semibold ${activeStep === step.number ? "text-slate-900" : "text-slate-600"}`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[10px] text-slate-400">{step.subtitle}</p>
                </div>
              </button>
              {i < flowSteps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-slate-300 shrink-0 mx-0.5" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Cost Buildup */}
      {activeStep === 1 && (
        <div className="animate-fade-in">
          <Card className="mb-6 border-red-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
                  <Factory className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <CardTitle>Step 1: Cost Buildup</CardTitle>
                  <CardDescription>
                    Each product&apos;s total cost is the sum of its
                    manufacturing components
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Cost component bars */}
              <div className="space-y-3 mb-6">
                {costBreakdown
                  .filter(
                    (c) =>
                      c.value > 0 && c.key !== "assemblyCost"
                  )
                  .map((comp) => {
                    const pct =
                      totalCost > 0 ? (comp.value / totalCost) * 100 : 0;
                    return (
                      <div key={comp.key}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-sm"
                              style={{ backgroundColor: comp.color }}
                            />
                            <span className="text-sm font-medium text-slate-700">
                              {comp.label}
                            </span>
                            <span className="text-xs text-slate-400">
                              {comp.description}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400">
                              {pct.toFixed(1)}%
                            </span>
                            <span className="text-sm font-bold text-slate-900 tabular-nums w-20 text-right">
                              {formatCurrency(comp.value)}
                            </span>
                          </div>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: comp.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}

                {/* Assembly labor (derived) */}
                {assemblySubtotal > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: "#a855f7" }}
                        />
                        <span className="text-sm font-medium text-slate-700">
                          Assembly Labor
                        </span>
                        <span className="text-xs text-slate-400">
                          Net labor after top + base
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">
                          {((assemblySubtotal / totalCost) * 100).toFixed(1)}%
                        </span>
                        <span className="text-sm font-bold text-slate-900 tabular-nums w-20 text-right">
                          {formatCurrency(assemblySubtotal)}
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(assemblySubtotal / totalCost) * 100}%`,
                          backgroundColor: "#a855f7",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Total cost callout */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 text-white">
                <div className="flex items-center gap-3">
                  <Layers className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-300">
                      Total Manufacturing Cost
                    </p>
                    <p className="text-xs text-slate-500">
                      Sum of all component costs for{" "}
                      <span className="text-slate-300 font-mono">
                        {row.sku}
                      </span>
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold tabular-nums">
                  {formatCurrency(totalCost)}
                </p>
              </div>

              {/* Formula callout */}
              <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <Info className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-800">
                  <strong>Formula:</strong> Total Cost = Top + Base + Edge
                  Routing + Assembly Labor + Freight In + Packaging. Assembly
                  cost in the spreadsheet includes top + base, so net assembly
                  labor is derived by subtraction.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: List Price via GPM */}
      {activeStep === 2 && (
        <div className="animate-fade-in">
          <Card className="mb-6 border-emerald-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100">
                  <Percent className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle>Step 2: List Price via Gross Profit Margin</CardTitle>
                  <CardDescription>
                    The published catalog price is set to achieve a target GPM
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Total Cost */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Total Cost
                  </p>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">
                    {formatCurrency(totalCost)}
                  </p>
                </div>

                {/* GPM */}
                <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-center relative">
                  <p className="text-xs text-emerald-600 uppercase tracking-wider mb-1">
                    Gross Profit Margin
                  </p>
                  <p className="text-2xl font-bold text-emerald-700 tabular-nums">
                    {(gpm * 100).toFixed(1)}%
                  </p>
                  {/* Visual GPM ring */}
                  <div className="mt-3 mx-auto w-24 h-24 relative">
                    <svg
                      viewBox="0 0 36 36"
                      className="w-24 h-24 -rotate-90"
                    >
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="3"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#8dc63f"
                        strokeWidth="3"
                        strokeDasharray={`${gpm * 88} 88`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-emerald-700">
                        {(gpm * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* List Price */}
                <div className="p-5 rounded-xl bg-brand-green/5 border border-brand-green/20 text-center">
                  <p className="text-xs text-brand-green uppercase tracking-wider mb-1">
                    List Price (MSRP)
                  </p>
                  <p className="text-2xl font-bold text-brand-green tabular-nums">
                    {formatCurrency(listPrice)}
                  </p>
                </div>
              </div>

              {/* Arrow flow showing the formula */}
              <div className="flex items-center justify-center gap-3 my-6 flex-wrap">
                <div className="px-4 py-2 rounded-lg bg-slate-100 text-sm font-mono text-slate-700">
                  {formatCurrency(totalCost)}
                </div>
                <span className="text-slate-400 font-bold text-lg">&divide;</span>
                <div className="px-4 py-2 rounded-lg bg-slate-100 text-sm font-mono text-slate-700">
                  (1 &minus; {(gpm * 100).toFixed(0)}%)
                </div>
                <span className="text-slate-400 font-bold text-lg">=</span>
                <div className="px-4 py-2 rounded-lg bg-slate-100 text-sm font-mono text-slate-700">
                  {formatCurrency(totalCost)} &divide; {(1 - gpm).toFixed(2)}
                </div>
                <span className="text-slate-400 font-bold text-lg">=</span>
                <div className="px-4 py-2 rounded-lg bg-brand-green/10 border border-brand-green/30 text-sm font-mono font-bold text-brand-green">
                  {formatCurrency(totalCost / (1 - gpm))}
                </div>
              </div>

              {/* Explanation */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <Info className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <div className="text-xs text-emerald-800">
                  <strong>How it works:</strong> The GPM determines what
                  fraction of the list price is profit. A {(gpm * 100).toFixed(0)}% GPM
                  means {(gpm * 100).toFixed(0)}% of the list price is gross
                  margin and {((1 - gpm) * 100).toFixed(0)}% covers cost. The actual
                  published list price is{" "}
                  <strong>{formatCurrency(listPrice)}</strong>
                  {Math.abs(listPrice - totalCost / (1 - gpm)) > 1 && (
                    <span>
                      {" "}
                      (vs. the formula&apos;s{" "}
                      {formatCurrency(totalCost / (1 - gpm))} — rounded or
                      adjusted by TableX).
                    </span>
                  )}
                  {" "}No dealer pays this — it&apos;s the starting point for discount
                  tiers.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Trade Discount Chain */}
      {activeStep === 3 && (
        <div className="animate-fade-in">
          <Card className="mb-6 border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                  <Tag className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Step 3: Trade Discount Chain</CardTitle>
                  <CardDescription>
                    Dealers get chained discounts based on their tier — no one
                    pays list price
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* How chained discounts work */}
              <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  How chained discounts work
                </p>
                <p className="text-xs text-blue-700 mb-3">
                  Discounts are applied sequentially, not added together. Each
                  percentage is taken from the <em>remaining</em> price after
                  the prior discount.
                </p>
                <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
                  <span className="px-3 py-1.5 rounded bg-white border border-blue-200 text-blue-900">
                    {formatCurrency(listPrice)}
                  </span>
                  <span className="text-blue-400">&times; 0.50</span>
                  <span className="text-blue-400">=</span>
                  <span className="px-3 py-1.5 rounded bg-white border border-blue-200 text-blue-900">
                    {formatCurrency(listPrice * 0.5)}
                  </span>
                  <span className="text-blue-400">&times; 0.80</span>
                  <span className="text-blue-400">=</span>
                  <span className="px-3 py-1.5 rounded bg-blue-100 border border-blue-300 text-blue-900 font-bold">
                    {formatCurrency(listPrice * 0.5 * 0.8)}
                  </span>
                  <Badge variant="info" className="ml-1">
                    = 50/20 tier
                  </Badge>
                </div>
              </div>

              {/* Tier cards */}
              <div className="space-y-3">
                {tierValues.map((tier, i) => {
                  const isFirst = i === 0;
                  const isBest = i === tierValues.length - 1;
                  return (
                    <div
                      key={tier.key}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        isFirst
                          ? "border-brand-green/30 bg-brand-green/5"
                          : isBest
                            ? "border-brand-navy/30 bg-brand-navy/5"
                            : "border-slate-200 bg-white"
                      }`}
                    >
                      {/* Tier label */}
                      <div className="w-24 shrink-0">
                        <p
                          className={`text-sm font-bold ${isFirst ? "text-brand-green" : isBest ? "text-brand-navy" : "text-slate-700"}`}
                        >
                          {tier.label}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          &times; {tier.factor.toFixed(2)}
                        </p>
                      </div>

                      {/* Price bar */}
                      <div className="flex-1">
                        <div className="h-6 bg-slate-100 rounded-full overflow-hidden relative">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(tier.price / listPrice) * 100}%`,
                              backgroundColor:
                                i === 0
                                  ? "#8dc63f"
                                  : i < 3
                                    ? "#3b82f6"
                                    : "#1a3c5c",
                            }}
                          />
                          {/* Total cost line */}
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-red-400"
                            style={{
                              left: `${(totalCost / listPrice) * 100}%`,
                            }}
                            title={`Cost: ${formatCurrency(totalCost)}`}
                          />
                        </div>
                      </div>

                      {/* Price + savings */}
                      <div className="w-32 text-right shrink-0">
                        <p className="text-sm font-bold text-slate-900 tabular-nums">
                          {formatCurrency(tier.price)}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          save {formatCurrency(tier.savings)} (
                          {tier.savingsPercent.toFixed(0)}%)
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="w-20 shrink-0">
                        {isFirst && (
                          <Badge variant="default" className="text-[9px]">
                            Standard
                          </Badge>
                        )}
                        {isBest && (
                          <Badge variant="info" className="text-[9px]">
                            Best Tier
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cost line legend */}
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <div className="w-4 h-0.5 bg-red-400 rounded" />
                <span>
                  Red line = manufacturing cost ({formatCurrency(totalCost)}).
                  Everything to the right of it is margin.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 4: Commission */}
      {activeStep === 4 && (
        <div className="animate-fade-in">
          <Card className="mb-6 border-purple-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Step 4: Commission Deduction</CardTitle>
                  <CardDescription>
                    Sales rep commission is a percentage of the net (post-discount)
                    price
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Visual flow: Net → Commission → Profit */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-center">
                <div className="p-5 rounded-xl bg-blue-50 border border-blue-200 text-center">
                  <p className="text-xs text-blue-500 uppercase tracking-wider mb-1">
                    Net Price (50/20)
                  </p>
                  <p className="text-2xl font-bold text-blue-700 tabular-nums">
                    {formatCurrency(net5020)}
                  </p>
                </div>

                <div className="flex items-center justify-center">
                  <div className="flex flex-col items-center gap-1">
                    <ArrowDown className="h-5 w-5 text-slate-300 md:rotate-[-90deg]" />
                    <span className="text-xs text-slate-400 font-mono">
                      &minus; {(commissionRate * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-purple-50 border border-purple-200 text-center">
                  <p className="text-xs text-purple-500 uppercase tracking-wider mb-1">
                    Commission
                  </p>
                  <p className="text-2xl font-bold text-purple-700 tabular-nums">
                    {formatCurrency(commissionAmount)}
                  </p>
                  <p className="text-xs text-purple-400 mt-1">
                    {formatCurrency(net5020)} &times;{" "}
                    {(commissionRate * 100).toFixed(0)}%
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <p className="text-xs text-emerald-500 uppercase tracking-wider mb-1">
                    After Commission
                  </p>
                  <p className="text-2xl font-bold text-emerald-700 tabular-nums">
                    {formatCurrency(net5020 - commissionAmount)}
                  </p>
                </div>
              </div>

              {/* Profit waterfall */}
              <div className="p-5 rounded-xl bg-slate-900 text-white">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-4">
                  Profit Breakdown for {row.sku}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">
                      Net price (50/20 tier)
                    </span>
                    <span className="text-sm font-bold tabular-nums">
                      {formatCurrency(net5020)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-red-400">
                    <span className="text-sm">&minus; Manufacturing cost</span>
                    <span className="text-sm font-bold tabular-nums">
                      ({formatCurrency(totalCost)})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-purple-400">
                    <span className="text-sm">
                      &minus; Commission ({(commissionRate * 100).toFixed(0)}%)
                    </span>
                    <span className="text-sm font-bold tabular-nums">
                      ({formatCurrency(commissionAmount)})
                    </span>
                  </div>
                  <div className="border-t border-slate-700 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-emerald-400">
                        Net Profit
                      </span>
                      <span className="text-lg font-bold text-emerald-400 tabular-nums">
                        {formatCurrency(netProfit)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 text-right mt-0.5">
                      {net5020 > 0
                        ? ((netProfit / net5020) * 100).toFixed(1)
                        : "0"}
                      % net margin
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-purple-50 border border-purple-200">
                <Info className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                <p className="text-xs text-purple-800">
                  <strong>Note:</strong> Commission rate varies by product — this
                  SKU uses {(commissionRate * 100).toFixed(0)}%. Commission is
                  always calculated on the <em>net</em> (post-discount) price,
                  not the list price.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 5: Freight */}
      {activeStep === 5 && (
        <div className="animate-fade-in">
          <Card className="mb-6 border-amber-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100">
                  <Truck className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle>Step 5: Freight (Delivery Cost)</CardTitle>
                  <CardDescription>
                    Freight is a separate line item based on delivery zone and
                    order total — not baked into the product price
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Zone selector */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-sm text-slate-500">Select zone:</span>
                {freightZones.map((z) => (
                  <button
                    key={z.zone}
                    onClick={() => setSelectedZone(z.zone)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      selectedZone === z.zone
                        ? "text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                    style={
                      selectedZone === z.zone
                        ? { backgroundColor: z.color }
                        : undefined
                    }
                  >
                    Zone {z.zone}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Zone details */}
                <div>
                  <div
                    className="p-5 rounded-xl border-2 mb-4"
                    style={{
                      borderColor: zone.color + "40",
                      backgroundColor: zone.color + "08",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: zone.color }}
                      >
                        {zone.zone}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Zone {zone.zone}
                        </p>
                        <p className="text-xs text-slate-500">
                          {zone.states.length} states
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {zone.states.map((st) => (
                        <span
                          key={st}
                          className="px-2 py-0.5 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: zone.color }}
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-800">
                      <strong>Zones radiate outward</strong> from TableX&apos;s
                      manufacturing facility. Zone 1 (closest) gets the best
                      freight rates. Zone 5 (West Coast) must always be quoted
                      individually.
                    </p>
                  </div>
                </div>

                {/* Pricing matrix for selected zone */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">
                    Zone {zone.zone} Freight Rates
                  </p>
                  <table className="data-table w-full">
                    <thead>
                      <tr>
                        <th>Order Total</th>
                        <th>Freight Charge</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { range: "Under $3,000", value: zone.pricing.under3k },
                        {
                          range: "$3,000 – $4,999",
                          value: zone.pricing.over3k,
                        },
                        {
                          range: "$5,000 – $7,499",
                          value: zone.pricing.over5k,
                        },
                        {
                          range: "$7,500 – $9,999",
                          value: zone.pricing.over7_5k,
                        },
                        { range: "$10,000+", value: zone.pricing.over10k },
                      ].map((row) => (
                        <tr key={row.range}>
                          <td className="text-sm">{row.range}</td>
                          <td>
                            {row.value === "FREE" ? (
                              <Badge variant="success">FREE</Badge>
                            ) : row.value === "Quote" ? (
                              <Badge variant="warning">Must Quote</Badge>
                            ) : (
                              <span className="text-sm font-semibold text-slate-900">
                                {row.value}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 6: Final Quote */}
      {activeStep === 6 && (
        <div className="animate-fade-in">
          <Card className="mb-6 border-brand-navy/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-navy/10">
                  <DollarSign className="h-5 w-5 text-brand-navy" />
                </div>
                <div>
                  <CardTitle>Step 6: The Final Quote</CardTitle>
                  <CardDescription>
                    Putting it all together — here&apos;s the complete
                    calculation for{" "}
                    <span className="font-mono text-slate-700">{row.sku}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Complete waterfall */}
              <div className="max-w-2xl mx-auto">
                {/* Manufacturing */}
                <div className="relative">
                  {[
                    { label: "Top Cost", value: row.topCost || 0, color: "#ef4444" },
                    { label: "Base Cost", value: row.baseCost || 0, color: "#f97316" },
                    ...(row.routeCost ? [{ label: "Edge Routing", value: row.routeCost, color: "#eab308" }] : []),
                    ...(assemblySubtotal > 0 ? [{ label: "Assembly Labor", value: assemblySubtotal, color: "#a855f7" }] : []),
                    ...(row.freightInCost ? [{ label: "Freight In", value: row.freightInCost, color: "#6366f1" }] : []),
                    { label: "Packaging", value: row.packagingCost || 0, color: "#0ea5e9" },
                  ]
                    .filter((item) => item.value > 0)
                    .map((item, i) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-4 py-2"
                      >
                        <div className="w-4 flex justify-center">
                          {i === 0 ? null : (
                            <span className="text-slate-400 text-sm font-bold">
                              +
                            </span>
                          )}
                        </div>
                        <div
                          className="w-3 h-3 rounded-sm shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-slate-600 flex-1">
                          {item.label}
                        </span>
                        <span className="text-sm font-bold text-slate-900 tabular-nums">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    ))}
                  <div className="border-t border-slate-200 mt-1 pt-2 flex items-center gap-4">
                    <div className="w-4 flex justify-center">
                      <span className="text-slate-400 text-sm font-bold">
                        =
                      </span>
                    </div>
                    <div className="w-3 h-3 rounded-sm shrink-0 bg-slate-800" />
                    <span className="text-sm font-semibold text-slate-900 flex-1">
                      Total Cost
                    </span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      {formatCurrency(totalCost)}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="my-4 border-t-2 border-dashed border-slate-200" />

                {/* Markup */}
                <div className="flex items-center gap-4 py-2">
                  <div className="w-4 flex justify-center">
                    <ArrowDown className="h-3 w-3 text-brand-green" />
                  </div>
                  <div className="w-3 h-3 rounded-sm shrink-0 bg-brand-green" />
                  <span className="text-sm text-slate-600 flex-1">
                    Apply {(gpm * 100).toFixed(0)}% GPM
                  </span>
                  <span className="text-sm font-bold text-brand-green tabular-nums">
                    {formatCurrency(listPrice)}
                  </span>
                </div>
                <div className="ml-7 pl-1 text-xs text-slate-400 mb-2">
                  List Price (MSRP) — the published catalog price
                </div>

                {/* Discount */}
                <div className="flex items-center gap-4 py-2">
                  <div className="w-4 flex justify-center">
                    <ArrowDown className="h-3 w-3 text-blue-500" />
                  </div>
                  <div className="w-3 h-3 rounded-sm shrink-0 bg-blue-500" />
                  <span className="text-sm text-slate-600 flex-1">
                    Apply 50/20 discount (&times;0.40)
                  </span>
                  <span className="text-sm font-bold text-blue-600 tabular-nums">
                    {formatCurrency(net5020)}
                  </span>
                </div>

                {/* Commission */}
                <div className="flex items-center gap-4 py-2">
                  <div className="w-4 flex justify-center">
                    <span className="text-purple-400 text-sm font-bold">
                      &minus;
                    </span>
                  </div>
                  <div className="w-3 h-3 rounded-sm shrink-0 bg-purple-500" />
                  <span className="text-sm text-slate-600 flex-1">
                    Commission ({(commissionRate * 100).toFixed(0)}%)
                  </span>
                  <span className="text-sm font-bold text-purple-600 tabular-nums">
                    ({formatCurrency(commissionAmount)})
                  </span>
                </div>

                {/* Freight */}
                <div className="flex items-center gap-4 py-2">
                  <div className="w-4 flex justify-center">
                    <span className="text-amber-400 text-sm font-bold">+</span>
                  </div>
                  <div className="w-3 h-3 rounded-sm shrink-0 bg-amber-500" />
                  <span className="text-sm text-slate-600 flex-1">
                    Freight (varies by zone & order size)
                  </span>
                  <span className="text-sm font-bold text-amber-600 tabular-nums">
                    Separate line
                  </span>
                </div>

                {/* Divider */}
                <div className="my-4 border-t-2 border-slate-300" />

                {/* Final */}
                <div className="p-5 rounded-xl bg-brand-navy text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-300">
                        What the dealer pays (50/20 tier)
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {row.sku}
                      </p>
                    </div>
                    <p className="text-3xl font-bold tabular-nums">
                      {formatCurrency(net5020)}
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      TableX net profit per unit
                    </span>
                    <span className="text-sm font-bold text-emerald-400 tabular-nums">
                      {formatCurrency(netProfit)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Net margin
                    </span>
                    <span className="text-sm font-bold text-emerald-400 tabular-nums">
                      {net5020 > 0
                        ? ((netProfit / net5020) * 100).toFixed(1)
                        : "0"}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All tiers comparison */}
          <Card>
            <CardHeader>
              <CardTitle>All Discount Tiers at a Glance</CardTitle>
              <CardDescription>
                How the final quote changes across dealer tiers for {row.sku}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th>Tier</th>
                      <th>Multiplier</th>
                      <th>Dealer Pays</th>
                      <th>Discount off List</th>
                      <th>Commission ({(commissionRate * 100).toFixed(0)}%)</th>
                      <th>TableX Profit</th>
                      <th>Net Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tierValues.map((tier) => {
                      const comm = tier.price * commissionRate;
                      const profit = tier.price - comm - totalCost;
                      const margin =
                        tier.price > 0 ? (profit / tier.price) * 100 : 0;
                      return (
                        <tr key={tier.key}>
                          <td className="font-semibold">{tier.label}</td>
                          <td className="font-mono text-slate-500">
                            &times;{tier.factor.toFixed(2)}
                          </td>
                          <td className="font-bold">
                            {formatCurrency(tier.price)}
                          </td>
                          <td className="text-slate-500">
                            {formatCurrency(tier.savings)} (
                            {tier.savingsPercent.toFixed(0)}%)
                          </td>
                          <td className="text-purple-600">
                            ({formatCurrency(comm)})
                          </td>
                          <td
                            className={
                              profit >= 0
                                ? "text-emerald-600 font-bold"
                                : "text-red-600 font-bold"
                            }
                          >
                            {formatCurrency(profit)}
                          </td>
                          <td>
                            <Badge
                              variant={
                                margin >= 20
                                  ? "success"
                                  : margin >= 10
                                    ? "warning"
                                    : "error"
                              }
                            >
                              {margin.toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
