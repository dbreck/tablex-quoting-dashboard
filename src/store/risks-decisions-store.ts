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

  // Risks CRUD — async, throw on DB failure (with optimistic state rolled back).
  addRisk: (risk: Risk) => Promise<void>;
  updateRisk: (
    id: string,
    patch: Partial<Omit<Risk, "id" | "severity" | "createdAt" | "updatedAt">>,
  ) => Promise<void>;
  deleteRisk: (id: string) => Promise<void>;

  // Decisions CRUD — same pattern.
  addDecision: (decision: Decision) => Promise<void>;
  updateDecision: (
    id: string,
    patch: Partial<Omit<Decision, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<void>;
  deleteDecision: (id: string) => Promise<void>;
}

function toError(err: unknown, label: string): Error {
  if (err instanceof Error) return err;
  if (typeof err === "object" && err !== null) {
    const obj = err as { message?: string; details?: string; hint?: string; code?: string };
    const msg =
      obj.message ??
      obj.details ??
      obj.hint ??
      (obj.code ? `Postgres error ${obj.code}` : null);
    if (msg) return new Error(msg);
  }
  return new Error(`${label} failed: ${String(err)}`);
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
  //
  // Each mutation applies the optimistic state, awaits the DB write, and
  // rolls back on failure so the dialog can surface the error and the user
  // can retry. Throwing here is intentional — RiskDialog awaits the promise.

  addRisk: async (risk) => {
    const withSeverity: Risk = {
      ...risk,
      severity: computeSeverity(risk.probability, risk.impact),
    };
    const previous = get().risks;
    set({ risks: [...previous, withSeverity] });
    try {
      await rdClient.createRisk({
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
      });
    } catch (err) {
      set({ risks: previous });
      console.error("[risks-decisions-store] addRisk failed", err);
      throw toError(err, "Save risk");
    }
  },

  updateRisk: async (id, patch) => {
    const now = new Date().toISOString();
    const previous = get().risks;
    set({
      risks: previous.map((r) => {
        if (r.id !== id) return r;
        const next: Risk = { ...r, ...patch, updatedAt: now };
        // Recompute severity locally so the chip reacts before Realtime echoes.
        if (patch.probability !== undefined || patch.impact !== undefined) {
          next.severity = computeSeverity(next.probability, next.impact);
        }
        return next;
      }),
    });
    try {
      await rdClient.updateRisk(id, patch);
    } catch (err) {
      set({ risks: previous });
      console.error("[risks-decisions-store] updateRisk failed", err);
      throw toError(err, "Update risk");
    }
  },

  deleteRisk: async (id) => {
    const previous = get().risks;
    set({ risks: previous.filter((r) => r.id !== id) });
    try {
      await rdClient.deleteRisk(id);
    } catch (err) {
      set({ risks: previous });
      console.error("[risks-decisions-store] deleteRisk failed", err);
      throw toError(err, "Delete risk");
    }
  },

  // ─── Decisions ─────────────────────────────────────────────────────────────

  addDecision: async (decision) => {
    const previous = get().decisions;
    set({ decisions: [...previous, decision] });
    try {
      await rdClient.createDecision({
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
      });
    } catch (err) {
      set({ decisions: previous });
      console.error("[risks-decisions-store] addDecision failed", err);
      throw toError(err, "Save decision");
    }
  },

  updateDecision: async (id, patch) => {
    const now = new Date().toISOString();
    const previous = get().decisions;
    set({
      decisions: previous.map((d) =>
        d.id === id ? { ...d, ...patch, updatedAt: now } : d,
      ),
    });
    try {
      await rdClient.updateDecision(id, patch);
    } catch (err) {
      set({ decisions: previous });
      console.error("[risks-decisions-store] updateDecision failed", err);
      throw toError(err, "Update decision");
    }
  },

  deleteDecision: async (id) => {
    const previous = get().decisions;
    set({ decisions: previous.filter((d) => d.id !== id) });
    try {
      await rdClient.deleteDecision(id);
    } catch (err) {
      set({ decisions: previous });
      console.error("[risks-decisions-store] deleteDecision failed", err);
      throw toError(err, "Delete decision");
    }
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
