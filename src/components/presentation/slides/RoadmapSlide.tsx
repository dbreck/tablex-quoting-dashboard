import { Slide } from "../Slide";
import { Globe, Cpu, Zap } from "lucide-react";

const phases = [
  {
    icon: Globe,
    quarter: "Q2 2026",
    title: "Website Rebuild",
    items: [
      "Modern design on new platform",
      "Integrated 3D configurator",
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
      "Sage ERP integration",
      "Automated quote-to-order flow",
      "Customer portal for dealers",
      "Advanced reporting & forecasting",
    ],
  },
];

export function RoadmapSlide() {
  return (
    <Slide>
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
                  ? "border-brand-green/30 bg-brand-green/5"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-lg p-2 ${
                    i === 0 ? "bg-brand-green/20" : "bg-white/10"
                  }`}
                >
                  <phase.icon
                    className={`h-5 w-5 ${
                      i === 0 ? "text-brand-green" : "text-white/50"
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
