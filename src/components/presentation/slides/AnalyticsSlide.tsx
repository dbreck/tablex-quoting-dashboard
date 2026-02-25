import { Slide } from "../Slide";
import { BarChart3, TrendingUp, PieChart, Users, Building } from "lucide-react";

const tabs = [
  { icon: BarChart3, label: "Volume", desc: "Monthly quote volume trends over 3 years" },
  { icon: TrendingUp, label: "Inbound", desc: "Web form requests vs. queue processing" },
  { icon: PieChart, label: "Product Mix", desc: "Top series & finishes by popularity" },
  { icon: Users, label: "Staff", desc: "Workload distribution, special vs. standard" },
  { icon: Building, label: "Dealers", desc: "Top 10 dealers by quote volume" },
];

export function AnalyticsSlide() {
  return (
    <Slide appLink="/queue" linkLabel="See the analytics">
      <div className="flex flex-col gap-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white">Business Intelligence</h2>
          <p className="mt-2 text-white/40">
            Real insights from your own data — not guesswork
          </p>
        </div>

        <div className="stagger flex flex-col gap-3">
          {tabs.map((tab) => (
            <div
              key={tab.label}
              className="animate-slide-up flex items-center gap-5 rounded-xl border border-white/10 bg-white/5 px-6 py-4"
            >
              <div className="rounded-lg bg-brand-green/10 p-2.5">
                <tab.icon className="h-5 w-5 text-brand-green" />
              </div>
              <div>
                <div className="font-semibold text-white">{tab.label}</div>
                <div className="text-sm text-white/40">{tab.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  );
}
