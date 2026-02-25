"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface SlideNavProps {
  current: number;
  total: number;
  onNavigate: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function SlideNav({ current, total, onNavigate, onPrev, onNext }: SlideNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-6 pb-6">
      <div className="flex items-center gap-4 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-xl">
        {/* Slide counter */}
        <span className="min-w-[3rem] text-center text-xs font-medium tabular-nums text-white/50">
          {String(current + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>

        {/* Prev button */}
        <button
          onClick={onPrev}
          disabled={current === 0}
          className="rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              onClick={() => onNavigate(i)}
              className={`transition-all duration-300 ${
                i === current
                  ? "h-2 w-8 rounded-full bg-brand-green"
                  : "h-2 w-2 rounded-full bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={onNext}
          disabled={current === total - 1}
          className="rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
