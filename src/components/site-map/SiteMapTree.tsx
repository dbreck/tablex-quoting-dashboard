"use client";

import { useMemo } from "react";
import {
  ChevronRight,
  ExternalLink,
  Sparkles,
  Eye,
  EyeOff,
  Hash,
  Check,
  X,
} from "lucide-react";
import {
  audienceLabels,
  ownerLabels,
  type Audience,
  type SiteMapGroup,
  type SiteMapPage,
} from "@/data/site-map";
import { useContentNode } from "@/store/content-map-store";
import {
  useApprovalDecision,
  useApprovalsStore,
  useGroupApprovalRollup,
} from "@/store/site-map-approvals-store";
import { ApprovalControls } from "./ApprovalControls";

interface Props {
  groups: SiteMapGroup[];
  visibleAudiences: Set<Audience>;
  query: string;
  selectedPageId: string | null;
  onPageClick: (pageId: string) => void;
  expandedGroups: Set<string>;
  expandedPages: Set<string>;
  onToggleGroup: (id: string) => void;
  onTogglePage: (id: string) => void;
}

interface PageNode {
  page: SiteMapPage;
  children: PageNode[];
}

function buildTree(group: SiteMapGroup): PageNode[] {
  const byParent = new Map<string | null, SiteMapPage[]>();
  for (const page of group.pages) {
    const parent = page.parentId ?? null;
    const list = byParent.get(parent);
    if (list) list.push(page);
    else byParent.set(parent, [page]);
  }

  function buildAt(parent: string | null): PageNode[] {
    return (byParent.get(parent) ?? []).map((page) => ({
      page,
      children: buildAt(page.id),
    }));
  }

  return buildAt(null);
}

const audienceBadgeBg: Record<Audience, string> = {
  public: "bg-emerald-100 text-emerald-700",
  dealer: "bg-blue-100 text-blue-700",
  rep: "bg-teal-100 text-teal-700",
  editor: "bg-purple-100 text-purple-700",
  admin: "bg-rose-100 text-rose-700",
};

const audienceStripe: Record<Audience, string> = {
  public: "bg-emerald-500",
  dealer: "bg-blue-500",
  rep: "bg-teal-500",
  editor: "bg-purple-500",
  admin: "bg-rose-500",
};

function matches(p: SiteMapPage, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    p.label.toLowerCase().includes(needle) ||
    p.route.toLowerCase().includes(needle) ||
    (p.description?.toLowerCase().includes(needle) ?? false) ||
    (p.notes?.toLowerCase().includes(needle) ?? false)
  );
}

/** A page node passes the filter if it matches OR any descendant matches. */
function nodeMatches(node: PageNode, q: string): boolean {
  if (matches(node.page, q)) return true;
  return node.children.some((c) => nodeMatches(c, q));
}

function ContentNodeBadge({ nodeId }: { nodeId: string }) {
  const node = useContentNode(nodeId);
  return (
    <a
      href={`/content/map?focus=${encodeURIComponent(nodeId)}`}
      onClick={(e) => e.stopPropagation()}
      title={
        node
          ? `Open in Content Map: ${node.title}`
          : `Content node ${nodeId} not yet hydrated`
      }
      className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-orange-500 font-mono transition-colors"
    >
      <ExternalLink className="h-2.5 w-2.5" />
      <span className="hidden lg:inline">linked</span>
    </a>
  );
}

interface RowProps {
  node: PageNode;
  depth: number;
  expandedPages: Set<string>;
  onTogglePage: (id: string) => void;
  selectedPageId: string | null;
  visibleAudiences: Set<Audience>;
  query: string;
  onPageClick: (id: string) => void;
}

function PageRow({
  node,
  depth,
  expandedPages,
  onTogglePage,
  selectedPageId,
  visibleAudiences,
  query,
  onPageClick,
}: RowProps) {
  const { page, children } = node;
  const hasChildren = children.length > 0;
  const expanded = expandedPages.has(page.id);
  const dimmed = !visibleAudiences.has(page.audience);
  const selected = page.id === selectedPageId;
  const decision = useApprovalDecision(page.id);
  const setDecision = useApprovalsStore((s) => s.setDecision);
  const clearApproval = useApprovalsStore((s) => s.clear);
  const isApproved = decision === "approved";
  const isRejected = decision === "rejected";

  const rowBg = selected
    ? "bg-orange-50 ring-1 ring-orange-300"
    : isApproved
      ? "hover:bg-emerald-50/60"
      : isRejected
        ? "hover:bg-rose-50/60"
        : "hover:bg-slate-50";

  return (
    <>
      <div
        role="treeitem"
        aria-expanded={hasChildren ? expanded : undefined}
        aria-selected={selected}
        tabIndex={0}
        onClick={() => onPageClick(page.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onPageClick(page.id);
          } else if (e.key === "ArrowRight" && hasChildren && !expanded) {
            e.preventDefault();
            onTogglePage(page.id);
          } else if (e.key === "ArrowLeft" && hasChildren && expanded) {
            e.preventDefault();
            onTogglePage(page.id);
          } else if ((e.key === "y" || e.key === "Y") && !e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            setDecision(page.id, "approved");
          } else if ((e.key === "n" || e.key === "N") && !e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            setDecision(page.id, "rejected");
          } else if (e.key === "r" || e.key === "R") {
            e.preventDefault();
            clearApproval(page.id);
          }
        }}
        className={`group relative grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-md px-2 py-1.5 cursor-pointer transition-colors ${rowBg} ${
          dimmed ? "opacity-40" : ""
        }`}
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        {/* Indent guide lines */}
        {Array.from({ length: depth }).map((_, i) => (
          <span
            key={i}
            className="absolute top-0 bottom-0 w-px bg-slate-200 pointer-events-none"
            style={{ left: `${i * 24 + 18}px` }}
            aria-hidden
          />
        ))}

        {/* Decision color stripe on the leftmost border */}
        {(isApproved || isRejected) && (
          <span
            aria-hidden
            className={`absolute left-0 top-1 bottom-1 w-0.5 rounded-full ${
              isApproved ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
        )}

        {/* Chevron / leaf dot */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onTogglePage(page.id);
          }}
          className={`flex h-5 w-5 items-center justify-center rounded transition-colors ${
            hasChildren
              ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              : "text-slate-300 cursor-default"
          }`}
          aria-label={hasChildren ? (expanded ? "Collapse" : "Expand") : undefined}
          tabIndex={-1}
        >
          {hasChildren ? (
            <ChevronRight
              className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`}
            />
          ) : (
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isApproved
                  ? "bg-emerald-400"
                  : isRejected
                    ? "bg-rose-400"
                    : "bg-slate-300"
              }`}
            />
          )}
        </button>

        {/* Label + route */}
        <div className="min-w-0 flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium truncate transition-colors ${
                isRejected
                  ? "text-slate-400 line-through decoration-rose-400 decoration-2"
                  : "text-slate-900"
              }`}
            >
              {page.label}
            </span>
            {page.isNew && (
              <span className="inline-flex items-center gap-0.5 rounded bg-orange-100 px-1.5 py-0.5 text-[9px] font-semibold text-orange-700">
                <Sparkles className="h-2.5 w-2.5" />
                NEW
              </span>
            )}
            <code
              className={`font-mono text-[10px] truncate ${
                isRejected ? "text-slate-300 line-through" : "text-slate-400"
              }`}
            >
              {page.route}
            </code>
          </div>
          {page.description && (
            <p
              className={`text-[11px] truncate ${
                isRejected ? "text-slate-300" : "text-slate-500"
              }`}
            >
              {page.description}
            </p>
          )}
        </div>

        {/* Right-rail metadata */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${audienceBadgeBg[page.audience]}`}
            title={`Audience: ${audienceLabels[page.audience]}`}
          >
            {audienceLabels[page.audience]}
          </span>
          <span
            className="text-[10px] text-slate-400 hidden md:inline"
            title={ownerLabels[page.owner]}
          >
            {page.owner === "payload" ? "Payload" : "Dynamic"}
          </span>
          {page.contentNodeRef && <ContentNodeBadge nodeId={page.contentNodeRef} />}
        </div>

        {/* Approval controls — Y/N + note popover */}
        <ApprovalControls pageId={page.id} pageLabel={page.label} />
      </div>

      {hasChildren && expanded && (
        <div role="group">
          {children
            .filter((c) => nodeMatches(c, query))
            .map((child) => (
              <PageRow
                key={child.page.id}
                node={child}
                depth={depth + 1}
                expandedPages={expandedPages}
                onTogglePage={onTogglePage}
                selectedPageId={selectedPageId}
                visibleAudiences={visibleAudiences}
                query={query}
                onPageClick={onPageClick}
              />
            ))}
        </div>
      )}
    </>
  );
}

export function SiteMapTree({
  groups,
  visibleAudiences,
  query,
  selectedPageId,
  onPageClick,
  expandedGroups,
  expandedPages,
  onToggleGroup,
  onTogglePage,
}: Props) {
  // When the user types in search, auto-expand groups whose subtree contains
  // a match. Don't permanently mutate user state — just reveal hits.
  const searchExpandedGroups = useMemo(() => {
    if (!query) return null;
    return new Set(
      groups
        .filter((g) => g.pages.some((p) => matches(p, query)))
        .map((g) => g.id),
    );
  }, [query, groups]);

  const searchExpandedPages = useMemo(() => {
    if (!query) return null;
    const s = new Set<string>();
    for (const g of groups) {
      for (const p of g.pages) {
        if (matches(p, query) && p.parentId) {
          // walk up parent chain
          let curr: string | null = p.parentId;
          while (curr) {
            s.add(curr);
            const parent = g.pages.find((x) => x.id === curr);
            curr = parent?.parentId ?? null;
          }
        }
      }
    }
    return s;
  }, [query, groups]);

  const effectiveExpandedPages = useMemo(() => {
    if (!searchExpandedPages) return expandedPages;
    if (searchExpandedPages.size === 0) return expandedPages;
    const merged = new Set(expandedPages);
    for (const id of searchExpandedPages) merged.add(id);
    return merged;
  }, [expandedPages, searchExpandedPages]);

  const trees = useMemo(
    () => groups.map((g) => ({ group: g, tree: buildTree(g) })),
    [groups],
  );

  const totalMatches = trees.reduce(
    (n, { tree }) => n + tree.filter((t) => nodeMatches(t, query)).length,
    0,
  );

  return (
    <div role="tree" className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {trees.map(({ group, tree }) => {
        const visiblePages = tree.filter((node) => nodeMatches(node, query));
        const hasResults = visiblePages.length > 0;
        const isOpen =
          (searchExpandedGroups?.has(group.id) ?? false) ||
          expandedGroups.has(group.id);

        if (query && !hasResults) return null;

        const visibleCount = group.pages.filter(
          (p) => visibleAudiences.has(p.audience) && matches(p, query),
        ).length;

        return (
          <GroupSection
            key={group.id}
            group={group}
            tree={tree}
            visiblePages={visiblePages}
            visibleCount={visibleCount}
            isOpen={isOpen}
            onToggle={() => onToggleGroup(group.id)}
            audienceStripe={audienceStripe}
          >

            {/* Group body */}
            {isOpen && (
              <div className="py-1.5">
                {visiblePages.length === 0 ? (
                  <div className="px-6 py-3 text-xs text-slate-400 italic flex items-center gap-2">
                    <EyeOff className="h-3.5 w-3.5" />
                    No pages match the current filter
                  </div>
                ) : (
                  visiblePages.map((node) => (
                    <PageRow
                      key={node.page.id}
                      node={node}
                      depth={0}
                      expandedPages={effectiveExpandedPages}
                      onTogglePage={onTogglePage}
                      selectedPageId={selectedPageId}
                      visibleAudiences={visibleAudiences}
                      query={query}
                      onPageClick={onPageClick}
                    />
                  ))
                )}
              </div>
            )}
          </GroupSection>
        );
      })}

      {query && totalMatches === 0 && (
        <div className="px-6 py-12 text-center text-sm text-slate-400">
          <Eye className="h-5 w-5 mx-auto mb-2 text-slate-300" />
          No pages match &ldquo;{query}&rdquo;.
        </div>
      )}
    </div>
  );
}

interface GroupSectionProps {
  group: SiteMapGroup;
  tree: PageNode[];
  visiblePages: PageNode[];
  visibleCount: number;
  isOpen: boolean;
  onToggle: () => void;
  audienceStripe: Record<Audience, string>;
  children: React.ReactNode;
}

function GroupSection({
  group,
  visibleCount,
  isOpen,
  onToggle,
  audienceStripe,
  children,
}: GroupSectionProps) {
  const allPageIds = useMemo(
    () => group.pages.map((p) => p.id),
    [group.pages],
  );
  const rollup = useGroupApprovalRollup(allPageIds);
  const reviewedTotal = rollup.approved + rollup.rejected;
  const allApproved =
    reviewedTotal === group.pages.length && rollup.rejected === 0;

  return (
    <section className="border-b border-slate-200 last:border-b-0">
      {/* Group header */}
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left ${
          allApproved
            ? "bg-emerald-50/60 hover:bg-emerald-100/60"
            : "bg-slate-50 hover:bg-slate-100"
        }`}
        aria-expanded={isOpen}
      >
        <div
          className={`h-8 w-1 rounded-full ${audienceStripe[group.audience]}`}
          aria-hidden
        />
        <ChevronRight
          className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? "rotate-90" : ""}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-slate-900">{group.label}</h3>
            <code className="font-mono text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
              {group.routeGroup}
            </code>
            {allApproved && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500 text-white px-1.5 py-0.5 text-[9px] font-semibold">
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
                ALL APPROVED
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">
            {group.description}
          </p>
        </div>

        {/* Approval rollup chips */}
        <div className="flex items-center gap-1.5 shrink-0">
          {rollup.approved > 0 && (
            <span
              className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 text-emerald-700 px-1.5 py-0.5 text-[10px] font-semibold"
              title={`${rollup.approved} approved`}
            >
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
              {rollup.approved}
            </span>
          )}
          {rollup.rejected > 0 && (
            <span
              className="inline-flex items-center gap-0.5 rounded-full bg-rose-100 text-rose-700 px-1.5 py-0.5 text-[10px] font-semibold"
              title={`${rollup.rejected} rejected`}
            >
              <X className="h-2.5 w-2.5" strokeWidth={3} />
              {rollup.rejected}
            </span>
          )}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 ml-1">
            <Hash className="h-3 w-3" />
            <span>
              {visibleCount}
              {visibleCount !== group.pages.length && (
                <span className="text-slate-400"> / {group.pages.length}</span>
              )}
            </span>
          </div>
        </div>
      </button>

      {children}
    </section>
  );
}
