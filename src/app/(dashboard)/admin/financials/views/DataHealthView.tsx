"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FIN_MILESTONES } from "@/lib/fin/types";
import {
  EMPTY_XERO,
  PART_KINDS,
  RECON_EXPECTED,
  compactMoney,
  count,
  money,
  parseHistogram,
  parseTotals,
  pct,
  shortDate,
  type FinancialsData,
} from "../_lib/aggregate";
import { AXIS, Banner, COLORS, EmptyState, GRID, Panel, Table, TOOLTIP_STYLE, countTick } from "../_lib/charts";
import { cn } from "@/lib/utils";

function formatSyncedAt(ts: string | null): string {
  if (!ts) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(ts));
}

function ReconRow({ label, actual, expected }: { label: string; actual: { count: number; cents: number }; expected: { count: number; cents: number } }) {
  const countOk = actual.count === expected.count;
  const centsOk = actual.cents === expected.cents;
  return (
    <tr className="tabular-nums">
      <td className="py-2 pr-3 font-medium text-gray-900">{label}</td>
      <td className="py-2 pr-3 text-right">{count(actual.count)}</td>
      <td className="py-2 pr-3 text-right">{money(actual.cents)}</td>
      <td className="py-2 pr-3 text-right text-gray-500">{count(expected.count)}</td>
      <td className="py-2 pr-3 text-right text-gray-500">{money(expected.cents)}</td>
      <td className={cn("py-2 text-right font-medium", countOk && centsOk ? "text-emerald-700" : "text-amber-700")}>
        {countOk && centsOk
          ? "Matches"
          : `${actual.count - expected.count >= 0 ? "+" : ""}${count(actual.count - expected.count)} inv · ${
              actual.cents - expected.cents >= 0 ? "+" : "−"
            }${money(Math.abs(actual.cents - expected.cents))}`}
      </td>
    </tr>
  );
}

export default function DataHealthView({ data }: { data: FinancialsData }) {
  const { sources, parseHealth, paidTotals, errors } = data;
  const histogram = useMemo(() => parseHistogram(parseHealth), [parseHealth]);
  const confTotals = useMemo(() => parseTotals(parseHealth), [parseHealth]);
  const yearActual = paidTotals.byYear[RECON_EXPECTED.year] ?? { count: 0, cents: 0 };

  return (
    <div className="space-y-6">
      <Banner>
        No Xero invoice detail after {shortDate(FIN_MILESTONES.xeroDetailCutoff)}. April 2026 onward is shown from Xero P&amp;L journal
        totals, so customer, series and size breakdowns stop at March 2026.
      </Banner>

      {errors.length > 0 && (
        <Banner tone="rose">
          <p className="font-semibold">Some datasets failed to load</p>
          <ul className="mt-1 list-disc pl-4">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Banner>
      )}

      <Panel title="Sources" caption="One row per sync source written by scripts/fin/*.">
        {sources.length === 0 ? (
          <EmptyState message={EMPTY_XERO} />
        ) : (
          <Table
            head={
              <tr>
                <th className="py-2 pr-3 font-medium">Source</th>
                <th className="py-2 pr-3 font-medium">Coverage</th>
                <th className="py-2 pr-3 font-medium">Last sync (ET)</th>
                <th className="py-2 pr-3 text-right font-medium">Rows</th>
                <th className="py-2 font-medium">Notes</th>
              </tr>
            }
          >
            {sources.map((s) => (
              <tr key={s.source}>
                <td className="py-2 pr-3 font-medium text-gray-900">{s.source}</td>
                <td className="py-2 pr-3 whitespace-nowrap">
                  {s.coverage_from || s.coverage_to ? `${shortDate(s.coverage_from)} – ${shortDate(s.coverage_to)}` : "—"}
                </td>
                <td className="py-2 pr-3 whitespace-nowrap">{formatSyncedAt(s.last_synced_at)}</td>
                <td className="py-2 pr-3 text-right tabular-nums">{s.row_count === null ? "—" : count(Number(s.row_count))}</td>
                <td className="py-2 text-gray-500">{s.notes ?? ""}</td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Invoice-line parse confidence" caption="Lines per parser confidence level, split by line type.">
          {parseHealth.length === 0 ? (
            <EmptyState message={EMPTY_XERO} />
          ) : (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={histogram} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke={GRID} vertical={false} />
                    <XAxis dataKey="confidence" tick={AXIS} />
                    <YAxis tickFormatter={countTick} tick={AXIS} width={48} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {PART_KINDS.map((k, i) => (
                      <Bar key={k} dataKey={k} name={k} stackId="c" fill={COLORS[i]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Table
                head={
                  <tr>
                    <th className="py-2 pr-3 font-medium">Confidence</th>
                    <th className="py-2 pr-3 text-right font-medium">Lines</th>
                    <th className="py-2 pr-3 text-right font-medium">Share</th>
                    <th className="py-2 text-right font-medium">Amount</th>
                  </tr>
                }
              >
                {confTotals.map((c) => (
                  <tr key={c.confidence} className="tabular-nums">
                    <td className="py-1.5 pr-3">{c.confidence}</td>
                    <td className="py-1.5 pr-3 text-right">{count(c.lines)}</td>
                    <td className="py-1.5 pr-3 text-right">{pct(c.share)}</td>
                    <td className="py-1.5 text-right">{compactMoney(c.cents)}</td>
                  </tr>
                ))}
              </Table>
            </>
          )}
        </Panel>

        <Panel
          title="Reconciliation: PAID invoices"
          caption="Imported PAID invoices against the totals expected from Xero. A mismatch means the pull is incomplete or statuses changed since the targets were taken."
        >
          {paidTotals.allTime.count === 0 ? (
            <EmptyState message={EMPTY_XERO} />
          ) : (
            <Table
              head={
                <tr>
                  <th className="py-2 pr-3 font-medium">Span</th>
                  <th className="py-2 pr-3 text-right font-medium">Count</th>
                  <th className="py-2 pr-3 text-right font-medium">Total</th>
                  <th className="py-2 pr-3 text-right font-medium">Expected #</th>
                  <th className="py-2 pr-3 text-right font-medium">Expected $</th>
                  <th className="py-2 text-right font-medium">Result</th>
                </tr>
              }
            >
              <ReconRow label="All-time" actual={paidTotals.allTime} expected={RECON_EXPECTED.allTime} />
              <ReconRow label={String(RECON_EXPECTED.year)} actual={yearActual} expected={RECON_EXPECTED.yearTotals} />
            </Table>
          )}
        </Panel>
      </div>
    </div>
  );
}
