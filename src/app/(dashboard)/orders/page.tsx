"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { useOrderStore } from "@/store/order-store";
import { useQuoteStore } from "@/store/quote-store";
import { useCrmStore } from "@/store/crm-store";
import { formatDate } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/quote-builder";
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
  ChevronsLeft,
  ChevronsRight,
  ArrowRight,
  ShoppingCart,
  X,
} from "lucide-react";

const PAGE_SIZES = [25, 50, 100, 250];

const statusBadge: Record<OrderStatus, "secondary" | "info" | "default" | "success" | "error" | "warning"> = {
  pending: "secondary",
  confirmed: "info",
  in_production: "warning",
  shipped: "info",
  delivered: "success",
  completed: "success",
  cancelled: "error",
};

const statusLabel: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_production: "In Production",
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

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

// Column helper needs access to stores, so we define columns inside the component
// using useMemo instead of at module level
export default function OrdersPage() {
  const [mounted, setMounted] = useState(false);
  const { orders, loadFromSupabase: loadOrders } = useOrderStore();
  const { quotes, loadFromSupabase: loadQuotes } = useQuoteStore();
  const { organizations, loadFromSupabase: loadCrm } = useCrmStore();
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [pageSize, setPageSize] = useState(25);

  // Filters
  const [statusFilter, setStatusFilter] = useState("__all__");
  const [yearFilter, setYearFilter] = useState("__all__");
  const [orgFilter, setOrgFilter] = useState("__all__");

  useEffect(() => {
    setMounted(true);
    loadOrders();
    loadQuotes();
    loadCrm();
  }, [loadOrders, loadQuotes, loadCrm]);

  const quotesMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const q of quotes) {
      map.set(q.id, q.quoteNumber);
    }
    return map;
  }, [quotes]);

  const orgsMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const o of organizations) {
      map.set(o.id, o.name);
    }
    return map;
  }, [organizations]);

  // Compute filter options with counts
  const filterOptions = useMemo(() => {
    const statusCounts = new Map<string, number>();
    const yearCounts = new Map<string, number>();
    const orgCounts = new Map<string, number>();

    for (const o of orders) {
      statusCounts.set(o.status, (statusCounts.get(o.status) || 0) + 1);
      const year = o.createdAt ? new Date(o.createdAt).getFullYear().toString() : "Unknown";
      yearCounts.set(year, (yearCounts.get(year) || 0) + 1);
      if (o.organizationId) {
        const orgName = orgsMap.get(o.organizationId) || o.organizationId;
        orgCounts.set(orgName, (orgCounts.get(orgName) || 0) + 1);
      }
    }

    return {
      status: (Object.keys(statusLabel) as OrderStatus[]).map((s) => ({
        value: s,
        label: statusLabel[s],
        count: statusCounts.get(s) || 0,
      })),
      year: Array.from(yearCounts.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([val, count]) => ({ value: val, label: val, count })),
      org: Array.from(orgCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30)
        .map(([val, count]) => ({ value: val, label: val, count })),
    };
  }, [orders, orgsMap]);

  const columnHelper = createColumnHelper<Order>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("orderNumber", {
        header: "Order #",
        cell: (info) => (
          <span className="font-mono text-sm">{info.getValue()}</span>
        ),
        size: 120,
      }),
      columnHelper.accessor("quoteId", {
        header: "Quote #",
        cell: (info) => {
          const quoteNumber = quotesMap.get(info.getValue());
          return (
            <span className="text-sm text-slate-600">
              {quoteNumber || "--"}
            </span>
          );
        },
        size: 120,
        enableSorting: false,
      }),
      columnHelper.accessor("organizationId", {
        header: "Organization",
        cell: (info) => {
          const orgId = info.getValue();
          const orgName = orgId ? orgsMap.get(orgId) : undefined;
          return (
            <span className="text-sm">{orgName || "--"}</span>
          );
        },
        size: 200,
        enableSorting: false,
      }),
      columnHelper.accessor("poNumber", {
        header: "PO Number",
        cell: (info) => (
          <span className="text-sm text-slate-600">
            {info.getValue() || "--"}
          </span>
        ),
        size: 120,
        enableSorting: false,
      }),
      columnHelper.accessor("sageSalesOrderId", {
        header: "Sage SO#",
        cell: (info) => (
          <span className="font-mono text-sm text-slate-600">
            {info.getValue() || "--"}
          </span>
        ),
        size: 110,
        enableSorting: false,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <Badge variant={statusBadge[info.getValue()]}>
            {statusLabel[info.getValue()]}
          </Badge>
        ),
        size: 120,
      }),
      columnHelper.accessor("createdAt", {
        header: "Created",
        cell: (info) => (
          <span className="text-sm text-slate-600">
            {formatDate(info.getValue())}
          </span>
        ),
        size: 120,
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => (
          <Link href={`/orders/${info.row.original.id}`}>
            <Button variant="ghost" size="sm">
              View
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        ),
        size: 80,
      }),
    ],
    [columnHelper, quotesMap, orgsMap]
  );

  // Apply all filters + search
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Status
    if (statusFilter !== "__all__") {
      result = result.filter((o) => o.status === statusFilter);
    }

    // Year
    if (yearFilter !== "__all__") {
      result = result.filter((o) => {
        const year = o.createdAt ? new Date(o.createdAt).getFullYear().toString() : "";
        return year === yearFilter;
      });
    }

    // Organization
    if (orgFilter !== "__all__") {
      result = result.filter((o) => {
        const orgName = o.organizationId ? orgsMap.get(o.organizationId) : "";
        return orgName === orgFilter;
      });
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((order) => {
        const orgName = order.organizationId
          ? orgsMap.get(order.organizationId)
          : "";
        return (
          order.orderNumber.toLowerCase().includes(q) ||
          (order.poNumber || "").toLowerCase().includes(q) ||
          (order.sageSalesOrderId || "").toLowerCase().includes(q) ||
          (orgName || "").toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [orders, search, statusFilter, yearFilter, orgFilter, orgsMap]);

  // Active filter tracking
  const activeFilters: { label: string; clear: () => void }[] = [];
  if (statusFilter !== "__all__")
    activeFilters.push({
      label: `Status: ${statusLabel[statusFilter as OrderStatus] ?? statusFilter}`,
      clear: () => setStatusFilter("__all__"),
    });
  if (yearFilter !== "__all__")
    activeFilters.push({ label: `Year: ${yearFilter}`, clear: () => setYearFilter("__all__") });
  if (orgFilter !== "__all__")
    activeFilters.push({ label: `Org: ${orgFilter}`, clear: () => setOrgFilter("__all__") });

  const clearAllFilters = useCallback(() => {
    setStatusFilter("__all__");
    setYearFilter("__all__");
    setOrgFilter("__all__");
    setSearch("");
  }, []);

  const table = useReactTable({
    data: filteredOrders,
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
  }, [search, statusFilter, yearFilter, orgFilter, pageSize, table]);

  if (!mounted) {
    return (
      <div>
        <Header title="Orders" subtitle="View and manage all orders" />
        <div className="animate-pulse h-96 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Orders"
        subtitle={`${orders.length.toLocaleString()} total orders`}
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
            label="Year"
            value={yearFilter}
            options={filterOptions.year}
            onChange={setYearFilter}
          />
          <FilterButton
            label="Organization"
            value={orgFilter}
            options={filterOptions.org}
            onChange={setOrgFilter}
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
              {filteredOrders.length === orders.length
                ? `${orders.length.toLocaleString()} orders`
                : `${filteredOrders.length.toLocaleString()} of ${orders.length.toLocaleString()}`}
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

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-600">No orders yet</p>
            <p className="text-sm text-slate-400 mt-1 mb-6">
              Orders will appear here once quotes are converted.
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
                            {header.column.getIsSorted() === "asc" && " \u2191"}
                            {header.column.getIsSorted() === "desc" && " \u2193"}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="cursor-pointer hover:bg-slate-50"
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
                  ))}
                  {table.getRowModel().rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="text-center text-slate-400 py-8"
                      >
                        No orders match your search.
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
                  {filteredOrders.length > 0 ? (
                    <>
                      {table.getState().pagination.pageIndex * pageSize + 1}
                      &ndash;
                      {Math.min(
                        (table.getState().pagination.pageIndex + 1) * pageSize,
                        filteredOrders.length
                      )}{" "}
                      of {filteredOrders.length.toLocaleString()}
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
