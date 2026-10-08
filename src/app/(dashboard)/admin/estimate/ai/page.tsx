"use client";

/**
 * /admin/estimate/ai — UNLINKED. The Order Workflow estimate re-run for
 * Claude Fable agent teams, four pricing scenarios, and the reasoning on
 * what to charge when AI does most of the work. Danny + Richie only.
 */

import { cn, formatCurrency } from "@/lib/utils";
import {
  AI_DAYS,
  AI_HUMAN_COST,
  AI_HUMAN_HOURS,
  AI_LINES,
  AI_SPEND,
  LINE_ITEMS,
  RECOMMENDED,
  RICHIE_NOTE,
  SCENARIOS,
  THINKING,
  TOTAL_COST,
  TRAD_HOURS,
  lineCost,
} from "@/data/order-workflow-estimate-ai";

const VERDICT = {
  no: { label: "Not this", cls: "bg-rose-50 text-rose-700 border-rose-200", ring: "border-gray-200" },
  maybe: { label: "Workable", cls: "bg-amber-50 text-amber-700 border-amber-200", ring: "border-gray-200" },
  recommended: { label: "Recommended", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", ring: "border-brand-green ring-2 ring-brand-green/20" },
} as const;

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

export default function AiEstimatePage() {
  const speedup = (TRAD_HOURS / AI_HUMAN_HOURS).toFixed(1);
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Internal · unlinked · Danny + Richie</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Order Workflow, priced for Fable teams</h1>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-gray-600">
          The same nine lines as the Order Workflow estimate, re-estimated for design and development done by teams of
          Claude Fable agents with Danny orchestrating, reviewing and shipping. Then four ways to price it, and the
          reasoning for which one.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Traditional estimate" value={formatCurrency(TOTAL_COST)} sub={`${TRAD_HOURS} hrs · 8 weeks`} />
        <Stat label="Human hours with agents" value={`${AI_HUMAN_HOURS} hrs`} sub={`${speedup}x fewer · ~${AI_DAYS} working days`} />
        <Stat label="Model spend" value={formatCurrency(AI_SPEND)} sub="Fable teams + verification" />
        <Stat label="Our cost basis" value={formatCurrency(AI_HUMAN_COST + AI_SPEND)} sub="human hrs at rate card + spend" />
      </div>

      {/* Line comparison */}
      <section>
        <h2 className="text-lg font-bold text-gray-900">Line by line: hours vs. hours with agents</h2>
        <p className="mt-1 text-sm text-gray-500">Human hours are orchestration, review, decisions, real-device smoke and shipping. Agent time is not counted as hours; it shows up as model spend.</p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 text-left">Line</th>
                <th className="px-4 py-3 text-right">Trad. hrs</th>
                <th className="px-4 py-3 text-right">Trad. cost</th>
                <th className="px-4 py-3 text-right">Human hrs</th>
                <th className="px-4 py-3 text-right">Model spend</th>
                <th className="px-4 py-3 text-right">Days</th>
                <th className="px-4 py-3 text-left">How</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {LINE_ITEMS.map((li) => {
                const ai = AI_LINES.find((a) => a.number === li.number)!;
                return (
                  <tr key={li.number} className={cn(li.gated && "bg-gray-50/60")}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <span className="mr-2 text-gray-400">{li.number}.</span>
                      {li.title}
                      {li.gated && <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">gated</span>}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-500">{li.hours}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-500">{formatCurrency(lineCost(li))}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-gray-900">{ai.humanHours}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">{formatCurrency(ai.aiSpend)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">{ai.days}</td>
                    <td className="max-w-md px-4 py-3 text-xs leading-relaxed text-gray-600">{ai.note}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold text-gray-900">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right tabular-nums">{TRAD_HOURS}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(TOTAL_COST)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{AI_HUMAN_HOURS}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(AI_SPEND)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{AI_DAYS}</td>
                <td className="px-4 py-3 text-xs font-normal text-gray-500">Calendar: 4 weeks with review gaps, vs. 8.</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Scenarios */}
      <section>
        <h2 className="text-lg font-bold text-gray-900">Four ways to price it</h2>
        <p className="mt-1 text-sm text-gray-500">Realized rate = price divided by the {AI_HUMAN_HOURS} human hours we would actually spend.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {SCENARIOS.map((s) => {
            const v = VERDICT[s.verdict];
            return (
              <div key={s.key} className={cn("rounded-2xl border bg-white p-6 shadow-sm", v.ring)}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-gray-900">{s.title}</p>
                    <p className="text-xs text-gray-500">{s.tag}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", v.cls)}>{v.label}</span>
                </div>
                <div className="mt-4 flex items-end gap-6">
                  <div>
                    <p className="text-3xl font-bold tabular-nums text-gray-900">{formatCurrency(s.price)}</p>
                    <p className="text-xs text-gray-500">{s.weeks}</p>
                  </div>
                  <div className="pb-1">
                    <p className="text-lg font-semibold tabular-nums text-gray-700">{formatCurrency(s.realizedRate)}/hr</p>
                    <p className="text-xs text-gray-500">realized on human time</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-600">{s.basis}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">For</p>
                    <ul className="mt-1 space-y-1.5">
                      {s.pros.map((p) => (
                        <li key={p} className="flex gap-2 text-sm leading-relaxed text-gray-700">
                          <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-rose-700">Against</p>
                    <ul className="mt-1 space-y-1.5">
                      {s.cons.map((c) => (
                        <li key={c} className="flex gap-2 text-sm leading-relaxed text-gray-700">
                          <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-rose-500" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recommendation */}
      <section className="rounded-2xl bg-brand-navy p-7 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">Recommendation</p>
        <p className="mt-2 text-2xl font-bold">
          {RECOMMENDED.title.replace(/^[A-D] · /, "")}: {formatCurrency(RECOMMENDED.price)} fixed, {RECOMMENDED.weeks}, no hours shown.
        </p>
        <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-white/85">
          About 10% under the traditional number, three weeks instead of eight, and a realized rate of {formatCurrency(RECOMMENDED.realizedRate)}
          /hr on the time we actually spend. The client gets a better deal than the hours estimate. We get paid for the
          outcome and the speed instead of for time we no longer need. Discovery waved; the Xero mirror quoted separately when
          Patty invoices from Xero.
        </p>
      </section>

      {/* Note for Richie */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Note for Richie · written 10/08</p>
        <h2 className="mt-1 text-2xl font-bold text-gray-900">{RICHIE_NOTE.title}</h2>
        <div className="mt-5 space-y-7">
          {RICHIE_NOTE.sections.map((sec) => (
            <div key={sec.heading} className="max-w-3xl">
              <h3 className="text-lg font-bold text-gray-900">{sec.heading}</h3>
              <div className="mt-2 space-y-3">
                {sec.paras.map((p, i) => (
                  <p key={i} className="text-[17px] leading-[1.65] text-gray-800">
                    {p}
                  </p>
                ))}
              </div>
              {sec.bullets && (
                <ul className="mt-3 space-y-2.5">
                  {sec.bullets.map((b) => (
                    <li key={b} className="flex gap-3 text-[17px] leading-[1.6] text-gray-800">
                      <span aria-hidden className="mt-[13px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Thinking */}
      <section className="space-y-8">
        <h2 className="text-lg font-bold text-gray-900">The thinking</h2>
        {THINKING.map((t) => (
          <div key={t.title} className="max-w-3xl">
            <h3 className="text-xl font-bold text-gray-900">{t.title}</h3>
            <div className="mt-3 space-y-3">
              {t.paras.map((p, i) => (
                <p key={i} className="text-[17px] leading-[1.65] text-gray-800">
                  {p}
                </p>
              ))}
            </div>
            {t.bullets && (
              <ul className="mt-3 space-y-2.5">
                {t.bullets.map((b) => (
                  <li key={b} className="flex gap-3 text-[17px] leading-[1.6] text-gray-800">
                    <span aria-hidden className="mt-[13px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
