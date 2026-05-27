"use client";

import { AppWindow, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { comps } from "@/data/comps";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export default function CompsPage() {
  return (
    <div className="flex h-[calc(100vh_-_4rem)] flex-col">
      <div className="mb-6 shrink-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-medium">
            Website Redesign · Content
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Comps</h1>
        <p className="mt-1 text-sm text-slate-500">
          High-fidelity page comps from claude.ai/design. Each opens full-screen
          in a new tab — reference artifacts for review with Brian and Kayla;
          production implementation lives in tablex-site.
        </p>
      </div>

      {comps.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">
          <div>
            <AppWindow className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">No comps yet.</p>
          </div>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {comps.map((comp) => (
            <a
              key={comp.slug}
              href={comp.file}
              target="_blank"
              rel="noopener noreferrer"
              className="group block h-full min-h-0"
            >
              <Card hover className="flex h-full flex-col overflow-hidden">
                <div className="relative min-h-0 flex-1 overflow-y-auto border-b border-slate-200 bg-slate-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {comp.thumb ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={comp.thumb}
                        alt={`${comp.label} preview`}
                        className="block w-full"
                      />
                      <div className="pointer-events-none sticky top-0 flex justify-end p-2">
                        <span className="flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                          Open <ExternalLink className="h-3 w-3" />
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
                      <AppWindow className="h-10 w-10 text-white/40" />
                    </div>
                  )}
                </div>
                <div className="shrink-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-1.5 text-base">
                      {comp.label}
                      <ExternalLink className="h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-slate-500" />
                    </CardTitle>
                    <CardDescription>{comp.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-medium">{formatDate(comp.date)}</span>
                      <span className="text-slate-300">·</span>
                      <span>{comp.tool}</span>
                      {comp.tags?.map((t) => (
                        <Badge
                          key={t}
                          className="bg-slate-100 text-slate-600 text-[9px]"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </div>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
