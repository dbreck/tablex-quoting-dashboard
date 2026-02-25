import { Slide } from "../Slide";
import { Settings, Inbox, FileText, Package, Receipt, ChevronRight } from "lucide-react";

const steps = [
  { icon: Settings, label: "Configure", desc: "3D builder" },
  { icon: Inbox, label: "Request", desc: "Web form" },
  { icon: FileText, label: "Quote", desc: "Formal pricing" },
  { icon: Package, label: "Order", desc: "PO & fulfillment" },
  { icon: Receipt, label: "Invoice", desc: "Payment tracking" },
];

export function PipelineSlide() {
  return (
    <Slide appLink="/quote/requests" linkLabel="See the pipeline" takeaway="Every stage from configuration to payment is tracked in one system. No more spreadsheet handoffs, lost emails, or status calls — the entire quote-to-cash flow is connected.">
      <div className="flex flex-col gap-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white">End-to-End Pipeline</h2>
          <p className="mt-2 text-white/40">
            One connected flow from first click to final payment
          </p>
        </div>

        {/* Flow diagram */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`rounded-xl border p-4 ${
                    i === 0
                      ? "border-[#ff6b6b]/30 bg-[#ff6b6b]/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <step.icon
                    className={`h-7 w-7 ${
                      i === 0 ? "text-[#ff6b6b]" : "text-white/50"
                    }`}
                  />
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-white">{step.label}</div>
                  <div className="text-xs text-white/30">{step.desc}</div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="mb-6 h-5 w-5 text-white/20" />
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-white/30">
          Every stage is tracked, linked, and searchable — no more spreadsheet handoffs
        </p>
      </div>
    </Slide>
  );
}
