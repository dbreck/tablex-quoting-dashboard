import { useMemo } from "react";
import { create } from "zustand";
import type { Risk, Decision } from "@/data/risks-decisions";
import * as rdClient from "@/lib/supabase/risks-decisions-client";
import {
  rowToRisk,
  rowToDecision,
  type RiskRow,
  type DecisionRow,
} from "@/lib/supabase/risks-decisions-converters";

// ─── Hydration + Realtime types ──────────────────────────────────────────────

export interface RisksDecisionsHydrationSnapshot {
  risks: Risk[];
  decisions: Decision[];
}

export type RisksDecisionsRealtimeTable = "risks" | "decisions";
export type RealtimeEventType = "INSERT" | "UPDATE" | "DELETE";

// ─── Store shape ─────────────────────────────────────────────────────────────

interface RisksDecisionsStore {
  risks: Risk[];
  decisions: Decision[];
  isInitialized: boolean;

  // Lifecycle
  hydrate: (snapshot: RisksDecisionsHydrationSnapshot) => void;
  mergeRealtimeChange: (
    table: RisksDecisionsRealtimeTable,
    eventType: RealtimeEventType,
    row: Record<string, unknown> | null,
    oldRow?: Record<string, unknown> | null,
  ) => void;
  clearLocal: () => void;

  // Risks CRUD
  addRisk: (risk: Risk) => void;
  updateRisk: (
    id: string,
    patch: Partial<Omit<Risk, "id" | "severity" | "createdAt" | "updatedAt">>,
  ) => void;
  deleteRisk: (id: string) => void;

  // Decisions CRUD
  addDecision: (decision: Decision) => void;
  updateDecision: (
    id: string,
    patch: Partial<Omit<Decision, "id" | "createdAt" | "updatedAt">>,
  ) => void;
  deleteDecision: (id: string) => void;
}

function fireAndForget(label: string, p: Promise<unknown>): void {
  void p.catch((err) => {
    console.error(`[risks-decisions-store] ${label} failed`, err);
  });
}

// Severity client-side mirror so optimistic rows don't show `NaN`.
function computeSeverity(probability: number, impact: number): number {
  return probability * impact;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useRisksDecisionsStore = create<RisksDecisionsStore>()((set, get) => ({
  risks: [],
  decisions: [],
  isInitialized: false,

  hydrate: (snapshot) => {
    set({
      risks: snapshot.risks,
      decisions: snapshot.decisions,
      isInitialized: true,
    });
  },

  mergeRealtimeChange: (table, eventType, row, oldRow) => {
    const state = get();

    if (table === "risks") {
      const id =
        (row?.id as string | undefined) ?? (oldRow?.id as string | undefined);
      if (!id) return;
      if (eventType === "DELETE") {
        set({ risks: state.risks.filter((r) => r.id !== id) });
        return;
      }
      if (!row) return;
      const incoming = rowToRisk(row as unknown as RiskRow);
      const existing = state.risks.find((r) => r.id === id);
      if (existing && Date.parse(existing.updatedAt) > Date.parse(incoming.updatedAt)) {
        return;
      }
      const next = existing
        ? state.risks.map((r) => (r.id === id ? incoming : r))
        : [...state.risks, incoming];
      set({ risks: next });
      return;
    }

    if (table === "decisions") {
      const id =
        (row?.id as string | undefined) ?? (oldRow?.id as string | undefined);
      if (!id) return;
      if (eventType === "DELETE") {
        set({ decisions: state.decisions.filter((d) => d.id !== id) });
        return;
      }
      if (!row) return;
      const incoming = rowToDecision(row as unknown as DecisionRow);
      const existing = state.decisions.find((d) => d.id === id);
      if (existing && Date.parse(existing.updatedAt) > Date.parse(incoming.updatedAt)) {
        return;
      }
      const next = existing
        ? state.decisions.map((d) => (d.id === id ? incoming : d))
        : [...state.decisions, incoming];
      set({ decisions: next });
      return;
    }
  },

  clearLocal: () => {
    set({ risks: [], decisions: [], isInitialized: false });
  },

  // ─── Risks ─────────────────────────────────────────────────────────────────

  addRisk: (risk) => {
    const withSeverity: Risk = {
      ...risk,
      severity: computeSeverity(risk.probability, risk.impact),
    };
    set({ risks: [...get().risks, withSeverity] });
    fireAndForget(
      "addRisk",
      rdClient.createRisk({
        id: risk.id,
        deliverableId: risk.deliverableId,
        title: risk.title,
        description: risk.description,
        category: risk.category,
        probability: risk.probability,
        impact: risk.impact,
        status: risk.status,
        triggerDate: risk.triggerDate,
        mitigationOwner: risk.mitigationOwner,
        mitigationPlan: risk.mitigationPlan,
        createdBy: risk.createdBy,
      }),
    );
  },

  updateRisk: (id, patch) => {
    const now = new Date().toISOString();
    set({
      risks: get().risks.map((r) => {
        if (r.id !== id) return r;
        const next: Risk = { ...r, ...patch, updatedAt: now };
        // Recompute severity locally so the chip reacts before Realtime echoes.
        if (patch.probability !== undefined || patch.impact !== undefined) {
          next.severity = computeSeverity(next.probability, next.impact);
        }
        return next;
      }),
    });
    fireAndForget("updateRisk", rdClient.updateRisk(id, patch));
  },

  deleteRisk: (id) => {
    set({ risks: get().risks.filter((r) => r.id !== id) });
    fireAndForget("deleteRisk", rdClient.deleteRisk(id));
  },

  // ─── Decisions ─────────────────────────────────────────────────────────────

  addDecision: (decision) => {
    set({ decisions: [...get().decisions, decision] });
    fireAndForget(
      "addDecision",
      rdClient.createDecision({
        id: decision.id,
        deliverableId: decision.deliverableId,
        taskId: decision.taskId,
        title: decision.title,
        context: decision.context,
        optionsConsidered: decision.optionsConsidered,
        decision: decision.decision,
        consequences: decision.consequences,
        decidedByMemberId: decision.decidedByMemberId,
        decidedByExternal: decision.decidedByExternal,
        decidedOn: decision.decidedOn,
        reversibility: decision.reversibility,
        status: decision.status,
        supersedes: decision.supersedes,
        supersededBy: decision.supersededBy,
      }),
    );
  },

  updateDecision: (id, patch) => {
    const now = new Date().toISOString();
    set({
      decisions: get().decisions.map((d) =>
        d.id === id ? { ...d, ...patch, updatedAt: now } : d,
      ),
    });
    fireAndForget("updateDecision", rdClient.updateDecision(id, patch));
  },

  deleteDecision: (id) => {
    set({ decisions: get().decisions.filter((d) => d.id !== id) });
    fireAndForget("deleteDecision", rdClient.deleteDecision(id));
  },
}));

// ─── Derived selectors ───────────────────────────────────────────────────────

/** Sorted-by-severity-desc risks, stable ref via useMemo. */
export function useRisks(): Risk[] {
  const risks = useRisksDecisionsStore((s) => s.risks);
  return useMemo(
    () =>
      [...risks].sort((a, b) => {
        if (b.severity !== a.severity) return b.severity - a.severity;
        return b.updatedAt.localeCompare(a.updatedAt);
      }),
    [risks],
  );
}

/** Sorted-by-decidedOn-desc decisions, stable ref via useMemo. */
export function useDecisions(): Decision[] {
  const decisions = useRisksDecisionsStore((s) => s.decisions);
  return useMemo(
    () => [...decisions].sort((a, b) => b.decidedOn.localeCompare(a.decidedOn)),
    [decisions],
  );
}

export function useRisk(id: string | null | undefined): Risk | undefined {
  return useRisksDecisionsStore((s) => {
    if (!id) return undefined;
    return s.risks.find((r) => r.id === id);
  });
}

export function useDecision(id: string | null | undefined): Decision | undefined {
  return useRisksDecisionsStore((s) => {
    if (!id) return undefined;
    return s.decisions.find((d) => d.id === id);
  });
}
