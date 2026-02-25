import { Slide } from "../Slide";
import { Clock, Shuffle, EyeOff, Database } from "lucide-react";

export function ProblemSlide() {
  return (
    <Slide takeaway="The current process burns 617 hours a year across disconnected tools, and Sage 50 has no API — every quote is manually re-entered. This isn't sustainable at scale.">
      <div className="flex flex-col gap-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white">The Problem</h2>
          <p className="mt-2 text-white/40">Why the current process needs to change</p>
        </div>

        <div className="stagger grid grid-cols-3 gap-6">
          {/* Pain point 1 — with breakdown tooltip */}
          <div className="group relative animate-slide-up flex flex-col items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <div className="rounded-xl bg-red-500/10 p-3">
              <Clock className="h-8 w-8 text-red-400" />
            </div>
            <div className="text-3xl font-bold text-red-400">617 hrs/yr</div>
            <div className="text-sm text-white/50">
              Wasted on manual quoting, data re-entry, and chasing order status across spreadsheets
            </div>

            {/* Tooltip */}
            <div className="pointer-events-none absolute -bottom-4 left-1/2 z-50 w-72 -translate-x-1/2 translate-y-full rounded-xl border border-white/10 bg-[#0c1220] p-4 opacity-0 shadow-2xl transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                How we got 617 hrs
              </div>
              <div className="space-y-1.5 text-left text-xs">
                <div className="flex justify-between">
                  <span className="text-white/60">Pricing &amp; configuration</span>
                  <span className="font-medium text-red-400">300 hrs</span>
                </div>
                <div className="flex justify-between text-white/30">
                  <span>5 min &times; 3,595 quotes</span>
                </div>
                <div className="my-1.5 border-t border-white/5" />
                <div className="flex justify-between">
                  <span className="text-white/60">Cross-system data entry</span>
                  <span className="font-medium text-red-400">180 hrs</span>
                </div>
                <div className="flex justify-between text-white/30">
                  <span>3 min &times; 3,595 quotes</span>
                </div>
                <div className="my-1.5 border-t border-white/5" />
                <div className="flex justify-between">
                  <span className="text-white/60">Status tracking &amp; follow-up</span>
                  <span className="font-medium text-red-400">120 hrs</span>
                </div>
                <div className="flex justify-between text-white/30">
                  <span>2 min &times; 3,595 quotes</span>
                </div>
                <div className="my-1.5 border-t border-white/5" />
                <div className="flex justify-between">
                  <span className="text-white/60">Filing &amp; documentation</span>
                  <span className="font-medium text-red-400">17 hrs</span>
                </div>
              </div>
              <div className="mt-2.5 flex justify-between border-t border-white/10 pt-2 text-xs font-semibold">
                <span className="text-white/70">Total</span>
                <span className="text-red-400">617 hrs/yr</span>
              </div>
              {/* Arrow */}
              <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-white/10 bg-[#0c1220]" />
            </div>
          </div>

          {/* Pain point 2 */}
          <div className="animate-slide-up flex flex-col items-center gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
            <div className="rounded-xl bg-amber-500/10 p-3">
              <Shuffle className="h-8 w-8 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-amber-400">6+ Systems</div>
            <div className="text-sm text-white/50">
              Disconnected tools — Excel, email, Sage, Gravity Forms, shared drives — none talk to each other
            </div>
          </div>

          {/* Pain point 3 */}
          <div className="animate-slide-up flex flex-col items-center gap-4 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-8 text-center">
            <div className="rounded-xl bg-orange-500/10 p-3">
              <EyeOff className="h-8 w-8 text-orange-400" />
            </div>
            <div className="text-3xl font-bold text-orange-400">No Visibility</div>
            <div className="text-sm text-white/50">
              No pipeline view, no analytics, no way to see what&apos;s quoted, ordered, or invoiced at a glance
            </div>
          </div>
        </div>

        {/* Sage ERP callout */}
        <div className="animate-slide-up flex items-center gap-5 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
          <div className="shrink-0 rounded-xl bg-violet-500/10 p-3">
            <Database className="h-8 w-8 text-violet-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-violet-400">
              Sage 50 Quantum — No API Access
            </div>
            <div className="mt-1 text-sm text-white/50">
              Your current ERP has no modern API. Every quote must be manually
              re-entered into Sage — there is no way to programmatically create
              sales orders.
            </div>
            <div className="mt-2 text-xs font-medium text-white/30">
              Sage 50 Quantum 2026 · On-premise · COM SDK only · No REST API
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
