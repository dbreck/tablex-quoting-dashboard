"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  StickyNote,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import {
  useApprovalForPage,
  useApprovalsStore,
} from "@/store/site-map-approvals-store";

interface Props {
  pageId: string;
  pageLabel: string;
  /** Lift focus back to the row after closing the popover. */
  onClosed?: () => void;
}

/** Inline Y / N controls for a Site Map row, plus a popover note for rejections. */
export function ApprovalControls({ pageId, pageLabel, onClosed }: Props) {
  const approval = useApprovalForPage(pageId);
  const setDecision = useApprovalsStore((s) => s.setDecision);
  const setNote = useApprovalsStore((s) => s.setNote);
  const clear = useApprovalsStore((s) => s.clear);
  const decision = approval?.decision ?? "pending";
  const note = approval?.note ?? "";

  const [popoverOpen, setPopoverOpen] = useState(false);
  // Local copy so we only push to the store on close (avoids re-render storm).
  const [draftNote, setDraftNote] = useState(note);

  // Keep draft in sync when the row's stored note changes externally.
  useEffect(() => {
    setDraftNote(note);
  }, [note]);

  const handleYes = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDecision(pageId, "approved");
  };

  const handleNo = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasAlreadyRejected = decision === "rejected";
    setDecision(pageId, "rejected");
    // Open the note popover automatically on the first reject click. If
    // they click N again to undo, the store toggles back to pending and
    // we don't bother re-opening.
    if (!wasAlreadyRejected) {
      setPopoverOpen(true);
    }
  };

  const handleNoteIcon = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPopoverOpen(true);
  };

  const handlePopoverChange = (open: boolean) => {
    setPopoverOpen(open);
    if (!open) {
      // Persist the draft note and pass focus back to the row.
      if (draftNote !== note) {
        setNote(pageId, draftNote);
      }
      onClosed?.();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    clear(pageId);
    setPopoverOpen(false);
  };

  const isRejected = decision === "rejected";
  const isApproved = decision === "approved";
  const hasNote = note.trim().length > 0;

  return (
    <div
      className="flex items-center gap-1 shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Note icon — visible when there's an existing note */}
      {(hasNote || (isRejected && !popoverOpen)) && (
        <button
          type="button"
          onClick={handleNoteIcon}
          aria-label={hasNote ? "Edit reason" : "Add reason"}
          title={hasNote ? note : "Add a reason"}
          className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
            hasNote
              ? "text-amber-600 hover:bg-amber-50"
              : "text-slate-300 hover:text-slate-500 hover:bg-slate-50"
          }`}
        >
          <StickyNote className="h-3.5 w-3.5" />
          {hasNote && (
            <span
              aria-hidden
              className="absolute mt-3 ml-3 h-1.5 w-1.5 rounded-full bg-amber-500"
            />
          )}
        </button>
      )}

      {/* Yes button */}
      <button
        type="button"
        onClick={handleYes}
        aria-label="Approve"
        aria-pressed={isApproved}
        title="Approve (y)"
        className={`flex h-6 w-6 items-center justify-center rounded-md transition-all ${
          isApproved
            ? "bg-emerald-500 text-white shadow-sm"
            : "text-slate-300 hover:text-emerald-600 hover:bg-emerald-50"
        }`}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </button>

      {/* No button — wrapped in popover for the note */}
      <Popover open={popoverOpen} onOpenChange={handlePopoverChange}>
        <PopoverAnchor asChild>
          <button
            type="button"
            onClick={handleNo}
            aria-label="Reject"
            aria-pressed={isRejected}
            title="Reject (n)"
            className={`flex h-6 w-6 items-center justify-center rounded-md transition-all ${
              isRejected
                ? "bg-rose-500 text-white shadow-sm"
                : "text-slate-300 hover:text-rose-600 hover:bg-rose-50"
            }`}
          >
            <X className="h-3.5 w-3.5" strokeWidth={3} />
          </button>
        </PopoverAnchor>
        <PopoverContent
          side="bottom"
          align="end"
          sideOffset={8}
          className="w-80"
        >
          <NoteForm
            pageId={pageId}
            pageLabel={pageLabel}
            value={draftNote}
            onChange={setDraftNote}
            onClose={() => handlePopoverChange(false)}
            onClear={handleClear}
            hasNote={hasNote}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface NoteFormProps {
  pageId: string;
  pageLabel: string;
  value: string;
  hasNote: boolean;
  onChange: (v: string) => void;
  onClose: () => void;
  onClear: (e: React.MouseEvent) => void;
}

function NoteForm({
  pageId,
  pageLabel,
  value,
  onChange,
  onClose,
  onClear,
  hasNote,
}: NoteFormProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="space-y-2.5">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-rose-600 font-semibold flex items-center gap-1">
          <X className="h-3 w-3" strokeWidth={3} />
          Rejected
        </div>
        <div className="text-sm font-semibold text-slate-900 mt-0.5 truncate">
          {pageLabel}
        </div>
      </div>
      <textarea
        id={`approval-note-${pageId}`}
        ref={ref}
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          // Let the textarea handle every keystroke (especially y/n/r) —
          // stopping propagation so the tree row's shortcut handler never
          // sees them, even if focus somehow ended up split.
          e.stopPropagation();
          if (e.key === "Escape") {
            e.preventDefault();
            onClose();
          } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onClose();
          }
        }}
        placeholder="What's wrong with this page? (Cmd+Enter to save)"
        rows={3}
        className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 resize-none"
      />
      <div className="flex items-center justify-between">
        {hasNote ? (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
          >
            Clear decision
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
