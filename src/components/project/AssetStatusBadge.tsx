"use client";

import {
  Inbox,
  Loader2,
  CircleDashed,
  CheckCircle2,
  AlertOctagon,
} from "lucide-react";
import {
  ASSET_GROUP_STATUS_LABEL,
  type AssetGroupStatus,
} from "@/data/assets";

const PILL: Record<AssetGroupStatus, string> = {
  requested: "bg-slate-100 text-slate-700 border border-slate-200",
  in_progress: "bg-blue-50 text-blue-700 border border-blue-200",
  partial: "bg-amber-50 text-amber-700 border border-amber-200",
  complete: "bg-brand-green/15 text-brand-green border border-brand-green/40",
  blocked: "bg-red-50 text-red-700 border border-red-200",
};

const ICON: Record<AssetGroupStatus, React.ComponentType<{ className?: string }>> = {
  requested: Inbox,
  in_progress: Loader2,
  partial: CircleDashed,
  complete: CheckCircle2,
  blocked: AlertOctagon,
};

export function AssetStatusBadge({ status }: { status: AssetGroupStatus }) {
  const Icon = ICON[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-mono uppercase tracking-[0.08em] ${PILL[status]}`}
    >
      <Icon className="h-3 w-3" />
      {ASSET_GROUP_STATUS_LABEL[status]}
    </span>
  );
}
