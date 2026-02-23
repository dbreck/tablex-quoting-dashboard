"use client";

import { useState } from "react";
import { ModelViewer } from "@/components/3d";

const TEST_BASES = [
  { name: "H-Base", file: "/test-bases/h-base_2024.glb", maps: "HT, H-Leg (Elite 08, Fundamental 33)" },
  { name: "V-Base", file: "/test-bases/v-base_2415.glb", maps: "VTR (Elite 08)" },
  { name: "A-Base", file: "/test-bases/a-base_2415.glb", maps: "A-Base (Fundamental 33)" },
  { name: "Disc Base (Round)", file: "/test-bases/disc-round_4023.glb", maps: "DP, D variants (Primary 44)" },
  { name: "Twin T-Base", file: "/test-bases/tt-base_5048.glb", maps: "TT (Surge 99)" },
  { name: "C-Base / C-Frame", file: "/test-bases/c-base_3024.glb", maps: "CS (Primary 44), WT cantilever" },
  { name: "U-Base", file: "/test-bases/u-base_3015.glb", maps: "OU (Ultra 00)" },
  { name: "Quad X-Base", file: "/test-bases/x-base-quad_4060.glb", maps: "QC (Primary 44)" },
];

export default function TestBasesPage() {
  const [selected, setSelected] = useState(0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Supplier Base Preview</h1>
        <p className="text-sm text-slate-500 mt-1">
          3D base models sourced from ModSilver — testing conversion pipeline for missing TableX base types
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model viewer */}
        <div className="lg:col-span-2">
          <ModelViewer
            modelUrl={TEST_BASES[selected].file}
            className="!aspect-[4/3]"
          />
          <div className="mt-2 text-center">
            <span className="text-lg font-semibold text-slate-800">{TEST_BASES[selected].name}</span>
            <span className="text-sm text-slate-500 ml-2">→ {TEST_BASES[selected].maps}</span>
          </div>
        </div>

        {/* Base selector */}
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Select Base Type</h2>
          {TEST_BASES.map((base, i) => (
            <button
              key={base.file}
              onClick={() => setSelected(i)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                i === selected
                  ? "border-brand-green bg-brand-green/5 text-slate-900"
                  : "border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900"
              }`}
            >
              <div className="font-medium">{base.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">{base.maps}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
