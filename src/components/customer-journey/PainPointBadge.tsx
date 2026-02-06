"use client";

import { useState } from "react";
import { X, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { JourneyPainPoint } from "@/types/customer-journey";

const severityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-blue-100 text-blue-800 border-blue-200",
};

const severityOptions: JourneyPainPoint["severity"][] = ["high", "medium", "low"];

interface PainPointBadgeProps {
  painPoint: JourneyPainPoint;
  onUpdate: (updated: JourneyPainPoint) => void;
  onRemove: () => void;
}

export function PainPointBadge({ painPoint, onUpdate, onRemove }: PainPointBadgeProps) {
  const [editing, setEditing] = useState(!painPoint.description);
  const [draft, setDraft] = useState(painPoint);

  function save() {
    if (!draft.description.trim()) return;
    onUpdate(draft);
    setEditing(false);
  }

  function cancel() {
    if (!painPoint.description) {
      onRemove();
      return;
    }
    setDraft(painPoint);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2">
        <Input
          placeholder="Describe the pain point..."
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          className="h-7 text-xs"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
        />
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500">Severity:</span>
          {severityOptions.map((s) => (
            <button
              key={s}
              onClick={() => setDraft({ ...draft, severity: s })}
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-medium capitalize border transition-colors",
                draft.severity === s ? severityColors[s] : "border-slate-200 text-slate-400 hover:border-slate-300"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <Input
          placeholder="Evidence (optional)"
          value={draft.evidence || ""}
          onChange={(e) => setDraft({ ...draft, evidence: e.target.value })}
          className="h-7 text-xs"
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
        />
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
      className={cn(
        "group flex items-start gap-1 rounded-md border px-2 py-1 text-xs cursor-pointer transition-colors",
        severityColors[painPoint.severity]
      )}
      onClick={() => setEditing(true)}
    >
      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
      <span className="flex-1 line-clamp-2">{painPoint.description}</span>
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
