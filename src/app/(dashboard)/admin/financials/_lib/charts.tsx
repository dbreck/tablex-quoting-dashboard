"use client";

/**
 * Visual primitives for /admin/financials: cards, stat tiles, empty states, banners,
 * the shared chart palette and axis/tooltip formatters. Palette matches QueueClient.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { compactDollars } from "./aggregate";

export const COLORS = [
  "#8dc63f",
  "#1a3c5c",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#10b981",
  "#6366f1",
  "#f97316",
  "#94a3b8",
];

export const GRID = "#e2e8f0";
export const AXIS = { fontSize: 11, fill: "#64748b" };
export const TOOLTIP_STYLE = { borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 };

export const dollarsTick = (v: unknown) => compactDollars(Number(v));
export const dollarsTip = (v: unknown) => compactDollars(Number(v));
export const countTick = (v: unknown) => new Intl.NumberFormat("en-US").format(Number(v));

/** Hatch pattern for "from P&L, invoice detail pending" bars. Render once per chart host. */
export const HATCH_ID = "fin-hatch-pending";
export function HatchDefs() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <defs>
        <pattern id={HATCH_ID} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#e8f4d9" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="#8dc63f" strokeWidth="2.5" />
        </pattern>
      </defs>
    </svg>
  );
}

export function Panel({
  title,
  caption,
  right,
  children,
  className,
}: {
  title?: string;
  caption?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-gray-200 bg-white p-5", className)}>
      {(title || right) && (
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-gray-900">{title}</h3>}
            {caption && <p className="mt-0.5 text-xs text-gray-500">{caption}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatTile({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  tone?: "default" | "up" | "down" | "muted";
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold tabular-nums",
          tone === "up" && "text-emerald-700",
          tone === "down" && "text-rose-700",
          tone === "muted" && "text-gray-400",
          tone === "default" && "text-gray-900",
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

export function EmptyState({ message, className }: { message: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-[120px] items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-xs font-medium text-gray-500",
        className,
      )}
    >
      {message}
    </div>
  );
}

export function Banner({ tone = "amber", children }: { tone?: "amber" | "sky" | "rose"; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-xs",
        tone === "amber" && "border-amber-200 bg-amber-50 text-amber-800",
        tone === "sky" && "border-sky-200 bg-sky-50 text-sky-800",
        tone === "rose" && "border-rose-200 bg-rose-50 text-rose-800",
      )}
    >
      {children}
    </div>
  );
}

export function Chip({ children, tone = "gray" }: { children: ReactNode; tone?: "green" | "gray" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500",
      )}
    >
      {children}
    </span>
  );
}

/** Small segmented control in the same style as the page's view switcher. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-lg bg-gray-100 p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
            value === o.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Table({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="border-b border-gray-200 text-left text-gray-500">{head}</thead>
        <tbody className="divide-y divide-gray-100 text-gray-700">{children}</tbody>
      </table>
    </div>
  );
}
