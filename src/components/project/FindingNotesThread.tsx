"use client";

/**
 * Notes thread for one meeting-findings item (migration 028). Shared by
 * /project/rep-demo and /project/staging-review; state comes from
 * meeting-findings-store and syncs live for everyone on the page.
 */

import { useState } from "react";
import { nanoid } from "nanoid";
import { Send } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useFindingNotes, useMeetingFindingsStore } from "@/store/meeting-findings-store";

export function formatStamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function FindingNotesThread({
  meetingKey,
  findingKeyValue,
  authorName,
}: {
  meetingKey: string;
  findingKeyValue: string;
  authorName: string;
}) {
  const notes = useFindingNotes(meetingKey, findingKeyValue);
  const addNote = useMeetingFindingsStore((s) => s.addNote);
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError(null);
    try {
      await addNote(meetingKey, {
        id: nanoid(10),
        findingKey: findingKeyValue,
        authorProfileId: user?.id ?? null,
        authorName,
        body: trimmed,
      });
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
        Notes ({notes.length})
      </p>
      {notes.length === 0 ? (
        <p className="mt-2 text-xs text-gray-500">No notes yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-medium text-gray-900">{n.authorName}</span>
                <span className="shrink-0 text-[11px] text-gray-400">{formatStamp(n.createdAt)}</span>
              </div>
              <p className="mt-0.5 whitespace-pre-wrap leading-relaxed text-gray-700">{n.body}</p>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit} className="mt-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          rows={2}
          placeholder="Add a note… (⌘↵ to save)"
          className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
        />
        {error && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-3 w-3" aria-hidden />
            {submitting ? "Saving…" : "Add note"}
          </button>
        </div>
      </form>
    </div>
  );
}
