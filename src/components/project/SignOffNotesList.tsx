"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSignOffsStore, useSignOffNotes } from "@/store/sign-offs-store";
import { useAuth } from "@/components/providers/AuthProvider";
import { makeSignOffNoteId, type SignOffNote } from "@/data/sign-offs";

interface SignOffNotesListProps {
  signOffId: string;
}

function formatStamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function SignOffNotesList({ signOffId }: SignOffNotesListProps) {
  const notes = useSignOffNotes(signOffId);
  const addNote = useSignOffsStore((s) => s.addNote);
  const { user, profile } = useAuth();

  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authorName = profile?.full_name?.trim() || profile?.email || "Anonymous";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);

    try {
      const note: SignOffNote = {
        id: makeSignOffNoteId(nanoid(10)),
        signOffId,
        authorProfileId: user?.id,
        authorName,
        body: trimmed,
        createdAt: new Date().toISOString(),
      };
      await addNote(note);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-500 mb-4">
        Notes ({notes.length})
      </h3>

      {notes.length === 0 ? (
        <p className="text-sm text-slate-500 mb-4">
          No notes yet. Use this for ad-hoc commentary — works at any status,
          including after approval.
        </p>
      ) : (
        <ul className="space-y-3 mb-4">
          {notes.map((n) => (
            <li
              key={n.id}
              className="rounded-md border border-slate-100 bg-slate-50/50 px-3 py-2"
            >
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="text-xs font-medium text-slate-900">
                  {n.authorName}
                </span>
                <span className="text-[11px] text-slate-400">
                  {formatStamp(n.createdAt)}
                </span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {n.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder="Add a note…"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
          disabled={submitting}
        />
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <span className="font-medium">Couldn&rsquo;t save: </span>
            {error}
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-slate-400">
            posting as <b className="text-slate-600">{authorName}</b>
          </span>
          <Button
            type="submit"
            size="sm"
            disabled={submitting || !body.trim()}
            className="gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            {submitting ? "Saving…" : "Post note"}
          </Button>
        </div>
      </form>
    </div>
  );
}
