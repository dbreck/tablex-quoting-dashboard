"use client";

import { ExternalLink, FileSpreadsheet } from "lucide-react";
import { itemCounts, type AssetGroup } from "@/data/assets";
import { DELIVERABLES } from "@/data/project-phase2";
import { AssetStatusBadge } from "@/components/project/AssetStatusBadge";

interface AssetCardProps {
  group: AssetGroup;
  onClick: () => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
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

export function AssetCard({ group, onClick }: AssetCardProps) {
  const counts = itemCounts(group.items);
  const dName = deliverableName(group.deliverableId);
  const pct = counts.total === 0 ? 0 : Math.round((counts.complete / counts.total) * 100);

  return (
    <li className="rounded-lg border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all">
      <button
        type="button"
        onClick={onClick}
        className="block w-full text-left px-4 py-3"
      >
        <div className="flex items-start gap-3">
          <AssetStatusBadge status={group.status} />

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="text-sm font-medium text-slate-900 truncate">
                {group.name}
              </h3>
              {group.category && (
                <span className="text-[10px] uppercase tracking-wider text-slate-400">
                  {group.category}
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              {group.vendor && <span>by {group.vendor}</span>}
              {dName && <span className="truncate">↳ {dName}</span>}
              {group.sourceUrl && (
                <span className="inline-flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  folder
                </span>
              )}
              {group.spreadsheetUrl && (
                <span className="inline-flex items-center gap-1">
                  <FileSpreadsheet className="h-3 w-3" />
                  sheet
                </span>
              )}
              <span className="ml-auto">updated {formatDate(group.updatedAt)}</span>
            </div>

            {/* Progress bar — only when there are items */}
            {counts.total > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-brand-green transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                  {counts.complete} / {counts.total}
                </span>
              </div>
            )}
          </div>
        </div>
      </button>
    </li>
  );
}
