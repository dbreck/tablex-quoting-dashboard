"use client";

import { CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { useSignOffRevisions } from "@/store/sign-offs-store";

interface SignOffRevisionTimelineProps {
  signOffId: string;
}

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

export function SignOffRevisionTimeline({ signOffId }: SignOffRevisionTimelineProps) {
  const revisions = useSignOffRevisions(signOffId);

  if (revisions.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-500 mb-2">
          Decision history
        </h3>
        <p className="text-sm text-slate-500">
          No decisions recorded yet — the reviewer hasn&rsquo;t responded.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-500 mb-4">
        Decision history
      </h3>
      <ol className="space-y-4">
        {revisions.map((r) => {
          const approved = r.decision === "approved";
          return (
            <li
              key={r.id}
              className={`relative pl-7 pb-4 last:pb-0 border-l-2 ${
                approved ? "border-brand-green/50" : "border-amber-300"
              }`}
            >
              <span
                className={`absolute -left-[9px] top-0 flex items-center justify-center w-4 h-4 rounded-full ${
                  approved ? "bg-brand-green text-black" : "bg-amber-400 text-amber-950"
                }`}
              >
                {approved ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <AlertTriangle className="h-3 w-3" />
                )}
              </span>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  className={`text-xs font-mono uppercase tracking-[0.1em] font-semibold ${
                    approved ? "text-brand-green" : "text-amber-700"
                  }`}
                >
                  {approved ? "Approved" : "Changes requested"}
                </span>
                <span className="text-xs text-slate-500">
                  · revision {r.revisionNumber}
                </span>
                <span className="text-xs text-slate-400 ml-auto">
                  {formatStamp(r.decidedAt)}
                </span>
              </div>
              <div className="mt-1 text-sm text-slate-900">
                {r.decidedByName}
              </div>
              {r.decidedNotes && (
                <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap rounded-md bg-slate-50 border border-slate-100 px-3 py-2">
                  {r.decidedNotes}
                </p>
              )}
              {r.linksSnapshot && r.linksSnapshot.length > 0 && (
                <details className="mt-2 text-xs text-slate-500">
                  <summary className="cursor-pointer hover:text-slate-700">
                    {r.linksSnapshot.length} link
                    {r.linksSnapshot.length === 1 ? "" : "s"} reviewed at this
                    decision
                  </summary>
                  <ul className="mt-1 ml-4 space-y-0.5">
                    {r.linksSnapshot.map((l, i) => (
                      <li key={i}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-brand-green hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {l.label || l.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
