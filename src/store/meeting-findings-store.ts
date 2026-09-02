import { useEffect, useMemo } from "react";
import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import {
  fetchMeetingFindings,
  insertFindingNote,
  rowToCheck,
  rowToNote,
  upsertFindingCheck,
  type FindingCheck,
  type FindingCheckRow,
  type FindingNote,
  type FindingNoteRow,
} from "@/lib/supabase/meeting-findings-client";

// Working state for meeting-findings pages (checks + notes, migration 028).
// Keyed per meeting so several meetings can hydrate side by side. Optimistic
// local writes with write-through; realtime merges under a last-write guard.

interface MeetingState {
  checks: Record<string, FindingCheck>;
  notes: FindingNote[];
  isInitialized: boolean;
  loadError: string | null;
}

interface MeetingFindingsStore {
  meetings: Record<string, MeetingState>;
  hydrate: (meetingKey: string, checks: FindingCheck[], notes: FindingNote[]) => void;
  setLoadError: (meetingKey: string, message: string) => void;
  mergeCheck: (meetingKey: string, check: FindingCheck) => void;
  mergeNote: (meetingKey: string, note: FindingNote) => void;
  removeNote: (meetingKey: string, id: string) => void;
  setDone: (
    meetingKey: string,
    findingKey: string,
    isDone: boolean,
    doneBy: string,
  ) => Promise<void>;
  addNote: (meetingKey: string, note: Omit<FindingNote, "createdAt">) => Promise<void>;
}

const EMPTY: MeetingState = { checks: {}, notes: [], isInitialized: false, loadError: null };

function toError(err: unknown, label: string): Error {
  if (err instanceof Error) return err;
  if (typeof err === "object" && err !== null) {
    const o = err as { message?: string; details?: string; code?: string };
    const msg = o.message ?? o.details ?? (o.code ? `Postgres error ${o.code}` : null);
    if (msg) return new Error(msg);
  }
  return new Error(`${label} failed: ${String(err)}`);
}

export const useMeetingFindingsStore = create<MeetingFindingsStore>()((set, get) => {
  const patch = (meetingKey: string, fn: (m: MeetingState) => Partial<MeetingState>) => {
    const cur = get().meetings[meetingKey] ?? EMPTY;
    set({ meetings: { ...get().meetings, [meetingKey]: { ...cur, ...fn(cur) } } });
  };

  return {
    meetings: {},

    hydrate: (meetingKey, checks, notes) =>
      patch(meetingKey, () => ({
        checks: Object.fromEntries(checks.map((c) => [c.findingKey, c])),
        notes,
        isInitialized: true,
        loadError: null,
      })),

    setLoadError: (meetingKey, message) => patch(meetingKey, () => ({ loadError: message })),

    mergeCheck: (meetingKey, check) =>
      patch(meetingKey, (m) => {
        const existing = m.checks[check.findingKey];
        if (existing && Date.parse(existing.updatedAt) > Date.parse(check.updatedAt)) return {};
        return { checks: { ...m.checks, [check.findingKey]: check } };
      }),

    mergeNote: (meetingKey, note) =>
      patch(meetingKey, (m) =>
        m.notes.some((n) => n.id === note.id)
          ? { notes: m.notes.map((n) => (n.id === note.id ? note : n)) }
          : { notes: [...m.notes, note] },
      ),

    removeNote: (meetingKey, id) =>
      patch(meetingKey, (m) => ({ notes: m.notes.filter((n) => n.id !== id) })),

    setDone: async (meetingKey, findingKey, isDone, doneBy) => {
      const previous = get().meetings[meetingKey]?.checks[findingKey];
      const now = new Date().toISOString();
      const optimistic: FindingCheck = {
        findingKey,
        isDone,
        doneBy: isDone ? doneBy : null,
        doneAt: isDone ? now : null,
        updatedAt: now,
      };
      patch(meetingKey, (m) => ({ checks: { ...m.checks, [findingKey]: optimistic } }));
      try {
        await upsertFindingCheck(optimistic);
      } catch (err) {
        patch(meetingKey, (m) => {
          const next = { ...m.checks };
          if (previous) next[findingKey] = previous;
          else delete next[findingKey];
          return { checks: next };
        });
        throw toError(err, "Check off");
      }
    },

    addNote: async (meetingKey, note) => {
      const optimistic: FindingNote = { ...note, createdAt: new Date().toISOString() };
      patch(meetingKey, (m) => ({ notes: [...m.notes, optimistic] }));
      try {
        await insertFindingNote(note);
      } catch (err) {
        get().removeNote(meetingKey, note.id);
        throw toError(err, "Add note");
      }
    },
  };
});

// ─── Hooks ───────────────────────────────────────────────────────────────────

/** Loads one meeting's checks + notes once, then keeps them live via realtime. */
export function useMeetingFindings(meetingKey: string): MeetingState {
  const state = useMeetingFindingsStore((s) => s.meetings[meetingKey]);

  useEffect(() => {
    const store = useMeetingFindingsStore.getState();
    if (store.meetings[meetingKey]?.isInitialized) return;
    let cancelled = false;
    fetchMeetingFindings(meetingKey)
      .then(({ checks, notes }) => {
        if (!cancelled) useMeetingFindingsStore.getState().hydrate(meetingKey, checks, notes);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[meeting-findings] fetch failed", err);
        useMeetingFindingsStore.getState().setLoadError(meetingKey, toError(err, "Load").message);
      });
    return () => {
      cancelled = true;
    };
  }, [meetingKey]);

  const isInitialized = state?.isInitialized ?? false;
  useEffect(() => {
    if (!isInitialized) return;
    const supabase = createClient();
    const prefix = `${meetingKey}:`;
    const channel = supabase
      .channel(`meeting-findings-${meetingKey}`)
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "meeting_finding_checks" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const row = (payload.new ?? null) as FindingCheckRow | null;
          if (!row || !row.finding_key.startsWith(prefix)) return;
          useMeetingFindingsStore.getState().mergeCheck(meetingKey, rowToCheck(row));
        },
      )
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "meeting_finding_notes" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const s = useMeetingFindingsStore.getState();
          if (payload.eventType === "DELETE") {
            const old = payload.old as { id?: string } | null;
            if (old?.id) s.removeNote(meetingKey, old.id);
            return;
          }
          const row = (payload.new ?? null) as FindingNoteRow | null;
          if (!row || !row.finding_key.startsWith(prefix)) return;
          s.mergeNote(meetingKey, rowToNote(row));
        },
      );
    channel.subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [meetingKey, isInitialized]);

  return state ?? EMPTY;
}

/** Notes for one finding, in creation order (stable ref via useMemo). */
export function useFindingNotes(meetingKey: string, findingKey: string): FindingNote[] {
  const notes = useMeetingFindingsStore((s) => s.meetings[meetingKey]?.notes);
  return useMemo(() => (notes ?? []).filter((n) => n.findingKey === findingKey), [notes, findingKey]);
}
