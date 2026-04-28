"use client";

import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { Trash2 } from "lucide-react";
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
  RISK_CATEGORIES,
  RISK_STATUSES,
  PROBABILITY_LABELS,
  IMPACT_LABELS,
  makeRiskId,
  type Risk,
  type RiskCategory,
  type RiskStatus,
} from "@/data/risks-decisions";

interface RiskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Existing risk to edit, or null for create. */
  risk: Risk | null;
}

const inputCls =
  "w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green";
const labelCls = "block text-xs font-medium text-slate-700 mb-1";

export function RiskDialog({ open, onOpenChange, risk }: RiskDialogProps) {
  const addRisk = useRisksDecisionsStore((s) => s.addRisk);
  const updateRisk = useRisksDecisionsStore((s) => s.updateRisk);
  const deleteRisk = useRisksDecisionsStore((s) => s.deleteRisk);
  const team = useTeam();
  const { isAdmin } = useAuth();

  const isEdit = risk !== null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deliverableId, setDeliverableId] = useState<string>("");
  const [category, setCategory] = useState<RiskCategory>("integration");
  const [probability, setProbability] = useState<1 | 2 | 3>(2);
  const [impact, setImpact] = useState<1 | 2 | 3>(2);
  const [status, setStatus] = useState<RiskStatus>("open");
  const [triggerDate, setTriggerDate] = useState<string>("");
  const [mitigationOwner, setMitigationOwner] = useState<string>("");
  const [mitigationPlan, setMitigationPlan] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSubmitting(false);
    if (risk) {
      setTitle(risk.title);
      setDescription(risk.description ?? "");
      setDeliverableId(risk.deliverableId ?? "");
      setCategory(risk.category);
      setProbability(risk.probability);
      setImpact(risk.impact);
      setStatus(risk.status);
      setTriggerDate(risk.triggerDate ?? "");
      setMitigationOwner(risk.mitigationOwner ?? "");
      setMitigationPlan(risk.mitigationPlan ?? "");
    } else {
      setTitle("");
      setDescription("");
      setDeliverableId("");
      setCategory("integration");
      setProbability(2);
      setImpact(2);
      setStatus("open");
      setTriggerDate("");
      setMitigationOwner("");
      setMitigationPlan("");
    }
  }, [open, risk]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setSubmitting(true);
    setError(null);
    try {
      if (isEdit && risk) {
        await updateRisk(risk.id, {
          title: trimmedTitle,
          description: description.trim() || undefined,
          deliverableId: deliverableId || undefined,
          category,
          probability,
          impact,
          status,
          triggerDate: triggerDate || undefined,
          mitigationOwner: mitigationOwner || undefined,
          mitigationPlan: mitigationPlan.trim() || undefined,
        });
      } else {
        const now = new Date().toISOString();
        const newRisk: Risk = {
          id: makeRiskId(nanoid(10)),
          title: trimmedTitle,
          description: description.trim() || undefined,
          deliverableId: deliverableId || undefined,
          category,
          probability,
          impact,
          severity: probability * impact,
          status,
          triggerDate: triggerDate || undefined,
          mitigationOwner: mitigationOwner || undefined,
          mitigationPlan: mitigationPlan.trim() || undefined,
          createdAt: now,
          updatedAt: now,
        };
        await addRisk(newRisk);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save risk");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!risk) return;
    if (!confirm(`Delete risk "${risk.title}"? This can't be undone.`)) return;
    setSubmitting(true);
    setError(null);
    try {
      await deleteRisk(risk.id);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete risk");
      setSubmitting(false);
    }
  }

  const severity = probability * impact;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit risk" : "New risk"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this risk. Severity auto-computes from probability × impact."
              : "Capture a risk. Severity = probability × impact (1–9)."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Short, specific risk statement"
              className={inputCls}
              autoFocus={!isEdit}
            />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Longer context — what breaks and why"
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
              <label className={labelCls}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RiskCategory)}
                className={inputCls}
              >
                {RISK_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Probability</label>
              <select
                value={probability}
                onChange={(e) => setProbability(parseInt(e.target.value, 10) as 1 | 2 | 3)}
                className={inputCls}
              >
                {([1, 2, 3] as const).map((n) => (
                  <option key={n} value={n}>
                    {n} · {PROBABILITY_LABELS[n]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Impact</label>
              <select
                value={impact}
                onChange={(e) => setImpact(parseInt(e.target.value, 10) as 1 | 2 | 3)}
                className={inputCls}
              >
                {([1, 2, 3] as const).map((n) => (
                  <option key={n} value={n}>
                    {n} · {IMPACT_LABELS[n]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Severity</label>
              <div
                className={`${inputCls} bg-slate-50 font-mono tabular-nums text-center`}
              >
                {severity}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RiskStatus)}
                className={inputCls}
              >
                {RISK_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Trigger date</label>
              <input
                type="date"
                value={triggerDate}
                onChange={(e) => setTriggerDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Mitigation owner</label>
            <select
              value={mitigationOwner}
              onChange={(e) => setMitigationOwner(e.target.value)}
              className={inputCls}
            >
              <option value="">— Unassigned —</option>
              {team.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} · {m.role}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Mitigation plan</label>
            <textarea
              value={mitigationPlan}
              onChange={(e) => setMitigationPlan(e.target.value)}
              rows={2}
              placeholder="One or two lines. If it's three paragraphs it's not a plan."
              className={inputCls}
            />
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
                    : "Create risk"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
