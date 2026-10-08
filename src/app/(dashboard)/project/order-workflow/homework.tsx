"use client";

/**
 * Order Workflow — per-person homework tabs (Brian, Mark, Sam, Patty).
 * One question at a time with a context panel beside it; answers save to
 * order_workflow_answers on the tracker Supabase project and reload on focus.
 * Questions + context live in ./data.ts (HOMEWORK, PEOPLE).
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  fetchAnswers,
  subscribeAnswers,
  upsertAnswer,
  type AnswerValue,
  type StoredAnswer,
  type WorkflowAnswer,
} from "@/lib/supabase/order-workflow-answers-client";
import { HOMEWORK, PEOPLE, type ContextBlock, type HomeworkQuestion, type Person } from "./data";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function hasValue(v: AnswerValue | null | undefined): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "number") return Number.isFinite(v);
  if (Array.isArray(v)) return v.length > 0;
  return v.trim().length > 0;
}

function isAnswered(a?: WorkflowAnswer): boolean {
  if (!a) return false;
  return hasValue(a.answer.value) || !!a.answer.notes?.trim();
}

function labelFor(q: HomeworkQuestion, id: string): string {
  return q.options?.find((o) => o.id === id)?.label ?? id;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });
}

function formatValue(q: HomeworkQuestion, v: AnswerValue): string[] {
  if (!hasValue(v)) return [];
  switch (q.type) {
    case "single":
      return [labelFor(q, String(v))];
    case "multi":
      return (v as string[]).map((id) => labelFor(q, id));
    case "rank":
      return (v as string[]).map((id, i) => `${i + 1}. ${labelFor(q, id)}`);
    case "number":
      return [`${v}${q.unit ? ` ${q.unit}` : ""}`];
    case "date":
      return [formatDate(String(v))];
    default:
      return [String(v)];
  }
}

function defaultValue(q: HomeworkQuestion): AnswerValue | null {
  if (q.type === "multi") return [];
  if (q.type === "rank") return (q.options ?? []).map((o) => o.id);
  if (q.type === "text" || q.type === "date") return "";
  return null;
}

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

/* ------------------------------------------------------------------ */
/* Context panel                                                       */
/* ------------------------------------------------------------------ */

function BlockTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold text-gray-900">{children}</p>;
}

function ContextView({ block }: { block: ContextBlock }) {
  switch (block.kind) {
    case "note":
      return (
        <div className="rounded-lg border border-brand-green/40 bg-brand-green/5 p-3">
          {block.title && <BlockTitle>{block.title}</BlockTitle>}
          <p className={`text-sm leading-relaxed text-gray-700 ${block.title ? "mt-1" : ""}`}>{block.text}</p>
        </div>
      );
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <div>
          {block.title && <BlockTitle>{block.title}</BlockTitle>}
          <List className={`mt-1.5 space-y-1 text-sm text-gray-700 ${block.ordered ? "list-decimal pl-5" : ""}`}>
            {block.items.map((it) => (
              <li key={it} className={block.ordered ? "" : "flex gap-2"}>
                {!block.ordered && <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-400" />}
                <span>{it}</span>
              </li>
            ))}
          </List>
        </div>
      );
    }
    case "facts":
      return (
        <div>
          {block.title && <BlockTitle>{block.title}</BlockTitle>}
          <dl className="mt-1.5 divide-y divide-gray-100 rounded-lg border border-gray-200">
            {block.rows.map(([k, v]) => (
              <div key={k} className="grid gap-1 px-3 py-2 sm:grid-cols-[minmax(0,140px)_minmax(0,1fr)] sm:gap-3">
                <dt className="text-xs font-semibold text-gray-500">{k}</dt>
                <dd className="break-words text-sm text-gray-800">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case "table":
      return (
        <div>
          {block.title && <BlockTitle>{block.title}</BlockTitle>}
          <div className="mt-1.5 overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                <tr>
                  {block.headers.map((h, i) => (
                    <th key={`${h}-${i}`} className="whitespace-nowrap px-2.5 py-1.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {block.rows.map((r, ri) => (
                  <tr key={ri}>
                    {r.map((c, ci) => (
                      <td key={ci} className="px-2.5 py-1.5 text-gray-800">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case "cards":
      return (
        <div>
          {block.title && <BlockTitle>{block.title}</BlockTitle>}
          <div className="mt-1.5 space-y-2">
            {block.cards.map((c) => (
              <div key={c.title} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">{c.title}</p>
                  {c.tag && (
                    <span className="shrink-0 rounded-full bg-brand-navy/10 px-2 py-0.5 text-[10px] font-bold text-brand-navy">{c.tag}</span>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-gray-600">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case "pre":
      return (
        <div>
          {block.title && <BlockTitle>{block.title}</BlockTitle>}
          <pre className="mt-1.5 overflow-x-auto whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-[11px] leading-relaxed text-gray-800">
            {block.text}
          </pre>
        </div>
      );
  }
}

function ContextPanel({ blocks }: { blocks?: ContextBlock[] }) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">What you need</p>
        <p className="mt-2 text-sm text-gray-500">Nothing to look up. Answer from what you know today.</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">What you need</p>
      <div className="mt-3 space-y-4">
        {blocks.map((b, i) => (
          <ContextView key={i} block={b} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Answer controls                                                     */
/* ------------------------------------------------------------------ */

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 shadow-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30";

function ChoiceCard({
  type,
  name,
  checked,
  label,
  hint,
  onChange,
}: {
  type: "radio" | "checkbox";
  name: string;
  checked: boolean;
  label: string;
  hint?: string;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 px-4 py-3 transition-colors ${
        checked ? "border-brand-green bg-brand-green/10" : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <input type={type} name={name} checked={checked} onChange={onChange} className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-brand-green)]" />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-gray-900">{label}</span>
        {hint && (
          <span className="mt-1 inline-block rounded-full bg-brand-green px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            {hint}
          </span>
        )}
      </span>
    </label>
  );
}

function AnswerControl({
  q,
  value,
  setValue,
}: {
  q: HomeworkQuestion;
  value: AnswerValue | null;
  setValue: (v: AnswerValue | null) => void;
}) {
  switch (q.type) {
    case "text":
      return (
        <textarea
          rows={q.rows ?? 3}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your answer"
          className={inputCls}
        />
      );
    case "single":
      return (
        <div className="space-y-2" role="radiogroup">
          {(q.options ?? []).map((o) => (
            <ChoiceCard key={o.id} type="radio" name={q.id} checked={value === o.id} label={o.label} hint={o.hint} onChange={() => setValue(o.id)} />
          ))}
        </div>
      );
    case "multi": {
      const arr = Array.isArray(value) ? value : [];
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          {(q.options ?? []).map((o) => (
            <ChoiceCard
              key={o.id}
              type="checkbox"
              name={q.id}
              checked={arr.includes(o.id)}
              label={o.label}
              hint={o.hint}
              onChange={() => setValue(arr.includes(o.id) ? arr.filter((x) => x !== o.id) : [...arr, o.id])}
            />
          ))}
        </div>
      );
    }
    case "rank": {
      const arr = Array.isArray(value) ? value : [];
      const move = (i: number, d: -1 | 1) => {
        const j = i + d;
        if (j < 0 || j >= arr.length) return;
        const next = [...arr];
        [next[i], next[j]] = [next[j], next[i]];
        setValue(next);
      };
      return (
        <ol className="space-y-2">
          {arr.map((id, i) => (
            <li key={id} className="flex items-center gap-3 rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">{i + 1}</span>
              <span className="min-w-0 flex-1 text-sm font-medium text-gray-900">{labelFor(q, id)}</span>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Move ${labelFor(q, id)} up`}
                  className="h-8 w-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === arr.length - 1}
                  aria-label={`Move ${labelFor(q, id)} down`}
                  className="h-8 w-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                >
                  ▼
                </button>
              </div>
            </li>
          ))}
        </ol>
      );
    }
    case "date":
      return (
        <input
          type="date"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => setValue(e.target.value)}
          className={`${inputCls} max-w-xs`}
        />
      );
    case "number":
      return (
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={typeof value === "number" ? value : ""}
            onChange={(e) => setValue(e.target.value === "" ? null : Number(e.target.value))}
            className={`${inputCls} max-w-[10rem]`}
          />
          {q.unit && <span className="text-sm font-semibold text-gray-600">{q.unit}</span>}
        </div>
      );
  }
}

/* ------------------------------------------------------------------ */
/* Question card (remounted per question via key, so draft state is    */
/* initialised from props without effects)                             */
/* ------------------------------------------------------------------ */

function QuestionCard({
  q,
  n,
  total,
  initial,
  saving,
  saveError,
  onBack,
  onSkip,
  onSave,
}: {
  q: HomeworkQuestion;
  n: number;
  total: number;
  initial?: WorkflowAnswer;
  saving: boolean;
  saveError: string | null;
  onBack: (() => void) | null;
  onSkip: () => void;
  onSave: (a: StoredAnswer) => void;
}) {
  const [value, setValue] = useState<AnswerValue | null>(() => initial?.answer.value ?? defaultValue(q));
  const [notes, setNotes] = useState(() => initial?.answer.notes ?? "");
  const canSave = hasValue(value) || notes.trim().length > 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-green">
          Question {n} of {total}
        </p>
        <h3 className="mt-2 text-xl font-bold leading-snug text-gray-900 md:text-2xl">{q.prompt}</h3>
        {q.why && <p className="mt-2 text-sm text-gray-500">{q.why}</p>}

        <div className="mt-6">
          <AnswerControl q={q} value={value} setValue={setValue} />
        </div>

        <div className="mt-5">
          <label htmlFor={`${q.id}-notes`} className="text-xs font-semibold text-gray-500">
            Notes (optional)
          </label>
          <textarea
            id={`${q.id}-notes`}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything we should know"
            className={`${inputCls} mt-1 text-sm`}
          />
        </div>

        {saveError && <p className="mt-3 text-sm font-medium text-rose-700">Could not save: {saveError}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onBack ?? undefined}
            disabled={!onBack}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Back
          </button>
          <button type="button" onClick={onSkip} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-800">
            Skip for now
          </button>
          <button
            type="button"
            onClick={() => onSave({ value: value ?? "", ...(notes.trim() ? { notes: notes.trim() } : {}) })}
            disabled={!canSave || saving}
            className="ml-auto rounded-lg bg-brand-green px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:brightness-95 disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save & next"}
          </button>
        </div>
      </div>

      <ContextPanel blocks={q.context} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Homework tab                                                        */
/* ------------------------------------------------------------------ */

function HomeworkTab({ person }: { person: Person }) {
  const questions = HOMEWORK[person];
  const meta = PEOPLE[person];
  const { user, profile } = useAuth();

  const [answers, setAnswers] = useState<Record<string, WorkflowAnswer>>({});
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchAnswers(person)
      .then((a) => {
        if (!alive) return;
        setAnswers(a);
        const first = questions.findIndex((q) => !isAnswered(a[q.id]));
        setIdx(first === -1 ? questions.length : first);
        setLoaded(true);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setLoadError(e instanceof Error ? e.message : "Could not load answers");
        setLoaded(true);
      });
    const unsub = subscribeAnswers(person, (a) => {
      if (alive) setAnswers(a);
    });
    return () => {
      alive = false;
      unsub();
    };
  }, [person, questions]);

  const answeredCount = questions.filter((q) => isAnswered(answers[q.id])).length;
  const pct = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
  const done = idx >= questions.length;
  const current = done ? null : questions[idx];

  const go = (i: number) => {
    setSaveError(null);
    setIdx(Math.max(0, Math.min(questions.length, i)));
  };

  const save = async (q: HomeworkQuestion, a: StoredAnswer) => {
    setSaving(true);
    setSaveError(null);
    try {
      const row = await upsertAnswer({
        person,
        questionId: q.id,
        answer: a,
        answeredBy: user?.email ?? profile?.email ?? null,
        answeredByName: profile?.full_name ?? user?.email ?? null,
      });
      setAnswers((prev) => ({ ...prev, [q.id]: row }));
      setSavedAt(timeOf(row.updatedAt));
      go(idx + 1);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "unknown error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header band */}
      <div className="overflow-hidden rounded-2xl bg-brand-navy text-white">
        <div className="p-5 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                {meta.name} · {meta.role}
              </p>
              <h2 className="mt-1.5 text-2xl font-bold md:text-3xl">
                Homework for {meta.first} · {questions.length} questions
              </h2>
            </div>
            <p className="text-sm text-white/70" aria-live="polite">
              {savedAt ? (
                <>
                  <span className="text-brand-green">Saved ✓</span> {savedAt}
                </>
              ) : loaded ? (
                "Answers save as you go"
              ) : (
                "Loading answers…"
              )}
            </p>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-brand-green transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums">
              {answeredCount} of {questions.length} answered
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2" aria-label="Questions">
            {questions.map((q, i) => {
              const answered = isAnswered(answers[q.id]);
              const isCurrent = i === idx;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Question ${i + 1}${answered ? " (answered)" : ""}`}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                    answered ? "bg-brand-green text-white" : "bg-white/15 text-white/70 hover:bg-white/25"
                  } ${isCurrent ? "ring-2 ring-white ring-offset-2 ring-offset-brand-navy" : ""}`}
                >
                  {i + 1}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => go(questions.length)}
              aria-label="Review all answers"
              aria-current={done ? "step" : undefined}
              className={`flex h-8 items-center justify-center rounded-full px-3 text-xs font-bold transition ${
                done ? "bg-white text-brand-navy" : "bg-white/15 text-white/70 hover:bg-white/25"
              }`}
            >
              Review
            </button>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          Could not load saved answers ({loadError}). You can still answer; saving will retry.
        </div>
      )}

      {!loaded ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">Loading…</div>
      ) : current ? (
        <QuestionCard
          key={current.id}
          q={current}
          n={idx + 1}
          total={questions.length}
          initial={answers[current.id]}
          saving={saving}
          saveError={saveError}
          onBack={idx > 0 ? () => go(idx - 1) : null}
          onSkip={() => go(idx + 1)}
          onSave={(a) => save(current, a)}
        />
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-green">
            {answeredCount === questions.length ? "All done" : "Review"}
          </p>
          <h3 className="mt-2 text-xl font-bold text-gray-900 md:text-2xl">
            {answeredCount === questions.length
              ? `Thank you, ${meta.first}. Every question is answered.`
              : `${answeredCount} of ${questions.length} answered so far.`}
          </h3>
          <p className="mt-1 text-sm text-gray-500">Danny sees these answers live.</p>
          <ol className="mt-6 divide-y divide-gray-100">
            {questions.map((q, i) => {
              const a = answers[q.id];
              const lines = a ? formatValue(q, a.answer.value) : [];
              return (
                <li key={q.id} className="flex gap-4 py-4">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isAnswered(a) ? "bg-brand-green text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">{q.prompt}</p>
                    {isAnswered(a) ? (
                      <div className="mt-1.5 space-y-0.5 text-sm text-gray-700">
                        {lines.map((l) => (
                          <p key={l} className="whitespace-pre-line break-words">
                            {l}
                          </p>
                        ))}
                        {a?.answer.notes && <p className="text-gray-500">Notes: {a.answer.notes}</p>}
                        {a?.answeredByName && (
                          <p className="text-[11px] text-gray-400">
                            {a.answeredByName} · {timeOf(a.updatedAt)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-1 text-sm italic text-gray-400">Not answered yet</p>
                    )}
                  </div>
                  <button type="button" onClick={() => go(i)} className="shrink-0 self-start text-sm font-semibold text-brand-navy hover:underline">
                    {isAnswered(a) ? "Edit" : "Answer"}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <p className="text-center text-xs text-gray-400">Answers save to the project tracker. Danny and the ClearPH team can see them.</p>
    </div>
  );
}

export function BrianHomework() {
  return <HomeworkTab person="brian" />;
}
export function MarkHomework() {
  return <HomeworkTab person="mark" />;
}
export function SamHomework() {
  return <HomeworkTab person="sam" />;
}
export function PattyHomework() {
  return <HomeworkTab person="patty" />;
}
