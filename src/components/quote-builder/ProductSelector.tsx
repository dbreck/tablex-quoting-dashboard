"use client";

import { useState, useMemo } from "react";
import { useQuoteStore } from "@/store/quote-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TIER_PRICE_KEYS } from "@/types/quote-builder";
import { formatCurrency } from "@/lib/utils";
import catalogData from "@/data/product-catalog.json";
import { Search, Plus, ShoppingCart, X, ChevronLeft, ChevronRight } from "lucide-react";

type CatalogRow = (typeof catalogData)[number];

export function ProductSelector() {
  const { draftQuote, addLineItem } = useQuoteStore();
  const [search, setSearch] = useState("");
  const [seriesFilter, setSeriesFilter] = useState<string[]>([]);
  const [shapeFilter, setShapeFilter] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CatalogRow | null>(null);
  const [addQty, setAddQty] = useState(1);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const tier = draftQuote?.discountTier ?? "50_20";
  const tierKey = TIER_PRICE_KEYS[tier] as keyof CatalogRow;
  const itemCount = draftQuote?.lineItems.length ?? 0;

  const uniqueSeries = useMemo(
    () => [...new Set(catalogData.map((r) => r.series))].filter(Boolean).sort(),
    []
  );
  const uniqueShapes = useMemo(
    () => [...new Set(catalogData.map((r) => r.shapeName))].filter(Boolean).sort(),
    []
  );

  const filteredData = useMemo(() => {
    let data = catalogData as CatalogRow[];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.sku.toLowerCase().includes(q) ||
          r.series.toLowerCase().includes(q) ||
          r.shapeName.toLowerCase().includes(q)
      );
    }
    if (seriesFilter.length > 0) {
      data = data.filter((r) => seriesFilter.includes(r.series));
    }
    if (shapeFilter.length > 0) {
      data = data.filter((r) => shapeFilter.includes(r.shapeName));
    }
    return data;
  }, [search, seriesFilter, shapeFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const pagedData = filteredData.slice(page * pageSize, (page + 1) * pageSize);

  function handleAddToQuote() {
    if (!selectedProduct || !draftQuote) return;
    const netPrice = (selectedProduct[tierKey] as number) || 0;
    addLineItem({
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      sku: selectedProduct.sku,
      description: `${selectedProduct.series} ${selectedProduct.shapeName} ${selectedProduct.size}`,
      series: selectedProduct.series,
      shape: selectedProduct.shapeName,
      size: selectedProduct.size,
      listPrice: selectedProduct.listPrice || 0,
      netPrice,
      quantity: addQty,
      totalPrice: netPrice * addQty,
    });
    setSelectedProduct(null);
    setAddQty(1);
  }

  const clearFilters = () => {
    setSearch("");
    setSeriesFilter([]);
    setShapeFilter([]);
    setPage(0);
  };

  const hasFilters = search || seriesFilter.length > 0 || shapeFilter.length > 0;

  return (
    <div className="space-y-4">
      {/* Items in quote badge */}
      {itemCount > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-sm px-3 py-1">
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
            {itemCount} item{itemCount !== 1 ? "s" : ""} in quote
          </Badge>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                placeholder="Search SKU, series, or shape..."
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-slate-500 self-center mr-1">Series:</span>
              {uniqueSeries.slice(0, 12).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSeriesFilter((prev) =>
                      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                    );
                    setPage(0);
                  }}
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

            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-slate-500 self-center mr-1">Shape:</span>
              {uniqueShapes.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setShapeFilter((prev) =>
                      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                    );
                    setPage(0);
                  }}
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

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add to Quote mini-form */}
      {selectedProduct && (
        <Card className="border-brand-green border-2">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <p className="font-mono text-sm font-semibold">{selectedProduct.sku}</p>
                <p className="text-xs text-slate-500">
                  {selectedProduct.series} {selectedProduct.shapeName} {selectedProduct.size}
                </p>
                <p className="text-sm mt-1">
                  <span className="text-slate-500">List:</span>{" "}
                  <span className="line-through text-slate-400">{formatCurrency(selectedProduct.listPrice || 0)}</span>
                  <span className="text-brand-green font-semibold ml-2">
                    Net: {formatCurrency((selectedProduct[tierKey] as number) || 0)}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Qty:</label>
                <Input
                  type="number"
                  min={1}
                  value={addQty}
                  onChange={(e) => setAddQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20"
                />
              </div>
              <Button onClick={handleAddToQuote}>
                <Plus className="h-4 w-4 mr-1" />
                Add to Quote
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base">
            Products ({filteredData.length.toLocaleString()})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Series</th>
                  <th>Shape</th>
                  <th>Size</th>
                  <th>List Price</th>
                  <th>Net Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pagedData.map((product) => (
                  <tr
                    key={product.sku}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => { setSelectedProduct(product); setAddQty(1); }}
                  >
                    <td className="font-mono text-xs">{product.sku}</td>
                    <td>
                      <Badge variant="secondary">{product.series}</Badge>
                    </td>
                    <td>{product.shapeName}</td>
                    <td>{product.size}</td>
                    <td className="price">{formatCurrency(product.listPrice || 0)}</td>
                    <td className="price text-brand-green font-semibold">
                      {formatCurrency((product[tierKey] as number) || 0)}
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(product);
                          setAddQty(1);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {pagedData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-slate-400 py-8">
                      No products found. Try adjusting your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Page {page + 1} of {totalPages} ({filteredData.length.toLocaleString()} products)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
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
