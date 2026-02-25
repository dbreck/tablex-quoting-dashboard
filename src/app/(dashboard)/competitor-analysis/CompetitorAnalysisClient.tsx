"use client";

import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { competitorAnalysis } from "@/data/competitor-analysis";
import { ExternalLink, ShieldAlert, Crosshair } from "lucide-react";

const threatVariants = {
  High: "warning",
  Medium: "info",
  Low: "secondary",
} as const;

export default function CompetitorAnalysisClient() {
  const totalMentions = competitorAnalysis.competitors.reduce(
    (sum, competitor) => sum + competitor.mentionCount,
    0
  );

  return (
    <div>
      <Header
        title="Competitor Analysis"
        subtitle="Top competitors by quote-record mention frequency, validated against current market positioning"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
              Competitors Tracked
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {competitorAnalysis.competitors.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
              Total Mentions
            </p>
            <p className="text-2xl font-bold text-slate-900">{totalMentions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
              Last Updated
            </p>
            <p className="text-base font-semibold text-slate-900">{competitorAnalysis.asOf}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 border-slate-200/90">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
              <ShieldAlert className="h-4 w-4 text-slate-700" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Methodology</h2>
          </div>
          <p className="text-sm text-slate-600">{competitorAnalysis.method}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {competitorAnalysis.competitors.map((competitor) => (
          <Card key={competitor.name} className="border-slate-200/90">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{competitor.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {competitor.mentionCount} quote mention
                    {competitor.mentionCount === 1 ? "" : "s"}
                  </p>
                </div>
                <Badge variant={threatVariants[competitor.threat]}>
                  {competitor.threat} Threat
                </Badge>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 mb-3">
                <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-1">
                  Competitive Overlap
                </p>
                <p className="text-sm text-slate-700">{competitor.overlap}</p>
              </div>

              <div className="mb-3">
                <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">
                  Key Findings
                </p>
                <ul className="space-y-2">
                  {competitor.findings.map((finding) => (
                    <li
                      key={finding}
                      className="text-xs text-slate-600 leading-relaxed flex items-start gap-2"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-brand-green/20 bg-brand-green/5 px-3 py-2 mb-3">
                <p className="text-[11px] uppercase tracking-widest text-brand-green mb-1 flex items-center gap-1.5">
                  <Crosshair className="h-3.5 w-3.5" />
                  TableX Counter-Position
                </p>
                <p className="text-xs text-slate-700">{competitor.response}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {competitor.sources.map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"
                  >
                    {source.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
