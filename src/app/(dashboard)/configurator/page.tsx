"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTexture } from "@react-three/drei";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModelUrl } from "@/components/3d/useModelUrl";
import {
  getAvailableShapes,
  getAvailableSizes,
  getAvailableBases,
  formatSizeLabel,
  MODEL_AVAILABILITY,
  SUPPLIER_BASES_BY_SERIES,
  VERIFIED_SUPPLIER_BASES,
} from "@/data/model-availability";
import {
  powderCoatFinishes,
  hplFinishes,
  tflFinishes,
  solidSurfaceFinishes,
  butcherBlockFinishes,
  edgeTypes,
  getEdgeFinish,
  type FinishOption,
} from "@/data/finish-catalog";
import { ShoppingCart, ChevronDown, ChevronRight, Plus, Minus, Info } from "lucide-react";
import type { EnvironmentPreset } from "@/components/3d/ModelViewer";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { QuoteRequestModal } from "@/components/configurator/QuoteRequestModal";

const ModelViewer3D = dynamic(
  () =>
    import("@/components/3d/ModelViewer").then((mod) => ({
      default: mod.ModelViewer,
    })),
  { ssr: false }
);

// Series that have 3D models — only series present in MODEL_AVAILABILITY
const SERIES_NAMES: Record<string, string> = {
  "00": "Ultra",
  "06": "Stretch",
  "08": "Elite",
  "30": "Foundation",
  "33": "Fundamental",
  "40": "Justice",
  "44": "Primary",
  "45": "Puddle",
  "71": "Exclaim",
  "74": "VertiGO",
  "99": "Surge",
};
const CONFIGURATOR_SERIES = Object.keys(MODEL_AVAILABILITY).map((code) => ({
  code,
  name: SERIES_NAMES[code] ?? code,
}));

// Shape display names
const SHAPE_NAMES: Record<string, string> = {
  TC: "Rectangular",
  SQ: "Square",
  RT: "Racetrack Oval",
  BT: "Boat Shape",
  EL: "Elliptical",
  TZ: "Trapezoid",
  RC: "Racetrack",
  HR: "Half Round",
  CR: "Curved",
  TR: "Trapezoid",
  AC: "Arc",
  CS: "Corner Section",
  SC: "Semicircle",
  VW: "V-Shape Wide",
  WG: "Wedge",
  CC: "Concave",
  CU: "Curved",
  KB: "Keyboard",
  TA: "Tapered",
  AS: "Asymmetric",
  BW: "Bow",
  RD: "Round",
  D: "D-Shape",
  BU: "Bullet",
  SL: "Slab",
  TN: "Tension",
  TE: "T-Extension",
  QD: "Quad Disc",
  QR: "Quad Round",
};

const BASE_NAMES: Record<string, string> = {
  T: "T-Base",
  X: "X-Base",
  D: "Disc Base",
  FR: "Frame",
  TT: "T-Base (Twin)",
  U: "U-Leg",
  C: "C-Frame",
  QD: "Quad Disc",
  Q: "Quad Base",
  V: "V-Leg",
  Y: "Y-Base",
  L: "L-Leg",
  QC: "Quad C-Frame",
  H: "H-Leg",
  DR: "Drum Base",
  GNT: "Gannet",
  GN: "Gannet",
  TOS: "T-Base (Offset)",
  SD: "Sled Base",
  A: "A-Base",
  HT: "Height-Adjustable T",
  VTR: "V-Trestle",
  WT: "Wall/Cantilever T",
  OU: "Oversize U-Leg",
  DP: "Disc Pedestal",
  SQ: "Square Disc",
};

type BaseCategory = "native" | "verified" | "unverified";

function classifyBase(seriesCode: string, baseCode: string): BaseCategory {
  const supplierBases = SUPPLIER_BASES_BY_SERIES[seriesCode] ?? [];
  if (!supplierBases.includes(baseCode)) return "native";
  const verified = VERIFIED_SUPPLIER_BASES[seriesCode] ?? [];
  return verified.includes(baseCode) ? "verified" : "unverified";
}

type TopMaterial = "hpl" | "tfl" | "solid-surface" | "butcher-block";

const TOP_MATERIALS: { value: TopMaterial; label: string }[] = [
  { value: "hpl", label: "HPL (High Pressure Laminate)" },
  { value: "tfl", label: "TFL (Thermally Fused Laminate)" },
  { value: "solid-surface", label: "Solid Surface" },
  { value: "butcher-block", label: "Butcher Block" },
];

const TOP_FINISH_MAP: Record<TopMaterial, FinishOption[]> = {
  hpl: hplFinishes,
  tfl: tflFinishes,
  "solid-surface": solidSurfaceFinishes,
  "butcher-block": butcherBlockFinishes,
};

const ENV_PRESETS: { value: EnvironmentPreset; label: string }[] = [
  { value: "lobby", label: "Lobby" },
  { value: "studio", label: "Studio" },
  { value: "apartment", label: "Apartment" },
  { value: "city", label: "City" },
  { value: "dawn", label: "Dawn" },
  { value: "forest", label: "Forest" },
  { value: "night", label: "Night" },
  { value: "park", label: "Park" },
  { value: "sunset", label: "Sunset" },
  { value: "warehouse", label: "Warehouse" },
];

export default function ConfiguratorPage() {
  const [series, setSeries] = useState<string>("");
  const [shape, setShape] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [base, setBase] = useState<string>("");
  const [baseFinish, setBaseFinish] = useState<FinishOption>(powderCoatFinishes[0]);
  const [topMaterial, setTopMaterial] = useState<TopMaterial>("hpl");
  const [topFinish, setTopFinish] = useState<FinishOption>(hplFinishes[0]);
  const [tierFilter, setTierFilter] = useState<"Core" | "Select" | "Luxe" | "Custom" | null>(null);
  const [envPreset, setEnvPreset] = useState<EnvironmentPreset>("city");
  const [shapesOpen, setShapesOpen] = useState(true);
  const [edgeType, setEdgeType] = useState<string>(edgeTypes[0].id);
  const [quantity, setQuantity] = useState(1);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Filtered options based on model availability map
  const availableShapes = useMemo(() => {
    if (!series) return [];
    return getAvailableShapes(series);
  }, [series]);

  // Auto-select first shape / size / base when none is explicitly selected.
  // Derived during render (instead of setState-in-effect) so the auto-select
  // UX is identical but without cascading renders.
  const effectiveShape = shape || availableShapes[0] || "";

  const availableSizes = useMemo(() => {
    if (!series || !effectiveShape) return [];
    return getAvailableSizes(series, effectiveShape);
  }, [series, effectiveShape]);

  const availableBases = useMemo(() => {
    if (!series || !effectiveShape) return [];
    return getAvailableBases(series, effectiveShape);
  }, [series, effectiveShape]);

  const effectiveSize = size || availableSizes[0] || "";
  const effectiveBase = base || availableBases[0] || "";

  // Preload textures for the selected top material category
  useEffect(() => {
    const finishes = TOP_FINISH_MAP[topMaterial];
    for (const finish of finishes) {
      const urls: string[] = [];
      if (finish.textureUrl) urls.push(finish.textureUrl);
      if (finish.normalMapUrl) urls.push(finish.normalMapUrl);
      if (finish.roughnessMapUrl) urls.push(finish.roughnessMapUrl);
      for (const url of urls) {
        useTexture.preload(url);
      }
    }
  }, [topMaterial]);

  // Resolve model URL — only when shape+size+base are all selected
  const { url: modelUrl, supplierBaseUrl, isSupplierBase, isVerifiedCombo } = useModelUrl({
    series,
    shape: effectiveShape,
    size: effectiveSize,
    base: effectiveBase,
  });

  // Reset dependent selections when parent changes
  function handleSeriesChange(val: string) {
    setSeries(val);
    setShape("");
    setSize("");
    setBase("");
  }

  function handleShapeChange(val: string) {
    setShape(val);
    setSize("");
    setBase("");
  }

  function handleTopMaterialChange(val: TopMaterial) {
    setTopMaterial(val);
    const finishes = TOP_FINISH_MAP[val];
    setTopFinish(finishes[0]);
    setTierFilter(null);
  }

  const topFinishes = TOP_FINISH_MAP[topMaterial];

  return (
    <div>
      <Header
        title="Table Configurator"
        subtitle="Configure and preview tables in 3D"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 3D Viewer */}
        <div className="lg:w-3/5 w-full">
          <Card>
            <CardContent className="p-4">
              <ModelViewer3D
                modelUrl={modelUrl}
                supplierBaseUrl={supplierBaseUrl}
                baseFinish={baseFinish}
                topFinish={topFinish}
                edgeFinish={getEdgeFinish(edgeType) ?? topFinish}
                environmentPreset={envPreset}
                className="w-full aspect-[4/3]"
              />
              {!modelUrl && (
                <p className="text-xs text-slate-400 text-center mt-2">
                  {!series
                    ? "Select a series to get started"
                    : !effectiveShape
                      ? "Choose a shape to preview"
                      : !effectiveSize || !effectiveBase
                        ? "Select size and base to load 3D model"
                        : "3D model not available for this configuration"}
                </p>
              )}
              {isSupplierBase && (
                <p className={`text-xs text-center mt-2 ${isVerifiedCombo ? "text-slate-400" : "text-amber-500"}`}>
                  {isVerifiedCombo
                    ? "Approximate preview — base shown is a generic reference model, not series-specific geometry."
                    : "This base has not been verified as a standard option for this series. Shown for reference only."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Lighting */}
          <div className="mt-3">
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Lighting
            </label>
            <Select value={envPreset} onValueChange={(val) => setEnvPreset(val as EnvironmentPreset)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENV_PRESETS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="lg:w-2/5 w-full space-y-5">
          {/* Series */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Series
            </label>
            <Select value={series} onValueChange={handleSeriesChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select series" />
              </SelectTrigger>
              <SelectContent>
                {CONFIGURATOR_SERIES.map((s) => (
                  <SelectItem key={s.code} value={s.code}>
                    {s.name} ({s.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Shape */}
          <div>
            <button
              type="button"
              onClick={() => setShapesOpen(!shapesOpen)}
              className="flex items-center gap-1 text-sm font-medium text-slate-700 mb-1.5 cursor-pointer hover:text-slate-900"
            >
              {shapesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              Shape{effectiveShape ? `: ${SHAPE_NAMES[effectiveShape] || effectiveShape}` : ""}
            </button>
            {shapesOpen && availableShapes.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {availableShapes.map((code) => (
                  <button
                    key={code}
                    onClick={() => handleShapeChange(code)}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs font-medium transition-colors cursor-pointer ${
                      effectiveShape === code
                        ? "border-brand-green bg-brand-green/5 text-brand-green"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-mono text-[10px] text-slate-400">
                      {code}
                    </span>
                    <span className="text-center leading-tight">
                      {SHAPE_NAMES[code] || code}
                    </span>
                  </button>
                ))}
              </div>
            ) : shapesOpen ? (
              <p className="text-sm text-slate-400">Select a series first</p>
            ) : null}
          </div>

          {/* Size */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Size
            </label>
            <Select
              value={effectiveSize}
              onValueChange={setSize}
              disabled={!effectiveShape}
            >
              <SelectTrigger>
                <SelectValue placeholder={effectiveShape ? "Select size" : "Select shape first"} />
              </SelectTrigger>
              <SelectContent>
                {availableSizes.map((raw) => (
                  <SelectItem key={raw} value={raw}>
                    {formatSizeLabel(raw)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Base */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <label className="text-sm font-medium text-slate-700">
                Base
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="top" className="w-80 text-sm">
                  <p className="font-medium text-slate-800 mb-2">Base Availability</p>
                  <div className="space-y-2 text-slate-600 text-xs leading-relaxed">
                    <p>
                      <span className="inline-block w-2 h-2 rounded-full bg-brand-green mr-1.5 align-middle" />
                      <strong>Series-specific</strong> — Exact 3D model for this series, built from manufacturer CAD files.
                    </p>
                    <p>
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1.5 align-middle" />
                      <strong>Generic preview</strong> — Uses a reference base model from the component supplier. This base is a verified option for this series but the 3D preview is approximate.
                    </p>
                    <p>
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1.5 align-middle" />
                      <strong>Exploratory</strong> — This base has not been verified as a standard option for this series. Shown for reference only.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Select
              value={effectiveBase}
              onValueChange={setBase}
              disabled={!effectiveShape}
            >
              <SelectTrigger>
                <SelectValue placeholder={effectiveShape ? "Select base" : "Select shape first"} />
              </SelectTrigger>
              <SelectContent>
                {availableBases.map((code) => {
                  const cat = series ? classifyBase(series, code) : "native";
                  return (
                    <SelectItem key={code} value={code}>
                      <span className="flex items-center gap-2">
                        {cat !== "native" && (
                          <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            cat === "verified" ? "bg-blue-400" : "bg-amber-400"
                          }`} />
                        )}
                        {BASE_NAMES[code] || code} ({code})
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Base Finish */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Base Finish
            </label>
            <div className="grid grid-cols-8 gap-1.5">
              {powderCoatFinishes.map((finish) => (
                <button
                  key={finish.id}
                  onClick={() => setBaseFinish(finish)}
                  title={finish.name}
                  className={`h-8 w-8 rounded-full border-2 transition-all cursor-pointer ${
                    baseFinish.id === finish.id
                      ? "border-brand-green scale-110 ring-2 ring-brand-green/30"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                  style={{ backgroundColor: finish.hex }}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">{baseFinish.name}</p>
          </div>

          {/* Top Material */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Top Material
            </label>
            <Select
              value={topMaterial}
              onValueChange={(val) => handleTopMaterialChange(val as TopMaterial)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TOP_MATERIALS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Top Color */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Top Color
            </label>
            {topFinishes.some((f) => f.priceTier) && (
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                <span className="text-xs text-slate-500 mr-1">Tier:</span>
                {(["Core", "Select", "Luxe", "Custom"] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setTierFilter(tierFilter === tier ? null : tier)}
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                      tierFilter === tier
                        ? "border-brand-green bg-brand-green/10 text-brand-green"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {tier}
                  </button>
                ))}
                {tierFilter && (
                  <button
                    onClick={() => setTierFilter(null)}
                    className="text-[11px] text-slate-500 hover:text-slate-700 ml-1 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
            <div className="grid grid-cols-4 gap-2">
              {topFinishes
                .filter((f) => !tierFilter || f.priceTier === tierFilter)
                .map((finish) => {
                  const hasMetadata = finish.brand || finish.priceTier;
                  const tierBadgeClass =
                    finish.priceTier === "Core"
                      ? "bg-slate-100 text-slate-700"
                      : finish.priceTier === "Select"
                        ? "bg-amber-100 text-amber-800"
                        : finish.priceTier === "Luxe"
                          ? "bg-violet-100 text-violet-800"
                          : finish.priceTier === "Custom"
                            ? "bg-slate-900 text-white"
                            : "";
                  return (
                    <button
                      key={finish.id}
                      onClick={() => setTopFinish(finish)}
                      title={finish.name}
                      className={`flex flex-col items-stretch rounded-lg border text-left transition-all cursor-pointer overflow-hidden ${
                        topFinish.id === finish.id
                          ? "border-brand-green ring-2 ring-brand-green/30"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <div
                        className="relative h-12 w-full"
                        style={{ backgroundColor: finish.hex }}
                      >
                        {finish.brand && (
                          <span className="absolute top-1 left-1 inline-flex items-center justify-center w-5 h-5 rounded bg-white/90 text-slate-900 text-[10px] font-bold">
                            {finish.brand === "Wilsonart" ? "W" : "F"}
                          </span>
                        )}
                      </div>
                      {hasMetadata ? (
                        <div className="px-1.5 py-1 space-y-0.5">
                          <div className="text-[11px] font-medium text-slate-900 leading-tight truncate">
                            {finish.name}
                          </div>
                          {finish.itemNumber && (
                            <div className="text-[10px] font-mono text-slate-500 truncate">
                              {finish.itemNumber}
                            </div>
                          )}
                          {finish.priceTier && (
                            <div className="flex items-center">
                              <span
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${tierBadgeClass}`}
                              >
                                {finish.priceTier}
                              </span>
                              {finish.upchargePct !== undefined && finish.upchargePct > 0 && (
                                <span className="text-[10px] text-slate-500 ml-1">
                                  +{finish.upchargePct}%
                                </span>
                              )}
                            </div>
                          )}
                          {finish.brand && finish.isStock === false && (
                            <div
                              className={`text-[10px] font-medium ${
                                finish.mustStock ? "text-amber-700" : "text-slate-500"
                              }`}
                            >
                              {finish.mustStock ? "Stocking soon" : "Special order"}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="px-1.5 py-1">
                          <div className="text-[11px] font-medium text-slate-900 leading-tight truncate">
                            {finish.name}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
            <p className="text-xs text-slate-500 mt-1">{topFinish.name}</p>
          </div>

          {/* Edge Type */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Edge Type
            </label>
            <Select value={edgeType} onValueChange={setEdgeType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {edgeTypes.map((edge) => (
                  <SelectItem key={edge.id} value={edge.id}>
                    {edge.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="h-9 w-9 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold tabular-nums w-12 text-center">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity((q) => q + 1)}
                className="h-9 w-9 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Request Quote Button */}
          <div>
            <Button
              className="w-full"
              size="lg"
              disabled={!series || !effectiveShape || !effectiveSize || !effectiveBase}
              onClick={() => setQuoteModalOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              Request Quote
            </Button>
            {submitted && (
              <p className="text-sm text-brand-green font-medium mt-2 text-center">
                Quote request submitted successfully!
              </p>
            )}
          </div>

          {/* Quote Request Modal */}
          <QuoteRequestModal
            open={quoteModalOpen}
            onOpenChange={setQuoteModalOpen}
            config={{
              seriesCode: series,
              seriesName: SERIES_NAMES[series] || series,
              shapeCode: effectiveShape,
              shapeName: SHAPE_NAMES[effectiveShape] || effectiveShape,
              size: effectiveSize,
              baseCode: effectiveBase,
              baseName: BASE_NAMES[effectiveBase] || effectiveBase,
              baseFinish: baseFinish.name,
              topMaterial,
              topFinish: topFinish.name,
              edgeType: edgeTypes.find((e) => e.id === edgeType)?.name || edgeType,
              quantity,
            }}
            onSuccess={() => {
              setSubmitted(true);
              setTimeout(() => setSubmitted(false), 4000);
            }}
          />
        </div>
      </div>
    </div>
  );
}
