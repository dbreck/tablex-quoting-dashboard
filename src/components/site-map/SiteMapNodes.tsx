"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ChevronDown, ChevronRight, ExternalLink, Sparkles } from "lucide-react";
import { audienceLabels } from "@/data/site-map";
import {
  GROUP_NODE_HEIGHT,
  GROUP_NODE_WIDTH,
  PAGE_NODE_HEIGHT,
  PAGE_NODE_WIDTH,
  type SiteMapGroupNodeData,
  type SiteMapPageNodeData,
} from "@/lib/site-map/flow";

interface GroupProps extends NodeProps {
  data: SiteMapGroupNodeData;
}

interface PageProps extends NodeProps {
  data: SiteMapPageNodeData;
}

export interface SiteMapNodeCallbacks {
  onToggleGroup: (groupId: string) => void;
  onPageClick: (pageId: string) => void;
  isGroupCollapsed: (groupId: string) => boolean;
  isPageDimmed: (page: SiteMapPageNodeData["page"]) => boolean;
  isPageSelected: (pageId: string) => boolean;
}

let callbacks: SiteMapNodeCallbacks | null = null;
export function setSiteMapNodeCallbacks(cb: SiteMapNodeCallbacks) {
  callbacks = cb;
}

export function GroupNode({ data }: GroupProps) {
  const collapsed = callbacks?.isGroupCollapsed(data.groupId) ?? false;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => callbacks?.onToggleGroup(data.groupId)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          callbacks?.onToggleGroup(data.groupId);
        }
      }}
      className="rounded-xl border-2 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      style={{
        width: GROUP_NODE_WIDTH,
        height: GROUP_NODE_HEIGHT,
        borderColor: data.color,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ visibility: "hidden" }}
      />
      <div className="flex h-full flex-col px-3 py-2">
        <div className="flex items-center gap-2">
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
          )}
          <span
            className="text-[10px] uppercase tracking-widest font-semibold"
            style={{ color: data.color }}
          >
            {audienceLabels[data.audience]}
          </span>
          <span className="ml-auto text-[10px] text-slate-400 font-mono">
            {data.routeGroup}
          </span>
        </div>
        <div className="mt-0.5 text-sm font-bold text-slate-900 truncate">
          {data.label}
        </div>
        <div className="mt-auto flex items-center justify-between text-[11px] text-slate-500">
          <span>
            {data.pageCount} {data.pageCount === 1 ? "page" : "pages"}
          </span>
          <span className="text-slate-400 italic">
            {collapsed ? "click to expand" : "click to collapse"}
          </span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ visibility: "hidden" }}
      />
    </div>
  );
}

export function PageNode({ data }: PageProps) {
  const dimmed = callbacks?.isPageDimmed(data.page) ?? false;
  const selected = callbacks?.isPageSelected(data.page.id) ?? false;
  const p = data.page;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => callbacks?.onPageClick(p.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          callbacks?.onPageClick(p.id);
        }
      }}
      className={`rounded-lg border bg-white shadow-sm hover:shadow-md transition-all cursor-pointer ${
        selected ? "ring-2 ring-brand-green" : ""
      } ${dimmed ? "opacity-30" : "opacity-100"}`}
      style={{
        width: PAGE_NODE_WIDTH,
        height: PAGE_NODE_HEIGHT,
        borderColor: selected ? "#FF6902" : "#e2e8f0",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ visibility: "hidden" }}
      />
      <div className="flex h-full flex-col px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-slate-500 truncate flex-1">
            {p.route}
          </span>
          {p.isNew && (
            <span
              title="Net-new in Phase 2"
              className="flex items-center gap-0.5 rounded bg-orange-100 px-1 py-0.5 text-[9px] font-semibold text-orange-700"
            >
              <Sparkles className="h-2.5 w-2.5" />
              NEW
            </span>
          )}
        </div>
        <div className="mt-1 text-[13px] font-semibold text-slate-900 leading-tight line-clamp-2">
          {p.label}
        </div>
        <div className="mt-auto flex items-center justify-between text-[10px]">
          <span
            className="rounded px-1.5 py-0.5 font-medium"
            style={{
              backgroundColor:
                p.audience === "public"
                  ? "#d1fae5"
                  : p.audience === "dealer"
                    ? "#dbeafe"
                    : p.audience === "rep"
                      ? "#ccfbf1"
                      : p.audience === "editor"
                        ? "#f3e8ff"
                        : "#ffe4e6",
              color:
                p.audience === "public"
                  ? "#047857"
                  : p.audience === "dealer"
                    ? "#1d4ed8"
                    : p.audience === "rep"
                      ? "#0f766e"
                      : p.audience === "editor"
                        ? "#7e22ce"
                        : "#be123c",
            }}
          >
            {audienceLabels[p.audience]}
          </span>
          {p.contentNodeRef && (
            <span
              title={`Linked to content node: ${p.contentNodeRef}`}
              className="flex items-center gap-0.5 text-slate-400"
            >
              <ExternalLink className="h-2.5 w-2.5" />
              <span className="font-mono text-[9px]">linked</span>
            </span>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ visibility: "hidden" }}
      />
    </div>
  );
}
