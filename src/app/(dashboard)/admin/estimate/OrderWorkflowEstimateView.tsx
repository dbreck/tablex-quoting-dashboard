"use client";

import { cn, formatCurrency } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Pencil, ShieldCheck, Plus, Printer, Lock } from "lucide-react";
import {
  ANNOTATIONS,
  CORE_COST,
  DESIGN_RATE,
  DEV_RATE,
  ESTIMATE_META,
  GATED_COST,
  LINE_ITEMS,
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

export default function OrderWorkflowEstimateView() {
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
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>
      </div>

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
                <p className="text-base font-bold tabular-nums text-gray-900">{formatCurrency(lineCost(item))}</p>
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
              Eight weeks from kickoff on Monday 10/12, phase by phase, each one live on tablex.com before the next starts. Dates assume Mark and Sam review on staging within two business days.
            </p>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <table className="w-full text-left text-xs">
                <tbody className="divide-y divide-gray-100">
                  {TIMELINE.map((t) => (
                    <tr key={t.week}>
                      <td className="w-20 whitespace-nowrap px-3 py-1.5 font-semibold text-gray-700">{t.week}</td>
                      <td className="w-24 whitespace-nowrap px-3 py-1.5 tabular-nums text-gray-500">{t.to}</td>
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
              <li className="text-xs text-gray-600"><span className="font-medium">Sales Order, acknowledgments and shipping live</span> — 30% ({formatCurrency(CORE_COST * 0.3)}) ~Week 4</li>
              <li className="text-xs text-gray-600"><span className="font-medium">Production schedule and packaging live</span> — 30% ({formatCurrency(CORE_COST * 0.3)}) ~Week 8</li>
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
