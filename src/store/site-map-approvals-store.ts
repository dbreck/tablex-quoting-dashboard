// Per-page approval state for the Site Map review flow.
//
// Multi-reviewer: thin Zustand cache over Supabase `site_map_approvals`.
// Mounted hydration + realtime hooks in src/app/(dashboard)/content/layout.tsx
// keep cross-client state in sync. Mutations are write-through (optimistic
// local update + fire-and-forget Supabase call); on failure, Realtime
// reconciles on next page load.
//
// Public API preserved verbatim from the previous localStorage version:
// `setDecision`, `setNote`, `clear`, `clearAll` still return void; the
// derived hooks (useApprovalForPage / useApprovalDecision / useApprovalStats /
// useGroupApprovalRollup) are unchanged. The export.ts caller's
// `useApprovalsStore.getState().approvals` still returns Record<pageId, PageApproval>.

import { useMemo } from "react";
import { create } from "zustand";
import * as smClient from "@/lib/supabase/site-map-approvals-client";
import {
  rowToApproval,
  type SiteMapApprovalRecord,
  type SiteMapApprovalRow,
} from "@/lib/supabase/site-map-approvals-converters";

export type ApprovalDecision = "approved" | "rejected" | "pending";

export interface PageApproval {
  decision: ApprovalDecision;
  /** Reason for rejection (or any free-text annotation). */
  note: string;
  decidedAt: string;
}

export interface ApprovalsHydrationSnapshot {
  records: SiteMapApprovalRecord[];
}

interface PageApprovalInternal extends PageApproval {
  /** Realtime echo guard — local-newer wins on merge. Not exposed to consumers. */
  updatedAt: string;
}

export type ApprovalsRealtimeTable = "site_map_approvals";
export type RealtimeEventType = "INSERT" | "UPDATE" | "DELETE";

interface State {
  /**
   * Internal map keyed by pageId. Consumers should go through the selector
   * hooks (useApprovalForPage / useApprovalDecision / etc.) — those return
   * the original `PageApproval` shape without leaking `updatedAt`.
   * Imperative callers (e.g. the Markdown export) use `getApprovalsSnapshot`.
   */
  _byId: Record<string, PageApprovalInternal>;
  isInitialized: boolean;

  // Lifecycle
  hydrate: (snapshot: ApprovalsHydrationSnapshot) => void;
  mergeRealtimeChange: (
    table: ApprovalsRealtimeTable,
    eventType: RealtimeEventType,
    row: Record<string, unknown> | null,
    oldRow?: Record<string, unknown> | null,
  ) => void;
  clearLocal: () => void;

  // Mutations — return void to match the prior synchronous signatures.
  setDecision: (pageId: string, decision: ApprovalDecision) => void;
  setNote: (pageId: string, note: string) => void;
  clear: (pageId: string) => void;
  clearAll: () => void;
}

function nowIso(): string {
  return new Date().toISOString();
}

function strip(internal: Record<string, PageApprovalInternal>): Record<string, PageApproval> {
  const out: Record<string, PageApproval> = {};
  for (const [id, a] of Object.entries(internal)) {
    out[id] = { decision: a.decision, note: a.note, decidedAt: a.decidedAt };
  }
  return out;
}

export const useApprovalsStore = create<State>()((set, get) => ({
  _byId: {},
  isInitialized: false,

  hydrate: (snapshot) => {
    const _byId: Record<string, PageApprovalInternal> = {};
    for (const r of snapshot.records) {
      _byId[r.pageId] = {
        decision: r.decision,
        note: r.note,
        decidedAt: r.decidedAt,
        updatedAt: r.updatedAt,
      };
    }
    set({ _byId, isInitialized: true });
  },

  mergeRealtimeChange: (table, eventType, row, oldRow) => {
    if (table !== "site_map_approvals") return;
    const state = get();
    const id =
      (row?.page_id as string | undefined) ??
      (oldRow?.page_id as string | undefined);
    if (!id) return;

    if (eventType === "DELETE") {
      if (!(id in state._byId)) return;
      const next = { ...state._byId };
      delete next[id];
      set({ _byId: next });
      return;
    }
    if (!row) return;
    const incoming = rowToApproval(row as unknown as SiteMapApprovalRow);
    const existing = state._byId[id];
    if (existing && Date.parse(existing.updatedAt) > Date.parse(incoming.updatedAt)) {
      return;
    }
    set({
      _byId: {
        ...state._byId,
        [id]: {
          decision: incoming.decision,
          note: incoming.note,
          decidedAt: incoming.decidedAt,
          updatedAt: incoming.updatedAt,
        },
      },
    });
  },

  clearLocal: () => {
    set({ _byId: {}, isInitialized: false });
  },

  setDecision: (pageId, decision) => {
    const state = get();
    const current = state._byId[pageId];

    // Toggle off when clicking the active decision again — preserve note,
    // reset decision to pending. (Same semantics as the old store.)
    const nextDecision: ApprovalDecision =
      current?.decision === decision ? "pending" : decision;
    const note = current?.note ?? "";
    const ts = nowIso();
    const nextRow: PageApprovalInternal = {
      decision: nextDecision,
      note,
      decidedAt: ts,
      updatedAt: ts,
    };

    set({ _byId: { ...state._byId, [pageId]: nextRow } });

    void smClient.upsertApproval(pageId, nextDecision, note).catch((err) => {
      console.error("[site-map-approvals] setDecision failed", err);
    });
  },

  setNote: (pageId, note) => {
    const state = get();
    const current = state._byId[pageId];
    const decision = current?.decision ?? "rejected";
    const ts = nowIso();
    const nextRow: PageApprovalInternal = {
      decision,
      note,
      decidedAt: ts,
      updatedAt: ts,
    };

    set({ _byId: { ...state._byId, [pageId]: nextRow } });

    void smClient.upsertApproval(pageId, decision, note).catch((err) => {
      console.error("[site-map-approvals] setNote failed", err);
    });
  },

  clear: (pageId) => {
    const state = get();
    if (!(pageId in state._byId)) return;
    const next = { ...state._byId };
    delete next[pageId];
    set({ _byId: next });

    void smClient.deleteApproval(pageId).catch((err) => {
      console.error("[site-map-approvals] clear failed", err);
    });
  },

  clearAll: () => {
    set({ _byId: {} });

    void smClient.deleteAllApprovals().catch((err) => {
      console.error("[site-map-approvals] clearAll failed", err);
    });
  },
}));

// ─── Imperative snapshot ───────────────────────────────────────────────
//
// For callers (like the Markdown exporter) that need the full map outside
// of React render. Returns a fresh Record on every call — do NOT use as a
// selector value or you'll re-render every commit.

export function getApprovalsSnapshot(): Record<string, PageApproval> {
  return strip(useApprovalsStore.getState()._byId);
}

// ─── Selector hooks ────────────────────────────────────────────────────

export function useApprovalForPage(pageId: string): PageApproval | undefined {
  // Return the stored internal record directly — it structurally satisfies
  // PageApproval (the extra `updatedAt` field is invisible through the
  // declared return type). Building a fresh `{decision, note, decidedAt}`
  // object inside the selector creates a new ref on every call and trips
  // React #185 the moment any store update fires.
  return useApprovalsStore((s) => s._byId[pageId]);
}

export function useApprovalDecision(pageId: string): ApprovalDecision {
  return useApprovalsStore((s) => s._byId[pageId]?.decision ?? "pending");
}

export interface ApprovalStats {
  approved: number;
  rejected: number;
  pending: number;
  total: number;
  pctReviewed: number;
}

export function useApprovalStats(totalPages: number): ApprovalStats {
  const byId = useApprovalsStore((s) => s._byId);
  return useMemo(() => {
    let approved = 0;
    let rejected = 0;
    for (const a of Object.values(byId)) {
      if (a.decision === "approved") approved++;
      else if (a.decision === "rejected") rejected++;
    }
    const pending = Math.max(0, totalPages - approved - rejected);
    const pctReviewed =
      totalPages === 0 ? 0 : Math.round(((approved + rejected) / totalPages) * 100);
    return { approved, rejected, pending, total: totalPages, pctReviewed };
  }, [byId, totalPages]);
}

/** Per-group rollup: how many of the group's pages have been approved/rejected. */
export function useGroupApprovalRollup(pageIds: string[]): {
  approved: number;
  rejected: number;
  pending: number;
} {
  const byId = useApprovalsStore((s) => s._byId);
  return useMemo(() => {
    let approved = 0;
    let rejected = 0;
    for (const id of pageIds) {
      const d = byId[id]?.decision;
      if (d === "approved") approved++;
      else if (d === "rejected") rejected++;
    }
    return { approved, rejected, pending: pageIds.length - approved - rejected };
  }, [byId, pageIds]);
}
