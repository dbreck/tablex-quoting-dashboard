// Per-page approval state for the Site Map review flow.
//
// Persisted to localStorage so reviewers can mark Yes/No (with a reason)
// across the 75-page IA and the state survives reloads. Single-user for now;
// can graduate to Supabase later if multi-reviewer editing becomes a need.

import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ApprovalDecision = "approved" | "rejected" | "pending";

export interface PageApproval {
  decision: ApprovalDecision;
  /** Reason for rejection (or any free-text annotation). */
  note: string;
  decidedAt: string;
}

interface State {
  approvals: Record<string, PageApproval>;
  setDecision: (pageId: string, decision: ApprovalDecision) => void;
  setNote: (pageId: string, note: string) => void;
  clear: (pageId: string) => void;
  clearAll: () => void;
}

const STORAGE_KEY = "tablex-sitemap-approvals-v1";

export const useApprovalsStore = create<State>()(
  persist(
    (set) => ({
      approvals: {},
      setDecision: (pageId, decision) =>
        set((s) => {
          const current = s.approvals[pageId];
          // Toggle off when clicking the active decision again.
          if (current?.decision === decision) {
            const next = { ...s.approvals };
            // Preserve the note in case the user wants to undo, but
            // reset decision to pending.
            next[pageId] = {
              decision: "pending",
              note: current.note,
              decidedAt: new Date().toISOString(),
            };
            return { approvals: next };
          }
          return {
            approvals: {
              ...s.approvals,
              [pageId]: {
                decision,
                note: current?.note ?? "",
                decidedAt: new Date().toISOString(),
              },
            },
          };
        }),
      setNote: (pageId, note) =>
        set((s) => {
          const current = s.approvals[pageId];
          return {
            approvals: {
              ...s.approvals,
              [pageId]: {
                decision: current?.decision ?? "rejected",
                note,
                decidedAt: new Date().toISOString(),
              },
            },
          };
        }),
      clear: (pageId) =>
        set((s) => {
          const next = { ...s.approvals };
          delete next[pageId];
          return { approvals: next };
        }),
      clearAll: () => set({ approvals: {} }),
    }),
    { name: STORAGE_KEY },
  ),
);

// ─── Selector hooks ────────────────────────────────────────────────────

export function useApprovalForPage(pageId: string): PageApproval | undefined {
  return useApprovalsStore((s) => s.approvals[pageId]);
}

export function useApprovalDecision(pageId: string): ApprovalDecision {
  return useApprovalsStore((s) => s.approvals[pageId]?.decision ?? "pending");
}

export interface ApprovalStats {
  approved: number;
  rejected: number;
  pending: number;
  total: number;
  pctReviewed: number;
}

export function useApprovalStats(totalPages: number): ApprovalStats {
  // Select the raw map and derive — avoid returning a new object per render
  // from the selector itself (otherwise Zustand v5 tears).
  const approvalsMap = useApprovalsStore((s) => s.approvals);
  return useMemo(() => {
    let approved = 0;
    let rejected = 0;
    for (const a of Object.values(approvalsMap)) {
      if (a.decision === "approved") approved++;
      else if (a.decision === "rejected") rejected++;
    }
    const pending = Math.max(0, totalPages - approved - rejected);
    const pctReviewed =
      totalPages === 0 ? 0 : Math.round(((approved + rejected) / totalPages) * 100);
    return { approved, rejected, pending, total: totalPages, pctReviewed };
  }, [approvalsMap, totalPages]);
}

/** Per-group rollup: how many of the group's pages have been approved/rejected. */
export function useGroupApprovalRollup(pageIds: string[]): {
  approved: number;
  rejected: number;
  pending: number;
} {
  const approvalsMap = useApprovalsStore((s) => s.approvals);
  return useMemo(() => {
    let approved = 0;
    let rejected = 0;
    for (const id of pageIds) {
      const d = approvalsMap[id]?.decision;
      if (d === "approved") approved++;
      else if (d === "rejected") rejected++;
    }
    return { approved, rejected, pending: pageIds.length - approved - rejected };
  }, [approvalsMap, pageIds]);
}
