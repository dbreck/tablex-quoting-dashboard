"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, X } from "lucide-react";

interface SlideProps {
  children: React.ReactNode;
  appLink?: string;
  linkLabel?: string;
  takeaway?: string;
}

export function Slide({ children, appLink, linkLabel = "See it live", takeaway }: SlideProps) {
  const router = useRouter();
  const [showTakeaway, setShowTakeaway] = useState(false);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-12 backdrop-blur-xl">
        {children}

        {/* Takeaway toggle button */}
        {takeaway && (
          <button
            onClick={() => setShowTakeaway((s) => !s)}
            className={`absolute right-4 top-4 rounded-full p-2 transition-all ${
              showTakeaway
                ? "bg-white/10 text-white/70"
                : "text-white/40 hover:bg-white/5 hover:text-white/60"
            }`}
            title="Key takeaway"
          >
            <Lightbulb className="h-4 w-4" />
          </button>
        )}

        {/* Takeaway panel */}
        {takeaway && (
          <div
            className={`absolute inset-x-4 top-4 z-20 overflow-hidden rounded-2xl border border-white/10 bg-[#0c1220]/95 backdrop-blur-xl transition-all duration-300 ${
              showTakeaway
                ? "pointer-events-auto translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-2 opacity-0"
            }`}
          >
            <div className="flex items-start gap-3 p-5">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <div className="flex-1">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-400/70">
                  Key Takeaway
                </div>
                <p className="text-sm leading-relaxed text-white/70">{takeaway}</p>
              </div>
              <button
                onClick={() => setShowTakeaway(false)}
                className="shrink-0 rounded-full p-1 text-white/30 transition-colors hover:bg-white/5 hover:text-white/50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
      {appLink && (
        <button
          onClick={() => router.push(appLink)}
          className="rounded-full border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-6 py-2.5 text-sm font-medium text-[#ff6b6b] transition-all hover:border-[#ff6b6b]/50 hover:bg-[#ff6b6b]/20"
        >
          {linkLabel} &rarr;
        </button>
      )}
    </div>
  );
}
