"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  FileEdit,
  Send,
  Plus,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSignOffs } from "@/store/sign-offs-store";
import { SignOffDialog } from "@/components/project/SignOffDialog";
import {
  SIGN_OFF_STATUS_LABEL,
  type SignOff,
  type SignOffStatus,
} from "@/data/sign-offs";
import { DELIVERABLES } from "@/data/project-phase2";

const STATUS_PILL: Record<SignOffStatus, string> = {
  draft:
    "bg-slate-100 text-slate-700 border border-slate-200",
  sent:
    "bg-blue-50 text-blue-700 border border-blue-200",
  changes_requested:
    "bg-amber-50 text-amber-700 border border-amber-200",
  approved:
    "bg-brand-green/15 text-brand-green border border-brand-green/40",
};

const STATUS_ICON: Record<SignOffStatus, React.ComponentType<{ className?: string }>> = {
  draft: FileEdit,
  sent: Send,
  changes_requested: AlertTriangle,
  approved: CheckCircle2,
};

const STATUS_FILTERS: { id: "all" | SignOffStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "draft", label: "Drafts" },
  { id: "sent", label: "Awaiting" },
  { id: "changes_requested", label: "Changes requested" },
  { id: "approved", label: "Approved" },
];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function deliverableName(id: string | undefined): string | null {
  if (!id) return null;
  const d = DELIVERABLES.find((x) => x.id === id);
  return d ? d.name : id;
}

export default function SignOffsPage() {
  const signOffs = useSignOffs();
  const [filter, setFilter] = useState<"all" | SignOffStatus>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SignOff | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return signOffs;
    return signOffs.filter((s) => s.status === filter);
  }, [signOffs, filter]);

  const counts = useMemo(() => {
    const c: Record<SignOffStatus | "all", number> = {
      all: signOffs.length,
      draft: 0,
      sent: 0,
      changes_requested: 0,
      approved: 0,
    };
    for (const s of signOffs) c[s.status]++;
    return c;
  }, [signOffs]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/50 font-medium mb-1">
            Project · Sign-Offs
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Client Sign-Offs
          </h1>
          <p className="mt-1.5 text-sm text-white/60 max-w-2xl">
            Send deliverables to the client for formal review. Approved sign-offs
            are locked; &ldquo;Needs Edits&rdquo; reopens the same record on a new
            revision.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          New Sign-Off
        </Button>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {STATUS_FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors border ${
                active
                  ? "bg-brand-green/10 text-brand-green border-brand-green/40"
                  : "bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/5 border-white/10"
              }`}
            >
              <span>{f.label}</span>
              <span className="font-mono text-[10px] opacity-70">
                {counts[f.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] py-12 text-center">
          <p className="text-sm text-white/50">
            {filter === "all"
              ? "No sign-offs yet. Click 'New Sign-Off' to start."
              : `No sign-offs in status ${SIGN_OFF_STATUS_LABEL[filter as SignOffStatus]}.`}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((s) => {
            const Icon = STATUS_ICON[s.status];
            const dName = deliverableName(s.deliverableId);
            return (
              <li
                key={s.id}
                className="group rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
              >
                <Link
                  href={`/project/sign-offs/${s.id}`}
                  className="block px-4 py-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-mono uppercase tracking-[0.08em] ${STATUS_PILL[s.status]}`}
                    >
                      <Icon className="h-3 w-3" />
                      {SIGN_OFF_STATUS_LABEL[s.status]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h3 className="text-sm font-medium text-white truncate">
                          {s.title}
                        </h3>
                        {s.revisionNumber > 1 && (
                          <span className="text-[10px] font-mono text-white/40">
                            r{s.revisionNumber}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-white/50">
                        {dName && (
                          <span className="truncate">↳ {dName}</span>
                        )}
                        {s.links.length > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            {s.links.length} link{s.links.length === 1 ? "" : "s"}
                          </span>
                        )}
                        <span className="ml-auto">
                          updated {formatDate(s.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <SignOffDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        signOff={editing}
      />
    </div>
  );
}
