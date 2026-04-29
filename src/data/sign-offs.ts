// Types + helpers for the Sign-Offs system. Mirrors Postgres columns from
// migration 024.

export type SignOffStatus = "draft" | "sent" | "changes_requested" | "approved";

export type SignOffDecision = "approved" | "changes_requested";

export interface SignOffLink {
  label: string;
  url: string;
}

export interface SignOff {
  id: string;
  deliverableId?: string;
  title: string;
  description?: string;
  links: SignOffLink[];
  status: SignOffStatus;
  revisionNumber: number;
  approvedAt?: string;
  approvedByProfileId?: string;
  approvedByName?: string;
  createdByMemberId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignOffRevision {
  id: string;
  signOffId: string;
  revisionNumber: number;
  decision: SignOffDecision;
  decidedByProfileId?: string;
  decidedByName: string;
  decidedNotes?: string;
  decidedAt: string;
  descriptionSnapshot?: string;
  linksSnapshot?: SignOffLink[];
}

export interface SignOffNote {
  id: string;
  signOffId: string;
  authorProfileId?: string;
  authorName: string;
  body: string;
  createdAt: string;
}

// ─── Enum metadata for UI ────────────────────────────────────────────────────

export const SIGN_OFF_STATUSES: { id: SignOffStatus; label: string }[] = [
  { id: "draft", label: "Draft" },
  { id: "sent", label: "Sent — awaiting review" },
  { id: "changes_requested", label: "Changes requested" },
  { id: "approved", label: "Approved" },
];

export const SIGN_OFF_STATUS_LABEL: Record<SignOffStatus, string> = {
  draft: "Draft",
  sent: "Awaiting review",
  changes_requested: "Changes requested",
  approved: "Approved",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** True when the body fields are immutable. */
export function isLocked(signOff: SignOff): boolean {
  return signOff.status === "approved";
}

/** True when the decision panel should be shown to reviewers. */
export function isAwaitingDecision(signOff: SignOff): boolean {
  return signOff.status === "sent";
}

/** Local nanoid prefixing so callers don't pull nanoid here. */
export function makeSignOffId(nanoid10: string): string {
  return `so-${nanoid10}`;
}
export function makeSignOffRevisionId(nanoid10: string): string {
  return `sor-${nanoid10}`;
}
export function makeSignOffNoteId(nanoid10: string): string {
  return `son-${nanoid10}`;
}
