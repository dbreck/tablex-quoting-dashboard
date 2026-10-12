"use client";

/**
 * Order Workflow — Asked & Answered archive. Read-only view of every
 * homework answer (Brian, Mark, Sam, Patty) from order_workflow_answers,
 * followed by the new questions teed up for the 10/12 walkthrough.
 * Replaces the four per-person homework tabs (homework.tsx keeps the editor).
 */

import { useEffect, useState } from "react";
import { fetchAnswers, type WorkflowAnswer } from "@/lib/supabase/order-workflow-answers-client";
import { HOMEWORK, PEOPLE, TODAY_QUESTIONS, type Person } from "./data";
import { formatValue, isAnswered, timeOf } from "./homework";

const ORDER: Person[] = ["brian", "mark", "sam", "patty"];

function dateOf(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
}

export function AskedAnswered() {
  const [answers, setAnswers] = useState<Record<Person, Record<string, WorkflowAnswer>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      Promise.all(ORDER.map((p) => fetchAnswers(p)))
        .then((rows) => {
          if (!alive) return;
          setAnswers(Object.fromEntries(ORDER.map((p, i) => [p, rows[i]])) as Record<Person, Record<string, WorkflowAnswer>>);
          setError(null);
        })
        .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : String(e)));
    load();
    const refresh = () => {
      if (document.visibilityState === "visible") load();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      alive = false;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  const total = ORDER.reduce((n, p) => n + HOMEWORK[p].length, 0);
  const done = answers ? ORDER.reduce((n, p) => n + HOMEWORK[p].filter((q) => isAnswered(answers[p][q.id])).length, 0) : 0;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-brand-green/30 bg-brand-green/5 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">For today: Monday 10/12, 11:00 AM</h2>
            <p className="mt-1 text-sm text-gray-600">
              Workflow walkthrough with Brian, Mark and Sam. Pure prep for the build; pricing is not on this agenda.
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">{TODAY_QUESTIONS.length} to settle</span>
        </div>
        <ol className="mt-4 space-y-3">
          {TODAY_QUESTIONS.map((t, i) => (
            <li key={t.q} className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">{i + 1}</span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-600">
                    {t.for === "all" ? "Everyone" : PEOPLE[t.for].first}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold text-gray-900">{t.q}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{t.why}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Asked &amp; Answered</h2>
            <p className="mt-1 text-sm text-gray-600">
              The 10/08 homework, keyed by Brian for all four. Rulings drawn from these live on the Answers &amp; Rulings tab.
            </p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            {answers ? `${done}/${total} answered` : "loading…"}
          </span>
        </div>
        {error && <p className="mt-3 text-sm text-red-700">Could not load answers: {error}</p>}

        <div className="mt-4 space-y-6">
          {ORDER.map((p) => (
            <div key={p} className="rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-baseline justify-between border-b border-gray-100 px-5 py-3">
                <h3 className="text-sm font-bold text-gray-900">
                  {PEOPLE[p].name} <span className="font-normal text-gray-500">· {PEOPLE[p].role}</span>
                </h3>
                <span className="text-xs text-gray-500">
                  {answers ? `${HOMEWORK[p].filter((q) => isAnswered(answers[p][q.id])).length}/${HOMEWORK[p].length}` : ""}
                </span>
              </div>
              <ol className="divide-y divide-gray-100">
                {HOMEWORK[p].map((q, i) => {
                  const a = answers?.[p]?.[q.id];
                  const answered = isAnswered(a);
                  const values = a ? formatValue(q, a.answer.value) : [];
                  return (
                    <li key={q.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                      <div className="flex gap-3">
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${answered ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"}`}>{i + 1}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{q.prompt}</p>
                          {q.why && <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{q.why}</p>}
                        </div>
                      </div>
                      <div className="min-w-0 lg:pl-2">
                        {answered && a ? (
                          <>
                            {values.length > 0 && (
                              <ul className="space-y-0.5 text-sm text-gray-900">
                                {values.map((v) => (
                                  <li key={v} className="whitespace-pre-wrap leading-relaxed">{v}</li>
                                ))}
                              </ul>
                            )}
                            {a.answer.notes?.trim() && (
                              <p className="mt-1.5 whitespace-pre-wrap text-sm italic leading-relaxed text-gray-700">{a.answer.notes}</p>
                            )}
                            <p className="mt-1.5 text-[11px] text-gray-400">
                              {a.answeredByName ?? a.answeredBy ?? "—"} · {dateOf(a.updatedAt)} {timeOf(a.updatedAt)}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-400">{answers ? "No answer yet." : "…"}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
