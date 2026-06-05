"use client";

import { useState, useMemo } from "react";
import {
  laminateCatalog,
  type FinishOption,
  type LaminatePriceTier,
  type LaminateSubCategory,
  type LaminateBrand,
} from "@/data/finish-catalog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Check } from "lucide-react";

const SUB_CATEGORIES: { value: LaminateSubCategory; label: string }[] = [
  { value: "woodgrain", label: "Woodgrain" },
  { value: "solid", label: "Solid" },
  { value: "pattern", label: "Pattern" },
];

const BRANDS: LaminateBrand[] = ["Wilsonart", "Formica"];

const PRICE_TIERS: LaminatePriceTier[] = ["Core", "Select", "Luxe", "Custom"];

const TIER_BADGE_CLASS: Record<LaminatePriceTier, string> = {
  Core: "bg-slate-100 text-slate-700",
  Select: "bg-amber-100 text-amber-800",
  Luxe: "bg-violet-100 text-violet-800",
  Custom: "bg-slate-900 text-white",
};

export default function LaminatesTab() {
  const [search, setSearch] = useState("");
  const [subCategoryFilter, setSubCategoryFilter] = useState<LaminateSubCategory[]>([]);
  const [brandFilter, setBrandFilter] = useState<LaminateBrand[]>([]);
  const [tierFilter, setTierFilter] = useState<LaminatePriceTier[]>([]);
  const [stockOnly, setStockOnly] = useState(false);

  const filtered = useMemo<FinishOption[]>(() => {
    let data = laminateCatalog;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.itemNumber?.toLowerCase().includes(q) ?? false)
      );
    }
    if (subCategoryFilter.length > 0) {
      data = data.filter((f) => f.subCategory && subCategoryFilter.includes(f.subCategory));
    }
    if (brandFilter.length > 0) {
      data = data.filter((f) => f.brand && brandFilter.includes(f.brand));
    }
    if (tierFilter.length > 0) {
      data = data.filter((f) => f.priceTier && tierFilter.includes(f.priceTier));
    }
    if (stockOnly) {
      data = data.filter((f) => f.isStock === true);
    }
    return data;
  }, [search, subCategoryFilter, brandFilter, tierFilter, stockOnly]);

  const hasFilters =
    search ||
    subCategoryFilter.length > 0 ||
    brandFilter.length > 0 ||
    tierFilter.length > 0 ||
    stockOnly;

  const clearFilters = () => {
    setSearch("");
    setSubCategoryFilter([]);
    setBrandFilter([]);
    setTierFilter([]);
    setStockOnly(false);
  };

  function togglePill<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, value: T) {
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  return (
    <div>
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
                placeholder="Search name or item #..."
                className="pl-9"
              />
            </div>

            {/* Sub-category */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-slate-500 self-center mr-1">Type:</span>
              {SUB_CATEGORIES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => togglePill(setSubCategoryFilter, s.value)}
                  className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                    subCategoryFilter.includes(s.value)
                      ? "bg-brand-green text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Brand */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-slate-500 self-center mr-1">Brand:</span>
              {BRANDS.map((b) => (
                <button
                  key={b}
                  onClick={() => togglePill(setBrandFilter, b)}
                  className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                    brandFilter.includes(b)
                      ? "bg-brand-green text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            {/* Price tier */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-slate-500 self-center mr-1">Tier:</span>
              {PRICE_TIERS.map((t) => (
                <button
                  key={t}
                  onClick={() => togglePill(setTierFilter, t)}
                  className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                    tierFilter.includes(t)
                      ? "bg-brand-green text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Stock only */}
            <button
              onClick={() => setStockOnly((v) => !v)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                stockOnly
                  ? "bg-brand-green text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {stockOnly && <Check className="h-3 w-3" />}
              Stock only
            </button>

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

      {/* Count */}
      <p className="text-xs text-slate-500 mb-3">
        Showing {filtered.length} of {laminateCatalog.length} laminates
        {" · "}
        {laminateCatalog.filter((f) => f.isStock).length} stocked
      </p>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {filtered.map((f) => (
          <div
            key={f.id}
            className="rounded-lg hover:shadow-md transition-shadow"
          >
            <div
              className="aspect-square w-full rounded-t-lg"
              style={{ backgroundColor: f.hex }}
            />
            <div className="p-3 space-y-1 bg-white rounded-b-lg border border-slate-200 border-t-0">
              <div className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2">
                {f.name}
              </div>
              <div className="text-xs font-mono text-slate-500">
                {f.brand} · {f.itemNumber}
              </div>
              <div className="flex items-center gap-2 pt-1">
                {f.priceTier && (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${TIER_BADGE_CLASS[f.priceTier]}`}
                  >
                    {f.priceTier}
                  </span>
                )}
                {typeof f.upchargePct === "number" && f.upchargePct > 0 && (
                  <span className="text-xs text-slate-500">+{f.upchargePct}%</span>
                )}
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    f.isStock
                      ? "bg-green-100 text-green-800"
                      : f.mustStock
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {f.isStock ? "In stock" : f.mustStock ? "Stocking soon" : "Special order"}
                </span>
              </div>
              {/* Edgeband state (priority: named substitute > offered matching > planned > custom quote).
                  Keyed on hasMatchingEdgeband (OFFER-level): patterns never show a matching edge even
                  where the manufacturer stocks one — TableX doesn't offer them (Brian 6/5). */}
              {f.edgebandRef ? (
                <div className="flex items-center gap-1 pt-1">
                  <Check className="h-3 w-3 text-amber-600" />
                  <span className="text-[10px] text-slate-500">Edge: {f.edgebandRef}</span>
                </div>
              ) : f.hasMatchingEdgeband ? (
                <div className="flex items-center gap-1 pt-1">
                  <Check className="h-3 w-3 text-green-600" />
                  <span className="text-[10px] text-slate-500">
                    Matching edge
                    {typeof f.bandingUpchargePct === "number" && f.bandingUpchargePct > 0
                      ? ` +${f.bandingUpchargePct}%`
                      : ""}
                  </span>
                </div>
              ) : f.edgebandMustStock ? (
                <div className="pt-1 text-[10px] text-slate-500">Edge band: stocking soon</div>
              ) : f.bandingUpchargePct === "custom" ? (
                <div className="pt-1 text-[10px] text-slate-500">Edge band: custom quote</div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-sm text-slate-500">
          No laminates match the current filters.
        </div>
      )}
    </div>
  );
}
