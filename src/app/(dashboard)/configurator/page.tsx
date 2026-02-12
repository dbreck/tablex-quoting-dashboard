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
import { ShoppingCart, ChevronDown, ChevronRight, Plus, Minus } from "lucide-react";
import type { EnvironmentPreset } from "@/components/3d/ModelViewer";
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
};

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

  const availableSizes = useMemo(() => {
    if (!series || !shape) return [];
    return getAvailableSizes(series, shape);
  }, [series, shape]);

  const availableBases = useMemo(() => {
    if (!series || !shape) return [];
    return getAvailableBases(series, shape);
  }, [series, shape]);

  // Auto-select first shape + first size when series changes
  useEffect(() => {
    if (availableShapes.length > 0 && !shape) {
      setShape(availableShapes[0]);
    }
  }, [availableShapes, shape]);

  useEffect(() => {
    if (availableSizes.length > 0 && !size) {
      setSize(availableSizes[0]);
    }
  }, [availableSizes, size]);

  // Auto-select first base when none is selected
  useEffect(() => {
    if (availableBases.length > 0 && !base) {
      setBase(availableBases[0]);
    }
  }, [availableBases, base]);

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
  const { url: modelUrl } = useModelUrl({
    series,
    shape,
    size,
    base,
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
                    : !shape
                      ? "Choose a shape to preview"
                      : !size || !base
                        ? "Select size and base to load 3D model"
                        : "3D model not available for this configuration"}
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
              Shape{shape ? `: ${SHAPE_NAMES[shape] || shape}` : ""}
            </button>
            {shapesOpen && availableShapes.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {availableShapes.map((code) => (
                  <button
                    key={code}
                    onClick={() => handleShapeChange(code)}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs font-medium transition-colors cursor-pointer ${
                      shape === code
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
              value={size}
              onValueChange={setSize}
              disabled={!shape}
            >
              <SelectTrigger>
                <SelectValue placeholder={shape ? "Select size" : "Select shape first"} />
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
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Base
            </label>
            <Select
              value={base}
              onValueChange={setBase}
              disabled={!shape}
            >
              <SelectTrigger>
                <SelectValue placeholder={shape ? "Select base" : "Select shape first"} />
              </SelectTrigger>
              <SelectContent>
                {availableBases.map((code) => (
                  <SelectItem key={code} value={code}>
                    {BASE_NAMES[code] || code} ({code})
                  </SelectItem>
                ))}
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
            <div className="flex flex-wrap gap-2">
              {topFinishes.map((finish) => (
                <button
                  key={finish.id}
                  onClick={() => setTopFinish(finish)}
                  title={finish.name}
                  className={`h-8 w-8 rounded-full border-2 transition-all cursor-pointer ${
                    topFinish.id === finish.id
                      ? "border-brand-green scale-110 ring-2 ring-brand-green/30"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                  style={{ backgroundColor: finish.hex }}
                />
              ))}
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
              disabled={!series || !shape || !size || !base}
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
              shapeCode: shape,
              shapeName: SHAPE_NAMES[shape] || shape,
              size,
              baseCode: base,
              baseName: BASE_NAMES[base] || base,
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
