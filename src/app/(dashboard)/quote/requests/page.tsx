"use client";

import { useState, useEffect, useMemo, Fragment, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuoteRequestStore } from "@/store/quote-request-store";
import { useQuoteStore } from "@/store/quote-store";
import { formatDate } from "@/lib/utils";
import type { QuoteRequest, QuoteRequestStatus } from "@/types/quote-builder";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Inbox,
  X,
  ChevronsLeft,
  ChevronsRight,
  ArrowRightLeft,
} from "lucide-react";

// ---------- Constants ----------

const STATUS_CONFIG: Record<
  QuoteRequestStatus,
  { label: string; variant: "warning" | "info" | "success" | "secondary" }
> = {
  pending: { label: "Pending", variant: "warning" },
  in_progress: { label: "In Progress", variant: "info" },
  quoted: { label: "Quoted", variant: "success" },
  closed: { label: "Closed", variant: "secondary" },
};

const PAGE_SIZES = [25, 50, 100, 250];

// ---------- Status inline select ----------

function StatusSelect({
  value,
  requestId,
}: {
  value: QuoteRequestStatus;
  requestId: string;
}) {
  const { updateRequestStatus } = useQuoteRequestStore();
  const [updating, setUpdating] = useState(false);

  async function handleChange(newStatus: string) {
    setUpdating(true);
    try {
      await updateRequestStatus(requestId, newStatus as QuoteRequestStatus);
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={updating}>
      <SelectTrigger className="h-8 w-[130px] text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(STATUS_CONFIG) as QuoteRequestStatus[]).map((s) => (
          <SelectItem key={s} value={s}>
            {STATUS_CONFIG[s].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ---------- Filter pill ----------

function FilterPill({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <button
      onClick={onClear}
      className="inline-flex items-center gap-1 rounded-full bg-brand-green/10 text-brand-green px-2 py-0.5 text-xs font-medium hover:bg-brand-green/20 transition-colors cursor-pointer"
    >
      {label}
      <X className="h-3 w-3" />
    </button>
  );
}

// ---------- Linked Quote Badge ----------

function LinkedQuoteBadge({ quoteId }: { quoteId?: string }) {
  const { quotes } = useQuoteStore();
  if (!quoteId) return null;
  const quote = quotes.find((q) => q.id === quoteId);
  const label = quote?.quoteNumber || "Quote";
  return (
    <Link
      href={`/quote/${quoteId}`}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 text-[11px] text-brand-green hover:underline font-medium ml-2"
      title={`Linked to ${label}`}
    >
      <ArrowRightLeft className="h-3 w-3" />
      {label}
    </Link>
  );
}

// ---------- Columns ----------

const columnHelper = createColumnHelper<QuoteRequest>();

const columns = [
  columnHelper.accessor("requestNumber", {
    header: "Request #",
    cell: (info) => {
      const val = info.getValue();
      const isGf = val.startsWith("GF-");
      const quoteId = info.row.original.quoteId;
      return (
        <span className="inline-flex items-center">
          <span className={`font-mono text-sm ${isGf ? "text-slate-400" : "text-brand-navy font-semibold"}`}>
            {val}
          </span>
          <LinkedQuoteBadge quoteId={quoteId} />
        </span>
      );
    },
    size: 160,
  }),
  columnHelper.accessor(
    (row) => `${row.contactFirstName} ${row.contactLastName}`,
    {
      id: "contactName",
      header: "Contact",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div>
            <p className="font-medium text-sm">{info.getValue()}</p>
            {row.contactCompany && (
              <p className="text-xs text-slate-500 truncate max-w-[200px]">
                {row.contactCompany}
              </p>
            )}
          </div>
        );
      },
      size: 180,
    }
  ),
  columnHelper.accessor("seriesName", {
    header: "Series",
    cell: (info) => (
      <Badge variant="secondary" className="text-xs">
        {info.getValue()}
      </Badge>
    ),
    size: 110,
  }),
  columnHelper.accessor("baseFinish", {
    header: "Finish",
    cell: (info) => {
      const val = info.getValue();
      return val ? (
        <span className="text-sm">{val}</span>
      ) : (
        <span className="text-slate-300">—</span>
      );
    },
    size: 110,
  }),
  columnHelper.accessor("quantity", {
    header: "Qty",
    cell: (info) => (
      <span className="text-sm font-medium tabular-nums">{info.getValue()}</span>
    ),
    size: 60,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <StatusSelect value={info.getValue()} requestId={info.row.original.id} />
    ),
    size: 140,
  }),
  columnHelper.accessor("createdAt", {
    header: "Date",
    cell: (info) => (
      <span className="text-sm text-slate-500 tabular-nums">
        {formatDate(info.getValue())}
      </span>
    ),
    size: 110,
  }),
];

// ---------- Expanded row ----------

function ExpandedRow({ request }: { request: QuoteRequest }) {
  return (
    <tr>
      <td colSpan={columns.length} className="bg-slate-50/80 px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3 text-sm">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-0.5">Size</p>
            <p>{request.size !== "N/A" ? request.size : "—"}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-0.5">Top Material</p>
            <p>{request.topMaterial || "—"}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-0.5">Top Finish</p>
            <p className="truncate">{request.topFinish || "—"}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-0.5">Edge Type</p>
            <p className="truncate">{request.edgeType || "—"}</p>
          </div>
          {request.contactEmail && (
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-0.5">Email</p>
              <p className="truncate">{request.contactEmail}</p>
            </div>
          )}
          {request.contactPhone && (
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-0.5">Phone</p>
              <p>{request.contactPhone}</p>
            </div>
          )}
          {request.notes && (
            <div className="col-span-2 md:col-span-4">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-0.5">Notes</p>
              <p className="text-slate-600 whitespace-pre-wrap text-xs leading-relaxed">
                {request.notes}
              </p>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

// ---------- Compact filter button ----------

function FilterButton({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string; count?: number }[];
  onChange: (val: string) => void;
}) {
  const isActive = value !== "__all__";
  const activeLabel = isActive
    ? options.find((o) => o.value === value)?.label ?? value
    : null;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={`h-7 w-auto text-xs border rounded-full px-2.5 gap-1 cursor-pointer transition-colors shadow-none ${
          isActive
            ? "bg-brand-navy text-white border-brand-navy hover:bg-brand-navy/90 [&>svg]:text-white/70"
            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 [&>svg]:text-slate-400"
        }`}
      >
        <SelectValue placeholder={label}>
          {activeLabel ?? label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__" className="text-xs">
          {label}
        </SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs">
            <span className="flex items-center justify-between gap-4 w-full">
              <span className="truncate">{opt.label}</span>
              {opt.count !== undefined && (
                <span className="text-[10px] text-slate-400 tabular-nums">{opt.count}</span>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ---------- Page ----------

export default function QuoteRequestsPage() {
  const [mounted, setMounted] = useState(false);
  const { requests, loadFromSupabase } = useQuoteRequestStore();
  const { loadFromSupabase: loadQuotes } = useQuoteStore();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [pageSize, setPageSize] = useState(25);

  // Filters
  const [statusFilter, setStatusFilter] = useState("__all__");
  const [seriesFilter, setSeriesFilter] = useState("__all__");
  const [finishFilter, setFinishFilter] = useState("__all__");
  const [yearFilter, setYearFilter] = useState("__all__");
  const [sourceFilter, setSourceFilter] = useState("__all__");

  useEffect(() => {
    setMounted(true);
    loadFromSupabase();
    loadQuotes();
  }, [loadFromSupabase, loadQuotes]);

  // Compute filter options with counts from full dataset
  const filterOptions = useMemo(() => {
    const statusCounts = new Map<string, number>();
    const seriesCounts = new Map<string, number>();
    const finishCounts = new Map<string, number>();
    const yearCounts = new Map<string, number>();
    const sourceCounts = new Map<string, number>();

    for (const r of requests) {
      statusCounts.set(r.status, (statusCounts.get(r.status) || 0) + 1);
      seriesCounts.set(r.seriesName, (seriesCounts.get(r.seriesName) || 0) + 1);
      if (r.baseFinish) {
        finishCounts.set(r.baseFinish, (finishCounts.get(r.baseFinish) || 0) + 1);
      }
      const year = r.createdAt ? new Date(r.createdAt).getFullYear().toString() : "Unknown";
      yearCounts.set(year, (yearCounts.get(year) || 0) + 1);
      const source = r.requestNumber.startsWith("GF-") ? "Web Form" : "Live";
      sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
    }

    const toSorted = (map: Map<string, number>, sortByCount = false) =>
      Array.from(map.entries())
        .sort(sortByCount ? (a, b) => b[1] - a[1] : (a, b) => a[0].localeCompare(b[0]))
        .map(([val, count]) => ({ value: val, label: val, count }));

    return {
      status: (Object.keys(STATUS_CONFIG) as QuoteRequestStatus[]).map((s) => ({
        value: s,
        label: STATUS_CONFIG[s].label,
        count: statusCounts.get(s) || 0,
      })),
      series: toSorted(seriesCounts, true),
      finish: toSorted(finishCounts, true),
      year: toSorted(yearCounts).reverse(),
      source: [
        { value: "Web Form", label: "Web Form (GF)", count: sourceCounts.get("Web Form") || 0 },
        { value: "Live", label: "Live Requests", count: sourceCounts.get("Live") || 0 },
      ],
    };
  }, [requests]);

  // Apply all filters
  const filteredRequests = useMemo(() => {
    let result = requests;

    // Status
    if (statusFilter !== "__all__") {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Series
    if (seriesFilter !== "__all__") {
      result = result.filter((r) => r.seriesName === seriesFilter);
    }

    // Finish
    if (finishFilter !== "__all__") {
      result = result.filter((r) => r.baseFinish === finishFilter);
    }

    // Year
    if (yearFilter !== "__all__") {
      result = result.filter((r) => {
        const year = r.createdAt ? new Date(r.createdAt).getFullYear().toString() : "";
        return year === yearFilter;
      });
    }

    // Source
    if (sourceFilter !== "__all__") {
      if (sourceFilter === "Web Form") {
        result = result.filter((r) => r.requestNumber.startsWith("GF-"));
      } else {
        result = result.filter((r) => r.requestNumber.startsWith("RQ-"));
      }
    }

    // Search (across all text columns)
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.requestNumber.toLowerCase().includes(q) ||
          `${r.contactFirstName} ${r.contactLastName}`.toLowerCase().includes(q) ||
          (r.contactCompany || "").toLowerCase().includes(q) ||
          (r.contactEmail || "").toLowerCase().includes(q) ||
          r.seriesName.toLowerCase().includes(q) ||
          (r.baseFinish || "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [requests, search, statusFilter, seriesFilter, finishFilter, yearFilter, sourceFilter]);

  // Active filter count
  const activeFilters: { label: string; clear: () => void }[] = [];
  if (statusFilter !== "__all__")
    activeFilters.push({
      label: `Status: ${STATUS_CONFIG[statusFilter as QuoteRequestStatus]?.label ?? statusFilter}`,
      clear: () => setStatusFilter("__all__"),
    });
  if (seriesFilter !== "__all__")
    activeFilters.push({ label: `Series: ${seriesFilter}`, clear: () => setSeriesFilter("__all__") });
  if (finishFilter !== "__all__")
    activeFilters.push({ label: `Finish: ${finishFilter}`, clear: () => setFinishFilter("__all__") });
  if (yearFilter !== "__all__")
    activeFilters.push({ label: `Year: ${yearFilter}`, clear: () => setYearFilter("__all__") });
  if (sourceFilter !== "__all__")
    activeFilters.push({
      label: `Source: ${sourceFilter === "Web Form" ? "Web Form" : "Live"}`,
      clear: () => setSourceFilter("__all__"),
    });

  const clearAllFilters = useCallback(() => {
    setStatusFilter("__all__");
    setSeriesFilter("__all__");
    setFinishFilter("__all__");
    setYearFilter("__all__");
    setSourceFilter("__all__");
    setSearch("");
  }, []);

  const table = useReactTable({
    data: filteredRequests,
    columns,
    state: { sorting, pagination: { pageIndex: 0, pageSize } },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Reset to page 0 when filters change
  useEffect(() => {
    table.setPageIndex(0);
  }, [search, statusFilter, seriesFilter, finishFilter, yearFilter, sourceFilter, pageSize, table]);

  if (!mounted) {
    return (
      <div>
        <Header
          title="Quote Requests"
          subtitle="Incoming requests from the configurator"
        />
        <div className="animate-pulse h-96 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Quote Requests"
        subtitle={`${requests.length.toLocaleString()} total requests`}
      />

      {/* Toolbar */}
      <div className="mb-4 space-y-2">
        {/* Single compact row: search + filters + count */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-8 h-7 text-xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-3 w-3 text-slate-400" />
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-slate-200" />

          {/* Filter buttons */}
          <FilterButton
            label="Status"
            value={statusFilter}
            options={filterOptions.status}
            onChange={setStatusFilter}
          />
          <FilterButton
            label="Series"
            value={seriesFilter}
            options={filterOptions.series}
            onChange={setSeriesFilter}
          />
          <FilterButton
            label="Finish"
            value={finishFilter}
            options={filterOptions.finish}
            onChange={setFinishFilter}
          />
          <FilterButton
            label="Year"
            value={yearFilter}
            options={filterOptions.year}
            onChange={setYearFilter}
          />
          <FilterButton
            label="Source"
            value={sourceFilter}
            options={filterOptions.source}
            onChange={setSourceFilter}
          />

          {/* Clear all (only when filters active) */}
          {activeFilters.length > 0 && (
            <>
              <div className="h-4 w-px bg-slate-200" />
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-slate-400 hover:text-slate-600 whitespace-nowrap cursor-pointer transition-colors"
              >
                Clear all
              </button>
            </>
          )}

          {/* Spacer + result count */}
          <div className="ml-auto">
            <span className="text-xs text-slate-400 tabular-nums whitespace-nowrap">
              {filteredRequests.length === requests.length
                ? `${requests.length.toLocaleString()} requests`
                : `${filteredRequests.length.toLocaleString()} of ${requests.length.toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Active filter pills (only when filtering) */}
        {(activeFilters.length > 0 || search) && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {search && (
              <FilterPill label={`"${search}"`} onClear={() => setSearch("")} />
            )}
            {activeFilters.map((f) => (
              <FilterPill key={f.label} label={f.label} onClear={f.clear} />
            ))}
          </div>
        )}
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Inbox className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-600">
              No quote requests yet
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Requests submitted through the configurator will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                      {hg.headers.map((header) => (
                        <th
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          className={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none hover:text-slate-900"
                              : ""
                          }
                          style={{ width: header.getSize() }}
                        >
                          <div className="flex items-center gap-1">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getIsSorted() === "asc" && " ↑"}
                            {header.column.getIsSorted() === "desc" && " ↓"}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <Fragment key={row.id}>
                      <tr
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() =>
                          setExpandedId(
                            expandedId === row.original.id
                              ? null
                              : row.original.id
                          )
                        }
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                      {expandedId === row.original.id && (
                        <ExpandedRow
                          key={`${row.id}-expanded`}
                          request={row.original}
                        />
                      )}
                    </Fragment>
                  ))}
                  {table.getRowModel().rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="text-center text-slate-400 py-12"
                      >
                        No requests match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <p className="text-xs text-slate-500 tabular-nums">
                  {filteredRequests.length > 0 ? (
                    <>
                      {table.getState().pagination.pageIndex * pageSize + 1}
                      &ndash;
                      {Math.min(
                        (table.getState().pagination.pageIndex + 1) * pageSize,
                        filteredRequests.length
                      )}{" "}
                      of {filteredRequests.length.toLocaleString()}
                    </>
                  ) : (
                    "0 results"
                  )}
                </p>
                <div className="h-3.5 w-px bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Show</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(val) => setPageSize(Number(val))}
                  >
                    <SelectTrigger className="h-7 w-[60px] text-xs shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZES.map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="h-7 w-7 p-0"
                >
                  <ChevronsLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-7 px-2 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </Button>
                <span className="text-xs text-slate-500 px-2 tabular-nums">
                  {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-7 px-2 text-xs"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="h-7 w-7 p-0"
                >
                  <ChevronsRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
