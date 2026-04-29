"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Maximize2,
  X,
  LayoutTemplate,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";

type SetKey = "site" | "system";

interface WireframeComment {
  id: string;
  page_path: string;
  set_key: SetKey;
  page_id: string;
  marker_x: number;
  marker_y: number;
  body: string;
  author: string;
  is_resolved: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const SETS: Record<
  SetKey,
  {
    url: string;
    label: string;
    eyebrow: string;
    title: string;
    description: string;
    badges: { label: string; variant?: "secondary" | "outline"; className?: string }[];
    sections?: { hash: string; num: string; label: string }[];
    pageLabels: Record<string, string>;
  }
> = {
  site: {
    url: "/wireframes/site.html",
    label: "Site wireframes",
    eyebrow: "Website Redesign · Self-Service CPQ · Apr 2026",
    title: "Site Wireframes",
    description:
      "Page-level wireframes for tablex.com — marketing, discovery, action, and portals. Use the left rail inside the canvas to jump between pages.",
    badges: [
      { label: "17 pages" },
      { label: "Desktop + tablet" },
      { label: "3 personas" },
      { label: "Dealer · Rep · Buyer" },
    ],
    pageLabels: {
      home: "Home",
      products: "Products (hub)",
      "x-spec": "X Spec",
      collections: "Collections index",
      "collection-app": "Collection · App",
      "product-ultra": "Product · Ultra",
      "browse-all": "Browse All",
      compare: "Compare Products",
      spaces: "Spaces hub",
      "spaces-training": "Spaces · Training",
      finishes: "Finishes hub",
      "finishes-powder": "Finishes · Powder",
      about: "About · Our Story",
      "get-a-quote": "Get a Quote (CPQ)",
      "find-rep": "Find Your Rep",
      "dealer-portal": "Dealer Portal",
      "rep-portal": "Rep Portal",
    },
  },
  system: {
    url: "/wireframes/system.html",
    label: "System wireframes",
    eyebrow: "Website Redesign · System doc",
    title: "System Wireframes",
    description:
      "Template & page tier wireframe spec for tablex.com — sitemap, 14 templates, 4 user flows, and 7 cross-cutting patterns.",
    badges: [
      { label: "34 URLs" },
      { label: "14 templates" },
      { label: "4 personas" },
      { label: "7 patterns" },
      {
        label: "10 open questions",
        variant: "outline",
        className: "border-amber-500/30 text-amber-300",
      },
    ],
    sections: [
      { hash: "toc", num: "00", label: "Start here" },
      { hash: "sitemap", num: "01", label: "Sitemap" },
      { hash: "templates", num: "02", label: "Templates · 14" },
      { hash: "flows", num: "03", label: "User flows · 4" },
      { hash: "patterns", num: "04", label: "Patterns · 7" },
      { hash: "followups", num: "05", label: "Follow-ups" },
    ],
    pageLabels: {
      toc: "Start here",
      sitemap: "Sitemap",
      templates: "Templates",
      flows: "User flows",
      patterns: "Patterns",
      followups: "Follow-ups",
    },
  },
};

function relTime(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export default function WireframesClient() {
  const [activeSet, setActiveSet] = useState<SetKey>("site");
  const [fullscreen, setFullscreen] = useState(false);
  const [hash, setHash] = useState<string>("toc");
  const [comments, setComments] = useState<WireframeComment[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [showResolved, setShowResolved] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fsIframeRef = useRef<HTMLIFrameElement>(null);

  const set = SETS[activeSet];
  const src = set.sections ? `${set.url}#${hash}` : set.url;

  // Fetch comments for the active set
  const refetch = useCallback(async () => {
    try {
      const res = await fetch(`/api/wireframe-comments?set=${activeSet}`, {
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error(`fetch ${res.status}`);
      const json = await res.json();
      setComments(json.comments ?? []);
    } catch {
      // Network errors are non-fatal — iframe still works locally.
    }
  }, [activeSet]);

  useEffect(() => {
    refetch();
    // Light polling so the panel reflects iframe-initiated writes.
    // No realtime by design; ~5s feels live enough for solo review.
    const interval = setInterval(refetch, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  const filteredComments = useMemo(() => {
    return showResolved ? comments : comments.filter((c) => !c.is_resolved);
  }, [comments, showResolved]);

  const groupedByPage = useMemo(() => {
    const map = new Map<string, WireframeComment[]>();
    for (const c of filteredComments) {
      const list = map.get(c.page_id) ?? [];
      list.push(c);
      map.set(c.page_id, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filteredComments]);

  const unresolvedCount = useMemo(
    () => comments.filter((c) => !c.is_resolved).length,
    [comments]
  );

  const jumpTo = useCallback(
    (pageId: string, commentId?: string) => {
      const target = fullscreen ? fsIframeRef.current : iframeRef.current;
      target?.contentWindow?.postMessage(
        { type: "wf:goto", set: activeSet, pageId, commentId },
        "*"
      );
    },
    [activeSet, fullscreen]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Page header */}
      <div className="border-b border-white/5 bg-[#0a0a0a] px-6 py-5">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <LayoutTemplate className="h-4 w-4 text-brand-green" />
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/50 font-medium">
                {set.eyebrow}
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              {set.title}
            </h1>
            <p className="mt-1.5 text-sm text-white/60 max-w-3xl leading-relaxed">
              {set.description}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {set.badges.map((b) => (
                <Badge
                  key={b.label}
                  variant={b.variant ?? "secondary"}
                  className={`text-[10px] ${b.className ?? ""}`}
                >
                  {b.label}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setPanelOpen((v) => !v)}
              className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border-2 text-xs font-semibold transition-all duration-200 ${
                panelOpen
                  ? "bg-brand-green/15 border-brand-green/50 text-brand-green"
                  : "bg-white/[0.03] border-white/10 text-white/80 hover:border-white/30 hover:bg-white/[0.06]"
              }`}
              title="Show recent comments"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Comments
              {unresolvedCount > 0 && (
                <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-brand-green text-black text-[10px] font-bold">
                  {unresolvedCount}
                </span>
              )}
            </button>
            <a
              href={set.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border-2 border-slate-200 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold transition-all duration-200"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in new tab
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFullscreen(true)}
              className="gap-1.5"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Fullscreen
            </Button>
          </div>
        </div>

        {/* Set switcher */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {(Object.keys(SETS) as SetKey[]).map((key) => {
            const s = SETS[key];
            const active = activeSet === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveSet(key);
                  setHash("toc");
                }}
                className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors border ${
                  active
                    ? "bg-brand-green/10 text-brand-green border-brand-green/40"
                    : "bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/5 border-white/10"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Section jump bar (only for sets that have sections) */}
        {set.sections && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {set.sections.map((s) => {
              const active = hash === s.hash;
              return (
                <button
                  key={s.hash}
                  onClick={() => setHash(s.hash)}
                  className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors border ${
                    active
                      ? "bg-brand-green/10 text-brand-green border-brand-green/40"
                      : "bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/5 border-white/10"
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-70">{s.num}</span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Iframe surface — comments panel floats over it, doesn't shrink it */}
      <div className="flex-1 relative bg-[#f7f6f2] overflow-hidden">
        <iframe
          ref={iframeRef}
          key={`${activeSet}-${hash}`}
          src={src}
          className="w-full h-full border-0"
          title={set.title}
        />

        {/* Comments panel — slides in over the iframe */}
        <aside
          className={`absolute right-0 top-0 bottom-0 w-[320px] z-20 bg-white border-l border-black/10 shadow-[-12px_0_28px_rgba(0,0,0,0.10)] flex flex-col transition-transform duration-200 ease-out ${
            panelOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
          }`}
          aria-hidden={!panelOpen}
        >
            <div className="px-4 py-3 border-b border-black/10 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold">
                  {set.label}
                </div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">
                  {comments.length === 0
                    ? "No comments yet"
                    : `${unresolvedCount} open · ${comments.length} total`}
                </div>
              </div>
              <button
                onClick={() => setPanelOpen(false)}
                className="text-slate-500 hover:text-slate-900 p-1"
                aria-label="Close panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 py-2 border-b border-black/5 flex items-center gap-3 text-[11px] text-slate-600">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showResolved}
                  onChange={(e) => setShowResolved(e.target.checked)}
                  className="h-3 w-3"
                />
                Show resolved
              </label>
              <button
                onClick={refetch}
                className="ml-auto underline-offset-2 hover:underline"
              >
                Refresh
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              {groupedByPage.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-slate-500">
                  Comments left in the wireframe iframe will show up here.
                  <br />
                  Click <b>Comments</b> inside the iframe and click on a
                  wireframe to drop a pin.
                </div>
              ) : (
                groupedByPage.map(([pageId, items]) => (
                  <div
                    key={pageId}
                    className="border-b border-black/5 last:border-b-0"
                  >
                    <button
                      onClick={() => jumpTo(pageId)}
                      className="w-full text-left px-4 pt-3 pb-1 hover:bg-slate-50"
                    >
                      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500 font-semibold">
                        {set.pageLabels[pageId] ?? pageId}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {items.length} comment{items.length === 1 ? "" : "s"} · jump
                      </div>
                    </button>
                    <ul className="px-4 pb-3">
                      {items
                        .sort(
                          (a, b) =>
                            new Date(a.created_at).getTime() -
                            new Date(b.created_at).getTime()
                        )
                        .map((c, i) => (
                          <li
                            key={c.id}
                            className={`mt-2 rounded border ${
                              c.is_resolved
                                ? "border-black/5 bg-slate-50"
                                : "border-black/10 bg-white"
                            }`}
                          >
                            <button
                              onClick={() => jumpTo(c.page_id, c.id)}
                              className="w-full text-left p-2.5 hover:bg-slate-50/80"
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <span className="font-mono text-[10px] tracking-[0.08em] text-slate-700">
                                  #{i + 1} · {c.author || "Anonymous"}
                                </span>
                                <span className="font-mono text-[10px] text-slate-400 shrink-0">
                                  {relTime(c.created_at)}
                                </span>
                              </div>
                              <p
                                className={`text-[12.5px] leading-snug whitespace-pre-wrap break-words ${
                                  c.is_resolved
                                    ? "line-through text-slate-400"
                                    : "text-slate-900"
                                }`}
                              >
                                {c.body}
                              </p>
                              {c.is_resolved && (
                                <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Resolved
                                </div>
                              )}
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
        </aside>
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 z-[60] flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors backdrop-blur-sm"
          >
            <X className="h-4 w-4" />
            Close
          </button>
          <iframe
            ref={fsIframeRef}
            src={src}
            className="w-full h-full border-0"
            title={`${set.title} — fullscreen`}
          />
        </div>
      )}
    </div>
  );
}
