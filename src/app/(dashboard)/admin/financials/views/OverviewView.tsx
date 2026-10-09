"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FIN_MILESTONES } from "@/lib/fin/types";
import {
  EMPTY_XERO,
  compactMoney,
  count,
  money,
  monthKey,
  monthLabel,
  overviewStats,
  pct,
  plByYear,
  revenueByMonth,
  revenueByYear,
  shortDate,
  type FinancialsData,
} from "../_lib/aggregate";
import {
  AXIS,
  COLORS,
  EmptyState,
  GRID,
  HATCH_ID,
  HatchDefs,
  Panel,
  StatTile,
  Table,
  TOOLTIP_STYLE,
  dollarsTick,
  dollarsTip,
} from "../_lib/charts";

export default function OverviewView({ data }: { data: FinancialsData }) {
  const { revenueMonthly, invoiceDays, asOf } = data;
  const monthly = useMemo(() => revenueByMonth(revenueMonthly, asOf), [revenueMonthly, asOf]);
  const yearly = useMemo(() => revenueByYear(revenueMonthly), [revenueMonthly]);
  const pl = useMemo(() => plByYear(revenueMonthly), [revenueMonthly]);
  const stats = useMemo(() => overviewStats(revenueMonthly, invoiceDays, asOf), [revenueMonthly, invoiceDays, asOf]);

  if (revenueMonthly.length === 0) return <EmptyState message={EMPTY_XERO} />;

  const year = asOf.slice(0, 4);
  const cutoffKey = monthKey(FIN_MILESTONES.xeroDetailCutoff);
  const launchKey = monthKey(FIN_MILESTONES.siteLaunch);
  const keys = new Set(monthly.map((m) => m.key));
  const ytdTone = stats.ytd.change === null ? "default" : stats.ytd.change >= 0 ? "up" : "down";

  return (
    <div className="space-y-6">
      <HatchDefs />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatTile
          label="Trailing 12 months revenue"
          value={compactMoney(stats.t12.cents)}
          sub={`${monthLabel(stats.t12.from)} – ${monthLabel(stats.t12.to)} · ${stats.t12.months} mo with data`}
        />
        <StatTile
          label={`${year} YTD vs prior YTD`}
          value={compactMoney(stats.ytd.cents)}
          tone={ytdTone}
          sub={
            <>
              {stats.ytd.change === null ? "No prior-year revenue" : `${stats.ytd.change >= 0 ? "+" : ""}${pct(stats.ytd.change)}`} vs{" "}
              {compactMoney(stats.ytd.priorCents)} to {shortDate(stats.ytd.through).replace(/, \d{4}$/, "")} {Number(year) - 1}
              {stats.ytd.priorPartialFromPl ? " (prior month from P&L)" : ""}
            </>
          }
        />
        <StatTile
          label={`Invoices ${year} YTD`}
          value={count(stats.invoicesYtd.count)}
          sub={stats.invoicesYtd.lastDay ? `Invoice detail through ${shortDate(stats.invoicesYtd.lastDay)}` : "No invoice detail this year"}
        />
        <StatTile
          label="Average invoice"
          value={stats.avgInvoiceCents === null ? "—" : money(stats.avgInvoiceCents)}
          sub={`${year} invoices with detail`}
        />
        <StatTile
          label="Gross margin (T12)"
          value={pct(stats.t12GrossMargin)}
          sub={`(Sales − COGS) ÷ sales, ${stats.t12PlMonths} P&L months`}
        />
        <StatTile
          label="Commissions % of sales (T12)"
          value={pct(stats.t12CommissionShare)}
          sub={`${stats.t12PlMonths} P&L months`}
        />
      </div>

      <Panel
        title="Revenue by month"
        caption="Invoiced months come from Xero invoice detail. Hatched months come from Xero P&L journal totals where invoice detail is not yet available."
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthly} margin={{ top: 20, right: 16, bottom: 0, left: 8 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="key" tickFormatter={(k) => monthLabel(String(k))} tick={AXIS} interval="preserveStartEnd" minTickGap={24} />
              <YAxis tickFormatter={dollarsTick} tick={AXIS} width={56} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelFormatter={(k) => monthLabel(String(k))}
                formatter={(v, name) => [dollarsTip(v), name]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="invoiced" name="Invoiced (Xero detail)" stackId="rev" fill={COLORS[0]} />
              <Bar
                dataKey="pending"
                name="From Xero P&L (invoice detail pending)"
                stackId="rev"
                fill={`url(#${HATCH_ID})`}
                stroke={COLORS[0]}
                strokeWidth={0.5}
              />
              {keys.has(cutoffKey) && (
                <ReferenceLine
                  x={cutoffKey}
                  stroke="#64748b"
                  strokeDasharray="4 4"
                  label={{ value: "Xero detail ends", position: "top", fontSize: 11, fill: "#475569" }}
                />
              )}
              {keys.has(launchKey) && (
                <ReferenceLine
                  x={launchKey}
                  stroke={COLORS[1]}
                  strokeDasharray="4 4"
                  label={{ value: "tablex.com launch", position: "top", fontSize: 11, fill: COLORS[1] }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Revenue by year" caption="Years that include P&L-only months show that portion hatched.">
          {yearly.length === 0 ? (
            <EmptyState message={EMPTY_XERO} />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearly} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                  <CartesianGrid stroke={GRID} vertical={false} />
                  <XAxis dataKey="year" tick={AXIS} />
                  <YAxis tickFormatter={dollarsTick} tick={AXIS} width={56} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, name) => [dollarsTip(v), name]} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="invoiced" name="Invoiced" stackId="y" fill={COLORS[0]} />
                  <Bar dataKey="pending" name="From P&L" stackId="y" fill={`url(#${HATCH_ID})`} stroke={COLORS[0]} strokeWidth={0.5} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel title="P&L by year" caption="Sums of the months that have a Xero P&L row (see Months). Gross margin = (sales − COGS) ÷ sales.">
          {pl.length === 0 ? (
            <EmptyState message={EMPTY_XERO} />
          ) : (
            <Table
              head={
                <tr>
                  <th className="py-2 pr-3 font-medium">Year</th>
                  <th className="py-2 pr-3 text-right font-medium">Months</th>
                  <th className="py-2 pr-3 text-right font-medium">Sales</th>
                  <th className="py-2 pr-3 text-right font-medium">COGS</th>
                  <th className="py-2 pr-3 text-right font-medium">GM%</th>
                  <th className="py-2 pr-3 text-right font-medium">Commissions</th>
                  <th className="py-2 pr-3 text-right font-medium">Spiff</th>
                  <th className="py-2 pr-3 text-right font-medium">Freight in</th>
                  <th className="py-2 pr-3 text-right font-medium">Freight out</th>
                  <th className="py-2 text-right font-medium">Advertising</th>
                </tr>
              }
            >
              {pl.map((y) => (
                <tr key={y.year} className="tabular-nums">
                  <td className="py-2 pr-3 font-medium text-gray-900">{y.year}</td>
                  <td className="py-2 pr-3 text-right">{y.months}</td>
                  <td className="py-2 pr-3 text-right">{compactMoney(y.income)}</td>
                  <td className="py-2 pr-3 text-right">{compactMoney(y.cogs)}</td>
                  <td className="py-2 pr-3 text-right">{pct(y.grossMargin)}</td>
                  <td className="py-2 pr-3 text-right">{compactMoney(y.commissions)}</td>
                  <td className="py-2 pr-3 text-right">{compactMoney(y.spiff)}</td>
                  <td className="py-2 pr-3 text-right">{compactMoney(y.freightIncome)}</td>
                  <td className="py-2 pr-3 text-right">{compactMoney(y.freightExpense)}</td>
                  <td className="py-2 text-right">{compactMoney(y.advertising)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>
      </div>
    </div>
  );
}
