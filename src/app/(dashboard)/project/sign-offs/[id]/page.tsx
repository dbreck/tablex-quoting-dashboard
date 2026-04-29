"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileEdit,
  Send,
  ExternalLink,
  Pencil,
  Link2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSignOff } from "@/store/sign-offs-store";
import { useSignOffsStore } from "@/store/sign-offs-store";
import { SignOffDialog } from "@/components/project/SignOffDialog";
import { SignOffDecisionPanel } from "@/components/project/SignOffDecisionPanel";
import { SignOffRevisionTimeline } from "@/components/project/SignOffRevisionTimeline";
import { SignOffNotesList } from "@/components/project/SignOffNotesList";
import {
  SIGN_OFF_STATUS_LABEL,
  isAwaitingDecision,
  isLocked,
  type SignOffStatus,
} from "@/data/sign-offs";
import { DELIVERABLES } from "@/data/project-phase2";

const STATUS_PILL: Record<SignOffStatus, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  sent: "bg-blue-50 text-blue-700 border-blue-200",
  changes_requested: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-brand-green/15 text-brand-green border-brand-green/40",
};
const STATUS_ICON: Record<SignOffStatus, React.ComponentType<{ className?: string }>> = {
  draft: FileEdit,
  sent: Send,
  changes_requested: AlertTriangle,
  approved: CheckCircle2,
};

function formatStamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function SignOffDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const signOff = useSignOff(params.id);
  const isInitialized = useSignOffsStore((s) => s.isInitialized);

  const [editOpen, setEditOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const deliverableName = useMemo(() => {
    if (!signOff?.deliverableId) return null;
    const d = DELIVERABLES.find((x) => x.id === signOff.deliverableId);
    return d?.name ?? signOff.deliverableId;
  }, [signOff]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-[#95ff00]" />
      </div>
    );
  }

  if (!signOff) {
    return (
      <div className="px-6 py-10 max-w-3xl mx-auto">
        <Link
          href="/project/sign-offs"
          className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to all sign-offs
        </Link>
        <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.03] py-12 text-center">
          <p className="text-sm text-white/60">
            Sign-off not found, or you don&rsquo;t have access.
          </p>
        </div>
      </div>
    );
  }

  const Icon = STATUS_ICON[signOff.status];
  const locked = isLocked(signOff);

  async function copyLink() {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/project/sign-offs/${signOff!.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1800);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/project/sign-offs"
          className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to all sign-offs
        </Link>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyLink}
            className="gap-1.5"
          >
            <Link2 className="h-3.5 w-3.5" />
            {linkCopied ? "Copied!" : "Copy share link"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="gap-1.5"
          >
            <Pencil className="h-3.5 w-3.5" />
            {locked ? "View" : "Edit"}
          </Button>
        </div>
      </div>

      {/* Header card */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 mb-4">
        <div className="flex items-start gap-3 mb-3">
          <div
            className={`shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-mono uppercase tracking-[0.08em] border ${STATUS_PILL[signOff.status]}`}
          >
            <Icon className="h-3 w-3" />
            {SIGN_OFF_STATUS_LABEL[signOff.status]}
          </div>
          {signOff.revisionNumber > 1 && (
            <span className="shrink-0 text-[10px] font-mono uppercase tracking-[0.1em] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">
              revision {signOff.revisionNumber}
            </span>
          )}
          {locked && (
            <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.1em] text-brand-green bg-brand-green/10 border border-brand-green/30 px-2 py-1 rounded-md">
              <Lock className="h-3 w-3" /> locked
            </span>
          )}
        </div>

        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
          {signOff.title}
        </h1>

        {deliverableName && (
          <div className="mt-1 text-xs text-slate-500">
            ↳ {deliverableName}
          </div>
        )}

        {signOff.description && (
          <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">
            {signOff.description}
          </p>
        )}

        {signOff.links.length > 0 && (
          <div className="mt-4">
            <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 mb-2">
              Review these
            </div>
            <ul className="space-y-1.5">
              {signOff.links.map((l, i) => (
                <li key={i}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-slate-900 hover:text-brand-green hover:underline group"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-green" />
                    <span className="font-medium">
                      {l.label || "Untitled link"}
                    </span>
                    <span className="text-xs text-slate-500 truncate max-w-md">
                      {l.url}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {locked && signOff.approvedByName && (
          <div className="mt-4 rounded-md bg-brand-green/[0.08] border border-brand-green/30 px-3 py-2 text-sm text-slate-900">
            <CheckCircle2 className="inline h-3.5 w-3.5 text-brand-green mr-1.5 -mt-0.5" />
            <span className="font-medium">{signOff.approvedByName}</span>
            {" approved on "}
            {signOff.approvedAt ? formatStamp(signOff.approvedAt) : "an unknown date"}
            .
          </div>
        )}
      </div>

      {/* Decision panel — only when actively awaiting */}
      {isAwaitingDecision(signOff) && (
        <div className="mb-4">
          <SignOffDecisionPanel signOff={signOff} />
        </div>
      )}

      {/* Revision history */}
      <div className="mb-4">
        <SignOffRevisionTimeline signOffId={signOff.id} />
      </div>

      {/* Notes thread */}
      <SignOffNotesList signOffId={signOff.id} />

      <SignOffDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        signOff={signOff}
        onSaved={() => {
          // If they delete inside the dialog, navigate back.
          // (Otherwise no-op — store update reflects automatically.)
          if (!signOff) router.push("/project/sign-offs");
        }}
      />
    </div>
  );
}
