"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { Copy, RotateCcw, Eye, EyeOff, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultJourney } from "@/data/default-journey";
import { JourneyPhaseCard } from "./JourneyPhaseCard";
import { EmotionCurve } from "./EmotionCurve";
import type { CustomerJourney, JourneyPhase } from "@/types/customer-journey";

const STORAGE_KEY = "tablex-customer-journey";

function genId() {
  return Math.random().toString(36).substring(2, 9);
}

// Hydration-safe "on the client" flag: false during SSR and the hydration
// render, true after mount — so server and client markup stay in sync.
const emptySubscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function JourneyBoard() {
  const hydrated = useHydrated();
  // Journey loaded from localStorage once we're on the client (replaces the
  // old load-on-mount effect; same visible sequence: spinner, then board).
  const initialJourney = useMemo<CustomerJourney | null>(() => {
    if (!hydrated) return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as CustomerJourney) : defaultJourney;
    } catch {
      return defaultJourney;
    }
  }, [hydrated]);
  const [journeyState, setJourneyState] = useState<CustomerJourney | null>(null);
  // Edits win over the loaded value.
  const journey = journeyState ?? initialJourney;
  const [workshopMode, setWorkshopMode] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const dragIndexRef = useRef<number | null>(null);

  // Save to localStorage on change
  useEffect(() => {
    if (!journey) return;
    const toSave = { ...journey, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [journey]);

  const updatePhase = useCallback(
    (index: number, updated: JourneyPhase) => {
      setJourneyState((prev) => {
        const base = prev ?? initialJourney;
        if (!base) return prev;
        const phases = [...base.phases];
        phases[index] = updated;
        return { ...base, phases };
      });
    },
    [initialJourney]
  );

  const deletePhase = useCallback(
    (index: number) => {
      if (!window.confirm("Delete this phase? This cannot be undone.")) return;
      setJourneyState((prev) => {
        const base = prev ?? initialJourney;
        if (!base) return prev;
        const phases = base.phases.filter((_, i) => i !== index);
        // Re-order
        phases.forEach((p, i) => (p.order = i));
        return { ...base, phases };
      });
    },
    [initialJourney]
  );

  const addPhase = useCallback(
    (atIndex: number) => {
      setJourneyState((prev) => {
        const base = prev ?? initialJourney;
        if (!base) return prev;
        const newPhase: JourneyPhase = {
          id: `phase-${genId()}`,
          name: "",
          description: "",
          actor: "Customer",
          touchpoints: [],
          actions: [],
          thoughts: [],
          emotion: "neutral",
          emotionIntensity: 0,
          painPoints: [],
          opportunities: [],
          order: atIndex,
        };
        const phases = [...base.phases];
        phases.splice(atIndex, 0, newPhase);
        phases.forEach((p, i) => (p.order = i));
        return { ...base, phases };
      });
    },
    [initialJourney]
  );

  function handleDragStart(index: number) {
    return (e: React.DragEvent) => {
      dragIndexRef.current = index;
      e.dataTransfer.effectAllowed = "move";
      // Make the drag image semi-transparent
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.opacity = "0.5";
      }
    };
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(targetIndex: number) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.opacity = "1";
      }
      const fromIndex = dragIndexRef.current;
      if (fromIndex === null || fromIndex === targetIndex) return;

      setJourneyState((prev) => {
        const base = prev ?? initialJourney;
        if (!base) return prev;
        const phases = [...base.phases];
        const [moved] = phases.splice(fromIndex, 1);
        phases.splice(targetIndex, 0, moved);
        phases.forEach((p, i) => (p.order = i));
        return { ...base, phases };
      });

      dragIndexRef.current = null;
    };
  }

  function handleDragEnd(e: React.DragEvent) {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    dragIndexRef.current = null;
  }

  function copyAsJson() {
    if (!journey) return;
    navigator.clipboard.writeText(JSON.stringify(journey, null, 2));
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  }

  function resetToDefault() {
    if (!window.confirm("Reset to the default journey? All edits will be lost.")) return;
    const fresh = { ...defaultJourney, lastModified: new Date().toISOString() };
    setJourneyState(fresh);
  }

  // Loading state while reading localStorage
  if (!journey) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-green" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Board controls */}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold text-slate-900 flex-1">{journey.name}</h2>
        <Button
          variant={workshopMode ? "default" : "outline"}
          size="sm"
          onClick={() => setWorkshopMode(!workshopMode)}
        >
          {workshopMode ? <EyeOff className="mr-1.5 h-3.5 w-3.5" /> : <Eye className="mr-1.5 h-3.5 w-3.5" />}
          {workshopMode ? "Exit Workshop" : "Workshop Mode"}
        </Button>
        <Button variant="outline" size="sm" onClick={copyAsJson}>
          <Copy className="mr-1.5 h-3.5 w-3.5" />
          {copyFeedback ? "Copied!" : "Copy as JSON"}
        </Button>
        <Button variant="outline" size="sm" onClick={resetToDefault}>
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Reset to Default
        </Button>
      </div>

      {/* Actor legend */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="font-medium">Actors:</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-400" /> Customer</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-purple-400" /> Dealer/Rep</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" /> TableX Staff</span>
      </div>

      {/* Phase cards (horizontally scrollable) */}
      <div className="overflow-x-auto pb-4">
        <div className="flex items-stretch gap-2">
          {/* Add button at the start */}
          <button
            onClick={() => addPhase(0)}
            className="flex shrink-0 items-center justify-center w-8 rounded-lg border-2 border-dashed border-slate-200 text-slate-300 transition-colors hover:border-brand-green hover:text-brand-green"
            title="Add phase at start"
          >
            <Plus className="h-4 w-4" />
          </button>

          {journey.phases.map((phase, index) => (
            <div key={phase.id} className="flex items-stretch gap-2">
              <div onDragEnd={handleDragEnd}>
                <JourneyPhaseCard
                  phase={phase}
                  workshopMode={workshopMode}
                  onUpdate={(updated) => updatePhase(index, updated)}
                  onDelete={() => deletePhase(index)}
                  onDragStart={handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop(index)}
                />
              </div>
              {/* Add button between cards */}
              <button
                onClick={() => addPhase(index + 1)}
                className="flex shrink-0 items-center justify-center w-8 rounded-lg border-2 border-dashed border-slate-200 text-slate-300 transition-colors hover:border-brand-green hover:text-brand-green"
                title="Add phase here"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Emotion Curve */}
      <EmotionCurve phases={journey.phases} />
    </div>
  );
}
