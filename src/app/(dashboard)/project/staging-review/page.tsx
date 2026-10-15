"use client";

/**
 * /project/staging-review — Sam's checklist for the staging.tablex.com test
 * week: every SpeX Studio catalog change from Brian's action tracker, Mark's
 * 10/12 items, and the Sales Orders walkthrough.
 *
 * Content is static in src/data/spex-review-items.ts. Reviewed state and
 * notes live in Supabase (migration 028, same tables as /project/rep-demo)
 * keyed `${SPEX_REVIEW_MEETING_KEY}:${item.id}` and sync live for everyone.
 * One group renders at a time; the rail (chip bar at narrow widths) switches.
 */

import { useRef, useState } from "react";
import { ArrowRight, Check, ExternalLink, MessageSquare } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { FindingNotesThread, formatStamp } from "@/components/project/FindingNotesThread";
import {
  SPEX_REVIEW_MEETING_KEY,
  STAGING_ORIGIN,
  STAGING_REVIEW_GROUPS,
  STAGING_REVIEW_ITEM_COUNT,
  spexReviewKey,
  type SpexReviewGroup,
  type SpexReviewItem,
  type SpexReviewStatus,
} from "@/data/spex-review-items";
import type { FindingCheck } from "@/lib/supabase/meeting-findings-client";
import {
  useFindingNotes,
  useMeetingFindings,
  useMeetingFindingsStore,
} from "@/store/meeting-findings-store";

const STATUS_META: Record<SpexReviewStatus, { label: string; className: string }> = {
  done: { label: "Built", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  "done-unpriced": {
    label: "Built, unpriced until Mark adds a book row",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  conflict: {
    label: "Built at the book figure, tracker price differed",
    className: "bg-orange-50 text-orange-800 border-orange-200",
  },
  "done-already": { label: "Already offered", className: "bg-sky-50 text-sky-800 border-sky-200" },
  "needs-mark": { label: "Needs Mark", className: "bg-rose-50 text-rose-800 border-rose-200" },
  "out-of-scope": { label: "Out of scope", className: "bg-gray-100 text-gray-700 border-gray-200" },
  review: { label: "Please review", className: "bg-indigo-50 text-indigo-800 border-indigo-200" },
};

type Filter = "all" | "open" | "needs-mark" | "conflict";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Not reviewed" },
  { id: "needs-mark", label: "Needs Mark" },
  { id: "conflict", label: "Price differs" },
];

function matches(item: SpexReviewItem, filter: Filter, checks: Record<string, FindingCheck>) {
  switch (filter) {
    case "all":
      return true;
    case "open":
      return !checks[spexReviewKey(item.id)]?.isDone;
    case "needs-mark":
      return item.status === "needs-mark";
    case "conflict":
      return item.status === "conflict";
  }
}

function reviewedIn(group: SpexReviewGroup, checks: Record<string, FindingCheck>): number {
  return group.items.filter((it) => checks[spexReviewKey(it.id)]?.isDone).length;
}

export default function StagingReviewPage() {
  const { checks, isInitialized, loadError } = useMeetingFindings(SPEX_REVIEW_MEETING_KEY);
  const [selectedId, setSelectedId] = useState(STAGING_REVIEW_GROUPS[0].id);
  const [filter, setFilter] = useState<Filter>("all");
  const topRef = useRef<HTMLDivElement>(null);

  const groupIndex = Math.max(
    0,
    STAGING_REVIEW_GROUPS.findIndex((g) => g.id === selectedId),
  );
  const group = STAGING_REVIEW_GROUPS[groupIndex];
  const nextGroup = STAGING_REVIEW_GROUPS[groupIndex + 1];
  const visibleItems = group.items.filter((it) => matches(it, filter, checks));

  const reviewedTotal = STAGING_REVIEW_GROUPS.reduce((n, g) => n + reviewedIn(g, checks), 0);
  const pct = Math.round((reviewedTotal / STAGING_REVIEW_ITEM_COUNT) * 100);

  function select(id: string) {
    setSelectedId(id);
    const top = topRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) topRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900">Staging Review</h1>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            This mirrors the test-site review for SpeX Studio (test week Oct 19 to 25) and Sales
            Orders. Open each item on{" "}
            <a
              href={STAGING_ORIGIN}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-gray-900 underline underline-offset-2"
            >
              staging.tablex.com <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
            , check it, and tick Reviewed. Notes save for everyone.
          </p>
        </div>
        <div className="w-full max-w-xs">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold text-gray-900">
              {reviewedTotal} of {STAGING_REVIEW_ITEM_COUNT} reviewed
            </span>
            <span className="tabular-nums text-gray-500">{pct}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full bg-emerald-500 transition-[width]" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p className="font-semibold">Couldn&apos;t load the review state.</p>
          <p className="mt-1 text-red-600">{loadError}</p>
        </div>
      ) : !isInitialized ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-brand-green" />
        </div>
      ) : (
        <div ref={topRef} className="scroll-mt-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
          {/* Group rail (chip bar below lg) */}
          <nav aria-label="Review groups" className="lg:sticky lg:top-6 lg:self-start">
            <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-3 lg:mx-0 lg:block lg:space-y-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
              {STAGING_REVIEW_GROUPS.map((g) => {
                const done = reviewedIn(g, checks);
                const active = g.id === group.id;
                const complete = done === g.items.length;
                const hits =
                  filter === "all" ? null : g.items.filter((it) => matches(it, filter, checks)).length;
                return (
                  <li key={g.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => select(g.id)}
                      aria-current={active ? "true" : undefined}
                      className={`flex w-full items-center justify-between gap-3 whitespace-nowrap rounded-full border px-3 py-1.5 text-left text-sm transition-colors lg:rounded-lg lg:border-transparent lg:px-3 lg:py-2 ${
                        active
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100 lg:bg-transparent"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-medium">
                        {complete && (
                          <Check
                            className={`h-3.5 w-3.5 ${active ? "text-emerald-300" : "text-emerald-600"}`}
                            strokeWidth={3}
                            aria-label="All reviewed"
                          />
                        )}
                        {g.title}
                      </span>
                      <span
                        className={`text-xs tabular-nums ${active ? "text-gray-300" : "text-gray-500"}`}
                      >
                        {hits !== null ? (
                          <span className={hits > 0 ? "font-semibold" : ""}>{hits} match</span>
                        ) : (
                          <>
                            {done} of {g.items.length}
                          </>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* One group at a time */}
          <section aria-labelledby="group-heading" className="mt-4 max-w-3xl lg:mt-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 id="group-heading" className="text-xl font-bold text-gray-900">
                  {group.title}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {reviewedIn(group, checks)} of {group.items.length} reviewed
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {group.links.map((link, i) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={
                      i === 0
                        ? "inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                        : "inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    }
                  >
                    {i === 0 ? "Open on staging" : link.label}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                ))}
              </div>
            </div>

            <div role="group" aria-label="Filter items" className="mt-5 flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    filter === f.id
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {visibleItems.length === 0 ? (
              <p className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
                Nothing in {group.title} matches this filter.
              </p>
            ) : (
              <ul className="mt-5 space-y-4">
                {visibleItems.map((item) => (
                  <ReviewCard key={item.id} item={item} groupHref={group.links[0]?.href} />
                ))}
              </ul>
            )}

            {nextGroup && (
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => select(nextGroup.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Next: {nextGroup.title}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function ReviewCard({ item, groupHref }: { item: SpexReviewItem; groupHref?: string }) {
  const key = spexReviewKey(item.id);
  const check = useMeetingFindingsStore((s) => s.meetings[SPEX_REVIEW_MEETING_KEY]?.checks[key]);
  const setDone = useMeetingFindingsStore((s) => s.setDone);
  const notes = useFindingNotes(SPEX_REVIEW_MEETING_KEY, key);
  const { profile } = useAuth();
  const [notesOpen, setNotesOpen] = useState(() => notes.length > 0);
  const [error, setError] = useState<string | null>(null);

  const isDone = check?.isDone ?? false;
  const authorName = profile?.full_name?.trim() || profile?.email || "Anonymous";
  const status = STATUS_META[item.status];
  // Series items all point at the group page; only show a per-card link when it differs.
  const cardLink = item.deepLink && item.deepLink !== groupHref ? item.deepLink : null;

  async function toggle() {
    setError(null);
    try {
      await setDone(SPEX_REVIEW_MEETING_KEY, key, !isDone, authorName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t save");
    }
  }

  return (
    <li
      className={`rounded-xl border bg-white p-5 transition-colors ${
        isDone ? "border-emerald-200 bg-emerald-50/40" : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs font-semibold text-gray-700">
            {item.id}
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        </div>
        <button
          type="button"
          role="checkbox"
          aria-checked={isDone}
          aria-label={`Reviewed ${item.id}`}
          onClick={toggle}
          className="group inline-flex shrink-0 items-center gap-2 rounded-lg px-1 py-0.5 text-sm font-semibold text-gray-700"
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-md border-2 transition-colors ${
              isDone
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-gray-300 bg-white text-transparent group-hover:border-gray-500"
            }`}
          >
            <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
          </span>
          Reviewed
        </button>
      </div>

      <p className="mt-3 text-base font-semibold leading-relaxed text-gray-900">{item.request}</p>
      <p className="mt-2 text-sm leading-relaxed text-gray-700">{item.outcome}</p>
      {item.priceSource && (
        <p className="mt-1.5 text-xs leading-relaxed text-gray-500">Price source: {item.priceSource}</p>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        {cardLink && (
          <a
            href={cardLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-gray-900 underline underline-offset-2 hover:opacity-80"
          >
            Open on staging <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        )}
        <button
          type="button"
          onClick={() => setNotesOpen((v) => !v)}
          aria-expanded={notesOpen}
          aria-controls={`notes-${item.id}`}
          className="inline-flex items-center gap-1.5 font-medium text-gray-600 hover:text-gray-900"
        >
          <MessageSquare className="h-3.5 w-3.5" aria-hidden />
          {notesOpen ? "Hide notes" : notes.length > 0 ? `Notes (${notes.length})` : "Add a note"}
        </button>
        {isDone && check?.doneBy && (
          <span className="text-xs text-gray-500">
            Reviewed by {check.doneBy}
            {check.doneAt ? ` · ${formatStamp(check.doneAt)}` : ""}
          </span>
        )}
      </div>

      {notesOpen && (
        <div id={`notes-${item.id}`} className="mt-4">
          <FindingNotesThread
            meetingKey={SPEX_REVIEW_MEETING_KEY}
            findingKeyValue={key}
            authorName={authorName}
          />
        </div>
      )}
    </li>
  );
}
