"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuoteStore } from "@/store/quote-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Quote } from "@/types/quote-builder";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  FileText,
  Plus,
} from "lucide-react";

const statusBadge: Record<string, "secondary" | "info" | "success" | "error"> = {
  draft: "secondary",
  sent: "info",
  accepted: "success",
  rejected: "error",
};

const columnHelper = createColumnHelper<Quote>();

const columns = [
  columnHelper.accessor("quoteNumber", {
    header: "Quote #",
    cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
    size: 120,
  }),
  columnHelper.accessor("customer", {
    header: "Customer",
    cell: (info) => {
      const customer = info.getValue();
      return (
        <div>
          <p className="font-medium text-sm">{customer.name}</p>
          <p className="text-xs text-slate-500">{customer.company}</p>
        </div>
      );
    },
    size: 200,
    enableSorting: false,
  }),
  columnHelper.accessor("createdAt", {
    header: "Date",
    cell: (info) => (
      <span className="text-sm text-slate-600">{formatDate(info.getValue())}</span>
    ),
    size: 120,
  }),
  columnHelper.accessor("lineItems", {
    header: "Items",
    cell: (info) => (
      <Badge variant="secondary">{info.getValue().length}</Badge>
    ),
    size: 80,
    enableSorting: false,
  }),
  columnHelper.accessor("total", {
    header: "Total",
    cell: (info) => (
      <span className="price font-semibold">{formatCurrency(info.getValue())}</span>
    ),
    size: 120,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <Badge variant={statusBadge[info.getValue()]}>
        {info.getValue()}
      </Badge>
    ),
    size: 100,
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: (info) => (
      <Link href={`/quote/${info.row.original.id}`}>
        <Button variant="ghost" size="sm">
          View
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </Link>
    ),
    size: 80,
  }),
];

export default function QuoteListPage() {
  const [mounted, setMounted] = useState(false);
  const { quotes, loadFromSupabase } = useQuoteStore();
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  useEffect(() => {
    setMounted(true);
    loadFromSupabase();
  }, [loadFromSupabase]);

  const filteredQuotes = useMemo(() => {
    if (!search) return quotes;
    const q = search.toLowerCase();
    return quotes.filter(
      (quote) =>
        quote.quoteNumber.toLowerCase().includes(q) ||
        quote.customer.name.toLowerCase().includes(q) ||
        quote.customer.company.toLowerCase().includes(q)
    );
  }, [quotes, search]);

  const table = useReactTable({
    data: filteredQuotes,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (!mounted) {
    return (
      <div>
        <Header title="All Quotes" subtitle="View and manage all quotes" />
        <div className="animate-pulse h-96 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      <Header
        title="All Quotes"
        subtitle={`${filteredQuotes.length} quote${filteredQuotes.length !== 1 ? "s" : ""}`}
      />

      {/* Search + New */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by quote #, customer name, or company..."
            className="pl-9"
          />
        </div>
        <Link href="/quote/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            New Quote
          </Button>
        </Link>
      </div>

      {quotes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-600">No quotes yet</p>
            <p className="text-sm text-slate-400 mt-1 mb-6">
              Create your first quote to get started.
            </p>
            <Link href="/quote/new">
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                New Quote
              </Button>
            </Link>
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
                        No quotes match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()} ({filteredQuotes.length} quotes)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
