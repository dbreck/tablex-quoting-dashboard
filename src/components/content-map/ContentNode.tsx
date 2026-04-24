"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Lock, Sparkles, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useContentMapStore,
  useIsNodeExpanded,
} from "@/store/content-map-store";
import type { ContentNode as ContentNodeData } from "@/lib/supabase/content-map-converters";

// Color → stripe classes (mirrors the palette used on SiteArchitectureClient).
const stripeByColor: Record<string, string> = {
  green: "bg-green-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  slate: "bg-slate-400",
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
  indigo: "bg-indigo-500",
  blue: "bg-blue-500",
  teal: "bg-teal-500",
};

const stripeClass = (color: string | null | undefined) =>
  (color && stripeByColor[color]) ?? "bg-slate-300";

export interface ContentNodeRFData extends Record<string, unknown> {
  node: ContentNodeData;
  selected?: boolean;
}

export function ContentNodeComponent({ data, selected }: NodeProps) {
  const n = (data as ContentNodeRFData).node;
  const isRoot = n.kind === "root";
  const hasBody = !!(n.body && n.body.trim().length > 0);
  const expanded = useIsNodeExpanded(n.id);
  const toggleExpanded = useContentMapStore((s) => s.toggleExpanded);

  return (
    <div
      className={cn(
        "rounded-xl bg-white border-2 shadow-sm overflow-hidden w-[220px] transition-all",
        selected
          ? "border-brand-green shadow-lg shadow-brand-green/10"
          : "border-slate-200 hover:border-slate-300",
        isRoot && "ring-2 ring-offset-2 ring-brand-navy/30",
      )}
    >
      {/* Top handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-slate-400 !w-2 !h-2 !border-white"
      />

      {/* Color stripe */}
      <div className={cn("h-1.5 w-full", stripeClass(n.color))} />

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "text-[13px] font-semibold text-slate-900 leading-tight line-clamp-2 break-words",
              isRoot && "text-sm",
            )}
          >
            {n.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            {n.isNew && (
              <span
                title="New"
                className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-emerald-500/10"
              >
                <Sparkles className="h-2.5 w-2.5 text-emerald-500" />
              </span>
            )}
            {n.authGate && (
              <span
                title={`Auth: ${n.authGate}`}
                className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-500/10"
              >
                <Lock className="h-2.5 w-2.5 text-blue-500" />
              </span>
            )}
            {hasBody && (
              <button
                type="button"
                title={expanded ? "Collapse content" : "Expand content"}
                onClick={(e) => {
                  // Stop propagation so the canvas doesn't treat this as a
                  // node click (which would select / deselect).
                  e.stopPropagation();
                  toggleExpanded(n.id);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                // nodrag / nopan prevents React Flow from treating the click
                // as the start of a drag on the node.
                className="nodrag nopan inline-flex items-center justify-center h-4 w-4 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                {expanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            )}
          </div>
        </div>

        {n.body && (
          <p
            className={cn(
              "text-[10.5px] text-slate-500 mt-1.5 leading-snug whitespace-pre-wrap break-words",
              expanded ? "" : "line-clamp-2",
            )}
          >
            {n.body}
          </p>
        )}

        <div className="flex items-center gap-1.5 mt-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
              n.kind === "root"
                ? "bg-slate-900 text-white"
                : n.kind === "section"
                  ? "bg-slate-100 text-slate-600"
                  : n.kind === "utility"
                    ? "bg-blue-50 text-blue-600"
                    : n.kind === "note"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-emerald-50 text-emerald-600",
            )}
          >
            {n.kind}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-slate-400 !w-2 !h-2 !border-white"
      />
    </div>
  );
}
