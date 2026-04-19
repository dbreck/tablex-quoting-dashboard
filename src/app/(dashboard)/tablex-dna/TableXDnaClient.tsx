"use client";

import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { brandReport, manifesto, type ArchetypeCloudBrand } from "@/data/tablex-dna";
import { Download, Fingerprint, Quote, ScrollText, Sparkles } from "lucide-react";

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

      {/* Archetypes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ArchetypeBlock archetype={brandReport.archetypes.primary} />
        <ArchetypeBlock archetype={brandReport.archetypes.secondary} />
      </div>

      {/* Section insights */}
      <div className="space-y-4">
        {brandReport.sectionInsights.map((section, idx) => (
          <Card key={section.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600">
                  {idx + 1}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 pt-0.5">
                  {section.title}
                </h3>
              </div>
              <p
                className="text-sm text-slate-600 leading-relaxed [&_em]:italic [&_em]:text-slate-900 [&_em]:font-medium [&_strong]:font-semibold [&_strong]:text-slate-900"
                dangerouslySetInnerHTML={{ __html: section.html }}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Brand principles summary */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
              North Star
            </p>
            <h3 className="text-lg font-semibold text-slate-900">
              Four Brand Principles
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {brandReport.brandPrinciples.map((principle) => (
              <div
                key={principle.name}
                className="rounded-lg border border-slate-200 bg-slate-50/50 p-4"
              >
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  {principle.name}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {principle.line}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
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
