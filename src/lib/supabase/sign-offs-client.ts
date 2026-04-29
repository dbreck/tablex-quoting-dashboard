// Browser-side CRUD for sign-offs + revisions + notes. Authz is RLS-enforced.

import { createClient } from "@/lib/supabase/client";
import type {
  SignOff,
  SignOffRevision,
  SignOffNote,
} from "@/data/sign-offs";
import {
  rowToSignOff,
  rowToSignOffRevision,
  rowToSignOffNote,
  signOffToInsertRow,
  signOffUpdatesToRow,
  signOffRevisionToInsertRow,
  signOffNoteToInsertRow,
  type SignOffRow,
  type SignOffRevisionRow,
  type SignOffNoteRow,
} from "@/lib/supabase/sign-offs-converters";

// ─── Reads ───────────────────────────────────────────────────────────────────

export async function fetchAllSignOffs(): Promise<SignOff[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sign_offs")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as SignOffRow[]).map(rowToSignOff);
}

export async function fetchAllSignOffRevisions(): Promise<SignOffRevision[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sign_off_revisions")
    .select("*")
    .order("decided_at", { ascending: true });
  if (error) throw error;
  return (data as SignOffRevisionRow[]).map(rowToSignOffRevision);
}

export async function fetchAllSignOffNotes(): Promise<SignOffNote[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sign_off_notes")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as SignOffNoteRow[]).map(rowToSignOffNote);
}

// ─── Sign-off writes ─────────────────────────────────────────────────────────

export async function createSignOff(
  signOff: Omit<SignOff, "createdAt" | "updatedAt">,
): Promise<SignOff> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sign_offs")
    .insert(signOffToInsertRow(signOff))
    .select("*")
    .single();
  if (error) throw error;
  return rowToSignOff(data as SignOffRow);
}

export async function updateSignOff(
  id: string,
  patch: Partial<Omit<SignOff, "id" | "createdAt" | "updatedAt">>,
): Promise<void> {
  const supabase = createClient();
  const row = signOffUpdatesToRow(patch);
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("sign_offs").update(row).eq("id", id);
  if (error) throw error;
}

export async function deleteSignOff(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("sign_offs").delete().eq("id", id);
  if (error) throw error;
}

// ─── Revision writes (insert-only) ───────────────────────────────────────────

export async function insertSignOffRevision(
  rev: SignOffRevision,
): Promise<SignOffRevision> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sign_off_revisions")
    .insert(signOffRevisionToInsertRow(rev))
    .select("*")
    .single();
  if (error) throw error;
  return rowToSignOffRevision(data as SignOffRevisionRow);
}

// ─── Note writes (insert-only) ───────────────────────────────────────────────

export async function insertSignOffNote(note: SignOffNote): Promise<SignOffNote> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sign_off_notes")
    .insert(signOffNoteToInsertRow(note))
    .select("*")
    .single();
  if (error) throw error;
  return rowToSignOffNote(data as SignOffNoteRow);
}
