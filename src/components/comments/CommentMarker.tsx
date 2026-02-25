"use client";

import { cn } from "@/lib/utils";

interface CommentMarkerProps {
  id: string;
  number: number;
  x: number;
  y: number;
  isActive: boolean;
  isResolved: boolean;
  onClick: () => void;
}

export function CommentMarker({
  number,
  x,
  y,
  isActive,
  isResolved,
  onClick,
}: CommentMarkerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Comment ${number}${isResolved ? " (resolved)" : ""}`}
      className={cn(
        "absolute z-40 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-xs font-bold text-white transition-transform duration-150 hover:scale-110",
        isResolved
          ? "bg-slate-300"
          : "bg-brand-green",
        isActive && "ring-2 ring-brand-navy ring-offset-1"
      )}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {isActive && !isResolved && (
        <span className="absolute inset-0 animate-ping rounded-full bg-brand-green/40" />
      )}
      <span className="relative">{number}</span>
    </button>
  );
}
