"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Brain,
  Check,
  Download,
  ListTree,
  Network,
  RotateCcw,
  Search as SearchIcon,
  Sparkles,
  Table as TableIcon,
  X,
} from "lucide-react";
import {
  siteMapGroups,
  computeSiteMapStats,
  audienceLabels,
  type Audience,
} from "@/data/site-map";
import { downloadSiteMapMarkdown } from "@/lib/site-map/export";
import { SiteMapFlow } from "@/components/site-map/SiteMapFlow";
import { SiteMapTable } from "@/components/site-map/SiteMapTable";
import { SiteMapTree } from "@/components/site-map/SiteMapTree";
import { SiteMapMindmap } from "@/components/site-map/SiteMapMindmap";
import {
  useApprovalsStore,
  useApprovalStats,
} from "@/store/site-map-approvals-store";

type ViewMode = "tree" | "mindmap" | "diagram" | "table";

const VIEW_TABS: Array<{
  id: ViewMode;
  label: string;
  icon: typeof Network;
  hint: string;
}> = [
  {
    id: "tree",
    label: "Tree",
    icon: ListTree,
    hint: "Expandable outline — most readable",
  },
  {
    id: "mindmap",
    label: "Mindmap",
    icon: Brain,
    hint: "Radial — full surface at a glance",
  },
  {
    id: "diagram",
    label: "Diagram",
    icon: Network,
    hint: "Hierarchical flow",
  },
  {
    id: "table",
    label: "Table",
    icon: TableIcon,
    hint: "All metadata",
  },
];

const ALL_AUDIENCES: Audience[] = [
  "public",
  "dealer",
  "rep",
  "editor",
  "admin",
];

const audienceChipColor: Record<Audience, string> = {
  public: "border-emerald-300 bg-emerald-50 text-emerald-800",
  dealer: "border-blue-300 bg-blue-50 text-blue-800",
  rep: "border-teal-300 bg-teal-50 text-teal-800",
  editor: "border-purple-300 bg-purple-50 text-purple-800",
  admin: "border-rose-300 bg-rose-50 text-rose-800",
};

export default function SiteMapClient() {
  const [view, setView] = useState<ViewMode>("tree");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );
  const [visibleAudiences, setVisibleAudiences] = useState<Set<Audience>>(
    new Set(ALL_AUDIENCES),
  );
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Tree view state — owned here so toolbar Expand/Collapse can act on it.
  const [treeExpandedGroups, setTreeExpandedGroups] = useState<Set<string>>(
    () => new Set(siteMapGroups.map((g) => g.id)),
  );
  const [treeExpandedPages, setTreeExpandedPages] = useState<Set<string>>(
    () => {
      // Default: expand pages that have children, leave leaves alone.
      const s = new Set<string>();
      for (const g of siteMapGroups) {
        for (const p of g.pages) {
          const hasChildren = g.pages.some((c) => c.parentId === p.id);
          if (hasChildren) s.add(p.id);
        }
      }
      return s;
    },
  );

  const stats = useMemo(() => computeSiteMapStats(siteMapGroups), []);
  const approvalStats = useApprovalStats(stats.totalPages);
  const clearAllApprovals = useApprovalsStore((s) => s.clearAll);

  const toggleGroup = useCallback((groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  const toggleAudience = useCallback((aud: Audience) => {
    setVisibleAudiences((prev) => {
      const next = new Set(prev);
      if (next.has(aud)) next.delete(aud);
      else next.add(aud);
      return next;
    });
  }, []);

  const toggleTreeGroup = useCallback((id: string) => {
    setTreeExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleTreePage = useCallback((id: string) => {
    setTreeExpandedPages((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    if (view === "diagram") {
      setCollapsedGroups(new Set(siteMapGroups.map((g) => g.id)));
    } else if (view === "tree") {
      setTreeExpandedGroups(new Set());
      setTreeExpandedPages(new Set());
    }
  }, [view]);

  const expandAll = useCallback(() => {
    if (view === "diagram") {
      setCollapsedGroups(new Set());
    } else if (view === "tree") {
      setTreeExpandedGroups(new Set(siteMapGroups.map((g) => g.id)));
      setTreeExpandedPages(() => {
        const s = new Set<string>();
        for (const g of siteMapGroups) for (const p of g.pages) s.add(p.id);
        return s;
      });
    }
  }, [view]);

  const showsExpandControls = view === "diagram" || view === "tree";
  const showsSearch = view === "tree" || view === "table";

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-medium">
              Website Redesign · Content
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Site Map</h1>
          <p className="mt-1 text-sm text-slate-500 max-w-3xl">
            Canonical IA for the redesigned tablex.com — every page Phase 2 will ship,
            grouped by route group and tagged by audience tier. Switch views by job:
            tree to read, mindmap to see the whole shape, diagram for flow, table for metadata.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadSiteMapMarkdown()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            title="Download a Brian-shareable Markdown of this sitemap"
          >
            <Download className="h-4 w-4" />
            Export Markdown
          </button>
        </div>
      </div>

      {/* Stat bar */}
      <div className="mb-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <Stat label="Total pages" value={stats.totalPages} />
        <Stat label="Groups" value={stats.totalGroups} />
        <Stat label="New in Phase 2" value={stats.newPages} highlight />
        <Stat
          label="Approved"
          value={approvalStats.approved}
          tone="emerald"
          icon={Check}
        />
        <Stat
          label="Rejected"
          value={approvalStats.rejected}
          tone="rose"
          icon={X}
        />
        <Stat
          label="Pending"
          value={approvalStats.pending}
          tone="slate"
        />
      </div>

      {/* Approval progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-slate-500">
            <strong className="text-slate-900">{approvalStats.pctReviewed}%</strong>{" "}
            reviewed —{" "}
            <span className="text-emerald-700 font-semibold">{approvalStats.approved} yes</span>{" "}
            ·{" "}
            <span className="text-rose-700 font-semibold">{approvalStats.rejected} no</span>{" "}
            · {approvalStats.pending} undecided
          </span>
          {(approvalStats.approved > 0 || approvalStats.rejected > 0) && (
            <button
              onClick={() => {
                if (
                  confirm(
                    "Reset every approval decision and clear all reasons? This can't be undone.",
                  )
                ) {
                  clearAllApprovals();
                }
              }}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset all
            </button>
          )}
        </div>
        <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
          {/* Approved fill */}
          <div
            className="absolute inset-y-0 left-0 bg-emerald-500 transition-all duration-300"
            style={{
              width: `${(approvalStats.approved / Math.max(1, approvalStats.total)) * 100}%`,
            }}
          />
          {/* Rejected fill */}
          <div
            className="absolute inset-y-0 bg-rose-500 transition-all duration-300"
            style={{
              left: `${(approvalStats.approved / Math.max(1, approvalStats.total)) * 100}%`,
              width: `${(approvalStats.rejected / Math.max(1, approvalStats.total)) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Toolbar — Row 1: tabs + actions */}
      <div className="mb-2 rounded-xl border border-slate-200 bg-white p-3 flex flex-col lg:flex-row lg:items-center gap-3">
        {/* View toggle — 4 tabs */}
        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
          {VIEW_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = view === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                title={tab.hint}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 ml-auto flex-wrap">
          {showsExpandControls && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={expandAll}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Expand all
              </button>
              <span className="text-slate-300">·</span>
              <button
                onClick={collapseAll}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Collapse all
              </button>
            </div>
          )}

          {showsSearch && (
            <div className="relative w-full lg:w-72">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter routes / pages…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
              />
            </div>
          )}
        </div>
      </div>

      {/* Toolbar — Row 2: audience filter chips */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
          Audience
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {ALL_AUDIENCES.map((aud) => {
            const active = visibleAudiences.has(aud);
            return (
              <button
                key={aud}
                onClick={() => toggleAudience(aud)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all ${
                  active
                    ? audienceChipColor[aud]
                    : "border-slate-200 bg-white text-slate-400 line-through"
                }`}
              >
                {audienceLabels[aud]}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => {
            const allOn = ALL_AUDIENCES.every((a) => visibleAudiences.has(a));
            ALL_AUDIENCES.forEach((a) => {
              if (allOn) toggleAudience(a);
              else if (!visibleAudiences.has(a)) toggleAudience(a);
            });
          }}
          className="ml-auto text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
        >
          {ALL_AUDIENCES.every((a) => visibleAudiences.has(a)) ? "Hide all" : "Show all"}
        </button>
      </div>

      {/* Main view */}
      {view === "tree" && (
        <SiteMapTree
          groups={siteMapGroups}
          visibleAudiences={visibleAudiences}
          query={query}
          selectedPageId={selectedPageId}
          onPageClick={setSelectedPageId}
          expandedGroups={treeExpandedGroups}
          expandedPages={treeExpandedPages}
          onToggleGroup={toggleTreeGroup}
          onTogglePage={toggleTreePage}
        />
      )}

      {view === "mindmap" && (
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white overflow-hidden h-[calc(100vh-300px)] min-h-[600px]">
          <SiteMapMindmap
            visibleAudiences={visibleAudiences}
            selectedPageId={selectedPageId}
            onPageClick={setSelectedPageId}
          />
        </div>
      )}

      {view === "diagram" && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden h-[calc(100vh-300px)] min-h-[480px]">
          <SiteMapFlow
            collapsedGroups={collapsedGroups}
            visibleAudiences={visibleAudiences}
            selectedPageId={selectedPageId}
            onToggleGroup={toggleGroup}
            onPageClick={setSelectedPageId}
          />
        </div>
      )}

      {view === "table" && (
        <SiteMapTable
          groups={siteMapGroups}
          visibleAudiences={visibleAudiences}
          query={query}
          onPageClick={setSelectedPageId}
          selectedPageId={selectedPageId}
        />
      )}

      {/* Footer note */}
      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 leading-relaxed">
        <p className="flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-900">No checkout.</strong> The conversion event is{" "}
            <span className="font-mono text-[11px] bg-white px-1 py-0.5 rounded border border-slate-200">/quote/submit</span>{" "}
            (Submit Quote Request). The cart at{" "}
            <span className="font-mono text-[11px] bg-white px-1 py-0.5 rounded border border-slate-200">/quote/cart</span>{" "}
            holds in-progress configurations the user wants to come back to —
            it resolves into a quote request, never an order.{" "}
            <strong className="text-slate-900">Spex Studio</strong> lives at{" "}
            <span className="font-mono text-[11px] bg-white px-1 py-0.5 rounded border border-slate-200">/spex-studio/:seriesId</span>;
            series detail pages link in.
          </span>
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  tone?: "emerald" | "rose" | "slate";
  icon?: typeof Check;
}) {
  let containerClass = "border-slate-200 bg-white";
  let labelClass = "text-slate-500";
  let valueClass = "text-slate-900";

  if (highlight) {
    containerClass = "border-orange-200 bg-orange-50";
    labelClass = "text-orange-700";
    valueClass = "text-orange-900";
  } else if (tone === "emerald") {
    containerClass = "border-emerald-200 bg-emerald-50/60";
    labelClass = "text-emerald-700";
    valueClass = "text-emerald-900";
  } else if (tone === "rose") {
    containerClass = "border-rose-200 bg-rose-50/60";
    labelClass = "text-rose-700";
    valueClass = "text-rose-900";
  }

  return (
    <div className={`rounded-lg border px-3 py-2 ${containerClass}`}>
      <div
        className={`text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1 ${labelClass}`}
      >
        {Icon && <Icon className="h-2.5 w-2.5" strokeWidth={3} />}
        {label}
      </div>
      <div className={`mt-0.5 text-xl font-bold ${valueClass}`}>{value}</div>
    </div>
  );
}
