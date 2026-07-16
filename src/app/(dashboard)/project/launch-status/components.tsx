"use client";

/**
 * Launch Status — shared visual primitives.
 *
 * Status colors are semantic and always paired with a label (never color
 * alone): emerald = done, amber = partial, slate = waiting on content.
 */

import type { AreaStatus } from "./data";

export const STATUS_META: Record<
  AreaStatus,
  { label: string; dot: string; chip: string; bar: string }
> = {
  done: {
    label: "Done",
    dot: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bar: "bg-emerald-500",
  },
  partial: {
    label: "Partial",
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-700 border-amber-200",
    bar: "bg-amber-500",
  },
  blocked: {
    label: "Needs content",
    dot: "bg-slate-400",
    chip: "bg-slate-100 text-slate-600 border-slate-200",
    bar: "bg-slate-400",
  },
};

export function StatusChip({ status }: { status: AreaStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${m.chip}`}
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

export function SectionIntro({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-gray-600">{children}</div>
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-5 ${className}`}>
      {children}
    </div>
  );
}

export function StatTile({
  value,
  label,
  sub,
  accent = false,
}: {
  value: string;
  label: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <Card className="flex flex-col justify-between">
      <p
        className={`text-3xl font-bold tabular-nums ${accent ? "text-brand-green" : "text-gray-900"}`}
      >
        {value}
      </p>
      <div className="mt-2">
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
      </div>
    </Card>
  );
}

/**
 * Horizontal composition bar. Every segment is direct-labeled below the bar
 * (label + count), so color is never the only encoding.
 */
export function CompositionBar({
  segments,
  total,
}: {
  segments: { label: string; value: number; color: string }[];
  total: number;
}) {
  return (
    <div>
      <div className="flex h-8 w-full gap-0.5 overflow-hidden rounded-lg">
        {segments.map((s) => (
          <div
            key={s.label}
            className={`${s.color} min-w-[2px] transition-all`}
            style={{ width: `${(s.value / total) * 100}%` }}
            title={`${s.label}: ${s.value.toLocaleString()}`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5">
        {segments.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-2 text-sm text-gray-700">
            <span aria-hidden className={`h-2.5 w-2.5 rounded-sm ${s.color}`} />
            <span className="font-medium">{s.label}</span>
            <span className="tabular-nums text-gray-500">
              {s.value.toLocaleString()} ({Math.round((s.value / total) * 100)}%)
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Labeled horizontal bar in a ranked list (value bar + direct label). */
export function BarRow({
  label,
  value,
  max,
  suffix,
}: {
  label: string;
  value: number;
  max: number;
  suffix: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-sm font-medium text-gray-700">{label}</span>
      <div className="h-5 flex-1 rounded bg-gray-100">
        <div
          className="flex h-5 items-center rounded bg-brand-green pl-2"
          style={{ width: `${Math.max((value / max) * 100, 8)}%` }}
        >
          <span className="text-[11px] font-bold text-white tabular-nums">{value}</span>
        </div>
      </div>
      <span className="w-24 shrink-0 text-right text-xs text-gray-500">{suffix}</span>
    </div>
  );
}

/** Numbered step in a vertical flow. */
export function FlowStep({
  n,
  title,
  detail,
  last = false,
}: {
  n: number;
  title: string;
  detail: string;
  last?: boolean;
}) {
  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      {!last && (
        <span
          aria-hidden
          className="absolute left-[15px] top-9 h-[calc(100%-2rem)] w-px bg-gray-200"
        />
      )}
      <span className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">
        {n}
      </span>
      <div className="pt-1">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="mt-0.5 text-sm text-gray-600">{detail}</p>
      </div>
    </div>
  );
}
