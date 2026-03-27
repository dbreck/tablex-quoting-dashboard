import { Slide } from "../Slide";
import { Globe, Cpu, Zap } from "lucide-react";

const phases = [
  {
    icon: Globe,
    quarter: "Q2 2026",
    title: "Website Rebuild",
    items: [
      "Modern design on new platform",
      "Spec Studio + Collections",
      "Quote request flow built-in",
      "Mobile-first responsive design",
    ],
  },
  {
    icon: Cpu,
    quarter: "Q3 2026",
    title: "QuoteX Production",
    items: [
      "Internal quoting system launch",
      "CRM & dealer management",
      "Order & invoice tracking",
      "Staff dashboards & analytics",
    ],
  },
  {
    icon: Zap,
    quarter: "Q4 2026",
    title: "Automation & Growth",
    items: [
      "Sage Intacct migration + API integration",
      "Automated quote-to-order via Sage API",
      "Customer portal for dealers",
      "Advanced reporting & forecasting",
    ],
  },
];

export function RoadmapSlide() {
  return (
    <Slide takeaway="This is a three-phase plan — website first, then internal tools, then full automation with Sage Intacct. Each phase delivers standalone value, so you see results immediately.">
      <div className="flex flex-col gap-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white">The Roadmap</h2>
          <p className="mt-2 text-white/40">Three phases to full digital transformation</p>
        </div>

        <div className="stagger grid grid-cols-3 gap-6">
          {phases.map((phase, i) => (
            <div
              key={phase.quarter}
              className={`animate-slide-up flex flex-col gap-4 rounded-2xl border p-6 ${
                i === 0
                  ? "border-[#ff6b6b]/30 bg-[#ff6b6b]/5"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-lg p-2 ${
                    i === 0 ? "bg-[#ff6b6b]/20" : "bg-white/10"
                  }`}
                >
                  <phase.icon
                    className={`h-5 w-5 ${
                      i === 0 ? "text-[#ff6b6b]" : "text-white/50"
                    }`}
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-white/30">{phase.quarter}</div>
                  <div className="font-semibold text-white">{phase.title}</div>
                </div>
              </div>
              <ul className="flex flex-col gap-2">
                {phase.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/50">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/30" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  );
}
