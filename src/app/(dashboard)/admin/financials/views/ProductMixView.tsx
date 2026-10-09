"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  EMPTY_XERO,
  PART_KINDS,
  compactMoney,
  count,
  monthLabel,
  partKindByYear,
  replacementsByYear,
  seriesStack,
  shapeLabel,
  specialsShare,
  topSizes,
  type FinancialsData,
} from "../_lib/aggregate";
import { AXIS, COLORS, EmptyState, GRID, Panel, Table, TOOLTIP_STYLE, dollarsTick, dollarsTip } from "../_lib/charts";

const KIND_LABEL: Record<string, string> = {
  table: "Table",
  base: "Base",
  top: "Top",
  accessory: "Accessory",
  freight: "Freight",
  discount: "Discount",
  other: "Other",
};

function fmtIn(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export default function ProductMixView({ data }: { data: FinancialsData }) {
  const { seriesMonths, sizeMix } = data;
  const stack = useMemo(() => seriesStack(seriesMonths, 8), [seriesMonths]);
  const kinds = useMemo(() => partKindByYear(seriesMonths), [seriesMonths]);
  const specials = useMemo(() => specialsShare(seriesMonths), [seriesMonths]);
  const repl = useMemo(() => replacementsByYear(seriesMonths), [seriesMonths]);
  const sizes = useMemo(() => topSizes(sizeMix, 15), [sizeMix]);

  if (seriesMonths.length === 0) return <EmptyState message={EMPTY_XERO} />;

  return (
    <div className="space-y-6">
      <Panel
        title="Revenue by series"
        caption="Invoice lines with a parsed series code (top 8 series by total, the rest as Other). Lines with no series code, such as freight, are left out. Names come from the 2026 series catalog; unmapped codes show as “Series NN”."
      >
        {stack.keys.length === 0 ? (
          <EmptyState message="No invoice lines carry a parsed series code yet." />
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stack.points} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="key" tickFormatter={(k) => monthLabel(String(k))} tick={AXIS} minTickGap={24} />
                <YAxis tickFormatter={dollarsTick} tick={AXIS} width={56} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(k) => monthLabel(String(k))} formatter={(v, name) => [dollarsTip(v), name]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {stack.keys.map((s, i) => (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stackId="series"
                    stroke={s.key === "other" ? COLORS[10] : COLORS[i % 10]}
                    fill={s.key === "other" ? COLORS[10] : COLORS[i % 10]}
                    fillOpacity={0.75}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Revenue by line type per year" caption="Line types come from the invoice-line parser. Discounts are negative.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kinds} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="year" tick={AXIS} />
                <YAxis tickFormatter={dollarsTick} tick={AXIS} width={56} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, name) => [dollarsTip(v), name]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {PART_KINDS.map((k, i) => (
                  <Bar key={k} dataKey={k} name={KIND_LABEL[k]} stackId="kind" fill={COLORS[i]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Specials share of line revenue" caption="Monthly special-line amount ÷ all line amounts (SP- prefix, SPECIAL item code or special height). Months with no positive total are gaps.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={specials} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="key" tickFormatter={(k) => monthLabel(String(k))} tick={AXIS} minTickGap={24} />
                <YAxis tickFormatter={(v) => `${v}%`} tick={AXIS} width={40} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelFormatter={(k) => monthLabel(String(k))}
                  formatter={(v) => [`${Number(v).toFixed(1)}%`, "Specials share"]}
                />
                <Line type="monotone" dataKey="share" stroke={COLORS[3]} strokeWidth={2} dot={false} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Top 15 sizes"
          caption={
            sizes.years.length === 0
              ? "Parsed shape + width × depth from invoice lines."
              : `Parsed shape + width × depth from invoice lines, ${sizes.years.join(" and ")}, ranked by quantity.`
          }
        >
          {sizes.sizes.length === 0 ? (
            <EmptyState message="No invoice lines carry a parsed size yet." />
          ) : (
            <Table
              head={
                <tr>
                  <th className="py-2 pr-3 font-medium">#</th>
                  <th className="py-2 pr-3 font-medium">Shape</th>
                  <th className="py-2 pr-3 font-medium">Size (in)</th>
                  <th className="py-2 pr-3 text-right font-medium">Qty</th>
                  <th className="py-2 pr-3 text-right font-medium">Lines</th>
                  <th className="py-2 text-right font-medium">Revenue</th>
                </tr>
              }
            >
              {sizes.sizes.map((s, i) => (
                <tr key={`${s.shape}|${s.width}|${s.depth ?? ""}`} className="tabular-nums">
                  <td className="py-1.5 pr-3 text-gray-400">{i + 1}</td>
                  <td className="py-1.5 pr-3">{shapeLabel(s.shape)}</td>
                  <td className="py-1.5 pr-3 font-medium text-gray-900">
                    {s.depth === null ? `${fmtIn(s.width)}″` : `${fmtIn(s.width)} × ${fmtIn(s.depth)}`}
                  </td>
                  <td className="py-1.5 pr-3 text-right">{count(s.qty)}</td>
                  <td className="py-1.5 pr-3 text-right">{count(s.lines)}</td>
                  <td className="py-1.5 text-right">{compactMoney(s.cents)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>

        <Panel title="Replacement lines per year" caption="Warranty replacements (-Repl reference, “Replacement”, or $0 with the original model).">
          {repl.length === 0 ? (
            <EmptyState message="No replacement lines found." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={repl} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke={GRID} vertical={false} />
                  <XAxis dataKey="year" tick={AXIS} />
                  <YAxis allowDecimals={false} tick={AXIS} width={40} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="lines" name="Replacement lines" fill={COLORS[4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
