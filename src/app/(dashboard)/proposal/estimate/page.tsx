"use client";

import {
  PROJECT_PHASES,
  WORKSTREAMS,
  TOTAL_HOURS,
  TOTAL_COST,
  AVG_HOURLY_RATE,
  TOTAL_WEEKS,
  getWorkstreamPhaseHours,
  getWorkstreamPhaseCost,
  getWorkstreamHours,
  getWorkstreamCost,
  getPhaseHours,
  getPhaseCost,
} from "@/data/project-phase2";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { DollarSign, Clock, Calendar, Gauge } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Summary Cards ──────────────────────────────────────────────────────────

const stats = [
  {
    label: "Total Project Cost",
    value: formatCurrency(TOTAL_COST),
    icon: DollarSign,
    color: "text-green-600 bg-green-50",
  },
  {
    label: "Average Hourly Rate",
    value: formatCurrency(AVG_HOURLY_RATE),
    icon: Gauge,
    color: "text-purple-600 bg-purple-50",
  },
  {
    label: "Total Weeks",
    value: `${TOTAL_WEEKS}`,
    icon: Calendar,
    color: "text-blue-600 bg-blue-50",
  },
  {
    label: "Total Hours",
    value: `${formatNumber(TOTAL_HOURS)} hrs`,
    icon: Clock,
    color: "text-amber-600 bg-amber-50",
  },
];

// ─── Donut Chart Data ───────────────────────────────────────────────────────

const pieData = WORKSTREAMS.map((ws) => ({
  name: ws.name,
  value: getWorkstreamCost(ws.id),
  color: ws.color,
}));

function CostTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md text-sm">
      <p className="font-medium" style={{ color: d.payload.color }}>
        {d.name}
      </p>
      <p className="text-gray-600">{formatCurrency(d.value)}</p>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function EstimatePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Phase 2 — Estimate
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Cost breakdown by workstream and project phase
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={cn("rounded-lg p-2", s.color)}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {s.label}
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  {s.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Matrix Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Workstream
              </th>
              {PROJECT_PHASES.map((phase) => (
                <th
                  key={phase.id}
                  className="px-4 py-3 text-right font-semibold text-gray-700"
                >
                  {phase.name}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-semibold text-gray-900 bg-gray-100">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {WORKSTREAMS.map((ws, i) => {
              const wsHours = getWorkstreamHours(ws.id);
              const wsCost = getWorkstreamCost(ws.id);
              return (
                <tr
                  key={ws.id}
                  className={cn(
                    "border-b border-gray-100",
                    i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: ws.color }}
                      />
                      <span className="font-medium text-gray-900">
                        {ws.name}
                      </span>
                    </div>
                  </td>
                  {PROJECT_PHASES.map((phase) => {
                    const hrs = getWorkstreamPhaseHours(ws.id, phase.id);
                    const cost = getWorkstreamPhaseCost(ws.id, phase.id);
                    return (
                      <td
                        key={phase.id}
                        className="px-4 py-3 text-right"
                      >
                        {hrs === 0 ? (
                          <span className="text-gray-300">&mdash;</span>
                        ) : (
                          <div>
                            <span className="text-gray-900">
                              {formatCurrency(cost)}
                            </span>
                            <br />
                            <span className="text-xs text-gray-400">
                              {hrs} hrs
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right bg-gray-50 font-medium">
                    <span className="text-gray-900">
                      {formatCurrency(wsCost)}
                    </span>
                    <br />
                    <span className="text-xs text-gray-500">
                      {wsHours} hrs
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
              <td className="px-4 py-3 text-gray-900">Total</td>
              {PROJECT_PHASES.map((phase) => {
                const hrs = getPhaseHours(phase.id);
                const cost = getPhaseCost(phase.id);
                return (
                  <td key={phase.id} className="px-4 py-3 text-right">
                    <span className="text-gray-900">
                      {formatCurrency(cost)}
                    </span>
                    <br />
                    <span className="text-xs text-gray-500">
                      {hrs} hrs
                    </span>
                  </td>
                );
              })}
              <td className="px-4 py-3 text-right bg-gray-100">
                <span className="text-gray-900">
                  {formatCurrency(TOTAL_COST)}
                </span>
                <br />
                <span className="text-xs text-gray-500">
                  {formatNumber(TOTAL_HOURS)} hrs
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Cost by Workstream Donut Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Cost by Workstream
        </h2>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="w-full lg:w-1/2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CostTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full lg:w-1/2 grid grid-cols-2 gap-3">
            {pieData.map((entry) => (
              <div
                key={entry.name}
                className="flex items-center gap-2 text-sm"
              >
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-600">{entry.name}</span>
                <span className="ml-auto font-medium text-gray-900">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
