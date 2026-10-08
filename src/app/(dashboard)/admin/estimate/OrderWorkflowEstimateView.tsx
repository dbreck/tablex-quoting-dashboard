"use client";

import { useEffect, useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Pencil, ShieldCheck, Plus, Printer, Lock, MessageSquareText, X, HelpCircle } from "lucide-react";
import {
  ANNOTATIONS,
  CORE_COST,
  DESIGN_RATE,
  DEV_RATE,
  ESTIMATE_META,
  GATED_COST,
  LINE_ITEMS,
  LINE_WHY,
  TALKING_POINTS,
  TIMELINE,
  TOTAL_COST,
  TOTAL_HOURS,
  lineCost,
  type AnnotationType,
} from "@/data/order-workflow-estimate";

const annotationConfig: Record<AnnotationType, { icon: typeof Pencil; bg: string; text: string; border: string; badge: string; label: string }> = {
  clarification: { icon: ShieldCheck, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", label: "Scope Clarification" },
  changed: { icon: Pencil, bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", label: "Text Changed" },
  added: { icon: Plus, bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", badge: "bg-blue-100 text-blue-700", label: "New Content" },
};

function AnnotationIcon({ id }: { id: string }) {
  const annotation = ANNOTATIONS.find((a) => a.id === id);
  if (!annotation) return null;
  const config = annotationConfig[annotation.type];
  const Icon = config.icon;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn("inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full border transition-transform hover:scale-110 print:hidden", config.bg, config.text, config.border)}
          aria-label={`Annotation ${id}: ${config.label}`}
        >
          <Icon className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-80 text-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={cn("rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", config.badge)}>{config.label}</span>
            <span className="font-mono text-xs text-gray-400">{annotation.id}</span>
          </div>
          <p className="text-xs font-semibold text-gray-900">{annotation.label}</p>
          {annotation.original && (
            <div className="rounded border border-red-100 bg-red-50 px-2.5 py-1.5">
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-400">Original</p>
              <p className="text-xs text-red-700">{annotation.original}</p>
            </div>
          )}
          <div className={cn("rounded border px-2.5 py-1.5", config.bg, config.border)}>
            <p className={cn("mb-0.5 text-[10px] font-semibold uppercase tracking-wide", config.text)}>{annotation.original ? "Changed To" : "Added"}</p>
            <p className="text-xs text-gray-700">{annotation.changed}</p>
          </div>
          <div className="rounded border border-gray-100 bg-gray-50 px-2.5 py-1.5">
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Rationale</p>
            <p className="text-xs text-gray-600">{annotation.rationale}</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const RISK_META = {
  light: { label: "May be light", cls: "bg-rose-50 text-rose-700 border-rose-200" },
  heavy: { label: "May be heavy", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  fair: { label: "Fair", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
} as const;

function TalkingPointsPanel({ open, onClose, focus }: { open: boolean; onClose: () => void; focus: string | null }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !focus) return;
    const el = document.getElementById(`tp-${focus}`);
    el?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [open, focus]);

  const nav = [
    ...TALKING_POINTS.map((t) => ({ id: t.id, label: t.title })),
    { id: "lines", label: "Line by line" },
  ];

  return (
    <div className={cn("fixed inset-0 z-40 print:hidden", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
      <div className={cn("absolute inset-0 bg-gray-900/30 transition-opacity", open ? "opacity-100" : "opacity-0")} onClick={onClose} />
      <aside
        role="dialog"
        aria-label="Talking points"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-white shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-7 py-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">For the walk-through with Richie</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">Talking points</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 border-b border-gray-100 px-7 py-3">
          {nav.map((n) => (
            <a key={n.id} href={`#tp-${n.id}`} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">
              {n.label}
            </a>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto px-7 py-6">
          <div className="space-y-10">
            {TALKING_POINTS.map((t) => (
              <section key={t.id} id={`tp-${t.id}`} className="scroll-mt-4">
                {t.kicker && <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-green">{t.kicker}</p>}
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
                    {t.bullets.map((b, i) => (
                      <li key={i} className="flex gap-3 text-[17px] leading-[1.6] text-gray-800">
                        <span aria-hidden className="mt-[13px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <section id="tp-lines" className="scroll-mt-4">
              <h3 className="text-xl font-bold text-gray-900">Line by line</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-500">Why each line has the hours it has, and which way it is likely to miss.</p>
              <div className="mt-4 space-y-4">
                {LINE_ITEMS.map((li) => {
                  const w = LINE_WHY[li.number];
                  if (!w) return null;
                  const r = RISK_META[w.risk];
                  return (
                    <div key={li.number} id={`tp-line-${li.number}`} className="scroll-mt-4 rounded-xl border border-gray-200 p-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-lg font-bold text-gray-900">
                          <span className="mr-2 text-gray-400">{li.number}.</span>
                          {li.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm tabular-nums text-gray-500">
                            {w.hours} · {formatCurrency(lineCost(li))}
                          </span>
                          <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", r.cls)}>{r.label}</span>
                        </div>
                      </div>
                      <p className="mt-3 text-[16px] leading-[1.65] text-gray-800">{w.note}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function OrderWorkflowEstimateView() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const openAt = (id: string | null) => {
    setFocus(id);
    setPanelOpen(true);
  };
  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          nav, aside, header, [data-sidebar], [class*="Sidebar"] { display: none !important; }
          .print\\:hidden { display: none !important; }
          body { background: white !important; }
          * { box-shadow: none !important; border-color: #e5e7eb !important; }
          @page { margin: 0.75in; }
        }
      `}</style>

      <div className="flex items-center justify-between print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-gray-500">Legend:</span>
          {(Object.entries(annotationConfig) as [AnnotationType, (typeof annotationConfig)[AnnotationType]][]).map(([type, config]) => (
            <span key={type} className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", config.badge)}>
              <config.icon className="h-3 w-3" />
              {config.label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
            <Lock className="h-3 w-3" />
            Gated line
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openAt("headline")}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-green px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:brightness-95"
          >
            <MessageSquareText className="h-4 w-4" />
            Talking points
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      <TalkingPointsPanel open={panelOpen} onClose={() => setPanelOpen(false)} focus={focus} />

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Clear pH Design</h1>
              <p className="mt-1 text-xs text-gray-500">St. Petersburg, FL</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{ESTIMATE_META.number}</p>
              <p className="mt-0.5 text-xs text-gray-500">Date: {ESTIMATE_META.date}</p>
            </div>
          </div>
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Prepared For</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-900">Table X</p>
                <p className="text-xs text-gray-500">tablex.com</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Subject</p>
                <p className="mt-0.5 whitespace-pre-line text-sm font-medium text-gray-900">{ESTIMATE_META.subject}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {LINE_ITEMS.map((item) => (
            <div key={item.number} className={cn("px-8 py-6", item.gated && "bg-gray-50/60")}>
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h2 className="text-base font-bold text-gray-900">
                  <span className="mr-2 text-gray-400">{item.number}.</span>
                  {item.title}
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    {item.phase} · {item.hours} hrs @ {formatCurrency(item.rate)}
                  </span>
                  {item.gated && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-gray-200 px-2 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                      <Lock className="h-3 w-3" />
                      {item.gated}
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-3">
                  {LINE_WHY[item.number] && (
                    <button
                      onClick={() => openAt(`line-${item.number}`)}
                      className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50 print:hidden"
                    >
                      <HelpCircle className="h-3 w-3" />
                      Why
                    </button>
                  )}
                  <p className="text-base font-bold tabular-nums text-gray-900">{formatCurrency(lineCost(item))}</p>
                </div>
              </div>
              <div className="space-y-4">
                {item.sections.map((section, si) => (
                  <div key={si} className="ml-5">
                    <div className="mb-1.5 flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-800">{section.heading}</h3>
                      {section.annotations?.map((aid) => (
                        <AnnotationIcon key={aid} id={aid} />
                      ))}
                    </div>
                    {section.description && <p className="mb-2 text-xs leading-relaxed text-gray-600">{section.description}</p>}
                    {section.deliverables && (
                      <ul className="space-y-1">
                        {section.deliverables.map((d, di) => (
                          <li key={di} className="flex items-start gap-2 text-xs text-gray-600">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-300" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-gray-200 px-8 py-5">
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Core workflow, lines 1–6, 8, 9</span>
                <span className="tabular-nums">{formatCurrency(CORE_COST)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Gated: Xero invoice mirror (line 7)</span>
                <span className="tabular-nums">{formatCurrency(GATED_COST)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Tax</span>
                <span>{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                <span>Total ({TOTAL_HOURS} hrs)</span>
                <span className="tabular-nums">{formatCurrency(TOTAL_COST)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 border-t border-gray-200 bg-gray-50/50 px-8 py-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900">Notes &amp; Terms</h2>

          <div>
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-xs font-semibold text-gray-800">Timeline</h3>
              <AnnotationIcon id="a" />
            </div>
            <p className="mb-2 text-xs leading-relaxed text-gray-600">
              Starting Friday 10/9. The order-to-ship flow is live Monday 10/19, the production board by Friday 10/23, packaging by Monday 10/26. Dates assume Mark and Sam review on staging the same day and production@ exists by Wednesday 10/14.
            </p>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <table className="w-full text-left text-xs">
                <tbody className="divide-y divide-gray-100">
                  {TIMELINE.map((t) => (
                    <tr key={t.week}>
                      <td className="w-40 whitespace-nowrap px-3 py-1.5 font-semibold text-gray-700">{t.week}</td>
                      <td className="w-16 whitespace-nowrap px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-green">{t.to}</td>
                      <td className="px-3 py-1.5 text-gray-700">{t.what}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-xs font-semibold text-gray-800">Outside of Scope</h3>
              <AnnotationIcon id="e" />
              <AnnotationIcon id="b" />
            </div>
            <p className="text-xs leading-relaxed text-gray-600">
              The OCTOBER 2026 master pricing import, the SpeX Studio action tracker, a bill of materials per SKU, any write to Xero (creating invoices from the app), historical order import from Sage, the Returned-to-stock list, and any work not described in the line items above.
            </p>
          </div>

          <div>
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-xs font-semibold text-gray-800">Client Responsibilities</h3>
              <AnnotationIcon id="c" />
              <AnnotationIcon id="d" />
            </div>
            <p className="text-xs leading-relaxed text-gray-600">
              TableX creates production@tablex.com and has its IT vendor allow send.tablex.com in INKY before the production emails go live; confirms the Xero invoicing start date; sets up multi-location dealers as one organization per location; and provides packaging rates and the salesperson for each order.
            </p>
          </div>

          <div>
            <h3 className="mb-1 text-xs font-semibold text-gray-800">Rates</h3>
            <p className="text-xs leading-relaxed text-gray-600">
              Development: {formatCurrency(DEV_RATE)}/hr. Design, QA and training: {formatCurrency(DESIGN_RATE)}/hr. Work beyond this scope is billed at the applicable hourly rate with prior client approval.
            </p>
          </div>

          <div>
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-xs font-semibold text-gray-800">Payment Schedule</h3>
              <AnnotationIcon id="g" />
            </div>
            <ol className="mt-1.5 list-inside list-decimal space-y-1">
              <li className="text-xs text-gray-600"><span className="font-medium">Kickoff</span> — 40% ({formatCurrency(CORE_COST * 0.4)}) due upon signed agreement</li>
              <li className="text-xs text-gray-600"><span className="font-medium">Sales Order, acknowledgments and shipping live</span> — 30% ({formatCurrency(CORE_COST * 0.3)}) Mon 10/19</li>
              <li className="text-xs text-gray-600"><span className="font-medium">Production schedule and packaging live</span> — 30% ({formatCurrency(CORE_COST * 0.3)}) Mon 10/26</li>
              <li className="text-xs text-gray-600"><span className="font-medium">Xero invoice mirror</span> — {formatCurrency(GATED_COST)} billed when it starts</li>
            </ol>
          </div>

          <div>
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-xs font-semibold text-gray-800">Support</h3>
              <AnnotationIcon id="h" />
              <AnnotationIcon id="f" />
            </div>
            <p className="text-xs leading-relaxed text-gray-600">
              One review round with Mark and Sam per phase on staging. Up to 5 business days of bug-fix support after each phase goes live. Feature requests after that are billed separately.
            </p>
          </div>

          <div>
            <h3 className="mb-1 text-xs font-semibold text-gray-800">Liability</h3>
            <p className="text-xs leading-relaxed text-gray-600">
              Clear pH Design&apos;s total liability under this agreement shall not exceed the total amount paid by the client. Clear pH Design is not liable for any indirect, incidental, or consequential damages including lost profits, data loss, or business interruption.
            </p>
          </div>

          <div>
            <h3 className="mb-1 text-xs font-semibold text-gray-800">Agreement</h3>
            <p className="text-xs leading-relaxed text-gray-600">
              This estimate is valid for 30 days from the date issued. Acceptance constitutes agreement to the terms outlined herein. Work begins upon receipt of the signed agreement and the kickoff payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
