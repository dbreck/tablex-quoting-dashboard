"use client";

import { ExternalLink, Sparkles } from "lucide-react";
import {
  audienceLabels,
  approvalLabels,
  ownerLabels,
  type Audience,
  type SiteMapPage,
  type SiteMapGroup,
} from "@/data/site-map";
import { useContentNode } from "@/store/content-map-store";

interface Props {
  groups: SiteMapGroup[];
  visibleAudiences: Set<Audience>;
  query: string;
  onPageClick: (pageId: string) => void;
  selectedPageId: string | null;
}

const audienceBadge: Record<Audience, string> = {
  public: "bg-emerald-100 text-emerald-700",
  dealer: "bg-blue-100 text-blue-700",
  rep: "bg-teal-100 text-teal-700",
  editor: "bg-purple-100 text-purple-700",
  admin: "bg-rose-100 text-rose-700",
};

const approvalBadge = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-slate-100 text-slate-600",
  review: "bg-amber-100 text-amber-700",
} as const;

function ContentNodeLink({ nodeId }: { nodeId: string }) {
  const node = useContentNode(nodeId);
  return (
    <a
      href={`/content/map?focus=${encodeURIComponent(nodeId)}`}
      onClick={(e) => e.stopPropagation()}
      title={
        node
          ? `Open in Content Map: ${node.title}`
          : `Content node ${nodeId} not yet hydrated — open Content Map to load`
      }
      className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-brand-green font-mono"
    >
      <ExternalLink className="h-3 w-3" />
      {node ? node.title : nodeId}
    </a>
  );
}

function matchesQuery(p: SiteMapPage, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    p.label.toLowerCase().includes(needle) ||
    p.route.toLowerCase().includes(needle) ||
    (p.description?.toLowerCase().includes(needle) ?? false) ||
    (p.notes?.toLowerCase().includes(needle) ?? false)
  );
}

export function SiteMapTable({
  groups,
  visibleAudiences,
  query,
  onPageClick,
  selectedPageId,
}: Props) {
  return (
    <div className="space-y-6">
      {groups.map((g) => {
        const visiblePages = g.pages.filter(
          (p) => visibleAudiences.has(p.audience) && matchesQuery(p, query),
        );
        if (visiblePages.length === 0) return null;

        return (
          <section key={g.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {g.label}
                  </h3>
                  <span className="font-mono text-[11px] text-slate-500">
                    {g.routeGroup}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{g.description}</p>
              </div>
              <span className="text-[11px] text-slate-500 whitespace-nowrap">
                {visiblePages.length} of {g.pages.length} pages
              </span>
            </header>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-200">
                    <th className="px-4 py-2 font-medium">Route</th>
                    <th className="px-4 py-2 font-medium">Page</th>
                    <th className="px-4 py-2 font-medium">Audience</th>
                    <th className="px-4 py-2 font-medium">Owner</th>
                    <th className="px-4 py-2 font-medium">Approval</th>
                    <th className="px-4 py-2 font-medium">Content node</th>
                  </tr>
                </thead>
                <tbody>
                  {visiblePages.map((p) => {
                    const isSelected = p.id === selectedPageId;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => onPageClick(p.id)}
                        className={`border-b border-slate-100 last:border-b-0 cursor-pointer transition-colors ${
                          isSelected ? "bg-orange-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-4 py-2.5 align-top">
                          <code className="font-mono text-[11px] text-slate-700 whitespace-nowrap">
                            {p.route}
                          </code>
                        </td>
                        <td className="px-4 py-2.5 align-top">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-slate-900">
                              {p.label}
                            </span>
                            {p.isNew && (
                              <span className="inline-flex items-center gap-0.5 rounded bg-orange-100 px-1.5 py-0.5 text-[9px] font-semibold text-orange-700">
                                <Sparkles className="h-2.5 w-2.5" />
                                NEW
                              </span>
                            )}
                          </div>
                          {p.description && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {p.description}
                            </p>
                          )}
                          {p.notes && (
                            <p className="text-[11px] text-amber-700 mt-1 italic">
                              {p.notes}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-2.5 align-top">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-[11px] font-medium ${audienceBadge[p.audience]}`}
                          >
                            {audienceLabels[p.audience]}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 align-top text-xs text-slate-600">
                          {ownerLabels[p.owner]}
                        </td>
                        <td className="px-4 py-2.5 align-top">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-[11px] font-medium ${approvalBadge[p.approval]}`}
                          >
                            {approvalLabels[p.approval]}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 align-top">
                          {p.contentNodeRef ? (
                            <ContentNodeLink nodeId={p.contentNodeRef} />
                          ) : (
                            <span className="text-[11px] text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
