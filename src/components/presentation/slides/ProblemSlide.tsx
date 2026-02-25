import { Slide } from "../Slide";
import { Clock, Shuffle, EyeOff } from "lucide-react";

export function ProblemSlide() {
  return (
    <Slide>
      <div className="flex flex-col gap-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white">The Problem</h2>
          <p className="mt-2 text-white/40">Why the current process needs to change</p>
        </div>

        <div className="stagger grid grid-cols-3 gap-6">
          {/* Pain point 1 */}
          <div className="animate-slide-up flex flex-col items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <div className="rounded-xl bg-red-500/10 p-3">
              <Clock className="h-8 w-8 text-red-400" />
            </div>
            <div className="text-3xl font-bold text-red-400">617 hrs/yr</div>
            <div className="text-sm text-white/50">
              Wasted on manual quoting, data re-entry, and chasing order status across spreadsheets
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
      </div>
    </Slide>
  );
}
