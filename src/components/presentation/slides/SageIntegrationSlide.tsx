import { Slide } from "../Slide";
import { Database, FileSpreadsheet, Plug, Globe, ArrowRight } from "lucide-react";

const options = [
  {
    label: "A",
    title: "CSV export from QuoteX",
    effort: "~1 week",
    description:
      "Sage-importable files, 80% less re-entry, no infra changes",
    highlight: "secondary" as const,
  },
  {
    label: "B",
    title: "ODBC read + SDK write",
    effort: "2–3 weeks",
    description:
      "Two-way sync, Windows-only, fragile",
    highlight: null,
  },
  {
    label: "C",
    title: "Third-party middleware",
    effort: "1–2 wks + $$$/mo",
    description:
      "REST wrapper on existing Sage 50",
    highlight: null,
  },
  {
    label: "D",
    title: "Sage Intacct upgrade",
    effort: "4–6 wks + licensing",
    description:
      "Full REST API, webhooks, cloud-native",
    highlight: "recommended" as const,
  },
];

const icons = [FileSpreadsheet, Database, Plug, Globe];

export function SageIntegrationSlide() {
  return (
    <Slide takeaway="Sage 50 has no modern API, so we recommend CSV export as an immediate bridge to eliminate re-entry, with a long-term migration to Sage Intacct for full two-way integration.">
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white">Sage ERP Integration</h2>
          <p className="mt-2 text-white/40">
            Bridging QuoteX to your accounting system
          </p>
        </div>

        {/* Options table */}
        <div className="stagger flex flex-col gap-3">
          {options.map((opt, i) => {
            const Icon = icons[i];
            const isRecommended = opt.highlight === "recommended";
            const isSecondary = opt.highlight === "secondary";

            return (
              <div
                key={opt.label}
                className={`animate-slide-up flex items-center gap-5 rounded-xl border p-5 ${
                  isRecommended
                    ? "border-[#ff6b6b]/30 bg-[#ff6b6b]/5"
                    : isSecondary
                      ? "border-brand-green/20 bg-brand-green/5"
                      : "border-white/10 bg-white/5"
                }`}
              >
                {/* Icon */}
                <div
                  className={`shrink-0 rounded-lg p-2.5 ${
                    isRecommended
                      ? "bg-[#ff6b6b]/15"
                      : isSecondary
                        ? "bg-brand-green/10"
                        : "bg-white/10"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isRecommended
                        ? "text-[#ff6b6b]"
                        : isSecondary
                          ? "text-brand-green"
                          : "text-white/50"
                    }`}
                  />
                </div>

                {/* Label + Title */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        isRecommended
                          ? "text-[#ff6b6b]"
                          : isSecondary
                            ? "text-brand-green"
                            : "text-white/40"
                      }`}
                    >
                      Option {opt.label}
                    </span>
                    <span className="font-semibold text-white">{opt.title}</span>
                    {isRecommended && (
                      <span className="rounded-full bg-[#ff6b6b]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#ff6b6b]">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-white/50">{opt.description}</p>
                </div>

                {/* Effort badge */}
                <div className="shrink-0 rounded-lg bg-white/5 px-3 py-1.5 text-sm font-medium text-white/60">
                  {opt.effort}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recommendation callout */}
        <div className="animate-slide-up rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-start gap-3">
            <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-[#ff6b6b]" />
            <div>
              <p className="text-sm font-semibold text-white">
                Our recommendation
              </p>
              <p className="mt-1 text-sm text-white/50">
                <span className="font-medium text-[#ff6b6b]">Option D</span>{" "}
                (Sage Intacct) is the long-term play — a true cloud ERP with a
                full REST API. In the meantime,{" "}
                <span className="font-medium text-brand-green">Option A</span>{" "}
                (CSV export) gives you immediate relief with zero infrastructure
                changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
