"use client";

import { useState, useMemo, useEffect } from "react";
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

// Series that have 3D models — only series present in MODEL_AVAILABILITY
const CONFIGURATOR_SERIES = Object.keys(MODEL_AVAILABILITY).map((code) => {
  const names: Record<string, string> = { "00": "Ultra", "30": "Foundation", "33": "Fundamental" };
  return { code, name: names[code] ?? code };
});

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
  TOS: "T-Base (Offset)",
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

export default function ConfiguratorPage() {
  const [series, setSeries] = useState<string>("");
  const [shape, setShape] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [base, setBase] = useState<string>("");
  const [baseFinish, setBaseFinish] = useState<FinishOption>(powderCoatFinishes[0]);
  const [topMaterial, setTopMaterial] = useState<TopMaterial>("hpl");
  const [topFinish, setTopFinish] = useState<FinishOption>(hplFinishes[0]);
  const [edgeType, setEdgeType] = useState<string>(edgeTypes[0].id);

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

  // Auto-select base when only one option exists
  useEffect(() => {
    if (availableBases.length === 1 && base !== availableBases[0]) {
      setBase(availableBases[0]);
    }
  }, [availableBases, base]);

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
                edgeFinish={topFinish}
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
