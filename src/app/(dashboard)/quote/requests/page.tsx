"use client";

import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";

const statusBadgeVariant: Record<QuoteRequestStatus, "warning" | "info" | "success" | "secondary"> = {
  pending: "warning",
  in_progress: "info",
  quoted: "success",
  closed: "secondary",
};

const statusLabels: Record<QuoteRequestStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  quoted: "Quoted",
  closed: "Closed",
};

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
        {(Object.keys(statusLabels) as QuoteRequestStatus[]).map((s) => (
          <SelectItem key={s} value={s}>
            {statusLabels[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const columnHelper = createColumnHelper<QuoteRequest>();

const columns = [
  columnHelper.accessor("requestNumber", {
    header: "Request #",
    cell: (info) => (
      <span className="font-mono text-sm">{info.getValue()}</span>
    ),
    size: 100,
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
              <p className="text-xs text-slate-500">{row.contactCompany}</p>
            )}
          </div>
        );
      },
      size: 180,
    }
  ),
  columnHelper.accessor(
    (row) => `${row.seriesName} ${row.shapeCode} ${row.size}`,
    {
      id: "config",
      header: "Configuration",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {row.seriesName}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {row.shapeCode}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {row.size}
            </Badge>
          </div>
        );
      },
      size: 220,
      enableSorting: false,
    }
  ),
  columnHelper.accessor("quantity", {
    header: "Qty",
    cell: (info) => (
      <span className="text-sm font-medium">{info.getValue()}</span>
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
      <span className="text-sm text-slate-600">
        {formatDate(info.getValue())}
      </span>
    ),
    size: 110,
  }),
];

function ExpandedRow({ request }: { request: QuoteRequest }) {
  return (
    <tr>
      <td colSpan={columns.length} className="bg-slate-50 px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500 text-xs font-medium">Base</p>
            <p>{request.baseCode}{request.baseFinish ? ` - ${request.baseFinish}` : ""}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium">Top Material</p>
            <p>{request.topMaterial || "—"}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium">Top Finish</p>
            <p>{request.topFinish || "—"}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium">Edge Type</p>
            <p>{request.edgeType || "—"}</p>
          </div>
          {request.contactEmail && (
            <div>
              <p className="text-slate-500 text-xs font-medium">Email</p>
              <p>{request.contactEmail}</p>
            </div>
          )}
          {request.contactPhone && (
            <div>
              <p className="text-slate-500 text-xs font-medium">Phone</p>
              <p>{request.contactPhone}</p>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function QuoteRequestsPage() {
  const [mounted, setMounted] = useState(false);
  const { requests, loadFromSupabase } = useQuoteRequestStore();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  useEffect(() => {
    setMounted(true);
    loadFromSupabase();
  }, [loadFromSupabase]);

  const filteredRequests = useMemo(() => {
    if (!search) return requests;
    const q = search.toLowerCase();
    return requests.filter(
      (r) =>
        r.requestNumber.toLowerCase().includes(q) ||
        `${r.contactFirstName} ${r.contactLastName}`.toLowerCase().includes(q) ||
        (r.contactCompany || "").toLowerCase().includes(q) ||
        r.seriesName.toLowerCase().includes(q)
    );
  }, [requests, search]);

  const table = useReactTable({
    data: filteredRequests,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

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
        subtitle={`${filteredRequests.length} request${filteredRequests.length !== 1 ? "s" : ""}`}
      />

      {/* Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by request #, name, company, or series..."
            className="pl-9"
          />
        </div>
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
                    <>
                      <tr
                        key={row.id}
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
                    </>
                  ))}
                  {table.getRowModel().rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="text-center text-slate-400 py-8"
                      >
                        No requests match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {table.getPageCount() > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()} ({filteredRequests.length} requests)
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
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
