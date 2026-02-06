"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { JourneyPhase } from "@/types/customer-journey";

const emotionLabels: Record<number, string> = {
  2: "Very Positive",
  1: "Positive",
  0: "Neutral",
  "-1": "Negative",
  "-2": "Very Negative",
};

const emotionColors: Record<number, string> = {
  2: "#10b981",
  1: "#34d399",
  0: "#94a3b8",
  "-1": "#f59e0b",
  "-2": "#ef4444",
};

interface EmotionCurveProps {
  phases: JourneyPhase[];
}

function CustomDot(props: { cx?: number; cy?: number; payload?: { intensity: number } }) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;
  const color = emotionColors[payload.intensity] || "#94a3b8";
  return (
    <circle cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={2} />
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; intensity: number } }> }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const color = emotionColors[data.intensity] || "#94a3b8";
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-slate-700">{data.name}</p>
      <p className="text-xs" style={{ color }}>
        {emotionLabels[data.intensity] || "Neutral"}
      </p>
    </div>
  );
}

export function EmotionCurve({ phases }: EmotionCurveProps) {
  const data = phases
    .sort((a, b) => a.order - b.order)
    .map((p) => ({
      name: p.name.length > 20 ? p.name.slice(0, 18) + "..." : p.name,
      intensity: p.emotionIntensity,
    }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Emotion Curve</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
          <defs>
            <linearGradient id="emotionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="50%" stopColor="#94a3b8" stopOpacity={0.05} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis
            domain={[-2.5, 2.5]}
            ticks={[-2, -1, 0, 1, 2]}
            tick={{ fontSize: 10, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            tickFormatter={(v: number) => emotionLabels[v]?.split(" ")[0] || ""}
            width={50}
          />
          <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="intensity"
            stroke="#64748b"
            strokeWidth={2}
            fill="url(#emotionGradient)"
            dot={<CustomDot />}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
