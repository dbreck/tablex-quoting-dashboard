"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSignOffsStore } from "@/store/sign-offs-store";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  makeSignOffRevisionId,
  type SignOff,
  type SignOffDecision,
} from "@/data/sign-offs";

interface SignOffDecisionPanelProps {
  signOff: SignOff;
}

/**
 * The Approve / Needs Edits surface that appears on the sign-off detail page
 * when status === 'sent'. Reviewers fill an optional notes field, hit one of
 * the two buttons, and the panel:
 *   1. inserts a row into sign_off_revisions with a description + links snapshot
 *   2. updates the parent sign_off status accordingly
 *   3. on Approve, also stamps approved_at + approved_by_*
 */
export function SignOffDecisionPanel({ signOff }: SignOffDecisionPanelProps) {
  const recordRevision = useSignOffsStore((s) => s.recordRevision);
  const updateSignOff = useSignOffsStore((s) => s.updateSignOff);
  const { user, profile } = useAuth();

  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState<SignOffDecision | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reviewerName = profile?.full_name?.trim() || profile?.email || "Anonymous";

  async function decide(decision: SignOffDecision) {
    setSubmitting(decision);
    setError(null);
    const now = new Date().toISOString();

    try {
      const rev = {
        id: makeSignOffRevisionId(nanoid(10)),
        signOffId: signOff.id,
        revisionNumber: signOff.revisionNumber,
        decision,
        decidedByProfileId: user?.id,
        decidedByName: reviewerName,
        decidedNotes: notes.trim() || undefined,
        decidedAt: now,
        descriptionSnapshot: signOff.description,
        linksSnapshot: signOff.links,
      };
      await recordRevision(rev);

      const patch: Partial<SignOff> = {
        status: decision === "approved" ? "approved" : "changes_requested",
      };
      if (decision === "approved") {
        patch.approvedAt = now;
        patch.approvedByProfileId = user?.id;
        patch.approvedByName = reviewerName;
      }
      await updateSignOff(signOff.id, patch);

      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record decision");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="rounded-lg border-2 border-brand-green/40 bg-brand-green/[0.03] p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-brand-green">
          Awaiting your decision
        </span>
      </div>
      <p className="text-sm text-slate-700 mb-4">
        Click each link above to review the asset, then mark this sign-off as
        approved or send back for edits. Notes are optional.
      </p>

      <label className="block text-xs font-medium text-slate-700 mb-1">
        Notes <span className="text-slate-400 font-normal">(optional)</span>
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="What you saw, anything that should change, or just 'looks great.'"
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
      />

      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <span className="font-medium">Couldn&rsquo;t save: </span>
          {error}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => void decide("changes_requested")}
          disabled={submitting !== null}
          className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          {submitting === "changes_requested" ? "Recording…" : "Needs Edits"}
        </Button>
        <Button
          type="button"
          onClick={() => void decide("approved")}
          disabled={submitting !== null}
          className="gap-1.5 bg-brand-green text-black hover:bg-brand-green/90"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {submitting === "approved" ? "Recording…" : "Sign Off"}
        </Button>
      </div>
      <p className="mt-2 text-[11px] text-slate-500 text-right">
        Submitted as <b>{reviewerName}</b>. Decisions are append-only and
        recorded in the revision history below.
      </p>
    </div>
  );
}
