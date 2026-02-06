"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buildWaterfallData, discountTierLabels } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { DollarSign, TrendingUp, Layers } from "lucide-react";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface ProfitRow {
  [key: string]: string | number | null | undefined;
  tag: string;
  qty: number | null;
  sku: string;
  series: string;
  topCost: number | null;
  routeCost: number | null;
  baseCost: number | null;
  nestFoldCost: number | null;
  asbGnLcCost1: number | null;
  asbGnLcCost2: number | null;
  assemblyCost: number | null;
  lfCost: number | null;
  freightInCost: number | null;
  packagingCost: number | null;
  totalCost: number | null;
  freightOutPct: number | null;
  gpm: number | null;
  commission: number | null;
  standardPrice: number | null;
  netProfit: number | null;
  listPrice: number | null;
  discountFactor: number | null;
  netPrice: number | null;
  newNetProfit: number | null;
  notes: string;
  price_50_20: number | null;
  price_50_20_5: number | null;
  price_50_20_10: number | null;
  price_50_20_15: number | null;
  price_50_20_20: number | null;
}

interface PricingClientProps {
  profitData: ProfitRow[];
}

export default function PricingClient({ profitData }: PricingClientProps) {
  const [selectedSku, setSelectedSku] = useState<string>(
    profitData[0]?.sku || ""
  );

  const selectedRow = useMemo(
    () => profitData.find((r) => r.sku === selectedSku) || profitData[0],
    [profitData, selectedSku]
  );

  const waterfallData = useMemo(() => {
    if (!selectedRow) return [];
    return buildWaterfallData(selectedRow as ProfitRow);
  }, [selectedRow]);

  // GPM distribution for histogram
  const gpmValues = useMemo(
    () => profitData.map((r) => (r.gpm || 0) * 100).filter((v) => v > 0 && v < 100),
    [profitData]
  );

  // Discount tier comparison for selected product
  const tierData = useMemo(() => {
    if (!selectedRow) return [];
    return discountTierLabels.map((tier) => ({
      tier: tier.label,
      price: (selectedRow as Record<string, unknown>)[tier.key] as number || 0,
      savings: (selectedRow.listPrice || 0) - ((selectedRow as Record<string, unknown>)[tier.key] as number || 0),
    }));
  }, [selectedRow]);

  // Plotly waterfall trace
  const plotlyData = useMemo(() => {
    const measures = waterfallData.map((item) =>
      item.type === "total" ? "total" : "relative"
    );
    const values = waterfallData.map((item) =>
      item.type === "total" ? item.value : item.value
    );
    const colors = waterfallData.map((item) => {
      switch (item.type) {
        case "cost": return "#ef4444";
        case "markup": return "#8dc63f";
        case "discount": return "#f59e0b";
        case "total": return "#1a3c5c";
        case "profit": return "#10b981";
        default: return "#94a3b8";
      }
    });

    return [{
      type: "waterfall" as const,
      orientation: "v" as const,
      measure: measures,
      x: waterfallData.map((item) => item.name),
      y: values,
      connector: { line: { color: "#e2e8f0" } },
      decreasing: { marker: { color: "#f59e0b" } },
      increasing: { marker: { color: "#8dc63f" } },
      totals: { marker: { color: "#1a3c5c" } },
      textposition: "outside" as const,
      text: waterfallData.map((item) => formatCurrency(Math.abs(item.value))),
      textfont: { size: 10 },
    }];
  }, [waterfallData]);

  const plotlyLayout = useMemo(() => ({
    height: 400,
    margin: { t: 20, b: 80, l: 60, r: 20 },
    font: { family: "DM Sans, system-ui, sans-serif" },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    xaxis: { tickangle: -45 },
    yaxis: { title: { text: "USD" }, gridcolor: "#f1f5f9" },
    showlegend: false,
  }), []);

  return (
    <div>
      <Header
        title="Pricing Waterfall"
        subtitle="Cost breakdown, margin analysis, and discount tier comparison"
      />

      {/* Product selector */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700 shrink-0">Select Product:</label>
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="flex h-10 w-full max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green"
            >
              {profitData.map((r) => (
                <option key={r.sku} value={r.sku}>
                  {r.sku} — List: {formatCurrency(r.listPrice || 0)} | GPM: {((r.gpm || 0) * 100).toFixed(0)}%
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      {selectedRow && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 stagger">
          <Card hover className="stat-card animate-slide-up">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
                  <DollarSign className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Total Cost</p>
                  <p className="text-xl font-bold text-slate-900">{formatCurrency(selectedRow.totalCost || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card hover className="stat-card animate-slide-up">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-green/10">
                  <Layers className="h-5 w-5 text-brand-green" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">List Price</p>
                  <p className="text-xl font-bold text-slate-900">{formatCurrency(selectedRow.listPrice || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card hover className="stat-card animate-slide-up">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">GPM</p>
                  <p className="text-xl font-bold text-slate-900">{((selectedRow.gpm || 0) * 100).toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Waterfall Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Price Waterfall</CardTitle>
            <CardDescription>From component costs through to net profit</CardDescription>
          </CardHeader>
          <CardContent>
            {typeof window !== "undefined" && (
              <Plot
                data={plotlyData}
                layout={plotlyLayout}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: "100%", height: "400px" }}
              />
            )}
          </CardContent>
        </Card>

        {/* Discount Tier Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Discount Tier Comparison</CardTitle>
            <CardDescription>Net prices across all 5 discount tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={tierData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="tier" width={80} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                />
                <Legend />
                <Bar dataKey="price" name="Net Price" radius={[0, 4, 4, 0]}>
                  {tierData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? "#8dc63f" : i < 3 ? "#6fa832" : "#1a3c5c"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* GPM Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Margin Distribution</CardTitle>
          <CardDescription>GPM spread across {profitData.length} products in the ProfitAnalysis sheet</CardDescription>
        </CardHeader>
        <CardContent>
          {typeof window !== "undefined" && (
            <Plot
              data={[{
                type: "histogram" as const,
                x: gpmValues,
                nbinsx: 30,
                marker: { color: "#8dc63f", line: { color: "#6fa832", width: 1 } },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any]}
              layout={{
                height: 300,
                margin: { t: 20, b: 40, l: 60, r: 20 },
                font: { family: "DM Sans, system-ui, sans-serif" },
                paper_bgcolor: "transparent",
                plot_bgcolor: "transparent",
                xaxis: { title: { text: "GPM (%)" }, gridcolor: "#f1f5f9" },
                yaxis: { title: { text: "Product Count" }, gridcolor: "#f1f5f9" },
                bargap: 0.05,
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: "100%", height: "300px" }}
            />
          )}
          <div className="mt-4 flex items-center gap-6">
            <div>
              <p className="text-xs text-slate-500">Average GPM</p>
              <p className="text-lg font-bold text-brand-green">
                {(gpmValues.reduce((a, b) => a + b, 0) / gpmValues.length).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Median GPM</p>
              <p className="text-lg font-bold text-slate-900">
                {gpmValues.sort((a, b) => a - b)[Math.floor(gpmValues.length / 2)]?.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Products Analyzed</p>
              <p className="text-lg font-bold text-slate-900">{profitData.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
