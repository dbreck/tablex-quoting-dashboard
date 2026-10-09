"use client";

import { useMemo } from "react";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FIN_MILESTONES } from "@/lib/fin/types";
import {
  EMPTY_SITE,
  LAUNCH_MONTH,
  count,
  money,
  monthKey,
  monthLabel,
  pct,
  pipelineByMonth,
  ratio,
  siteFunnel,
  type FinancialsData,
  type FunnelRow,
} from "../_lib/aggregate";
import { AXIS, COLORS, EmptyState, GRID, Panel, StatTile, Table, TOOLTIP_STYLE, countTick } from "../_lib/charts";

const STAGES = [
  { key: "created", label: "Created" },
  { key: "submitted", label: "Submitted" },
  { key: "quoted", label: "Quoted" },
  { key: "accepted", label: "Accepted" },
] as const;

const KIND_LABEL: Record<string, string> = { portal: "Portal quotes (dealer / rep)", self: "Self-quotes (public)" };

function Funnel({ row }: { row: FunnelRow }) {
  const top = row.created;
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-gray-900">{KIND_LABEL[row.kind] ?? row.kind}</p>
      <div className="space-y-1.5">
        {STAGES.map((s) => {
          const n = row[s.key];
          const share = ratio(n, top);
          return (
            <div key={s.key} className="flex items-center gap-3 text-xs">
              <span className="w-20 shrink-0 text-gray-500">{s.label}</span>
              <div className="h-5 flex-1 rounded bg-gray-100">
                <div className="h-5 rounded bg-[#8dc63f]" style={{ width: `${share === null ? 0 : Math.max(share * 100, n > 0 ? 2 : 0)}%` }} />
              </div>
              <span className="w-24 shrink-0 text-right tabular-nums text-gray-700">
                {count(n)} <span className="text-gray-400">{s.key === "created" ? "" : pct(share, 0)}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function QuotePipelineView({ data }: { data: FinancialsData }) {
  const { queueMonthly, webRequestsMonthly, siteQuotesMonthly, queueRows } = data;
  const series = useMemo(() => pipelineByMonth(queueMonthly, webRequestsMonthly), [queueMonthly, webRequestsMonthly]);
  const funnel = useMemo(() => siteFunnel(siteQuotesMonthly), [siteQuotesMonthly]);
  const postLaunchMonths = useMemo(
    () => siteQuotesMonthly.filter((r) => monthKey(r.month) >= LAUNCH_MONTH).sort((a, b) => a.month.localeCompare(b.month)),
    [siteQuotesMonthly],
  );

  const totals = funnel.reduce(
    (acc, r) => ({ created: acc.created + r.created, accepted: acc.accepted + r.accepted, net: acc.net + r.acceptedNetCents }),
    { created: 0, accepted: 0, net: 0 },
  );
  const launchKey = monthKey(FIN_MILESTONES.siteLaunch);
  const hasLaunch = series.some((p) => p.key === launchKey);
  const hasUnlabeled = series.some((p) => p.unlabeled > 0);

  return (
    <div className="space-y-6">
      <Panel
        title="Pre-launch demand: desk quote queue + web requests"
        caption={
          <>
            Bars = the desk&apos;s quote-queue spreadsheet ({count(queueRows)} rows). Column C holds “QUOTE # / EMAIL QUOTE / SO #”: values
            that start with PO/SO or carry “SO” plus a number count as orders; blanks, “-” and “NONE” are unlabeled; everything else
            (quote numbers, “Email Quote”) counts as a quote. Lines = web quote requests: old-site Gravity Forms (gf) and new-site
            quote requests (qr).
          </>
        }
      >
        {series.length === 0 ? (
          <EmptyState message="No quote-queue rows or web requests yet — run scripts/fin/site-snapshot.ts" />
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={series} margin={{ top: 20, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="key" tickFormatter={(k) => monthLabel(String(k))} tick={AXIS} minTickGap={24} />
                <YAxis tickFormatter={countTick} allowDecimals={false} tick={AXIS} width={40} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(k) => monthLabel(String(k))} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="quotes" name="Queue: quotes" stackId="q" fill={COLORS[1]} />
                <Bar dataKey="orders" name="Queue: orders (PO/SO)" stackId="q" fill={COLORS[0]} />
                {hasUnlabeled && <Bar dataKey="unlabeled" name="Queue: unlabeled" stackId="q" fill={COLORS[10]} />}
                <Line type="monotone" dataKey="gf" name="Web requests: Gravity Forms" stroke={COLORS[3]} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="qr" name="Web requests: tablex.com" stroke={COLORS[4]} strokeWidth={2} dot={false} />
                {hasLaunch && (
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
        )}
      </Panel>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Site quotes created" value={count(totals.created)} sub={`Since ${monthLabel(LAUNCH_MONTH)}`} />
        <StatTile label="Site quotes accepted" value={count(totals.accepted)} sub={`${pct(ratio(totals.accepted, totals.created))} of created`} />
        <StatTile label="Accepted net $" value={money(totals.net)} sub="Net subtotal of accepted site quotes" />
        <StatTile
          label="Avg accepted quote"
          value={totals.accepted === 0 ? "—" : money(totals.net / totals.accepted)}
          sub="Net subtotal ÷ accepted"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Post-launch funnel" caption={`tablex.com quotes created since ${monthLabel(LAUNCH_MONTH)}, by stage reached. Percentages are of created.`}>
          {funnel.length === 0 ? (
            <EmptyState message={EMPTY_SITE} />
          ) : (
            <div className="space-y-5">
              {funnel.map((r) => (
                <Funnel key={r.kind} row={r} />
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Site quotes by month" caption="From the tablex-site snapshot, grouped by quote kind and pricing source.">
          {postLaunchMonths.length === 0 ? (
            <EmptyState message={EMPTY_SITE} />
          ) : (
            <Table
              head={
                <tr>
                  <th className="py-2 pr-3 font-medium">Month</th>
                  <th className="py-2 pr-3 font-medium">Kind</th>
                  <th className="py-2 pr-3 font-medium">Priced</th>
                  <th className="py-2 pr-3 text-right font-medium">Created</th>
                  <th className="py-2 pr-3 text-right font-medium">Submitted</th>
                  <th className="py-2 pr-3 text-right font-medium">Quoted</th>
                  <th className="py-2 pr-3 text-right font-medium">Accepted</th>
                  <th className="py-2 text-right font-medium">Accepted net</th>
                </tr>
              }
            >
              {postLaunchMonths.map((r) => (
                <tr key={`${r.month}|${r.kind}|${r.priced_source}`} className="tabular-nums">
                  <td className="py-1.5 pr-3">{monthLabel(monthKey(r.month))}</td>
                  <td className="py-1.5 pr-3">{r.kind ?? "—"}</td>
                  <td className="py-1.5 pr-3">{r.priced_source ?? "—"}</td>
                  <td className="py-1.5 pr-3 text-right">{count(Number(r.created))}</td>
                  <td className="py-1.5 pr-3 text-right">{count(Number(r.submitted))}</td>
                  <td className="py-1.5 pr-3 text-right">{count(Number(r.quoted))}</td>
                  <td className="py-1.5 pr-3 text-right">{count(Number(r.accepted))}</td>
                  <td className="py-1.5 text-right">{money(Number(r.accepted_net_cents ?? 0))}</td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>
      </div>
    </div>
  );
}
