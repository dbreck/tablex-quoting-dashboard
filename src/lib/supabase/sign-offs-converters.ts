// Pure snake_case ↔ camelCase converters for sign-offs + revisions + notes.
// No supabase client coupling — reusable from route handlers.

import type {
  SignOff,
  SignOffRevision,
  SignOffNote,
  SignOffStatus,
  SignOffDecision,
  SignOffLink,
} from "@/data/sign-offs";

// ─── Row shapes ──────────────────────────────────────────────────────────────

export interface SignOffRow {
  id: string;
  deliverable_id: string | null;
  title: string;
  description: string | null;
  links: SignOffLink[] | null;
  status: SignOffStatus;
  revision_number: number;
  approved_at: string | null;
  approved_by_profile_id: string | null;
  approved_by_name: string | null;
  created_by_member_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SignOffRevisionRow {
  id: string;
  sign_off_id: string;
  revision_number: number;
  decision: SignOffDecision;
  decided_by_profile_id: string | null;
  decided_by_name: string;
  decided_notes: string | null;
  decided_at: string;
  description_snapshot: string | null;
  links_snapshot: SignOffLink[] | null;
}

export interface SignOffNoteRow {
  id: string;
  sign_off_id: string;
  author_profile_id: string | null;
  author_name: string;
  body: string;
  created_at: string;
}

// ─── Row → TS ────────────────────────────────────────────────────────────────

export function rowToSignOff(row: SignOffRow): SignOff {
  return {
    id: row.id,
    deliverableId: row.deliverable_id ?? undefined,
    title: row.title,
    description: row.description ?? undefined,
    links: Array.isArray(row.links) ? row.links : [],
    status: row.status,
    revisionNumber: row.revision_number,
    approvedAt: row.approved_at ?? undefined,
    approvedByProfileId: row.approved_by_profile_id ?? undefined,
    approvedByName: row.approved_by_name ?? undefined,
    createdByMemberId: row.created_by_member_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToSignOffRevision(row: SignOffRevisionRow): SignOffRevision {
  return {
    id: row.id,
    signOffId: row.sign_off_id,
    revisionNumber: row.revision_number,
    decision: row.decision,
    decidedByProfileId: row.decided_by_profile_id ?? undefined,
    decidedByName: row.decided_by_name,
    decidedNotes: row.decided_notes ?? undefined,
    decidedAt: row.decided_at,
    descriptionSnapshot: row.description_snapshot ?? undefined,
    linksSnapshot: Array.isArray(row.links_snapshot) ? row.links_snapshot : undefined,
  };
}

export function rowToSignOffNote(row: SignOffNoteRow): SignOffNote {
  return {
    id: row.id,
    signOffId: row.sign_off_id,
    authorProfileId: row.author_profile_id ?? undefined,
    authorName: row.author_name,
    body: row.body,
    createdAt: row.created_at,
  };
}

// ─── TS → Row ────────────────────────────────────────────────────────────────

export function signOffToInsertRow(
  signOff: Omit<SignOff, "createdAt" | "updatedAt">,
): Omit<SignOffRow, "created_at" | "updated_at"> {
  return {
    id: signOff.id,
    deliverable_id: signOff.deliverableId ?? null,
    title: signOff.title,
    description: signOff.description ?? null,
    links: signOff.links ?? [],
    status: signOff.status,
    revision_number: signOff.revisionNumber,
    approved_at: signOff.approvedAt ?? null,
    approved_by_profile_id: signOff.approvedByProfileId ?? null,
    approved_by_name: signOff.approvedByName ?? null,
    created_by_member_id: signOff.createdByMemberId ?? null,
  };
}

export function signOffUpdatesToRow(
  updates: Partial<Omit<SignOff, "id" | "createdAt" | "updatedAt">>,
): Partial<Omit<SignOffRow, "id" | "created_at" | "updated_at">> {
  const row: Partial<Omit<SignOffRow, "id" | "created_at" | "updated_at">> = {};
  if (updates.deliverableId !== undefined) row.deliverable_id = updates.deliverableId ?? null;
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.description !== undefined) row.description = updates.description ?? null;
  if (updates.links !== undefined) row.links = updates.links;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.revisionNumber !== undefined) row.revision_number = updates.revisionNumber;
  if (updates.approvedAt !== undefined) row.approved_at = updates.approvedAt ?? null;
  if (updates.approvedByProfileId !== undefined)
    row.approved_by_profile_id = updates.approvedByProfileId ?? null;
  if (updates.approvedByName !== undefined)
    row.approved_by_name = updates.approvedByName ?? null;
  if (updates.createdByMemberId !== undefined)
    row.created_by_member_id = updates.createdByMemberId ?? null;
  return row;
}

export function signOffRevisionToInsertRow(
  rev: SignOffRevision,
): SignOffRevisionRow {
  return {
    id: rev.id,
    sign_off_id: rev.signOffId,
    revision_number: rev.revisionNumber,
    decision: rev.decision,
    decided_by_profile_id: rev.decidedByProfileId ?? null,
    decided_by_name: rev.decidedByName,
    decided_notes: rev.decidedNotes ?? null,
    decided_at: rev.decidedAt,
    description_snapshot: rev.descriptionSnapshot ?? null,
    links_snapshot: rev.linksSnapshot ?? null,
  };
}

export function signOffNoteToInsertRow(note: SignOffNote): SignOffNoteRow {
  return {
    id: note.id,
    sign_off_id: note.signOffId,
    author_profile_id: note.authorProfileId ?? null,
    author_name: note.authorName,
    body: note.body,
    created_at: note.createdAt,
  };
}
