"use client";

import { Circle, Eye, CheckCircle2, XCircle } from "lucide-react";
import {
  ASSET_ITEM_STATUS_LABEL,
  type AssetItemStatus,
} from "@/data/assets";

const PILL: Record<AssetItemStatus, string> = {
  outstanding: "bg-slate-100 text-slate-700",
  in_review: "bg-blue-50 text-blue-700",
  complete: "bg-brand-green/15 text-brand-green",
  rejected: "bg-red-50 text-red-700",
};

const ICON: Record<AssetItemStatus, React.ComponentType<{ className?: string }>> = {
  outstanding: Circle,
  in_review: Eye,
  complete: CheckCircle2,
  rejected: XCircle,
};

export function AssetItemStatusBadge({ status }: { status: AssetItemStatus }) {
  const Icon = ICON[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${PILL[status]}`}
    >
      <Icon className="h-3 w-3" />
      {ASSET_ITEM_STATUS_LABEL[status]}
    </span>
  );
}
