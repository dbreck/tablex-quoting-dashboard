"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Maximize2, X, LayoutTemplate } from "lucide-react";

const SYSTEM_URL = "/wireframes/system.html";

const SECTIONS = [
  { hash: "toc", num: "00", label: "Start here" },
  { hash: "sitemap", num: "01", label: "Sitemap" },
  { hash: "templates", num: "02", label: "Templates · 14" },
  { hash: "flows", num: "03", label: "User flows · 4" },
  { hash: "patterns", num: "04", label: "Patterns · 7" },
  { hash: "followups", num: "05", label: "Follow-ups" },
];

export default function WireframesClient() {
  const [fullscreen, setFullscreen] = useState(false);
  const [hash, setHash] = useState<string>("toc");

  const src = `${SYSTEM_URL}#${hash}`;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Page header */}
      <div className="border-b border-white/5 bg-[#0a0a0a] px-6 py-5">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <LayoutTemplate className="h-4 w-4 text-brand-green" />
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/50 font-medium">
                Website Redesign · Marketing site
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              System Wireframes
            </h1>
            <p className="mt-1.5 text-sm text-white/60 max-w-3xl leading-relaxed">
              Template &amp; page tier wireframe spec for tablex.com —
              sitemap, 14 templates, 4 user flows, and 7 cross-cutting patterns.
              The source-of-truth brief the marketing-site designer is working from.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">34 URLs</Badge>
              <Badge variant="secondary" className="text-[10px]">14 templates</Badge>
              <Badge variant="secondary" className="text-[10px]">4 personas</Badge>
              <Badge variant="secondary" className="text-[10px]">7 patterns</Badge>
              <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-300">
                10 open questions
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={SYSTEM_URL}
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

        {/* Section jump bar */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {SECTIONS.map((s) => {
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
      </div>

      {/* Iframe surface */}
      <div className="flex-1 bg-[#f7f6f2] overflow-hidden">
        <iframe
          key={hash}
          src={src}
          className="w-full h-full border-0"
          title="TableX System Wireframes"
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
            title="TableX System Wireframes — fullscreen"
          />
        </div>
      )}
    </div>
  );
}
