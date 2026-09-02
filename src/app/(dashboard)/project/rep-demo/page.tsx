"use client";

/**
 * /project/rep-demo — working list from the 2026-09-02 sales-rep demo.
 *
 * Content (the findings) is static in src/data/rep-demo-findings.ts. Each
 * item collapses under its title; the team checks items off and threads
 * notes under them — that state lives in Supabase (migration 028) and syncs
 * live for everyone on the page.
 */

import { useState } from "react";
import { nanoid } from "nanoid";
import { Check, ChevronDown, ExternalLink, FileDiff, MessageSquare, Send } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  findingKey,
  firefliesLink,
  REP_DEMO_FINDINGS,
  REP_DEMO_ITEM_COUNT,
  REP_DEMO_MEETING_KEY,
  type FindingItem,
  type FindingTag,
} from "@/data/rep-demo-findings";
import { useFindingNotes, useMeetingFindingsStore, useMeetingFindings } from "@/store/meeting-findings-store";

const TAG_CLASS: Record<FindingTag, string> = {
  fix: "bg-orange-50 text-orange-800 border-orange-200",
  req: "bg-slate-100 text-slate-700 border-slate-200",
  shipped: "bg-emerald-50 text-emerald-700 border-emerald-200",
  decision: "bg-amber-50 text-amber-800 border-amber-200",
  phase2: "bg-violet-50 text-violet-700 border-violet-200",
};

function formatStamp(iso: string): string {
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

export default function RepDemoFindingsPage() {
  const { checks, isInitialized, loadError } = useMeetingFindings(REP_DEMO_MEETING_KEY);
  const doneCount = REP_DEMO_FINDINGS.reduce(
    (n, g) => n + g.items.filter((it) => checks[findingKey(it.id)]?.isDone).length,
    0,
  );
  const pct = Math.round((doneCount / REP_DEMO_ITEM_COUNT) * 100);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900">Rep Demo Findings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Fixes, ruled requirements, post-launch items, and open decisions from the September 2
            web and configurator demo with Adam, Joe, Chris, and Mike. Click a title to open it;
            check it off when it ships; notes save for everyone.{" "}
            <span className="inline-flex items-center gap-1 whitespace-nowrap text-gray-400">
              <FileDiff className="h-3 w-3" aria-hidden />
              <span className="text-xs">= likely a change order</span>
            </span>{" "}
            <a
              href={firefliesLink()}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1 font-medium text-gray-700 underline underline-offset-2 hover:text-gray-900"
            >
              Recording <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          </p>
        </div>
        <div className="min-w-[220px]">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold text-gray-900">
              {doneCount} of {REP_DEMO_ITEM_COUNT} done
            </span>
            <span className="tabular-nums text-gray-500">{pct}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full bg-emerald-500 transition-[width]" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p className="font-semibold">Couldn&apos;t load the check-off state.</p>
          <p className="mt-1 text-red-600">{loadError}</p>
          <p className="mt-2 text-xs text-red-500">
            If this is a fresh setup, migration <code>028_meeting_findings</code> may not be applied
            yet.
          </p>
        </div>
      ) : !isInitialized ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-brand-green" />
        </div>
      ) : (
        REP_DEMO_FINDINGS.map((group) => {
          const groupDone = group.items.filter((it) => checks[findingKey(it.id)]?.isDone).length;
          return (
            <section key={group.id} aria-labelledby={`group-${group.id}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h2 id={`group-${group.id}`} className="text-lg font-bold text-gray-900">
                  {group.title}
                </h2>
                <span className="text-xs font-medium tabular-nums text-gray-500">
                  {groupDone} / {group.items.length}
                </span>
              </div>
              <p className="mt-1 max-w-3xl text-sm text-gray-500">{group.intro}</p>
              <ul className="mt-4 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
                {group.items.map((item) => (
                  <FindingRow key={item.id} item={item} />
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}

function FindingRow({ item }: { item: FindingItem }) {
  const key = findingKey(item.id);
  const check = useMeetingFindingsStore((s) => s.meetings[REP_DEMO_MEETING_KEY]?.checks[key]);
  const setDone = useMeetingFindingsStore((s) => s.setDone);
  const notes = useFindingNotes(REP_DEMO_MEETING_KEY, key);
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDone = check?.isDone ?? false;
  const authorName = profile?.full_name?.trim() || profile?.email || "Anonymous";

  async function toggle() {
    setError(null);
    try {
      await setDone(REP_DEMO_MEETING_KEY, key, !isDone, authorName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t save");
    }
  }

  return (
    <li className={isDone ? "bg-gray-50/70" : ""}>
      <div className="flex items-start gap-3 px-4 py-3">
        <button
          type="button"
          role="checkbox"
          aria-checked={isDone}
          aria-label={`${isDone ? "Reopen" : "Mark done"} ${item.id}`}
          onClick={toggle}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
            isDone
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-gray-300 bg-white text-transparent hover:border-gray-500"
          }`}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
        </button>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={`finding-${item.id}`}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <span className="mt-0.5 flex w-14 shrink-0 items-center gap-1.5 font-mono text-[11px] font-semibold text-gray-400">
            {item.id}
            {item.changeOrder && (
              <FileDiff
                className="h-3 w-3 text-amber-500/80"
                aria-label="Likely a change order"
                role="img"
              />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span
              className={`block text-sm font-semibold leading-snug ${
                isDone ? "text-gray-500 line-through decoration-gray-300" : "text-gray-900"
              }`}
            >
              {item.title}
            </span>
            <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag.label}
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${TAG_CLASS[tag.kind]}`}
                >
                  {tag.label}
                </span>
              ))}
              {notes.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500">
                  <MessageSquare className="h-3 w-3" aria-hidden />
                  {notes.length}
                </span>
              )}
              {isDone && check?.doneBy && (
                <span className="text-[11px] text-gray-400">
                  Done by {check.doneBy}
                  {check.doneAt ? ` · ${formatStamp(check.doneAt)}` : ""}
                </span>
              )}
            </span>
          </span>
          <ChevronDown
            className={`mt-1 h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      </div>

      {error && (
        <p role="alert" className="px-4 pb-2 text-xs text-red-600">
          {error}
        </p>
      )}

      {open && (
        <div id={`finding-${item.id}`} className="border-t border-gray-100 bg-gray-50/50 px-4 py-4 pl-[5rem]">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              {item.said && (
                <blockquote className="border-l-2 border-gray-300 pl-3 text-sm italic leading-relaxed text-gray-700">
                  <p>“{item.said}”</p>
                  <footer className="mt-1.5 text-xs not-italic text-gray-500">
                    {item.who}
                    {item.t !== undefined && (
                      <>
                        {" · "}
                        <a
                          href={firefliesLink(item.t)}
                          target="_blank"
                          rel="noopener"
                          className="font-mono underline underline-offset-2 hover:text-gray-900"
                        >
                          {item.at}
                        </a>
                      </>
                    )}
                  </footer>
                </blockquote>
              )}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                  Build
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-800">{item.build}</p>
              </div>
              {item.note && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Watch out
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-800">{item.note}</p>
                </div>
              )}
              {!item.said && item.t !== undefined && (
                <a
                  href={firefliesLink(item.t)}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1 text-xs text-gray-500 underline underline-offset-2 hover:text-gray-900"
                >
                  In the recording at <span className="font-mono">{item.at}</span>
                </a>
              )}
            </div>

            <NotesThread findingKeyValue={key} authorName={authorName} />
          </div>
        </div>
      )}
    </li>
  );
}

function NotesThread({ findingKeyValue, authorName }: { findingKeyValue: string; authorName: string }) {
  const notes = useFindingNotes(REP_DEMO_MEETING_KEY, findingKeyValue);
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
      await addNote(REP_DEMO_MEETING_KEY, {
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
