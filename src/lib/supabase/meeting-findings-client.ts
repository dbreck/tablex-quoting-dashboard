// Browser-side reads/writes for meeting_finding_checks + meeting_finding_notes
// (migration 028). Authz is RLS-enforced (can_access_proposal for read/write,
// admin for delete). Rows are keyed "<meeting>:<item>" so one meeting's page
// loads only its own prefix.

import { createClient } from "@/lib/supabase/client";

export interface FindingCheck {
  findingKey: string;
  isDone: boolean;
  doneBy: string | null;
  doneAt: string | null;
  updatedAt: string;
}

export interface FindingNote {
  id: string;
  findingKey: string;
  authorProfileId: string | null;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface FindingCheckRow {
  finding_key: string;
  is_done: boolean;
  done_by: string | null;
  done_at: string | null;
  updated_at: string;
}

export interface FindingNoteRow {
  id: string;
  finding_key: string;
  author_profile_id: string | null;
  author_name: string;
  body: string;
  created_at: string;
}

export function rowToCheck(r: FindingCheckRow): FindingCheck {
  return {
    findingKey: r.finding_key,
    isDone: r.is_done,
    doneBy: r.done_by,
    doneAt: r.done_at,
    updatedAt: r.updated_at,
  };
}

export function rowToNote(r: FindingNoteRow): FindingNote {
  return {
    id: r.id,
    findingKey: r.finding_key,
    authorProfileId: r.author_profile_id,
    authorName: r.author_name,
    body: r.body,
    createdAt: r.created_at,
  };
}

// ─── Reads ───────────────────────────────────────────────────────────────────

export async function fetchMeetingFindings(
  meetingKey: string,
): Promise<{ checks: FindingCheck[]; notes: FindingNote[] }> {
  const supabase = createClient();
  const prefix = `${meetingKey}:%`;
  const [checksRes, notesRes] = await Promise.all([
    supabase.from("meeting_finding_checks").select("*").like("finding_key", prefix),
    supabase
      .from("meeting_finding_notes")
      .select("*")
      .like("finding_key", prefix)
      .order("created_at", { ascending: true }),
  ]);
  if (checksRes.error) throw checksRes.error;
  if (notesRes.error) throw notesRes.error;
  return {
    checks: (checksRes.data as FindingCheckRow[]).map(rowToCheck),
    notes: (notesRes.data as FindingNoteRow[]).map(rowToNote),
  };
}

// ─── Writes ──────────────────────────────────────────────────────────────────

export async function upsertFindingCheck(check: {
  findingKey: string;
  isDone: boolean;
  doneBy: string | null;
  doneAt: string | null;
}): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("meeting_finding_checks").upsert(
    {
      finding_key: check.findingKey,
      is_done: check.isDone,
      done_by: check.doneBy,
      done_at: check.doneAt,
    },
    { onConflict: "finding_key" },
  );
  if (error) throw error;
}

export async function insertFindingNote(note: Omit<FindingNote, "createdAt">): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("meeting_finding_notes").insert({
    id: note.id,
    finding_key: note.findingKey,
    author_profile_id: note.authorProfileId,
    author_name: note.authorName,
    body: note.body,
  });
  if (error) throw error;
}
