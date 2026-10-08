"use client";

/**
 * Order Workflow — the six tab sections. Pure presentation over ./data,
 * reusing the Launch Status primitives.
 */

import { Fragment, useState } from "react";
import { salesOrderSteps } from "@/data/sales-order-steps";
import {
  BRIAN_ASKS,
  BRIAN_QUOTE,
  CHALLENGES,
  MATRIX,
  MATRIX_META,
  MEETING,
  MODEL_CHILDREN,
  MODEL_CORE,
  MODEL_DECISION,
  PHASES,
  PIPELINE,
  QUESTION_GROUPS,
  REUSE,
  ROUND_LANES,
  ROUND_TRIP,
  ROUND_TRIP_NOTES,
  ROUND_TRIP_QUESTIONS,
  TODAY_LANES,
  TODAY_STEPS,
  FILES_RECEIVED,
  type MatrixStatus,
  type ModelBox,
  type When,
} from "./data";
import {
  Card,
  CardHeading,
  FlowStep,
  OwnerChip,
  SectionIntro,
  StatTile,
  StatusChip,
} from "../launch-status/components";

/* ------------------------------------------------------------------ */
/* Local primitives                                                    */
/* ------------------------------------------------------------------ */

function ArrowRight({ className = "text-gray-300" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`h-5 w-5 shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

function ArrowDown({ className = "text-gray-300" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`h-5 w-5 shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v15M6 13l6 6 6-6" />
    </svg>
  );
}

function MatrixChip({ status }: { status: MatrixStatus }) {
  const m = MATRIX_META[status];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${m.chip}`}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function ConfirmChip({ compact = false }: { compact?: boolean }) {
  return (
    <span
      title="Confirm on call"
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800"
    >
      <span aria-hidden>?</span> Confirm
      <span className={compact ? "hidden 2xl:inline" : ""}> on call</span>
    </span>
  );
}

const WHEN_STYLE: Record<When, { box: string; tag: string; label: string }> = {
  today: { box: "border-gray-300 bg-white text-gray-800", tag: "bg-gray-200 text-gray-700", label: "Today" },
  future: { box: "border-dashed border-brand-green bg-brand-green/5 text-gray-900", tag: "bg-brand-green text-white", label: "Future" },
  both: { box: "border-brand-navy bg-white text-gray-900", tag: "bg-brand-navy text-white", label: "Both" },
};

function Hero({ eyebrow, title, sub, children }: { eyebrow: string; title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-brand-navy text-white">
      <div className="p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">{title}</h2>
        {sub && <p className="mt-2 max-w-2xl text-sm text-white/80">{sub}</p>}
        {children}
      </div>
    </div>
  );
}

/* ================================================================== */
/* 1 · Brian's ask                                                     */
/* ================================================================== */

export function AskSection() {
  return (
    <div className="space-y-8">
      <Hero eyebrow={`Brian's ask · ${MEETING.date}`} title="One connected workflow" sub="Three emails on 10/07. Once a Sales Order exists, it is the single record from acceptance to payment.">
        <div className="mt-6 flex items-stretch gap-1.5">
          {PIPELINE.map((p, i) => (
            <Fragment key={p.key}>
              <div
                className={`flex min-w-0 flex-1 flex-col justify-center rounded-xl px-3 py-4 text-center ${
                  p.key === "so" ? "bg-brand-green text-white ring-2 ring-white/40" : "bg-white/10 text-white"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-white/60">Step {i + 1}</p>
                <p className="mt-1 text-base font-bold leading-tight xl:text-lg">{p.label}</p>
                <p className="mt-1 text-[11px] leading-snug text-white/75">{p.sub}</p>
              </div>
              {i < PIPELINE.length - 1 && (
                <div className="flex items-center">
                  <ArrowRight className="text-white/50" />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </Hero>

      <blockquote className="rounded-xl border-l-4 border-brand-green bg-white p-5 text-base italic leading-relaxed text-gray-800 shadow-sm">
        &ldquo;{BRIAN_QUOTE}&rdquo;
        <footer className="mt-2 text-xs font-semibold not-italic text-gray-500">Brian Craig, 10/07</footer>
      </blockquote>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {BRIAN_ASKS.map((a) => (
          <Card key={a.heading} className="flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <CardHeading>{a.heading}</CardHeading>
              <span
                className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                  a.email === "Email 1" ? "bg-brand-navy/10 text-brand-navy" : "bg-brand-green/15 text-brand-green"
                }`}
              >
                {a.email}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-gray-900">{a.summary}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
              {a.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm font-bold text-emerald-900">
          <span aria-hidden>✓ </span>Files received 10/08
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {FILES_RECEIVED.map((f) => (
            <li key={f.name} className="rounded-lg border border-emerald-200 bg-white px-3 py-2">
              <p className="break-words text-xs font-bold text-emerald-900">{f.name}</p>
              <p className="mt-0.5 text-xs text-emerald-900/70">{f.what}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ================================================================== */
/* 2 · What exists today                                               */
/* ================================================================== */

export function TodaySection() {
  const cols = Math.max(...TODAY_STEPS.map((s) => s.col));
  const counts = (["exists", "partial", "new"] as MatrixStatus[]).map((k) => ({
    k,
    n: MATRIX.filter((r) => r.status === k).length,
  }));
  return (
    <div className="space-y-8">
      <SectionIntro title="The live flow on tablex.com">
        <p>Quote to acceptance works end to end today. After &ldquo;accepted&rdquo;, the app stops and the order is re-keyed by hand.</p>
      </SectionIntro>

      {/* Swimlane */}
      <Card className="overflow-x-auto p-0">
        <div className="min-w-[760px]">
          <div className="grid border-b border-gray-200 bg-gray-50" style={{ gridTemplateColumns: `112px repeat(${cols}, minmax(0, 1fr))` }}>
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">Lane</div>
            {Array.from({ length: cols }, (_, i) => (
              <div key={i} className="min-w-0 px-1 py-2 text-center leading-tight text-[10px] font-bold uppercase tracking-wide text-gray-400">
                {i + 1 === cols ? "After accept" : `Step ${i + 1}`}
              </div>
            ))}
          </div>
          {TODAY_LANES.map((lane, li) => (
            <div
              key={lane.key}
              className={`grid ${li < TODAY_LANES.length - 1 ? "border-b border-gray-100" : ""}`}
              style={{ gridTemplateColumns: `112px repeat(${cols}, minmax(0, 1fr))` }}
            >
              <div className="flex min-w-0 flex-col justify-center border-r border-gray-100 bg-gray-50/60 px-3 py-4">
                <p className="break-words text-xs font-bold leading-tight text-gray-900">{lane.label}</p>
                <p className="mt-0.5 break-words text-[11px] leading-tight text-gray-500">{lane.sub}</p>
              </div>
              {Array.from({ length: cols }, (_, ci) => {
                const steps = TODAY_STEPS.filter((s) => s.lane === lane.key && s.col === ci + 1);
                return (
                  <div key={ci} className="relative flex min-w-0 flex-col justify-center gap-1.5 p-1.5">
                    {steps.map((s) => (
                      <div
                        key={s.title}
                        className={`min-w-0 break-words rounded-lg border p-2 ${
                          s.stop
                            ? "border-rose-300 bg-rose-50"
                            : lane.key === "system"
                              ? "border-brand-navy/20 bg-brand-navy/5"
                              : lane.key === "desk"
                                ? "border-brand-green/40 bg-brand-green/5"
                                : "border-gray-200 bg-white"
                        }`}
                      >
                        <p className={`text-[11px] font-bold leading-tight ${s.stop ? "text-rose-700" : "text-gray-900"}`}>
                          {s.stop && <span aria-hidden>■ </span>}
                          {s.title}
                        </p>
                        <p className={`mt-1 text-[11px] leading-tight ${s.stop ? "text-rose-800/80" : "text-gray-600"}`}>{s.detail}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
          <div className="flex items-center gap-2 border-t border-gray-200 bg-gray-50 px-4 py-2 text-[11px] text-gray-500">
            <span>Time flows</span>
            <ArrowRight className="text-gray-400" />
            <span className="ml-auto">Everything right of &ldquo;accepted&rdquo; happens outside the app.</span>
          </div>
        </div>
      </Card>

      {/* Feb strip */}
      <div>
        <CardHeading>How the order side worked when we started (Feb 2026 interviews)</CardHeading>
        <div className="mt-3 grid grid-cols-4 gap-y-3 xl:grid-cols-8">
          {salesOrderSteps.map((s, i) => (
            <div key={s.id} className="flex items-stretch">
              <div className="flex min-w-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white p-3">
                <span className="text-[10px] font-bold text-gray-400">{i + 1}</span>
                <p className="mt-0.5 text-xs font-bold leading-tight text-gray-900">{s.name}</p>
                <div className="mt-auto flex flex-wrap gap-1 pt-2">
                  <OwnerChip owner={s.owner} />
                  <span className="rounded-md bg-brand-navy/5 px-1.5 py-0.5 text-[10px] font-medium text-brand-navy">{s.tool}</span>
                </div>
              </div>
              {i < salesOrderSteps.length - 1 && (
                <div className="flex items-center px-0.5">
                  <ArrowRight className="h-4 w-4 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-3 gap-4">
        {counts.map(({ k, n }) => (
          <Card key={k}>
            <p className={`text-3xl font-bold tabular-nums ${MATRIX_META[k].tile}`}>{n}</p>
            <div className="mt-2 flex items-center gap-2">
              <MatrixChip status={k} />
              <span className="text-sm text-gray-600">of {MATRIX.length} asks</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Matrix */}
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Brian&apos;s ask</th>
              <th className="px-4 py-3">Today</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MATRIX.map((r) => (
              <tr key={r.ask} className="align-top">
                <td className="w-[19%] px-4 py-3 font-semibold text-gray-900">
                  <span className="flex items-center gap-2">
                    <span aria-hidden className={`h-2.5 w-2.5 shrink-0 rounded-full ${MATRIX_META[r.status].dot}`} />
                    {r.ask}
                  </span>
                </td>
                <td className="w-[26%] px-4 py-3 text-gray-700">{r.today}</td>
                <td className="w-[10%] px-4 py-3">
                  <MatrixChip status={r.status} />
                </td>
                <td className="px-4 py-3 text-gray-600">{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ================================================================== */
/* 3 · After accept: the round trip                                    */
/* ================================================================== */

export function RoundTripSection() {
  const grid = `112px repeat(${ROUND_TRIP.length}, minmax(0, 1fr))`;
  return (
    <div className="space-y-8">
      <Hero eyebrow="After accept" title="The round trip: PO to payment" sub="Seven stages, seven lanes. Grey boxes happen today, outside or inside the app. Green dashed boxes are what we would build." />

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
        {(["today", "future"] as When[]).map((w) => (
          <span key={w} className="flex items-center gap-1.5">
            <span className={`inline-block h-4 w-6 rounded border ${WHEN_STYLE[w].box}`} />
            {WHEN_STYLE[w].label}
          </span>
        ))}
        <ConfirmChip />
        <span>= stage where we need TableX to confirm how it works</span>
      </div>

      <Card className="overflow-x-auto p-0">
        <div className="min-w-[760px]">
          {/* Stage header */}
          <div className="grid border-b border-gray-200 bg-brand-navy text-white" style={{ gridTemplateColumns: grid }}>
            <div className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide text-white/60">Lane</div>
            {ROUND_TRIP.map((s) => (
              <div key={s.n} className="relative flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-2.5 text-center">
                <div className="flex min-w-0 flex-wrap items-center justify-center gap-1.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green text-[11px] font-bold">{s.n}</span>
                  <span className="break-words text-xs font-bold leading-tight xl:text-sm">{s.title}</span>
                </div>
                {s.confirm && <ConfirmChip compact />}
                {s.n < ROUND_TRIP.length && (
                  <span aria-hidden className="absolute -right-2 top-1/2 z-10 -translate-y-1/2 text-white/40">
                    ▶
                  </span>
                )}
              </div>
            ))}
          </div>
          {ROUND_LANES.map((lane, li) => (
            <div
              key={lane.key}
              className={`grid ${li < ROUND_LANES.length - 1 ? "border-b border-gray-100" : ""} ${li % 2 ? "bg-gray-50/40" : ""}`}
              style={{ gridTemplateColumns: grid }}
            >
              <div className="flex min-w-0 flex-col justify-center border-r border-gray-100 px-3 py-3">
                <p className="break-words text-xs font-bold leading-tight text-gray-900">{lane.label}</p>
                <p className="mt-0.5 break-words text-[11px] leading-tight text-gray-500">{lane.who}</p>
              </div>
              {ROUND_TRIP.map((stage) => {
                const cells = stage.cells.filter((c) => c.lane === lane.key);
                return (
                  <div key={stage.n} className="flex min-h-[64px] min-w-0 flex-col justify-center gap-1.5 border-r border-gray-100 p-1 last:border-r-0">
                    {cells.map((c) => (
                      <div key={c.text} className={`min-w-0 break-words rounded-md border p-1.5 ${WHEN_STYLE[c.when].box}`}>
                        <span className={`inline-block rounded px-1 py-px text-[9px] font-bold uppercase tracking-wide ${WHEN_STYLE[c.when].tag}`}>
                          {WHEN_STYLE[c.when].label}
                        </span>
                        <p className="mt-1 text-[11px] font-medium leading-tight">{c.text}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {ROUND_TRIP_NOTES.map((n) => (
          <Card key={n.title}>
            <CardHeading>{n.title}</CardHeading>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">{n.body}</p>
          </Card>
        ))}
      </div>

      <Card className="border-amber-200">
        <div className="flex items-center justify-between gap-3">
          <CardHeading>Confirm on the call</CardHeading>
          <ConfirmChip />
        </div>
        <ol className="mt-4 space-y-3">
          {ROUND_TRIP_QUESTIONS.map((q, i) => (
            <li key={q.q} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">{i + 1}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{q.q}</p>
                {q.context && <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{q.context}</p>}
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

/* ================================================================== */
/* 4 · The build                                                       */
/* ================================================================== */

const MODEL_TONE: Record<ModelBox["tone"], { box: string; tag: string; label: string }> = {
  existing: { box: "border-gray-300 bg-white", tag: "bg-gray-200 text-gray-700", label: "Existing" },
  new: { box: "border-brand-green bg-brand-green/5", tag: "bg-brand-green text-white", label: "New" },
  extend: { box: "border-amber-300 bg-amber-50", tag: "bg-amber-500 text-white", label: "Extend" },
};

function ModelCard({ m, big = false }: { m: ModelBox; big?: boolean }) {
  const t = MODEL_TONE[m.tone];
  return (
    <div className={`rounded-xl border-2 p-4 ${t.box} ${big ? "min-w-0 flex-1" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <code className={`font-mono font-bold text-gray-900 ${big ? "text-base" : "text-sm"}`}>{m.name}</code>
        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${t.tag}`}>{t.label}</span>
      </div>
      <p className="mt-1 text-xs text-gray-600">{m.role}</p>
      <ul className="mt-2 space-y-0.5">
        {m.fields.map((f) => (
          <li key={f} className="font-mono text-[11px] leading-snug text-gray-700">· {f}</li>
        ))}
      </ul>
    </div>
  );
}

export function BuildSection() {
  const [quotes, orders] = MODEL_CORE;
  return (
    <div className="space-y-8">
      <SectionIntro title="What we would build">
        <p>The quote stays the line and pricing record. A new order record sits beside it and carries everything that happens after acceptance.</p>
      </SectionIntro>

      {/* Data model */}
      <Card>
        <CardHeading>Data model sketch</CardHeading>
        <div className="mt-4 flex items-stretch gap-2">
          <ModelCard m={quotes} big />
          <div className="flex flex-col items-center justify-center px-1">
            <span className="text-[10px] font-bold text-gray-500">1 : 1</span>
            <ArrowRight className="text-brand-green" />
          </div>
          <div className="min-w-0 flex-[1.6]">
            <ModelCard m={orders} />
          </div>
        </div>
        <div className="mt-2 flex justify-end pr-[18%]">
          <div className="flex flex-col items-center">
            <ArrowDown className="text-brand-green" />
            <span className="text-[10px] font-bold text-gray-500">1 : n</span>
          </div>
        </div>
        <div className="mt-2 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          {MODEL_CHILDREN.map((m) => (
            <ModelCard key={m.name} m={m} />
          ))}
        </div>
        <p className="mt-4 rounded-lg bg-brand-navy px-4 py-3 text-sm font-semibold text-white">{MODEL_DECISION}</p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Phase timeline */}
        <Card>
          <CardHeading>Phased plan (dates set on the call)</CardHeading>
          <ol className="relative mt-5 space-y-4">
            <span aria-hidden className="absolute bottom-2 left-[19px] top-2 w-0.5 bg-gray-200" />
            {PHASES.map((p) => (
              <li key={p.key} className="relative flex gap-4">
                <span
                  className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    p.track === "parallel"
                      ? "border-2 border-dashed border-brand-navy bg-white text-brand-navy"
                      : p.track === "later"
                        ? "border-2 border-gray-300 bg-gray-100 text-gray-500"
                        : "bg-brand-navy text-white"
                  }`}
                >
                  {p.track ? (p.track === "parallel" ? "∥" : "…") : p.label}
                </span>
                <div className={`min-w-0 flex-1 rounded-xl border p-4 ${p.track === "later" ? "border-gray-200 bg-gray-50" : "border-gray-200 bg-white"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-gray-900">
                      {p.track ? <span className="mr-1.5 text-[10px] font-bold uppercase text-gray-500">{p.label} ·</span> : null}
                      {p.title}
                    </p>
                    <StatusChip status="open" />
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    {p.items.map((it) => (
                      <li key={it} className="flex gap-2">
                        <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-green" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        {/* Reuse */}
        <div className="space-y-6">
          <Card>
            <CardHeading>What we reuse</CardHeading>
            <p className="mt-1 text-xs text-gray-500">Already live on tablex.com.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {REUSE.map((r) => (
                <span key={r} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  <span aria-hidden>✓</span>
                  {r}
                </span>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeading>One renderer, four documents</CardHeading>
            <div className="mt-4 space-y-2">
              {[
                { t: "Quote", p: true },
                { t: "Sales Order", p: true },
                { t: "Work Order", p: false },
                { t: "Packing Slip", p: false },
              ].map((d) => (
                <div key={d.t} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                  <span className="text-sm font-semibold text-gray-900">{d.t}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${d.p ? "bg-brand-green/15 text-brand-green" : "bg-gray-100 text-gray-500"}`}>
                    {d.p ? "With pricing" : "No pricing"}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500">Invoice stays in Xero; the SO shows its number and status.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* 5 · Challenges & decisions                                          */
/* ================================================================== */

const KIND_META = {
  decided: { label: "Decided", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-emerald-500" },
  open: { label: "Open question", chip: "bg-amber-50 text-amber-700 border-amber-200", bar: "bg-amber-500" },
  risk: { label: "Risk", chip: "bg-rose-50 text-rose-700 border-rose-200", bar: "bg-rose-500" },
} as const;

export function ChallengesSection() {
  return (
    <div className="space-y-8">
      <SectionIntro title="Challenges and decisions">
        <p>Three decisions are already made. The rest need TableX input or carry risk to the schedule.</p>
      </SectionIntro>
      <div className="grid grid-cols-3 gap-4">
        {(Object.keys(KIND_META) as (keyof typeof KIND_META)[]).map((k) => (
          <StatTile key={k} value={`${CHALLENGES.filter((c) => c.kind === k).length}`} label={KIND_META[k].label} accent={k === "decided"} />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CHALLENGES.map((c) => {
          const m = KIND_META[c.kind];
          return (
            <Card key={c.title} className="relative overflow-hidden pl-6">
              <span aria-hidden className={`absolute inset-y-0 left-0 w-1.5 ${m.bar}`} />
              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${m.chip}`}>{m.label}</span>
              <p className="mt-3 text-base font-bold text-gray-900">{c.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{c.body}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/* 6 · Questions for the call                                          */
/* ================================================================== */

export function QuestionsSection() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const total = QUESTION_GROUPS.reduce((n, g) => n + g.questions.length, 0);
  const done = Object.values(checked).filter(Boolean).length;
  const offsets = QUESTION_GROUPS.map((_, gi) =>
    QUESTION_GROUPS.slice(0, gi).reduce((sum, g) => sum + g.questions.length, 0),
  );
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionIntro title="Questions for the call">
          <p>Tick each one as it is answered. Nothing is saved; this is a live checklist.</p>
        </SectionIntro>
        <div className="rounded-xl bg-brand-navy px-5 py-3 text-white">
          <p className="text-2xl font-bold tabular-nums">
            {done} <span className="text-base text-white/60">/ {total}</span>
          </p>
          <p className="text-[11px] uppercase tracking-wide text-white/60">Answered</p>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full rounded-full bg-brand-green transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {QUESTION_GROUPS.map((g, gi) => (
          <Card key={g.who}>
            <CardHeading>{g.who}</CardHeading>
            <ul className="mt-3 space-y-1">
              {g.questions.map((q, qi) => {
                const n = offsets[gi] + qi + 1;
                const id = `${g.who}:${q}`;
                const on = !!checked[id];
                return (
                  <li key={id}>
                    <label className={`flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 ${on ? "opacity-60" : ""}`}>
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={(e) => setChecked((c) => ({ ...c, [id]: e.target.checked }))}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-brand-green,#16a34a)]"
                      />
                      <span className="w-5 shrink-0 text-xs font-bold tabular-nums text-gray-400">{n}.</span>
                      <span className={`text-sm text-gray-800 ${on ? "line-through" : ""}`}>{q}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeading>After the call</CardHeading>
        <div className="mt-4">
          {[
            { t: "Map the files to the build", d: "Mark's tracker, cover sheet and packaging form become P1, P4 and P5 specs." },
            { t: "Danny sets phase dates", d: "P1 first; priority order from Brian." },
            { t: "Scope + estimate to Richie", d: "Second project-sized effort, quoted separately." },
          ].map((s, i, arr) => (
            <FlowStep key={s.t} n={i + 1} title={s.t} detail={s.d} last={i === arr.length - 1} />
          ))}
        </div>
      </Card>
    </div>
  );
}
