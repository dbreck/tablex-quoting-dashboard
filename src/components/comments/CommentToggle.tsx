"use client";

import { MessageSquarePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommentToggleProps {
  active: boolean;
  unresolvedCount: number;
  onToggle: () => void;
}

export function CommentToggle({ active, unresolvedCount, onToggle }: CommentToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={active ? "Exit comment mode" : "Enter comment mode"}
      className={cn(
        "fixed top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-105",
        active
          ? "bg-brand-green text-white"
          : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      )}
    >
      {active ? <X className="h-4 w-4" /> : <MessageSquarePlus className="h-4 w-4" />}
      {!active && unresolvedCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {unresolvedCount}
        </span>
      )}
    </button>
  );
}
