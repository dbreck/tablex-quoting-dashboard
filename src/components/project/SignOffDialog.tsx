"use client";

import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { Trash2, Plus, X, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSignOffsStore } from "@/store/sign-offs-store";
import { useAuth } from "@/components/providers/AuthProvider";
import { DELIVERABLES } from "@/data/project-phase2";
import {
  makeSignOffId,
  isLocked,
  type SignOff,
  type SignOffLink,
} from "@/data/sign-offs";

interface SignOffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Existing record to edit, or null for create. */
  signOff: SignOff | null;
  /** Called after a successful save. The id is passed back so callers can
   *  navigate to the detail page after creation. */
  onSaved?: (id: string) => void;
}

const inputCls =
  "w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green disabled:bg-slate-50 disabled:text-slate-500";
const labelCls = "block text-xs font-medium text-slate-700 mb-1";

const EMPTY_LINK: SignOffLink = { label: "", url: "" };

export function SignOffDialog({
  open,
  onOpenChange,
  signOff,
  onSaved,
}: SignOffDialogProps) {
  const addSignOff = useSignOffsStore((s) => s.addSignOff);
  const updateSignOff = useSignOffsStore((s) => s.updateSignOff);
  const deleteSignOff = useSignOffsStore((s) => s.deleteSignOff);
  const { isAdmin } = useAuth();

  const isEdit = signOff !== null;
  const locked = isEdit && signOff ? isLocked(signOff) : false;
  const isChangesRequested = signOff?.status === "changes_requested";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deliverableId, setDeliverableId] = useState<string>("");
  const [links, setLinks] = useState<SignOffLink[]>([{ ...EMPTY_LINK }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSubmitting(false);
    if (signOff) {
      setTitle(signOff.title);
      setDescription(signOff.description ?? "");
      setDeliverableId(signOff.deliverableId ?? "");
      setLinks(signOff.links.length > 0 ? signOff.links : [{ ...EMPTY_LINK }]);
    } else {
      setTitle("");
      setDescription("");
      setDeliverableId("");
      setLinks([{ ...EMPTY_LINK }]);
    }
  }, [open, signOff]);

  function setLink(idx: number, patch: Partial<SignOffLink>) {
    setLinks((curr) => curr.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }
  function addLinkRow() {
    setLinks((curr) => [...curr, { ...EMPTY_LINK }]);
  }
  function removeLinkRow(idx: number) {
    setLinks((curr) => (curr.length === 1 ? [{ ...EMPTY_LINK }] : curr.filter((_, i) => i !== idx)));
  }

  function buildPayload() {
    const trimmedLinks: SignOffLink[] = links
      .map((l) => ({ label: l.label.trim(), url: l.url.trim() }))
      .filter((l) => l.url.length > 0);
    return {
      title: title.trim(),
      description: description.trim() || undefined,
      deliverableId: deliverableId || undefined,
      links: trimmedLinks,
    };
  }

  async function persist(intent: "save" | "send") {
    const payload = buildPayload();
    if (!payload.title) {
      setError("Title is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let id: string;
      if (isEdit && signOff) {
        id = signOff.id;
        const patch: Partial<SignOff> = {
          title: payload.title,
          description: payload.description,
          deliverableId: payload.deliverableId,
          links: payload.links,
        };
        if (intent === "send") {
          patch.status = "sent";
          // Re-sending after changes_requested bumps the revision counter.
          if (isChangesRequested) {
            patch.revisionNumber = signOff.revisionNumber + 1;
          }
        }
        await updateSignOff(id, patch);
      } else {
        id = makeSignOffId(nanoid(10));
        const now = new Date().toISOString();
        const newRecord: SignOff = {
          id,
          title: payload.title,
          description: payload.description,
          deliverableId: payload.deliverableId,
          links: payload.links,
          status: intent === "send" ? "sent" : "draft",
          revisionNumber: 1,
          createdAt: now,
          updatedAt: now,
        };
        await addSignOff(newRecord);
      }

      if (intent === "send") {
        await copyShareLink(id);
      }

      onSaved?.(id);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save sign-off");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyShareLink(id: string) {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/project/sign-offs/${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  async function handleDelete() {
    if (!signOff) return;
    if (!confirm(`Delete sign-off "${signOff.title}"? This cascades to revisions and notes.`))
      return;
    setSubmitting(true);
    setError(null);
    try {
      await deleteSignOff(signOff.id);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete sign-off");
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit sign-off" : "New sign-off"}</DialogTitle>
          <DialogDescription>
            {locked
              ? "This sign-off is approved and locked. Notes can still be added on the detail page."
              : isChangesRequested
                ? "Edits go on revision " + ((signOff?.revisionNumber ?? 1) + 1) + ". 'Save & Re-send' notifies the reviewer."
                : "Describe what to review and add the asset link(s). 'Save & Send' copies a shareable link to the clipboard."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void persist("save");
          }}
          className="space-y-4"
        >
          <div>
            <label className={labelCls}>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Homepage v2 — design review"
              className={inputCls}
              autoFocus={!isEdit}
              disabled={locked}
            />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What the reviewer should look at + any context (markdown supported)"
              className={inputCls}
              disabled={locked}
            />
          </div>

          <div>
            <label className={labelCls}>Deliverable (optional)</label>
            <select
              value={deliverableId}
              onChange={(e) => setDeliverableId(e.target.value)}
              className={inputCls}
              disabled={locked}
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
            <div className="flex items-center justify-between mb-1">
              <label className={labelCls}>Links *</label>
              {!locked && (
                <button
                  type="button"
                  onClick={addLinkRow}
                  className="text-xs font-medium text-brand-green hover:text-brand-green/80 inline-flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Add link
                </button>
              )}
            </div>
            <div className="space-y-2">
              {links.map((link, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => setLink(idx, { label: e.target.value })}
                    placeholder="Label (e.g. Figma frame)"
                    className={`${inputCls} basis-1/3`}
                    disabled={locked}
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => setLink(idx, { url: e.target.value })}
                    placeholder="https://figma.com/..."
                    className={`${inputCls} flex-1`}
                    disabled={locked}
                  />
                  {!locked && (
                    <button
                      type="button"
                      onClick={() => removeLinkRow(idx)}
                      className="text-slate-400 hover:text-red-600 p-2"
                      title="Remove link"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              At least one URL is required to send. Reviewers click these to view the asset externally.
            </p>
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
              {!locked && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void persist("save")}
                  disabled={submitting}
                >
                  {submitting ? "Saving…" : isEdit ? "Save changes" : "Save as draft"}
                </Button>
              )}
              {!locked && (
                <Button
                  type="button"
                  onClick={() => void persist("send")}
                  disabled={
                    submitting ||
                    !title.trim() ||
                    links.every((l) => !l.url.trim())
                  }
                  className="gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isChangesRequested ? "Save & Re-send" : "Save & Send"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
