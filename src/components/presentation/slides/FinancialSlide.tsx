import { Slide } from "../Slide";
import { StatCard } from "../StatCard";
import { DollarSign, Package, Receipt } from "lucide-react";

export function FinancialSlide() {
  return (
    <Slide appLink="/invoices" linkLabel="See the invoices">
      <div className="flex flex-col gap-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white">Financial Visibility</h2>
          <p className="mt-2 text-white/40">
            Complete order and invoice history — at a glance
          </p>
        </div>

        <div className="stagger grid grid-cols-3 gap-6">
          <div className="animate-slide-up">
            <StatCard
              value="$13.7M"
              label="Total Quote Value"
              icon={<DollarSign className="h-6 w-6" />}
              accent
            />
          </div>
          <div className="animate-slide-up">
            <StatCard
              value="1,812"
              label="Orders Tracked"
              icon={<Package className="h-6 w-6" />}
            />
          </div>
          <div className="animate-slide-up">
            <StatCard
              value="1,812"
              label="Invoices Generated"
              icon={<Receipt className="h-6 w-6" />}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-medium text-white/60">Avg Quote Value</div>
            <div className="mt-1 text-2xl font-bold text-white">$3,820</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-medium text-white/60">Sage SO Integration</div>
            <div className="mt-1 text-2xl font-bold text-white">1,729</div>
            <div className="text-xs text-white/30">Sales orders linked</div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
