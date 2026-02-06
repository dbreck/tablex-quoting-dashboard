"use client";

import { useState, useRef } from "react";
import { GripVertical, Trash2, Plus, Clock, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PainPointBadge } from "./PainPointBadge";
import { OpportunityBadge } from "./OpportunityBadge";
import type { JourneyPhase, JourneyPainPoint, JourneyOpportunity } from "@/types/customer-journey";

const actorColors: Record<string, string> = {
  Customer: "bg-blue-400",
  "Dealer/Rep": "bg-purple-400",
  "TableX Staff": "bg-amber-400",
};

const emotionEmojis: Record<string, string> = {
  "very-positive": "\ud83d\ude04",
  positive: "\ud83d\ude42",
  neutral: "\ud83d\ude10",
  negative: "\ud83d\ude1f",
  "very-negative": "\ud83d\ude24",
};

const emotionValues: JourneyPhase["emotion"][] = [
  "very-positive",
  "positive",
  "neutral",
  "negative",
  "very-negative",
];

const emotionIntensityMap: Record<string, number> = {
  "very-positive": 2,
  positive: 1,
  neutral: 0,
  negative: -1,
  "very-negative": -2,
};

const emotionColorMap: Record<string, string> = {
  "very-positive": "bg-emerald-100 text-emerald-700 border-emerald-300",
  positive: "bg-emerald-50 text-emerald-600 border-emerald-200",
  neutral: "bg-slate-100 text-slate-600 border-slate-300",
  negative: "bg-amber-100 text-amber-700 border-amber-300",
  "very-negative": "bg-red-100 text-red-700 border-red-300",
};

function genId() {
  return Math.random().toString(36).substring(2, 9);
}

interface JourneyPhaseCardProps {
  phase: JourneyPhase;
  workshopMode: boolean;
  onUpdate: (updated: JourneyPhase) => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export function JourneyPhaseCard({
  phase,
  workshopMode,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}: JourneyPhaseCardProps) {
  const [showEmotionPicker, setShowEmotionPicker] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  function updateField<K extends keyof JourneyPhase>(key: K, value: JourneyPhase[K]) {
    onUpdate({ ...phase, [key]: value });
  }

  function setEmotion(emotion: JourneyPhase["emotion"]) {
    onUpdate({
      ...phase,
      emotion,
      emotionIntensity: emotionIntensityMap[emotion],
    });
    setShowEmotionPicker(false);
  }

  function addPainPoint() {
    const pp: JourneyPainPoint = { id: `pp-${genId()}`, description: "", severity: "medium" };
    updateField("painPoints", [...phase.painPoints, pp]);
  }

  function updatePainPoint(index: number, updated: JourneyPainPoint) {
    const next = [...phase.painPoints];
    next[index] = updated;
    updateField("painPoints", next);
  }

  function removePainPoint(index: number) {
    updateField("painPoints", phase.painPoints.filter((_, i) => i !== index));
  }

  function addOpportunity() {
    const opp: JourneyOpportunity = { id: `opp-${genId()}`, name: "", impact: "medium", effort: "medium" };
    updateField("opportunities", [...phase.opportunities, opp]);
  }

  function updateOpportunity(index: number, updated: JourneyOpportunity) {
    const next = [...phase.opportunities];
    next[index] = updated;
    updateField("opportunities", next);
  }

  function removeOpportunity(index: number) {
    updateField("opportunities", phase.opportunities.filter((_, i) => i !== index));
  }

  const actorBarColor = actorColors[phase.actor] || "bg-slate-400";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "shrink-0 transition-all duration-200",
        workshopMode ? "w-[340px]" : "w-[300px]"
      )}
    >
      <Card hover className="group relative h-full overflow-hidden">
        {/* Actor color bar */}
        <div className={cn("h-1.5 w-full", actorBarColor)} />

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="absolute right-2 top-4 rounded p-1 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500 hover:bg-red-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>

        <div className="p-4">
          {/* Drag handle + Phase name */}
          <div className="flex items-start gap-1.5 mb-2">
            <div className="mt-1 cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing">
              <GripVertical className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <input
                ref={nameRef}
                value={phase.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none focus:border-b focus:border-brand-green placeholder:text-slate-400"
                placeholder="Phase name..."
              />
            </div>
          </div>

          {/* Description */}
          <textarea
            value={phase.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="mb-3 w-full resize-none bg-transparent text-xs text-slate-600 outline-none placeholder:text-slate-400 focus:border-b focus:border-slate-300"
            placeholder="Describe this phase..."
            rows={workshopMode ? 4 : 3}
          />

          {/* Actor + Emotion row */}
          <div className="mb-3 flex items-center gap-2">
            <input
              value={phase.actor}
              onChange={(e) => updateField("actor", e.target.value)}
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium text-white outline-none w-24 text-center",
                actorBarColor
              )}
              title="Edit actor"
            />
            <div className="relative">
              <button
                onClick={() => setShowEmotionPicker(!showEmotionPicker)}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
                  emotionColorMap[phase.emotion]
                )}
              >
                <span>{emotionEmojis[phase.emotion]}</span>
              </button>
              {showEmotionPicker && (
                <div className="absolute left-0 top-full z-10 mt-1 flex gap-1 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
                  {emotionValues.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEmotion(e)}
                      className={cn(
                        "rounded-full p-1 text-sm transition-colors hover:bg-slate-100",
                        phase.emotion === e && "bg-slate-100 ring-1 ring-slate-300"
                      )}
                      title={e.replace("-", " ")}
                    >
                      {emotionEmojis[e]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Technical metadata (hidden in workshop mode) */}
          {!workshopMode && (
            <div className="mb-3 space-y-2">
              {/* Time + Tool */}
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <input
                    value={phase.timeEstimate || ""}
                    onChange={(e) => updateField("timeEstimate", e.target.value)}
                    className="w-20 bg-transparent outline-none placeholder:text-slate-300"
                    placeholder="Time est."
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Wrench className="h-3 w-3" />
                  <input
                    value={phase.tool || ""}
                    onChange={(e) => updateField("tool", e.target.value)}
                    className="w-20 bg-transparent outline-none placeholder:text-slate-300"
                    placeholder="Tool"
                  />
                </div>
              </div>

              {/* Touchpoints */}
              {phase.touchpoints.length > 0 && (
                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Touchpoints</span>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {phase.touchpoints.map((tp, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] py-0">
                        {tp.channel}: {tp.type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {phase.actions.length > 0 && (
                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Actions</span>
                  <ul className="mt-0.5 space-y-0.5">
                    {phase.actions.map((a, i) => (
                      <li key={i} className="text-[10px] text-slate-500 leading-tight">- {a}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Thoughts */}
              {phase.thoughts.length > 0 && (
                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Thoughts</span>
                  <div className="mt-0.5 space-y-0.5">
                    {phase.thoughts.map((t, i) => (
                      <p key={i} className="text-[10px] italic text-slate-400 leading-tight">&ldquo;{t}&rdquo;</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pain Points */}
          <div className="mb-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Pain Points</span>
              <button
                onClick={addPainPoint}
                className="flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
            <div className="space-y-1">
              {phase.painPoints.map((pp, i) => (
                <PainPointBadge
                  key={pp.id}
                  painPoint={pp}
                  onUpdate={(updated) => updatePainPoint(i, updated)}
                  onRemove={() => removePainPoint(i)}
                />
              ))}
            </div>
          </div>

          {/* Opportunities */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Opportunities</span>
              <button
                onClick={addOpportunity}
                className="flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
            <div className="space-y-1">
              {phase.opportunities.map((opp, i) => (
                <OpportunityBadge
                  key={opp.id}
                  opportunity={opp}
                  onUpdate={(updated) => updateOpportunity(i, updated)}
                  onRemove={() => removeOpportunity(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
