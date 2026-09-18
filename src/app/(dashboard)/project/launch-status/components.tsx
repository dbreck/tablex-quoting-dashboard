"use client";

/**
 * Launch Status — shared visual primitives.
 *
 * Status colors are semantic and always paired with a label (never color
 * alone): emerald = done, sky = ready, amber = open, rose = blocked.
 */

import type { ItemStatus } from "./data";

export const STATUS_META: Record<
  ItemStatus,
  { label: string; dot: string; chip: string }
> = {
  done: { label: "Done", dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ready: { label: "Ready", dot: "bg-sky-500", chip: "bg-sky-50 text-sky-700 border-sky-200" },
  open: { label: "To do", dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700 border-amber-200" },
  blocked: { label: "Blocked", dot: "bg-rose-500", chip: "bg-rose-50 text-rose-700 border-rose-200" },
};

export function StatusChip({ status }: { status: ItemStatus }) {
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

export function OwnerChip({ owner }: { owner: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
      {owner}
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

/** Numbered step in a vertical flow. */
export function FlowStep({
  n,
  title,
  detail,
  last = false,
}: {
  n: number | string;
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

/** Small uppercase heading used inside cards. */
export function CardHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">{children}</h3>
  );
}

/** Callout band for the one warning that matters. */
export function Warning({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-5">
      <p className="text-sm font-bold text-rose-800">{title}</p>
      <div className="mt-1.5 text-sm leading-relaxed text-rose-900/80">{children}</div>
    </div>
  );
}
