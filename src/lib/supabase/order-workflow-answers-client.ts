// Browser-side reads/writes for order_workflow_answers (tracker project).
// One row per (person, question_id); RLS lets any authenticated user read and
// write. Used by /project/order-workflow homework tabs. No realtime: the
// meeting-findings client does not subscribe either, so callers refetch on
// tab focus via subscribeAnswers().

import { createClient } from "@/lib/supabase/client";

export type AnswerValue = string | string[] | number;

export interface StoredAnswer {
  value: AnswerValue;
  notes?: string;
}

export interface WorkflowAnswer {
  person: string;
  questionId: string;
  answer: StoredAnswer;
  answeredBy: string | null;
  answeredByName: string | null;
  updatedAt: string;
}

interface WorkflowAnswerRow {
  person: string;
  question_id: string;
  answer: StoredAnswer;
  answered_by: string | null;
  answered_by_name: string | null;
  updated_at: string;
}

function rowToAnswer(r: WorkflowAnswerRow): WorkflowAnswer {
  return {
    person: r.person,
    questionId: r.question_id,
    answer: r.answer,
    answeredBy: r.answered_by,
    answeredByName: r.answered_by_name,
    updatedAt: r.updated_at,
  };
}

export async function fetchAnswers(person: string): Promise<Record<string, WorkflowAnswer>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("order_workflow_answers")
    .select("person, question_id, answer, answered_by, answered_by_name, updated_at")
    .eq("person", person);
  if (error) throw error;
  const out: Record<string, WorkflowAnswer> = {};
  for (const r of (data ?? []) as WorkflowAnswerRow[]) out[r.question_id] = rowToAnswer(r);
  return out;
}

export async function upsertAnswer(input: {
  person: string;
  questionId: string;
  answer: StoredAnswer;
  answeredBy: string | null;
  answeredByName: string | null;
}): Promise<WorkflowAnswer> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("order_workflow_answers")
    .upsert(
      {
        person: input.person,
        question_id: input.questionId,
        answer: input.answer,
        answered_by: input.answeredBy,
        answered_by_name: input.answeredByName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "person,question_id" },
    )
    .select("person, question_id, answer, answered_by, answered_by_name, updated_at")
    .single();
  if (error) throw error;
  return rowToAnswer(data as WorkflowAnswerRow);
}

/** Refetch when the tab regains focus. Returns an unsubscribe function. */
export function subscribeAnswers(
  person: string,
  cb: (answers: Record<string, WorkflowAnswer>) => void,
): () => void {
  const refresh = () => {
    if (document.visibilityState !== "visible") return;
    fetchAnswers(person).then(cb).catch(() => {});
  };
  window.addEventListener("focus", refresh);
  document.addEventListener("visibilitychange", refresh);
  return () => {
    window.removeEventListener("focus", refresh);
    document.removeEventListener("visibilitychange", refresh);
  };
}
