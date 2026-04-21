"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Maximize2, X, LayoutTemplate } from "lucide-react";

type SetKey = "site" | "system";

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
  },
};

export default function WireframesClient() {
  const [activeSet, setActiveSet] = useState<SetKey>("site");
  const [fullscreen, setFullscreen] = useState(false);
  const [hash, setHash] = useState<string>("toc");

  const set = SETS[activeSet];
  const src = set.sections ? `${set.url}#${hash}` : set.url;

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

      {/* Iframe surface */}
      <div className="flex-1 bg-[#f7f6f2] overflow-hidden">
        <iframe
          key={`${activeSet}-${hash}`}
          src={src}
          className="w-full h-full border-0"
          title={set.title}
        />
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
            src={src}
            className="w-full h-full border-0"
            title={`${set.title} — fullscreen`}
          />
        </div>
      )}
    </div>
  );
}
