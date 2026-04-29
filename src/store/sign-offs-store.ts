import { useMemo } from "react";
import { create } from "zustand";
import type {
  SignOff,
  SignOffRevision,
  SignOffNote,
} from "@/data/sign-offs";
import * as soClient from "@/lib/supabase/sign-offs-client";
import {
  rowToSignOff,
  rowToSignOffRevision,
  rowToSignOffNote,
  type SignOffRow,
  type SignOffRevisionRow,
  type SignOffNoteRow,
} from "@/lib/supabase/sign-offs-converters";

// ─── Hydration + Realtime types ──────────────────────────────────────────────

export interface SignOffsHydrationSnapshot {
  signOffs: SignOff[];
  revisions: SignOffRevision[];
  notes: SignOffNote[];
}

export type SignOffsRealtimeTable =
  | "sign_offs"
  | "sign_off_revisions"
  | "sign_off_notes";
export type RealtimeEventType = "INSERT" | "UPDATE" | "DELETE";

// ─── Store shape ─────────────────────────────────────────────────────────────

interface SignOffsStore {
  signOffs: SignOff[];
  revisions: SignOffRevision[];
  notes: SignOffNote[];
  isInitialized: boolean;

  hydrate: (snapshot: SignOffsHydrationSnapshot) => void;
  mergeRealtimeChange: (
    table: SignOffsRealtimeTable,
    eventType: RealtimeEventType,
    row: Record<string, unknown> | null,
    oldRow?: Record<string, unknown> | null,
  ) => void;
  clearLocal: () => void;

  // Sign-off CRUD
  addSignOff: (signOff: SignOff) => Promise<void>;
  updateSignOff: (
    id: string,
    patch: Partial<Omit<SignOff, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<void>;
  deleteSignOff: (id: string) => Promise<void>;

  // Revisions (insert-only — formal decisions)
  recordRevision: (rev: SignOffRevision) => Promise<void>;

  // Notes (insert-only — append-only commentary)
  addNote: (note: SignOffNote) => Promise<void>;
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

// ─── Store ───────────────────────────────────────────────────────────────────

export const useSignOffsStore = create<SignOffsStore>()((set, get) => ({
  signOffs: [],
  revisions: [],
  notes: [],
  isInitialized: false,

  hydrate: (snapshot) => {
    set({
      signOffs: snapshot.signOffs,
      revisions: snapshot.revisions,
      notes: snapshot.notes,
      isInitialized: true,
    });
  },

  mergeRealtimeChange: (table, eventType, row, oldRow) => {
    const state = get();

    if (table === "sign_offs") {
      const id = (row?.id as string | undefined) ?? (oldRow?.id as string | undefined);
      if (!id) return;
      if (eventType === "DELETE") {
        set({ signOffs: state.signOffs.filter((s) => s.id !== id) });
        return;
      }
      if (!row) return;
      const incoming = rowToSignOff(row as unknown as SignOffRow);
      const existing = state.signOffs.find((s) => s.id === id);
      if (existing && Date.parse(existing.updatedAt) > Date.parse(incoming.updatedAt)) {
        return;
      }
      const next = existing
        ? state.signOffs.map((s) => (s.id === id ? incoming : s))
        : [...state.signOffs, incoming];
      set({ signOffs: next });
      return;
    }

    if (table === "sign_off_revisions") {
      const id = (row?.id as string | undefined) ?? (oldRow?.id as string | undefined);
      if (!id) return;
      if (eventType === "DELETE") {
        set({ revisions: state.revisions.filter((r) => r.id !== id) });
        return;
      }
      if (!row) return;
      const incoming = rowToSignOffRevision(row as unknown as SignOffRevisionRow);
      const existing = state.revisions.find((r) => r.id === id);
      const next = existing
        ? state.revisions.map((r) => (r.id === id ? incoming : r))
        : [...state.revisions, incoming];
      set({ revisions: next });
      return;
    }

    if (table === "sign_off_notes") {
      const id = (row?.id as string | undefined) ?? (oldRow?.id as string | undefined);
      if (!id) return;
      if (eventType === "DELETE") {
        set({ notes: state.notes.filter((n) => n.id !== id) });
        return;
      }
      if (!row) return;
      const incoming = rowToSignOffNote(row as unknown as SignOffNoteRow);
      const existing = state.notes.find((n) => n.id === id);
      const next = existing
        ? state.notes.map((n) => (n.id === id ? incoming : n))
        : [...state.notes, incoming];
      set({ notes: next });
      return;
    }
  },

  clearLocal: () => {
    set({ signOffs: [], revisions: [], notes: [], isInitialized: false });
  },

  // ─── Sign-off mutations ────────────────────────────────────────────────────

  addSignOff: async (signOff) => {
    const previous = get().signOffs;
    set({ signOffs: [...previous, signOff] });
    try {
      await soClient.createSignOff({
        id: signOff.id,
        deliverableId: signOff.deliverableId,
        title: signOff.title,
        description: signOff.description,
        links: signOff.links,
        status: signOff.status,
        revisionNumber: signOff.revisionNumber,
        approvedAt: signOff.approvedAt,
        approvedByProfileId: signOff.approvedByProfileId,
        approvedByName: signOff.approvedByName,
        createdByMemberId: signOff.createdByMemberId,
      });
    } catch (err) {
      set({ signOffs: previous });
      console.error("[sign-offs-store] addSignOff failed", err);
      throw toError(err, "Save sign-off");
    }
  },

  updateSignOff: async (id, patch) => {
    const now = new Date().toISOString();
    const previous = get().signOffs;
    set({
      signOffs: previous.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: now } : s)),
    });
    try {
      await soClient.updateSignOff(id, patch);
    } catch (err) {
      set({ signOffs: previous });
      console.error("[sign-offs-store] updateSignOff failed", err);
      throw toError(err, "Update sign-off");
    }
  },

  deleteSignOff: async (id) => {
    const previous = get().signOffs;
    set({ signOffs: previous.filter((s) => s.id !== id) });
    try {
      await soClient.deleteSignOff(id);
    } catch (err) {
      set({ signOffs: previous });
      console.error("[sign-offs-store] deleteSignOff failed", err);
      throw toError(err, "Delete sign-off");
    }
  },

  recordRevision: async (rev) => {
    const previous = get().revisions;
    set({ revisions: [...previous, rev] });
    try {
      await soClient.insertSignOffRevision(rev);
    } catch (err) {
      set({ revisions: previous });
      console.error("[sign-offs-store] recordRevision failed", err);
      throw toError(err, "Record decision");
    }
  },

  addNote: async (note) => {
    const previous = get().notes;
    set({ notes: [...previous, note] });
    try {
      await soClient.insertSignOffNote(note);
    } catch (err) {
      set({ notes: previous });
      console.error("[sign-offs-store] addNote failed", err);
      throw toError(err, "Save note");
    }
  },
}));

// ─── Derived selectors ───────────────────────────────────────────────────────

/** All sign-offs sorted by updatedAt desc. */
export function useSignOffs(): SignOff[] {
  const signOffs = useSignOffsStore((s) => s.signOffs);
  return useMemo(
    () => [...signOffs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [signOffs],
  );
}

export function useSignOff(id: string | null | undefined): SignOff | undefined {
  return useSignOffsStore((s) => {
    if (!id) return undefined;
    return s.signOffs.find((x) => x.id === id);
  });
}

/** Revisions for one sign-off, oldest-first. */
export function useSignOffRevisions(signOffId: string | null | undefined): SignOffRevision[] {
  const revisions = useSignOffsStore((s) => s.revisions);
  return useMemo(() => {
    if (!signOffId) return [];
    return revisions
      .filter((r) => r.signOffId === signOffId)
      .sort((a, b) => a.decidedAt.localeCompare(b.decidedAt));
  }, [revisions, signOffId]);
}

/** Notes for one sign-off, oldest-first. */
export function useSignOffNotes(signOffId: string | null | undefined): SignOffNote[] {
  const notes = useSignOffsStore((s) => s.notes);
  return useMemo(() => {
    if (!signOffId) return [];
    return notes
      .filter((n) => n.signOffId === signOffId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [notes, signOffId]);
}
