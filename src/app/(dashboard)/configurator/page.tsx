"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
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
  getShapesForSeries,
  getBasesForShape,
} from "@/data/compatibility-matrices";
import {
  powderCoatFinishes,
  hplFinishes,
  tflFinishes,
  solidSurfaceFinishes,
  butcherBlockFinishes,
  edgeTypes,
  type FinishOption,
} from "@/data/finish-catalog";
import { ShoppingCart } from "lucide-react";

const ModelViewer3D = dynamic(
  () =>
    import("@/components/3d/ModelViewer").then((mod) => ({
      default: mod.ModelViewer,
    })),
  { ssr: false }
);

// Series that have 3D models (codes match sku-to-model.ts SERIES_WITH_CAD)
const CONFIGURATOR_SERIES = [
  { code: "00", name: "Ultra" },
  { code: "30", name: "Foundation" },
  { code: "33", name: "Fundamental" },
];

// Available shapes per series (only shapes that have GLB models)
// Overrides the global compatibility matrix which includes shapes without CAD
const SERIES_SHAPES: Record<string, string[]> = {
  "00": ["TC", "BT", "D", "RD", "TA"],  // Ultra: confirmed from 81 GLBs
};

// Available bases per series (only bases that have GLB models)
const SERIES_BASES: Record<string, string[]> = {
  "00": ["U"],             // Ultra: U-Leg only
  "30": ["T", "X", "U"],   // Foundation: placeholder until converted
  "33": ["T", "X", "U"],   // Fundamental: placeholder until converted
};

// Default "hero" model per series — shown immediately when series is selected
// before user picks shape/size/base (a representative table for the series)
const SERIES_DEFAULT_GLB: Record<string, string> = {
  "00": "tc3060u28.glb",   // Ultra: 30x60 rectangular, U-leg
};

// Shape display names from compatibility-matrices
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
};

// Common table sizes (raw numeric format matching SKU parser)
const COMMON_SIZES = [
  { raw: "2448", label: '24" x 48"' },
  { raw: "2460", label: '24" x 60"' },
  { raw: "2472", label: '24" x 72"' },
  { raw: "3048", label: '30" x 48"' },
  { raw: "3060", label: '30" x 60"' },
  { raw: "3072", label: '30" x 72"' },
  { raw: "3096", label: '30" x 96"' },
  { raw: "3636", label: '36" x 36"' },
  { raw: "3648", label: '36" x 48"' },
  { raw: "3660", label: '36" x 60"' },
  { raw: "3672", label: '36" x 72"' },
  { raw: "3696", label: '36" x 96"' },
  { raw: "4242", label: '42" x 42"' },
  { raw: "4260", label: '42" x 60"' },
  { raw: "4848", label: '48" x 48"' },
  { raw: "4896", label: '48" x 96"' },
  { raw: "36", label: '36" Round' },
  { raw: "42", label: '42" Round' },
  { raw: "48", label: '48" Round' },
  { raw: "60", label: '60" Round' },
];

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

export default function ConfiguratorPage() {
  const [series, setSeries] = useState<string>("");
  const [shape, setShape] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [base, setBase] = useState<string>("");
  const [baseFinish, setBaseFinish] = useState<FinishOption>(powderCoatFinishes[0]);
  const [topMaterial, setTopMaterial] = useState<TopMaterial>("hpl");
  const [topFinish, setTopFinish] = useState<FinishOption>(hplFinishes[0]);
  const [edgeType, setEdgeType] = useState<string>(edgeTypes[0].id);

  // Filtered options based on selections
  const availableShapes = useMemo(() => {
    if (!series) return [];
    // Use series-specific shapes if available (only shapes with GLB models)
    return SERIES_SHAPES[series] ?? getShapesForSeries(series);
  }, [series]);

  const availableBases = useMemo(() => {
    if (!series || !shape) return [];
    // Use series-specific bases (only bases that have GLB models)
    return SERIES_BASES[series] ?? getBasesForShape(shape);
  }, [series, shape]);

  // Resolve model URL from config — falls back to series default hero model
  const { url: configModelUrl } = useModelUrl({
    series,
    shape,
    size,
    base,
  });

  const defaultGlb = series ? SERIES_DEFAULT_GLB[series] : undefined;
  const defaultUrl = defaultGlb
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/models/${defaultGlb}`
    : null;

  const modelUrl = configModelUrl ?? defaultUrl;

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
                className="w-full aspect-[4/3]"
              />
              {!modelUrl && series && shape && size && (
                <p className="text-xs text-slate-400 text-center mt-2">
                  3D model not available for this configuration
                </p>
              )}
            </CardContent>
          </Card>
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
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Shape
            </label>
            {availableShapes.length > 0 ? (
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
            ) : (
              <p className="text-sm text-slate-400">Select a series first</p>
            )}
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
                {COMMON_SIZES.map((s) => (
                  <SelectItem key={s.raw} value={s.raw}>
                    {s.label}
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

          {/* Request Quote Button */}
          <Link href="/quote/new" className="block">
            <Button className="w-full" size="lg">
              <ShoppingCart className="h-5 w-5" />
              Request Quote
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
