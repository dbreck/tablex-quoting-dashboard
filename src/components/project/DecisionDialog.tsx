"use client";

import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { Trash2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRisksDecisionsStore } from "@/store/risks-decisions-store";
import { useTeam } from "@/store/project-tracker-store";
import { useAuth } from "@/components/providers/AuthProvider";
import { DELIVERABLES } from "@/data/project-phase2";
import {
  DECISION_STATUSES,
  makeDecisionId,
  type Decision,
  type DecisionStatus,
  type Reversibility,
} from "@/data/risks-decisions";

interface DecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Existing decision to edit, or null for create. */
  decision: Decision | null;
}

const inputCls =
  "w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green";
const labelCls = "block text-xs font-medium text-slate-700 mb-1";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function DecisionDialog({ open, onOpenChange, decision }: DecisionDialogProps) {
  const addDecision = useRisksDecisionsStore((s) => s.addDecision);
  const updateDecision = useRisksDecisionsStore((s) => s.updateDecision);
  const deleteDecision = useRisksDecisionsStore((s) => s.deleteDecision);
  const team = useTeam();
  const { isAdmin } = useAuth();

  const isEdit = decision !== null;

  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [optionsConsidered, setOptionsConsidered] = useState("");
  const [decisionText, setDecisionText] = useState("");
  const [consequences, setConsequences] = useState("");
  const [deliverableId, setDeliverableId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [decidedByMemberId, setDecidedByMemberId] = useState("");
  const [decidedByExternal, setDecidedByExternal] = useState("");
  const [decidedOn, setDecidedOn] = useState(todayISO());
  const [reversibility, setReversibility] = useState<Reversibility>("two_way_door");
  const [status, setStatus] = useState<DecisionStatus>("proposed");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSubmitting(false);
    if (decision) {
      setTitle(decision.title);
      setContext(decision.context ?? "");
      setOptionsConsidered(decision.optionsConsidered ?? "");
      setDecisionText(decision.decision ?? "");
      setConsequences(decision.consequences ?? "");
      setDeliverableId(decision.deliverableId ?? "");
      setTaskId(decision.taskId ?? "");
      setDecidedByMemberId(decision.decidedByMemberId ?? "");
      setDecidedByExternal(decision.decidedByExternal ?? "");
      setDecidedOn(decision.decidedOn);
      setReversibility(decision.reversibility);
      setStatus(decision.status);
    } else {
      setTitle("");
      setContext("");
      setOptionsConsidered("");
      setDecisionText("");
      setConsequences("");
      setDeliverableId("");
      setTaskId("");
      setDecidedByMemberId("");
      setDecidedByExternal("");
      setDecidedOn(todayISO());
      setReversibility("two_way_door");
      setStatus("proposed");
    }
  }, [open, decision]);

  // Soft warning for editing a one-way-door decision already approved/implemented.
  const showOneWayWarning =
    isEdit &&
    decision &&
    decision.reversibility === "one_way_door" &&
    (decision.status === "approved" || decision.status === "implemented");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    if (!decidedOn) return;

    setSubmitting(true);
    setError(null);
    try {
      if (isEdit && decision) {
        await updateDecision(decision.id, {
          title: trimmedTitle,
          context: context.trim() || undefined,
          optionsConsidered: optionsConsidered.trim() || undefined,
          decision: decisionText.trim() || undefined,
          consequences: consequences.trim() || undefined,
          deliverableId: deliverableId || undefined,
          taskId: taskId.trim() || undefined,
          decidedByMemberId: decidedByMemberId || undefined,
          decidedByExternal: decidedByExternal.trim() || undefined,
          decidedOn,
          reversibility,
          status,
        });
      } else {
        const now = new Date().toISOString();
        const newDecision: Decision = {
          id: makeDecisionId(nanoid(10)),
          title: trimmedTitle,
          context: context.trim() || undefined,
          optionsConsidered: optionsConsidered.trim() || undefined,
          decision: decisionText.trim() || undefined,
          consequences: consequences.trim() || undefined,
          deliverableId: deliverableId || undefined,
          taskId: taskId.trim() || undefined,
          decidedByMemberId: decidedByMemberId || undefined,
          decidedByExternal: decidedByExternal.trim() || undefined,
          decidedOn,
          reversibility,
          status,
          createdAt: now,
          updatedAt: now,
        };
        await addDecision(newDecision);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save decision");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!decision) return;
    if (!confirm(`Delete decision "${decision.title}"? This can't be undone.`)) return;
    setSubmitting(true);
    setError(null);
    try {
      await deleteDecision(decision.id);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete decision");
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit decision" : "New decision"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this decision. One-way-door changes carry warnings."
              : "Capture a decision. Decided-on date is a contractual artifact — required."}
          </DialogDescription>
        </DialogHeader>

        {showOneWayWarning && (
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              This is a <b>one-way-door</b> decision that&rsquo;s already{" "}
              {decision?.status}. Reversing in build phase is expensive — consider
              a superseding decision instead of editing this one.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="The call, in one line"
              className={inputCls}
              autoFocus={!isEdit}
            />
          </div>
          <div>
            <label className={labelCls}>Context</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={2}
              placeholder="Why did this decision need to be made?"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Options considered</label>
            <textarea
              value={optionsConsidered}
              onChange={(e) => setOptionsConsidered(e.target.value)}
              rows={2}
              placeholder="What else was on the table?"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Decision</label>
            <textarea
              value={decisionText}
              onChange={(e) => setDecisionText(e.target.value)}
              rows={2}
              placeholder="The call itself."
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Consequences</label>
            <textarea
              value={consequences}
              onChange={(e) => setConsequences(e.target.value)}
              rows={2}
              placeholder="What does this commit us to / rule out?"
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Deliverable</label>
              <select
                value={deliverableId}
                onChange={(e) => setDeliverableId(e.target.value)}
                className={inputCls}
              >
                <option value="">— Unlinked —</option>
                {DELIVERABLES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Task id (optional)</label>
              <input
                type="text"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                placeholder="e.g. web-2a-r1"
                className={inputCls}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Decided by (team)</label>
              <select
                value={decidedByMemberId}
                onChange={(e) => setDecidedByMemberId(e.target.value)}
                className={inputCls}
              >
                <option value="">— None —</option>
                {team.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} · {m.role}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>or decided by (external)</label>
              <input
                type="text"
                value={decidedByExternal}
                onChange={(e) => setDecidedByExternal(e.target.value)}
                placeholder="Brian Craig, etc."
                className={inputCls}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Decided on *</label>
              <input
                type="date"
                value={decidedOn}
                onChange={(e) => setDecidedOn(e.target.value)}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Reversibility</label>
              <select
                value={reversibility}
                onChange={(e) => setReversibility(e.target.value as Reversibility)}
                className={inputCls}
              >
                <option value="two_way_door">Two-way door</option>
                <option value="one_way_door">One-way door</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DecisionStatus)}
                className={inputCls}
              >
                {DECISION_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <span className="font-medium">Couldn&rsquo;t save: </span>
              {error}
            </div>
          )}
          <DialogFooter className="justify-between">
            <div>
              {isEdit && isAdmin && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "Saving…"
                  : isEdit
                    ? "Save changes"
                    : "Log decision"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
