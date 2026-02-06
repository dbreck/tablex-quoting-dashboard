"use client";

import { useState } from "react";
import { X, Check, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { JourneyOpportunity } from "@/types/customer-journey";

const levelOptions: JourneyOpportunity["impact"][] = ["high", "medium", "low"];

interface OpportunityBadgeProps {
  opportunity: JourneyOpportunity;
  onUpdate: (updated: JourneyOpportunity) => void;
  onRemove: () => void;
}

export function OpportunityBadge({ opportunity, onUpdate, onRemove }: OpportunityBadgeProps) {
  const [editing, setEditing] = useState(!opportunity.name);
  const [draft, setDraft] = useState(opportunity);

  function save() {
    if (!draft.name.trim()) return;
    onUpdate(draft);
    setEditing(false);
  }

  function cancel() {
    if (!opportunity.name) {
      onRemove();
      return;
    }
    setDraft(opportunity);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 p-2">
        <Input
          placeholder="Describe the opportunity..."
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          className="h-7 text-xs"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
        />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500">Impact:</span>
            {levelOptions.map((l) => (
              <button
                key={l}
                onClick={() => setDraft({ ...draft, impact: l })}
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-medium capitalize border transition-colors",
                  draft.impact === l
                    ? "bg-emerald-200 text-emerald-800 border-emerald-300"
                    : "border-slate-200 text-slate-400 hover:border-slate-300"
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500">Effort:</span>
            {levelOptions.map((l) => (
              <button
                key={l}
                onClick={() => setDraft({ ...draft, effort: l })}
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-medium capitalize border transition-colors",
                  draft.effort === l
                    ? "bg-slate-200 text-slate-700 border-slate-300"
                    : "border-slate-200 text-slate-400 hover:border-slate-300"
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-1">
          <button onClick={cancel} className="rounded p-0.5 text-slate-400 hover:text-slate-600">
            <X className="h-3.5 w-3.5" />
          </button>
          <button onClick={save} className="rounded p-0.5 text-emerald-600 hover:text-emerald-700">
            <Check className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group flex items-start gap-1 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 px-2 py-1 text-xs cursor-pointer transition-colors"
      onClick={() => setEditing(true)}
    >
      <Lightbulb className="mt-0.5 h-3 w-3 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="line-clamp-2">{opportunity.name}</span>
        <span className="text-[10px] text-emerald-600">
          Impact: {opportunity.impact} / Effort: {opportunity.effort}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="shrink-0 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-opacity"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
