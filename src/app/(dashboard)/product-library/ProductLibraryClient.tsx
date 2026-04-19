"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  seriesCatalog,
  unmappedSeries,
  getSeriesByCode,
  type SeriesEntry,
  type Workspace,
  type Application,
} from "@/data/series-catalog";
import { MODEL_AVAILABILITY } from "@/data/model-availability";
import { cn } from "@/lib/utils";
import { Mail, X } from "lucide-react";

// ─── Filter definitions ─────────────────────────────────────────────────────

const COLLECTIONS = ["App", "Solo", "Outdoor", "Occasional", "Dining"] as const;
type Collection = (typeof COLLECTIONS)[number];

const APPLICATIONS: Application[] = [
  "Training & Classroom",
  "Conference",
  "Collaborative & Meeting",
  "Café & Dining",
  "Height-Adjustable",
  "Nesting & Folding",
  "Occasional",
  "Pull Up",
];

const BASE_STYLES = [
  "Pedestal",
  "T-leg",
  "X-base",
  "Flip-top",
  "Height-adj",
  "Trestle",
] as const;
type BaseStyle = (typeof BASE_STYLES)[number];

// ─── Membership heuristics ──────────────────────────────────────────────────

function seriesInCollection(series: SeriesEntry, collection: Collection): boolean {
  switch (collection) {
    case "App":
      return series.slug === "APP";
    case "Solo":
      return series.slug === "SOLO";
    case "Outdoor":
      return series.workspaces.includes("Outdoor");
    case "Occasional":
      return series.applications.includes("Occasional");
    case "Dining":
      return series.applications.includes("Café & Dining");
    default:
      return false;
  }
}

function seriesInApplication(series: SeriesEntry, application: Application): boolean {
  return series.applications.includes(application);
}

function seriesInBaseStyle(series: SeriesEntry, style: BaseStyle): boolean {
  const tags = series.tags.map((t) => t.toLowerCase());
  switch (style) {
    case "Pedestal":
      return (
        tags.some((t) => t.includes("pedestal")) ||
        tags.some((t) => t.includes("column"))
      );
    case "T-leg":
      return tags.some((t) => t.includes("t-leg") || t === "t leg");
    case "X-base":
      return tags.some((t) => t.includes("x-base") || t.includes("x base"));
    case "Flip-top":
      return tags.some((t) => t.includes("flip"));
    case "Height-adj":
      return (
        series.applications.includes("Height-Adjustable") ||
        tags.some((t) => t.includes("height-adjustable") || t.includes("height-adj"))
      );
    case "Trestle":
      return tags.some((t) => t.includes("trestle"));
    default:
      return false;
  }
}

// ─── Accent colour keyed off series tags ────────────────────────────────────

function accentClass(series: SeriesEntry): string {
  const woodFriendly = new Set(["ARTISAN", "STRETCH", "ELEMENT", "FOUNDATION"]);
  const heightAdjust = new Set(["VERTIGO", "SOLO", "TRIG", "APP"]);
  const statement = new Set(["EXCLAIM", "JUSTICE", "ELITE"]);

  if (woodFriendly.has(series.slug)) return "bg-amber-400";
  if (heightAdjust.has(series.slug)) return "bg-brand-green";
  if (statement.has(series.slug)) return "bg-red-500";
  return "bg-slate-400";
}

function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]*[.!?]/);
  return match ? match[0].trim() : text;
}

// ─── Admin mailto ───────────────────────────────────────────────────────────

function buildUnmappedMailto(): string {
  const subject = "TableX 2026 — Product codes for 6 new series";
  const listLines = unmappedSeries
    .map((s) => `- ${s.slug} — ${s.headline}`)
    .join("\n");
  const body = `Hey Brian,

We need two-digit product codes assigned to the following 6 new series so we can map them to SKUs:

${listLines}

Could you send me the codes at your convenience?

Thanks,
Danny`;
  const to = "bcraig@tablex.com";
  const cc = "danny@clearph.com";
  return `mailto:${to}?cc=${cc}&subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ProductLibraryClient() {
  const [selectedCollections, setSelectedCollections] = useState<Collection[]>([]);
  const [selectedApplications, setSelectedApplications] = useState<Application[]>([]);
  const [selectedBaseStyles, setSelectedBaseStyles] = useState<BaseStyle[]>([]);

  const toggleCollection = (c: Collection) =>
    setSelectedCollections((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  const toggleApplication = (a: Application) =>
    setSelectedApplications((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  const toggleBaseStyle = (b: BaseStyle) =>
    setSelectedBaseStyles((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
    );

  const clearAll = () => {
    setSelectedCollections([]);
    setSelectedApplications([]);
    setSelectedBaseStyles([]);
  };

  // Counts per application
  const applicationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const app of APPLICATIONS) {
      counts[app] = seriesCatalog.filter((s) => seriesInApplication(s, app)).length;
    }
    return counts;
  }, []);

  // Apply filters
  const filteredSeries = useMemo(() => {
    return seriesCatalog.filter((s) => {
      if (
        selectedCollections.length > 0 &&
        !selectedCollections.some((c) => seriesInCollection(s, c))
      ) {
        return false;
      }
      if (
        selectedApplications.length > 0 &&
        !selectedApplications.some((a) => seriesInApplication(s, a))
      ) {
        return false;
      }
      if (
        selectedBaseStyles.length > 0 &&
        !selectedBaseStyles.some((b) => seriesInBaseStyle(s, b))
      ) {
        return false;
      }
      return true;
    });
  }, [selectedCollections, selectedApplications, selectedBaseStyles]);

  const foundation = getSeriesByCode("30");
  const foundationConfigCount = MODEL_AVAILABILITY["30"]
    ? Object.keys(MODEL_AVAILABILITY["30"].shapes).length
    : null;

  const foundationInResults = filteredSeries.some((s) => s.slug === "FOUNDATION");
  const gridSeries = filteredSeries.filter((s) => s.slug !== "FOUNDATION");

  const activeFilters: Array<{ label: string; onRemove: () => void }> = [
    ...selectedCollections.map((c) => ({
      label: `Collection · ${c}`,
      onRemove: () => toggleCollection(c),
    })),
    ...selectedApplications.map((a) => ({
      label: `Space · ${a}`,
      onRemove: () => toggleApplication(a),
    })),
    ...selectedBaseStyles.map((b) => ({
      label: `Base · ${b}`,
      onRemove: () => toggleBaseStyle(b),
    })),
  ];

  const mailtoHref = buildUnmappedMailto();

  return (
    <div>
      <Header
        title="Product Library"
        subtitle="The 2026 TableX collection — 16 series for every space"
      />

      <div className="flex gap-6">
        {/* ─── Left rail filters ─────────────────────────────── */}
        <aside className="w-64 shrink-0 space-y-6">
          {/* Collection */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">
              Collection
            </h3>
            <div className="flex flex-wrap gap-2">
              {COLLECTIONS.map((c) => {
                const active = selectedCollections.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleCollection(c)}
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      active
                        ? "bg-brand-green text-white border-brand-green"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Space */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">
              Space
            </h3>
            <div className="space-y-2">
              {APPLICATIONS.map((a) => {
                const active = selectedApplications.includes(a);
                return (
                  <label
                    key={a}
                    className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 hover:text-slate-900"
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleApplication(a)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-green focus:ring-brand-green"
                    />
                    <span className="flex-1">{a}</span>
                    <span className="text-xs text-slate-400">
                      {applicationCounts[a]}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Base style */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">
              Base style
            </h3>
            <div className="flex flex-wrap gap-2">
              {BASE_STYLES.map((b) => {
                const active = selectedBaseStyles.includes(b);
                return (
                  <button
                    key={b}
                    onClick={() => toggleBaseStyle(b)}
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      active
                        ? "bg-brand-green text-white border-brand-green"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-slate-400 italic">
              v1 — mapping TBD
            </p>
          </div>
        </aside>

        {/* ─── Main content ──────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold shrink-0">
                  Active ·
                </span>
                {activeFilters.map((f, i) => (
                  <button
                    key={`${f.label}-${i}`}
                    onClick={f.onRemove}
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 shrink-0"
                  >
                    {f.label}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
              <button
                onClick={clearAll}
                className="shrink-0 text-xs font-semibold text-brand-green hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Hero card — Foundation */}
          {foundation && (!activeFilters.length || foundationInResults) && (
            <div className="rounded-xl bg-slate-900 text-white shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-10">
                {/* Art area placeholder */}
                <div className="relative min-h-[240px] rounded-lg bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(141,198,63,0.25),transparent_60%)]" />
                </div>
                {/* Content */}
                <div className="flex flex-col justify-center">
                  <p className="text-xs uppercase tracking-widest text-brand-green font-semibold mb-3">
                    — Most-specified this quarter
                  </p>
                  <h2 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight mb-4">
                    The <span className="text-brand-green">Foundation</span>{" "}
                    pedestal, built to handle everything.
                  </h2>
                  <p className="text-sm text-white/70 leading-relaxed mb-6">
                    {firstSentence(foundation.description)}
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <Link href="/configurator?series=30">
                      <Button size="lg">Configure Foundation</Button>
                    </Link>
                    <Link
                      href="/configurator?series=30"
                      className="text-sm font-semibold text-white/80 hover:text-white"
                    >
                      See {foundationConfigCount ?? "—"} configurations →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Series grid */}
          {gridSeries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-sm text-slate-500">
                  No series match the current filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {gridSeries.map((series) => (
                <SeriesCard key={series.slug} series={series} />
              ))}
            </div>
          )}

          {/* Admin — unmapped series */}
          <Card className="border-dashed">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {unmappedSeries.length} series need numeric codes
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    These series don&apos;t yet map to a legacy two-digit SKU
                    code. We need Brian to assign one before they can route to
                    the configurator.
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {unmappedSeries.map((s) => (
                      <li
                        key={s.slug}
                        className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {s.name}
                      </li>
                    ))}
                  </ul>
                </div>
                <a href={mailtoHref} className="shrink-0">
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4" />
                    Email Brian about unmapped series
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Series card ────────────────────────────────────────────────────────────

function SeriesCard({ series }: { series: SeriesEntry }) {
  const isMapped = series.code !== null;
  return (
    <Card hover className="overflow-hidden">
      <div className={cn("h-1.5 w-full", accentClass(series))} />
      <CardContent className="p-6">
        <h3 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
          {series.slug}
        </h3>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {firstSentence(series.description)}
        </p>

        {/* Workspaces */}
        {series.workspaces.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {series.workspaces.map((w: Workspace) => (
              <span
                key={w}
                className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700"
              >
                {w}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          {isMapped ? (
            <Link
              href={`/configurator?series=${series.code}`}
              className="text-sm font-semibold text-brand-green hover:underline"
            >
              Configure {series.name} →
            </Link>
          ) : (
            <span className="text-sm text-slate-400 cursor-not-allowed">
              Awaiting product code
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
