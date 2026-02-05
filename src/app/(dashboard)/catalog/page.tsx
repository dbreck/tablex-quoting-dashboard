"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import catalogData from "@/data/product-catalog.json";
import { formatCurrency } from "@/lib/utils";
import { Search, X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";

type CatalogRow = (typeof catalogData)[number];

const columnHelper = createColumnHelper<CatalogRow>();

const columns = [
  columnHelper.accessor("sku", {
    header: "SKU",
    cell: (info) => (
      <Link
        href={`/sku-decoder?sku=${encodeURIComponent(info.getValue())}`}
        className="font-mono text-xs text-brand-green hover:underline inline-flex items-center gap-1"
      >
        {info.getValue()}
        <ExternalLink className="h-3 w-3" />
      </Link>
    ),
    size: 200,
  }),
  columnHelper.accessor("series", {
    header: "Series",
    cell: (info) => <Badge variant="secondary">{info.getValue()}</Badge>,
    size: 80,
  }),
  columnHelper.accessor("shapeName", {
    header: "Shape",
    size: 100,
  }),
  columnHelper.accessor("size", {
    header: "Size",
    size: 100,
  }),
  columnHelper.accessor("totalCost", {
    header: "Cost",
    cell: (info) => <span className="price">{formatCurrency(info.getValue() || 0)}</span>,
    size: 100,
  }),
  columnHelper.accessor("listPrice", {
    header: "List",
    cell: (info) => <span className="price">{formatCurrency(info.getValue() || 0)}</span>,
    size: 100,
  }),
  columnHelper.accessor("price_50_20", {
    header: "50/20",
    cell: (info) => <span className="price text-brand-green">{formatCurrency(info.getValue() || 0)}</span>,
    size: 100,
  }),
  columnHelper.accessor("price_50_20_10", {
    header: "50/20/10",
    cell: (info) => <span className="price">{formatCurrency(info.getValue() || 0)}</span>,
    size: 100,
  }),
  columnHelper.accessor("price_50_20_20", {
    header: "50/20/20",
    cell: (info) => <span className="price">{formatCurrency(info.getValue() || 0)}</span>,
    size: 100,
  }),
  columnHelper.accessor("gpm", {
    header: "GPM",
    cell: (info) => {
      const val = (info.getValue() || 0) * 100;
      return (
        <Badge variant={val >= 40 ? "success" : val >= 25 ? "default" : "warning"}>
          {val.toFixed(0)}%
        </Badge>
      );
    },
    size: 80,
  }),
];

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [seriesFilter, setSeriesFilter] = useState<string[]>([]);
  const [shapeFilter, setShapeFilter] = useState<string[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Extract unique series and shapes
  const uniqueSeries = useMemo(
    () => [...new Set(catalogData.map((r: CatalogRow) => r.series))].filter(Boolean).sort(),
    []
  );
  const uniqueShapes = useMemo(
    () => [...new Set(catalogData.map((r: CatalogRow) => r.shapeName))].filter(Boolean).sort(),
    []
  );

  // Filter data
  const filteredData = useMemo(() => {
    let data = catalogData as CatalogRow[];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((r) => r.sku.toLowerCase().includes(q));
    }
    if (seriesFilter.length > 0) {
      data = data.filter((r) => seriesFilter.includes(r.series));
    }
    if (shapeFilter.length > 0) {
      data = data.filter((r) => shapeFilter.includes(r.shapeName));
    }
    return data;
  }, [search, seriesFilter, shapeFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 50 } },
  });

  const clearFilters = () => {
    setSearch("");
    setSeriesFilter([]);
    setShapeFilter([]);
  };

  const hasFilters = search || seriesFilter.length > 0 || shapeFilter.length > 0;

  return (
    <div>
      <Header
        title="Product Catalog"
        subtitle={`${filteredData.length.toLocaleString()} of ${catalogData.length.toLocaleString()} products`}
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search SKU..."
                className="pl-9"
              />
            </div>

            {/* Series filter */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-slate-500 self-center mr-1">Series:</span>
              {uniqueSeries.slice(0, 12).map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    setSeriesFilter((prev) =>
                      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                    )
                  }
                  className={`px-2 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                    seriesFilter.includes(s)
                      ? "bg-brand-green text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Shape filter */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-slate-500 self-center mr-1">Shape:</span>
              {uniqueShapes.map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    setShapeFilter((prev) =>
                      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                    )
                  }
                  className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                    shapeFilter.includes(s)
                      ? "bg-brand-green text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Clear */}
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
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
                        className="cursor-pointer select-none hover:text-slate-900"
                        style={{ width: header.getSize() }}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
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
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} ({filteredData.length.toLocaleString()} rows)
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
    </div>
  );
}
