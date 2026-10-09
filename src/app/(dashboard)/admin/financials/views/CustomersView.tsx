"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDown, ArrowUp } from "lucide-react";
import {
  CHURN_SINCE,
  CHURN_YEAR,
  EMPTY_XERO,
  YOY_YEAR,
  compactMoney,
  concentration,
  count,
  money,
  pct,
  rollupCustomers,
  shortDate,
  type CustomerAgg,
  type FinancialsData,
} from "../_lib/aggregate";
import { AXIS, COLORS, Chip, EmptyState, GRID, Panel, Segmented, StatTile, TOOLTIP_STYLE } from "../_lib/charts";

const TOP_N = [
  { id: "25", label: "Top 25" },
  { id: "50", label: "Top 50" },
  { id: "100", label: "Top 100" },
  { id: "all", label: "All" },
] as const;
type TopN = (typeof TOP_N)[number]["id"];

export default function CustomersView({ data }: { data: FinancialsData }) {
  const { customerYears } = data;
  const { customers, years } = useMemo(() => rollupCustomers(customerYears), [customerYears]);
  const conc = useMemo(() => concentration(customers), [customers]);

  const [topN, setTopN] = useState<TopN>("50");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "allTime", desc: true }]);

  // Top-N is by all-time revenue (independent of the current sort), then searched.
  const visible = useMemo(() => (topN === "all" ? customers : customers.slice(0, Number(topN))), [customers, topN]);

  const columns = useMemo<ColumnDef<CustomerAgg>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Customer",
        cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.name}</span>,
      },
      ...years.map<ColumnDef<CustomerAgg>>((y) => ({
        id: `y${y}`,
        header: String(y),
        accessorFn: (c) => c.byYear[y] ?? 0,
        cell: ({ getValue }) => {
          const v = Number(getValue());
          return v === 0 ? <span className="text-gray-300">—</span> : compactMoney(v);
        },
        meta: { numeric: true },
      })),
      {
        id: "allTime",
        accessorKey: "allTime",
        header: "All-time",
        cell: ({ getValue }) => <span className="font-semibold text-gray-900">{money(Number(getValue()))}</span>,
        meta: { numeric: true },
      },
      { id: "invoices", accessorKey: "invoices", header: "Invoices", cell: ({ getValue }) => count(Number(getValue())), meta: { numeric: true } },
      {
        id: "lastInvoice",
        accessorFn: (c) => c.lastInvoice ?? "",
        header: "Last invoice",
        cell: ({ row }) => shortDate(row.original.lastInvoice),
      },
      {
        id: "yoy",
        accessorFn: (c) => c.yoy ?? -Infinity,
        header: `YoY ${YOY_YEAR} vs ${YOY_YEAR - 1}`,
        cell: ({ row }) => {
          const r = row.original.yoy;
          if (r === null) return <span className="text-gray-400">{(row.original.byYear[YOY_YEAR] ?? 0) > 0 ? "New" : "—"}</span>;
          return <span className={r >= 0 ? "text-emerald-700" : "text-rose-700"}>{`${r >= 0 ? "+" : ""}${pct(r, 0)}`}</span>;
        },
        meta: { numeric: true },
      },
      {
        id: "site",
        accessorFn: (c) => (c.onSite ? 1 : 0),
        header: "Site",
        cell: ({ row }) =>
          row.original.onSite ? <Chip tone="green">On site · {row.original.siteOrgType}</Chip> : <Chip>Not linked</Chip>,
      },
    ],
    [years],
  );

  // TanStack Table returns non-memoizable functions; the React Compiler skips this component.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: visible,
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    globalFilterFn: (row, _col, value) => row.original.name.toLowerCase().includes(String(value).toLowerCase()),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (customerYears.length === 0) return <EmptyState message={EMPTY_XERO} />;

  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Top-10 share of all-time revenue" value={pct(conc.top10Share)} sub={`of ${compactMoney(conc.total)} across ${count(customers.length)} customers`} />
        <StatTile label={`Customers active in ${YOY_YEAR}`} value={count(conc.activeInYoyYear)} sub="At least one invoice that year" />
        <StatTile
          label="Churned"
          value={count(conc.churned)}
          sub={`Bought in ${CHURN_YEAR}, no invoice since ${shortDate(CHURN_SINCE)} (detail ends Mar 31, 2026)`}
        />
        <StatTile label="Customers all-time" value={count(customers.length)} sub="With an authorised or paid invoice" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Revenue concentration (Pareto)" caption="Cumulative share of all-time revenue against the share of customers, largest first.">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conc.pareto} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid stroke={GRID} />
                <XAxis
                  dataKey="rank"
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${Math.round(Number(v))}%`}
                  tick={AXIS}
                  label={{ value: "Share of customers", position: "insideBottom", offset: -4, fontSize: 11, fill: "#64748b" }}
                />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={AXIS} width={40} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelFormatter={(v) => `Top ${Number(v).toFixed(1)}% of customers`}
                  formatter={(v) => [`${Number(v).toFixed(1)}%`, "Share of revenue"]}
                />
                <Line type="monotone" dataKey="share" stroke={COLORS[1]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="New customers per year" caption="Year of each customer's first authorised or paid invoice in Xero (detail starts Oct 2020).">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conc.newPerYear} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="year" tick={AXIS} />
                <YAxis allowDecimals={false} tick={AXIS} width={40} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="customers" name="New customers" fill={COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel
        title="Customers"
        caption="Totals are authorised + paid invoice totals by year. Top-N ranks by all-time revenue; column headers sort."
        right={
          <div className="flex items-center gap-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers"
              className="h-8 w-48 rounded-md border border-gray-200 px-2.5 text-xs focus:border-gray-400 focus:outline-none"
            />
            <Segmented options={TOP_N} value={topN} onChange={setTopN} />
          </div>
        }
      >
        <div className="max-h-[640px] overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10 bg-white text-gray-500">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-gray-200">
                  {hg.headers.map((h) => {
                    const numeric = (h.column.columnDef.meta as { numeric?: boolean } | undefined)?.numeric;
                    const sorted = h.column.getIsSorted();
                    return (
                      <th key={h.id} className={`whitespace-nowrap py-2 pr-3 font-medium ${numeric ? "text-right" : "text-left"}`}>
                        <button
                          type="button"
                          onClick={h.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 hover:text-gray-900"
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {sorted === "asc" && <ArrowUp className="h-3 w-3" />}
                          {sorted === "desc" && <ArrowDown className="h-3 w-3" />}
                        </button>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-6 text-center text-gray-400">
                    No customers match “{search}”.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="tabular-nums hover:bg-gray-50">
                    {r.getVisibleCells().map((c) => {
                      const numeric = (c.column.columnDef.meta as { numeric?: boolean } | undefined)?.numeric;
                      return (
                        <td key={c.id} className={`whitespace-nowrap py-1.5 pr-3 ${numeric ? "text-right" : ""}`}>
                          {flexRender(c.column.columnDef.cell, c.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Showing {count(rows.length)} of {count(customers.length)} customers.
        </p>
      </Panel>
    </div>
  );
}
