"use client";

import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { brandReport, manifesto, type ArchetypeCloudBrand } from "@/data/tablex-dna";
import {
  Compass,
  Download,
  Fingerprint,
  Hammer,
  HeartHandshake,
  Quote,
  ScrollText,
  Sparkles,
  Sprout,
  Star,
  type LucideIcon,
} from "lucide-react";

export default function TableXDnaClient() {
  return (
    <div>
      <Header
        title="TableX DNA"
        subtitle="Brand voice, archetype, and manifesto — who TableX is and how we speak"
      />

      <Tabs defaultValue="report">
        <TabsList className="mb-6">
          <TabsTrigger value="report" className="gap-2">
            <Fingerprint className="h-4 w-4" />
            Brand Voice Report
          </TabsTrigger>
          <TabsTrigger value="manifesto" className="gap-2">
            <ScrollText className="h-4 w-4" />
            Manifesto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="report">
          <BrandReport />
        </TabsContent>

        <TabsContent value="manifesto">
          <Manifesto />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Brand Voice Report ─────────────────────────────────────────────────────

function BrandReport() {
  return (
    <div className="space-y-6">
      {/* Methodology + PDF download */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <Sparkles className="h-4 w-4 text-slate-700" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">Methodology</h2>
            </div>
            <p className="text-sm text-slate-600">{brandReport.methodology}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex flex-col justify-between gap-4 h-full">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
                Full Deliverable
              </p>
              <p className="text-sm text-slate-600">
                Download the complete workshop report as PDF.
              </p>
            </div>
            <a
              href={brandReport.pdfDownloadPath}
              download
              className="inline-flex"
            >
              <Button variant="outline" size="sm" className="w-full">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>

      {/* North Star — brand principles (moved above archetypes) */}
      <NorthStar />

      {/* Archetypes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ArchetypeBlock archetype={brandReport.archetypes.primary} />
        <ArchetypeBlock archetype={brandReport.archetypes.secondary} />
      </div>

      {/* Section insights — 2-col grid, read left-to-right top-to-bottom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {brandReport.sectionInsights.map((section, idx) => (
          <Card key={section.id} className="h-full">
            <CardContent className="p-6 h-full flex flex-col">
              <div className="flex items-start gap-4 mb-4 pb-3 border-b border-slate-100">
                <span
                  aria-hidden
                  className="font-black text-4xl md:text-5xl leading-[0.85] tracking-tight text-slate-900"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 pt-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-400 mb-0.5">
                    Insight {idx + 1} of {brandReport.sectionInsights.length}
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900 leading-snug">
                    {section.title}
                  </h3>
                </div>
              </div>
              <p
                className="text-sm text-slate-600 leading-relaxed [&_em]:italic [&_em]:text-slate-900 [&_em]:font-medium [&_strong]:font-semibold [&_strong]:text-slate-900"
                dangerouslySetInnerHTML={{ __html: section.html }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── North Star ─────────────────────────────────────────────────────────────

const PRINCIPLE_STYLES: Record<
  string,
  { icon: LucideIcon; accent: string; tint: string; border: string }
> = {
  Approachable: {
    icon: HeartHandshake,
    accent: "#d97706", // amber-600
    tint: "#fffbeb", // amber-50
    border: "#fde68a", // amber-200
  },
  Grounded: {
    icon: Sprout,
    accent: "#059669", // emerald-600
    tint: "#ecfdf5", // emerald-50
    border: "#a7f3d0", // emerald-200
  },
  Crafted: {
    icon: Hammer,
    accent: "#475569", // slate-600
    tint: "#f8fafc", // slate-50
    border: "#cbd5e1", // slate-300
  },
  Confident: {
    icon: Compass,
    accent: "#1e40af", // blue-800
    tint: "#eff6ff", // blue-50
    border: "#bfdbfe", // blue-200
  },
};

function NorthStar() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Star className="h-5 w-5" fill="currentColor" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1 font-semibold">
              North Star
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Four Brand Principles
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
              The lens we hold up to every voice and design decision. Real,
              skilled, approachable, and sure of itself.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {brandReport.brandPrinciples.map((principle, idx) => {
          const style =
            PRINCIPLE_STYLES[principle.name] ?? PRINCIPLE_STYLES.Crafted;
          const Icon = style.icon;
          return (
            <article
              key={principle.name}
              className="relative overflow-hidden rounded-xl border bg-white p-5 md:p-6 transition-shadow hover:shadow-md"
              style={{ borderColor: style.border }}
            >
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: style.accent }}
              />
              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: style.tint, color: style.accent }}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-[10px] uppercase tracking-widest font-bold"
                      style={{ color: style.accent }}
                    >
                      0{idx + 1}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">
                      {principle.name}
                    </h3>
                  </div>
                  <p
                    className="mt-1 text-sm font-medium italic leading-snug"
                    style={{ color: style.accent }}
                  >
                    “{principle.line}”
                  </p>
                </div>
              </div>
              <ul className="mt-5 space-y-2.5">
                {principle.phrases.map((phrase) => (
                  <li
                    key={phrase}
                    className="flex items-start gap-2.5 text-sm text-slate-700 leading-snug"
                  >
                    <span
                      aria-hidden
                      className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: style.accent }}
                    />
                    <span>{phrase}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ArchetypeBlock({
  archetype,
}: {
  archetype: typeof brandReport.archetypes.primary;
}) {
  const { accent } = archetype;
  return (
    <Card
      className="border-2 overflow-hidden"
      style={{ borderColor: `${accent}66` }}
    >
      <div
        className="h-1.5"
        style={{ backgroundColor: accent }}
      />
      <CardContent className="p-5">
        <div className="mb-3">
          <p
            className="text-[10px] uppercase tracking-widest font-semibold mb-1"
            style={{ color: accent }}
          >
            {archetype.role}
          </p>
          <h3 className="text-xl font-bold text-slate-900">{archetype.name}</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          {archetype.workshopInsight}
        </p>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2">
            Exemplar Brands
          </p>
          <div className="grid grid-cols-5 gap-2">
            {archetype.logoCloud.map((brand) => (
              <BrandChip key={brand.name} brand={brand} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BrandChip({ brand }: { brand: ArchetypeCloudBrand }) {
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-md border border-slate-200 bg-white p-2"
      title={brand.name}
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded text-[10px] font-bold text-white"
        style={{ backgroundColor: brand.color }}
      >
        {brand.initial}
      </div>
      <p className="text-[9px] text-slate-600 text-center leading-tight truncate w-full">
        {brand.name}
      </p>
    </div>
  );
}

// ─── Manifesto ───────────────────────────────────────────────────────────────

function Manifesto() {
  return (
    <div className="space-y-6">
      {/* Brian's framing memo */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
              <Quote className="h-4 w-4 text-slate-700" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-0.5">
                From the CEO
              </p>
              <h3 className="text-base font-semibold text-slate-900">
                Brian&rsquo;s Thinking
              </h3>
            </div>
          </div>
          <div className="space-y-3 text-sm text-slate-700 leading-relaxed border-l-2 border-slate-200 pl-4">
            {manifesto.intro.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500 italic">
            — {manifesto.attribution}
          </p>
        </CardContent>
      </Card>

      {/* Competitor emotion table */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
              The Setup
            </p>
            <h3 className="text-base font-semibold text-slate-900">
              Competitors sell emotion, not furniture
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 pb-2 pr-4">
                    Competitor
                  </th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 pb-2">
                    What they sell
                  </th>
                </tr>
              </thead>
              <tbody>
                {manifesto.competitorEmotions.map((c) => (
                  <tr key={c.name} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-semibold text-slate-900 whitespace-nowrap align-top">
                      {c.name}
                    </td>
                    <td className="py-3 text-slate-700">
                      <div className="flex flex-wrap gap-1.5">
                        {c.emotions.map((e) => (
                          <span
                            key={e}
                            className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                      {c.note && (
                        <p className="mt-1.5 text-xs text-slate-500 italic">
                          {c.note}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Thesis */}
      <div className="rounded-xl border border-slate-200 bg-slate-900 p-8 md:p-10">
        <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">
          Thesis
        </p>
        <p className="text-xl md:text-2xl font-serif text-white leading-relaxed italic">
          &ldquo;{manifesto.thesis}&rdquo;
        </p>
      </div>

      {/* The manifesto */}
      <Card>
        <CardContent className="px-6 py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-10">
              <span className="text-slate-900">TABLE</span>
              <span className="text-[#ff6b6b]">X</span>
            </h2>
            <div className="space-y-1 text-base md:text-lg leading-loose text-slate-800 font-serif">
              {manifesto.poem.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
            <p className="mt-10 text-xs uppercase tracking-widest text-slate-400">
              — A TableX Manifesto
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
