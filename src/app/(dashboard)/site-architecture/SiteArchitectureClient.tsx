"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Globe,
  Users,
  DollarSign,
  Zap,
  Download,
  Package,
  Layers,
  Palette,
  FileText,
  Info,
  MessageSquareQuote,
  MapPin,
  Building2,
  Briefcase,
  User,
  Lock,
  Sparkles,
  Search,
  LogIn,
  Phone,
  ShoppingCart,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Target,
  Tablet,
  Monitor,
  Settings,
  Mail,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  architectureSections,
  utilityNav,
  designPrinciples,
  personaPaths,
  currentVsFuture,
  architectureStats,
  v1DesignPrinciples,
  v1PersonaPaths,
  v1CurrentVsFuture,
  v3DesignPrinciples,
  v3PersonaFlows,
  v3CurrentVsFuture,
} from "@/data/future-site-architecture";
import type {
  ArchSection,
  DesignPrinciple,
  PersonaPath,
  Comparison,
  V3PersonaFlow,
} from "@/data/future-site-architecture";

// ── Draft definitions ───────────────────────────────────────────────

type DraftId = "transparent-pricing" | "self-service" | "quote-back";

const drafts: { id: DraftId; label: string; description: string }[] = [
  {
    id: "transparent-pricing",
    label: "Transparent Pricing",
    description: "Public pricing ranges, real-time CPQ, applications terminology",
  },
  {
    id: "self-service",
    label: "Self-Service CPQ",
    description: "Self-service quoting, spaces terminology, browser wireframe",
  },
  {
    id: "quote-back",
    label: "Quote-Back Flow",
    description: "No visible pricing — configure then receive personalized quote",
  },
];

// ── Icon maps ───────────────────────────────────────────────────────

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  DollarSign,
  Zap,
  Download,
  Tablet,
  Building2,
  Briefcase,
  User,
  Palette,
  MessageSquareQuote,
};

const sectionIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  products: Package,
  collections: Layers,
  spaces: Layers,
  applications: Layers,
  finishes: Palette,
  resources: FileText,
  about: Info,
  quote: MessageSquareQuote,
  "find-rep": MapPin,
  "dealer-portal": Building2,
  "rep-portal": Briefcase,
};

const utilityIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "util-search": Search,
  "util-login": LogIn,
  "util-contact": Phone,
  "util-cart": ShoppingCart,
};

// ── Color system ────────────────────────────────────────────────────

const colorMap: Record<
  string,
  { bg: string; bgLight: string; text: string; border: string; dot: string }
> = {
  green: { bg: "bg-green-500", bgLight: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-400" },
  violet: { bg: "bg-violet-500", bgLight: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-400" },
  amber: { bg: "bg-amber-500", bgLight: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400" },
  slate: { bg: "bg-slate-500", bgLight: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" },
  sky: { bg: "bg-sky-500", bgLight: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", dot: "bg-sky-400" },
  emerald: { bg: "bg-emerald-500", bgLight: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400" },
  indigo: { bg: "bg-indigo-500", bgLight: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", dot: "bg-indigo-400" },
  blue: { bg: "bg-blue-500", bgLight: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-400" },
  teal: { bg: "bg-teal-500", bgLight: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", dot: "bg-teal-400" },
};

const accentColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-400" },
  green: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-400" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400" },
};

// ── Section data transforms for drafts ──────────────────────────────

const v1Sections: ArchSection[] = architectureSections.map((s) =>
  s.id === "spaces"
    ? {
        ...s,
        id: "applications",
        label: "Applications",
        description: "Use-case navigation for non-industry visitors",
        children: s.children.map((c) => ({
          ...c,
          id: c.id.replace("spaces-", "app-"),
        })),
      }
    : s
);

const v3Sections: ArchSection[] = architectureSections.map((s) => {
  if (s.id === "quote")
    return {
      ...s,
      label: "Request a Quote",
      description: "Submit your configuration for a personalized quote",
      children: s.children.map((c) =>
        c.id === "quote-cpq"
          ? {
              ...c,
              label: "Spec Studio",
              description: "Interactive configurator — pricing calculated after submission",
            }
          : c
      ),
    };
  if (s.id === "products")
    return {
      ...s,
      children: s.children.map((c) =>
        c.id === "prod-browse"
          ? { ...c, description: "Filterable grid of all base styles and collections" }
          : c
      ),
    };
  return s;
});

// ═══════════════════════════════════════════════════════════════════
//  Main component
// ═══════════════════════════════════════════════════════════════════

export default function SiteArchitectureClient() {
  const [currentDraft, setCurrentDraft] = useState<DraftId>("quote-back");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeDraft = drafts.find((d) => d.id === currentDraft)!;

  return (
    <div>
      {/* Header with draft selector */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Future Site Architecture
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Proposed IA for tablex.com
          </p>
        </div>
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="text-slate-400 text-xs mr-1.5">Draft:</span>
            {activeDraft.label}
            <ChevronDown className="h-3 w-3 ml-1.5" />
          </Button>
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl border border-slate-200 shadow-xl py-1 min-w-[280px]">
                {drafts.map((draft) => (
                  <button
                    key={draft.id}
                    onClick={() => {
                      setCurrentDraft(draft.id);
                      setDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2.5 transition-colors flex items-start gap-3",
                      draft.id === currentDraft
                        ? "bg-brand-green/5"
                        : "hover:bg-slate-50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center",
                        draft.id === currentDraft
                          ? "border-brand-green bg-brand-green"
                          : "border-slate-300"
                      )}
                    >
                      {draft.id === currentDraft && (
                        <Check className="h-2.5 w-2.5 text-white" />
                      )}
                    </div>
                    <div>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          draft.id === currentDraft
                            ? "text-brand-green"
                            : "text-slate-700"
                        )}
                      >
                        {draft.label}
                        {draft.id === "quote-back" && (
                          <Badge className="ml-2 bg-emerald-100 text-emerald-700 text-[9px]">
                            NEW
                          </Badge>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {draft.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Draft content */}
      {currentDraft === "transparent-pricing" && <TransparentPricingDraft />}
      {currentDraft === "self-service" && <SelfServiceDraft />}
      {currentDraft === "quote-back" && <QuoteBackDraft />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  DRAFT 1: Transparent Pricing (v1 tree layout)
// ═══════════════════════════════════════════════════════════════════

function TransparentPricingDraft() {
  return (
    <Tabs defaultValue="sitemap">
      <TabsList className="mb-6">
        <TabsTrigger value="sitemap">Site Map</TabsTrigger>
        <TabsTrigger value="personas">Persona Paths</TabsTrigger>
        <TabsTrigger value="comparison">Current vs. Future</TabsTrigger>
      </TabsList>
      <TabsContent value="sitemap">
        <V1SiteMapTab />
      </TabsContent>
      <TabsContent value="personas">
        <PersonaFlowCards paths={v1PersonaPaths} />
      </TabsContent>
      <TabsContent value="comparison">
        <ComparisonTable data={v1CurrentVsFuture} />
      </TabsContent>
    </Tabs>
  );
}

function V1SiteMapTab() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const primarySections = v1Sections.filter((s) => s.tier === "primary");
  const actionSections = v1Sections.filter((s) => s.tier === "action");
  const portalSections = v1Sections.filter((s) => s.tier === "portal");

  return (
    <div className="space-y-6">
      {/* Design Principles */}
      <PrincipleCards principles={v1DesignPrinciples} />

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-slate-500">
            {expanded.size} of {v1Sections.length} sections open
          </p>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-emerald-500" /> NEW
            </span>
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-blue-500" /> AUTH
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setExpanded(new Set(v1Sections.map((s) => s.id)))}
            className="text-xs text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={() => setExpanded(new Set())}
            className="text-xs text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Tree */}
      <Card>
        <CardContent className="p-8 overflow-x-auto">
          <div className="min-w-[900px] flex flex-col items-center py-4">
            {/* Root */}
            <div className="flex flex-col items-center px-8 py-4 bg-brand-navy rounded-2xl text-white shadow-lg shadow-brand-navy/20">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="h-5 w-5 text-brand-green" />
                <span className="text-lg font-bold tracking-tight">tablex.com</span>
                <Badge className="bg-emerald-500 text-white text-[9px] ml-1">REDESIGN</Badge>
              </div>
              <div className="flex gap-3 mt-1 text-[10px] text-white/50">
                <span>{architectureStats.totalSections} sections</span>
                <span>·</span>
                <span>{architectureStats.totalPages} pages</span>
                <span>·</span>
                <span>{architectureStats.newPages} new</span>
              </div>
            </div>

            <div className="w-px h-8 bg-slate-300" />
            <TierLabel label="Primary Navigation" color="slate" />
            <V1Tier sections={primarySections} expanded={expanded} onToggle={toggle} />

            <div className="w-px h-8 bg-slate-300 mt-4" />
            <TierLabel label="Actions & Conversion" color="emerald" />
            <V1Tier sections={actionSections} expanded={expanded} onToggle={toggle} />

            <div className="w-px h-8 bg-slate-300 mt-4" />
            <TierLabel label="Authenticated Portals" color="blue" />
            <V1Tier sections={portalSections} expanded={expanded} onToggle={toggle} />

            {/* Utility Nav */}
            <div className="w-px h-8 bg-slate-300 mt-4" />
            <TierLabel label="Utility Navigation" color="slate" />
            <div className="flex gap-3">
              {utilityNav.map((item) => {
                const Icon = utilityIconMap[item.id] ?? Globe;
                return (
                  <div key={item.id} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                    <Icon className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[11px] font-medium text-slate-600">{item.label}</span>
                    {item.isNew && <Sparkles className="h-2.5 w-2.5 text-emerald-500" />}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <StatCards />
    </div>
  );
}

function TierLabel({ label, color }: { label: string; color: string }) {
  const styles: Record<string, string> = {
    slate: "bg-slate-100 text-slate-500",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-2", styles[color] ?? styles.slate)}>
      {label}
    </div>
  );
}

function V1Tier({
  sections,
  expanded,
  onToggle,
}: {
  sections: ArchSection[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="relative w-full">
      {sections.length > 1 && (
        <div
          className="absolute top-0 h-px bg-slate-300"
          style={{
            left: `${100 / (sections.length * 2)}%`,
            right: `${100 / (sections.length * 2)}%`,
          }}
        />
      )}
      <div className="flex justify-center">
        {sections.map((section) => {
          const c = colorMap[section.color] ?? colorMap.slate;
          const isOpen = expanded.has(section.id);
          const Icon = sectionIconMap[section.id] ?? Globe;

          return (
            <div
              key={section.id}
              className="flex flex-col items-center"
              style={{
                width: sections.length > 1 ? `${100 / sections.length}%` : undefined,
                minWidth: sections.length <= 2 ? "200px" : undefined,
              }}
            >
              {sections.length > 1 && <div className="w-px h-6 bg-slate-300" />}
              <button
                onClick={() => onToggle(section.id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer",
                  isOpen
                    ? `${c.bgLight} ${c.border} shadow-sm`
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <Icon className={cn("h-4 w-4", isOpen ? c.text : "text-slate-400")} />
                  {section.isNew && <Sparkles className="h-3 w-3 text-emerald-500" />}
                </div>
                <span className={cn("text-[11px] font-semibold whitespace-nowrap", isOpen ? c.text : "text-slate-700")}>
                  {section.label}
                </span>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", isOpen ? `${c.bg} text-white` : "bg-slate-100 text-slate-500")}>
                  {section.children.length}
                </span>
              </button>

              {isOpen && (
                <>
                  <div className={cn("w-px h-3", c.dot)} />
                  <div className={cn("rounded-lg border p-2 space-y-1 max-h-[300px] overflow-y-auto", c.border, c.bgLight)}>
                    {section.children.map((child) => (
                      <div key={child.id} className="flex items-center gap-1.5">
                        <div className={cn("w-1 h-1 rounded-full shrink-0", c.dot)} />
                        <span className={cn("text-[10px] whitespace-nowrap", c.text)}>{child.label}</span>
                        {child.isNew && <Sparkles className="h-2.5 w-2.5 text-emerald-500 shrink-0" />}
                        {child.auth && <Lock className="h-2.5 w-2.5 text-blue-400 shrink-0" />}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  DRAFT 2: Self-Service CPQ (v2 browser wireframe)
// ═══════════════════════════════════════════════════════════════════

function SelfServiceDraft() {
  return (
    <Tabs defaultValue="navigation">
      <TabsList className="mb-6">
        <TabsTrigger value="navigation">Navigation Architecture</TabsTrigger>
        <TabsTrigger value="flows">User Flows</TabsTrigger>
        <TabsTrigger value="comparison">Before & After</TabsTrigger>
      </TabsList>
      <TabsContent value="navigation">
        <BrowserWireframeTab
          sections={architectureSections}
          principles={designPrinciples}
        />
      </TabsContent>
      <TabsContent value="flows">
        <WireframeFlowsTab paths={personaPaths} />
      </TabsContent>
      <TabsContent value="comparison">
        <ComparisonTable data={currentVsFuture} />
      </TabsContent>
    </Tabs>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  DRAFT 3: Quote-Back Flow (v3 — no visible pricing)
// ═══════════════════════════════════════════════════════════════════

function QuoteBackDraft() {
  return (
    <Tabs defaultValue="navigation">
      <TabsList className="mb-6">
        <TabsTrigger value="navigation">Navigation Architecture</TabsTrigger>
        <TabsTrigger value="flows">Quote Flow</TabsTrigger>
        <TabsTrigger value="comparison">Before & After</TabsTrigger>
      </TabsList>
      <TabsContent value="navigation">
        <BrowserWireframeTab
          sections={v3Sections}
          principles={v3DesignPrinciples}
        />
      </TabsContent>
      <TabsContent value="flows">
        <QuoteBackFlowTab />
      </TabsContent>
      <TabsContent value="comparison">
        <ComparisonTable data={v3CurrentVsFuture} />
      </TabsContent>
    </Tabs>
  );
}

// ── Quote-Back Flow Tab ─────────────────────────────────────────────

function QuoteBackFlowTab() {
  const personaIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Building2,
    Briefcase,
    User,
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        No pricing is visible during configuration. Users submit their build,
        TableX&apos;s pricing engine applies rules and discounts, then a
        personalized quote is delivered back.
      </p>

      {v3PersonaFlows.map((persona) => {
        const a = accentColors[persona.accent] ?? accentColors.blue;
        const Icon = personaIconMap[persona.icon] ?? User;

        // Group steps by zone
        const groups: { zone: string; steps: typeof persona.steps }[] = [];
        for (const step of persona.steps) {
          const last = groups[groups.length - 1];
          if (last && last.zone === step.zone) {
            last.steps.push(step);
          } else {
            groups.push({ zone: step.zone, steps: [step] });
          }
        }

        return (
          <Card key={persona.persona}>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className={cn("flex items-center justify-center w-10 h-10 rounded-xl", a.bg)}>
                    <Icon className={cn("h-5 w-5", a.text)} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{persona.persona}</CardTitle>
                    <CardDescription>{persona.trafficShare} of traffic</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  <Target className="h-3 w-3 mr-1" />
                  {persona.goal}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-stretch gap-2 overflow-x-auto pb-3">
                {groups.map((group, gi) => (
                  <div key={gi} className="flex items-stretch gap-2 shrink-0">
                    {/* Zone container */}
                    <div
                      className={cn(
                        "rounded-xl p-3 flex flex-col",
                        group.zone === "backend"
                          ? "bg-brand-navy/5 border-2 border-dashed border-brand-navy/20"
                          : group.zone === "delivery"
                            ? "bg-emerald-50/80 border-2 border-dashed border-emerald-200"
                            : "bg-white"
                      )}
                    >
                      {/* Zone label */}
                      <div className="text-center mb-2">
                        <span
                          className={cn(
                            "text-[8px] uppercase tracking-widest font-bold",
                            group.zone === "backend"
                              ? "text-brand-navy/40"
                              : group.zone === "delivery"
                                ? "text-emerald-500/60"
                                : "text-slate-300"
                          )}
                        >
                          {group.zone === "frontend"
                            ? "User\u2019s Browser"
                            : group.zone === "backend"
                              ? "TableX Backend"
                              : "Quote Delivered"}
                        </span>
                      </div>

                      {/* Steps within zone */}
                      <div className="flex items-start gap-2 flex-1">
                        {group.steps.map((step, si) => (
                          <div key={si} className="flex items-center gap-2 shrink-0">
                            {group.zone === "backend" ? (
                              <BackendStepCard step={step} accent={a} />
                            ) : group.zone === "delivery" ? (
                              <DeliveryStepCard step={step} accent={a} persona={persona.persona} />
                            ) : (
                              <WireframeStepCard step={step} stepIndex={persona.steps.indexOf(step)} accent={a} />
                            )}
                            {si < group.steps.length - 1 && (
                              <ArrowRight className={cn("h-3 w-3 shrink-0", a.text, "opacity-40")} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Arrow between zones */}
                    {gi < groups.length - 1 && (
                      <div className="flex items-center shrink-0">
                        <div className={cn("flex flex-col items-center gap-0.5")}>
                          <ArrowRight
                            className={cn(
                              "h-5 w-5",
                              groups[gi + 1].zone === "backend"
                                ? "text-brand-navy/30"
                                : groups[gi + 1].zone === "delivery"
                                  ? "text-emerald-400"
                                  : "text-slate-300"
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Key insight */}
      <Card className="border-brand-navy/20 bg-brand-navy/5">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-navy/10 shrink-0">
            <MessageSquareQuote className="h-5 w-5 text-brand-navy" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">
              Why Quote-Back?
            </p>
            <p className="text-sm text-slate-600 mt-1">
              By keeping pricing off the frontend, TableX maintains control over
              dealer tier accuracy, volume discount calculations, and territory-specific
              rules. Dealers never see an incorrect price. Reps never quote outside
              their margin. And individual buyers get a professional, personalized
              quote instead of raw list pricing. The backend pricing engine becomes
              the single source of truth.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── v3 Step card components ─────────────────────────────────────────

function BackendStepCard({
  step,
  accent,
}: {
  step: V3PersonaFlow["steps"][0];
  accent: { bg: string; text: string; border: string; dot: string };
}) {
  return (
    <div className="w-[130px]">
      <div className="rounded-lg bg-brand-navy/10 border border-brand-navy/20 p-2.5 h-[90px] flex flex-col items-center justify-center gap-2">
        <Settings className="h-5 w-5 text-brand-navy/40 animate-[spin_8s_linear_infinite]" />
        <div className="space-y-0.5 w-full">
          <div className="h-1 bg-brand-navy/15 rounded-full w-full" />
          <div className="h-1 bg-brand-navy/10 rounded-full w-3/4 mx-auto" />
          <div className="h-1 bg-brand-navy/15 rounded-full w-full" />
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-[10px] font-semibold text-brand-navy/60">{step.label}</p>
        <p className="text-[8px] text-slate-400 leading-tight mt-0.5">{step.action}</p>
      </div>
    </div>
  );
}

function DeliveryStepCard({
  step,
  accent,
  persona,
}: {
  step: V3PersonaFlow["steps"][0];
  accent: { bg: string; text: string; border: string; dot: string };
  persona: string;
}) {
  const isIndividual = persona === "Individual Buyer";

  return (
    <div className="w-[130px]">
      <div className="rounded-lg bg-white border border-emerald-200 p-2.5 h-[90px] flex flex-col items-center justify-center gap-1.5">
        {!isIndividual && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-50 border border-blue-200">
              <Building2 className="h-3 w-3 text-blue-400" />
              <span className="text-[7px] font-semibold text-blue-500">Portal</span>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-50 border border-amber-200">
            <Mail className="h-3 w-3 text-amber-500" />
            <span className="text-[7px] font-semibold text-amber-600">Email</span>
          </div>
        </div>
        {isIndividual && (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-50 border border-dashed border-slate-300">
            <User className="h-3 w-3 text-slate-400" />
            <span className="text-[7px] font-medium text-slate-400">Account?</span>
          </div>
        )}
      </div>
      <div className="mt-2 text-center">
        <p className="text-[10px] font-semibold text-emerald-600">{step.label}</p>
        <p className="text-[8px] text-slate-400 leading-tight mt-0.5">{step.action}</p>
      </div>
    </div>
  );
}

function WireframeStepCard({
  step,
  stepIndex,
  accent,
}: {
  step: V3PersonaFlow["steps"][0];
  stepIndex: number;
  accent: { bg: string; text: string; border: string; dot: string };
}) {
  const wireframes: Record<string, React.ReactNode> = {
    Login: <WireframeLogin />,
    Configure: <WireframeConfigurator />,
    Submit: <WireframeSubmit />,
    Discover: <WireframeSpaces />,
    Demo: <WireframeConfigurator />,
    Order: <WireframeOrder />,
    Report: <WireframeDashboard />,
    Purchase: <WireframeCart />,
  };

  return (
    <div className="w-[130px]">
      <div className={cn("rounded-t-lg border border-b-0 px-2 py-1 flex items-center gap-1", accent.border, accent.bg)}>
        <div className="flex gap-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        </div>
        <span className={cn("text-[7px] font-semibold truncate", accent.text)}>{step.node}</span>
      </div>
      <div className={cn("border rounded-b-lg p-2 h-[70px] bg-white", accent.border)}>
        {wireframes[step.label] ?? (
          <div className="h-full flex items-center justify-center">
            <Monitor className="h-5 w-5 text-slate-200" />
          </div>
        )}
      </div>
      <div className="mt-1.5 text-center">
        <div className="flex items-center justify-center gap-1 mb-0.5">
          <span className={cn("flex items-center justify-center w-3.5 h-3.5 rounded-full text-[7px] font-bold text-white", accent.dot)}>
            {stepIndex + 1}
          </span>
          <span className={cn("text-[10px] font-semibold", accent.text)}>{step.label}</span>
        </div>
        <p className="text-[8px] text-slate-400 leading-tight">{step.action}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Shared: Browser Wireframe Tab
// ═══════════════════════════════════════════════════════════════════

function BrowserWireframeTab({
  sections,
  principles,
}: {
  sections: ArchSection[];
  principles: DesignPrinciple[];
}) {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const primarySections = sections.filter((s) => s.tier === "primary");
  const actionSections = sections.filter((s) => s.tier === "action");
  const portalSections = sections.filter((s) => s.tier === "portal");

  return (
    <div className="space-y-6">
      <PrincipleCards principles={principles} />

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="min-w-[800px]">
            {/* Browser Chrome */}
            <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-slate-200">
                <Search className="h-3 w-3 text-slate-400" />
                <span className="text-xs text-slate-500">tablex.com</span>
              </div>
            </div>

            {/* Utility Bar */}
            <div className="bg-brand-navy px-6 py-2 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {utilityNav.map((item) => {
                  const Icon = utilityIconMap[item.id] ?? Globe;
                  return (
                    <div key={item.id} className="flex items-center gap-1">
                      <Icon className="h-3 w-3 text-white/50" />
                      <span className="text-[10px] text-white/70">{item.label}</span>
                      {item.isNew && <Sparkles className="h-2 w-2 text-emerald-400" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Nav Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-8 h-8 bg-brand-navy rounded-lg flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">TX</span>
                </div>
                {primarySections.map((section) => {
                  const isActive = expandedMenu === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setExpandedMenu(isActive ? null : section.id)}
                      className={cn(
                        "text-xs font-semibold transition-colors relative pb-0.5",
                        isActive ? "text-brand-navy" : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      {section.label}
                      {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green rounded-full" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                {actionSections.map((action) => {
                  const isQuote = action.id === "quote";
                  return (
                    <button
                      key={action.id}
                      onClick={() => setExpandedMenu(expandedMenu === action.id ? null : action.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors",
                        isQuote
                          ? "bg-brand-green text-white hover:bg-brand-green/90"
                          : "bg-brand-navy text-white hover:bg-brand-navy/90"
                      )}
                    >
                      {action.label.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mega Menu */}
            {expandedMenu && (
              <MegaMenuPanel
                sections={sections}
                sectionId={expandedMenu}
                onClose={() => setExpandedMenu(null)}
              />
            )}

            {/* Page Content */}
            <div className="px-6 py-8 bg-slate-50 min-h-[120px]">
              {!expandedMenu && (
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Page Content Area</p>
                  <p className="text-[11px] text-slate-400">Click any nav item above to preview its mega-menu</p>
                </div>
              )}
            </div>

            {/* Portals */}
            <div className="border-t-2 border-dashed border-slate-300 bg-slate-50/80 px-6 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-600">Authenticated Portals</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {portalSections.map((portal) => {
                  const c = colorMap[portal.color] ?? colorMap.blue;
                  return (
                    <div key={portal.id} className={cn("rounded-xl border-2 p-4", c.border, c.bgLight)}>
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-3.5 w-3.5 text-blue-500" />
                        <span className={cn("text-sm font-semibold", c.text)}>{portal.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-3">{portal.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {portal.children.map((child) => (
                          <span key={child.id} className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border bg-white/60", c.border, c.text)}>
                            {child.label}
                            {child.isNew && <Sparkles className="h-2 w-2 text-emerald-500" />}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <StatCards />
    </div>
  );
}

function MegaMenuPanel({
  sections,
  sectionId,
  onClose,
}: {
  sections: ArchSection[];
  sectionId: string;
  onClose: () => void;
}) {
  const section = sections.find((s) => s.id === sectionId);
  if (!section) return null;
  const c = colorMap[section.color] ?? colorMap.slate;

  return (
    <div className={cn("border-b-2 px-6 py-5", c.border, c.bgLight)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className={cn("text-sm font-bold", c.text)}>{section.label}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">{section.description}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xs">Close</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {section.children.map((child) => (
          <div key={child.id} className={cn("flex items-start gap-2 px-3 py-2.5 rounded-lg border bg-white/70 hover:bg-white transition-colors", c.border)}>
            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 mt-1.5", c.dot)} />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-slate-800">{child.label}</span>
                {child.isNew && <Sparkles className="h-2.5 w-2.5 text-emerald-500 shrink-0" />}
                {child.auth && <Lock className="h-2.5 w-2.5 text-blue-400 shrink-0" />}
              </div>
              {child.description && <p className="text-[10px] text-slate-400 mt-0.5">{child.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Shared: Wireframe User Flows Tab (v2 style)
// ═══════════════════════════════════════════════════════════════════

const wireframeLayouts: Record<string, Record<string, React.ReactNode>> = {
  "Commercial Dealer": {
    Login: <WireframeLogin />,
    Configure: <WireframeProducts />,
    Price: <WireframeConfigurator />,
    Quote: <WireframeQuote />,
    Track: <WireframeTracker />,
    Order: <WireframeOrder />,
  },
  "Manufacturer's Rep": {
    Login: <WireframeLogin />,
    Review: <WireframeProducts />,
    Download: <WireframeDownloads />,
    Demo: <WireframeConfigurator />,
    Quote: <WireframeQuote />,
    Report: <WireframeDashboard />,
  },
  "Individual Buyer": {
    Discover: <WireframeSpaces />,
    Browse: <WireframeProducts />,
    Configure: <WireframeConfigurator />,
    Purchase: <WireframeCart />,
    Track: <WireframeTracker />,
  },
};

function WireframeFlowsTab({ paths }: { paths: PersonaPath[] }) {
  const personaIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Building2,
    Briefcase,
    User,
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        How each audience navigates the redesigned site. Each screen represents a key step in their workflow.
      </p>

      {paths.map((persona) => {
        const a = accentColors[persona.accent] ?? accentColors.blue;
        const Icon = personaIconMap[persona.icon] ?? User;
        const layouts = wireframeLayouts[persona.persona] ?? {};

        return (
          <Card key={persona.persona}>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className={cn("flex items-center justify-center w-10 h-10 rounded-xl", a.bg)}>
                    <Icon className={cn("h-5 w-5", a.text)} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{persona.persona}</CardTitle>
                    <CardDescription>{persona.trafficShare} of traffic</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  <Target className="h-3 w-3 mr-1" />
                  {persona.goal}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 overflow-x-auto pb-3">
                {persona.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3 shrink-0">
                    <div className="w-[150px]">
                      <div className={cn("rounded-t-lg border border-b-0 px-2 py-1.5 flex items-center gap-1.5", a.border, a.bg)}>
                        <div className="flex gap-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        </div>
                        <span className={cn("text-[8px] font-semibold truncate", a.text)}>{step.node}</span>
                      </div>
                      <div className={cn("border rounded-b-lg p-2.5 h-[100px] bg-white", a.border)}>
                        {layouts[step.label] ?? (
                          <div className="h-full flex items-center justify-center">
                            <Monitor className="h-6 w-6 text-slate-200" />
                          </div>
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-0.5">
                          <span className={cn("flex items-center justify-center w-4 h-4 rounded-full text-[8px] font-bold text-white", a.dot)}>
                            {i + 1}
                          </span>
                          <span className={cn("text-[11px] font-semibold", a.text)}>{step.label}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 leading-tight">{step.action}</p>
                      </div>
                    </div>
                    {i < persona.steps.length - 1 && (
                      <ArrowRight className={cn("h-4 w-4 shrink-0 -mt-6", a.text)} />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Card className="border-brand-green/30 bg-brand-green/5">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-green/20 shrink-0">
            <Zap className="h-5 w-5 text-brand-green" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Every Path Converges on Self-Service</p>
            <p className="text-sm text-slate-600 mt-1">
              Across all three personas, the redesigned site replaces manual touchpoints with self-service tools.
              Dealers configure and quote without waiting. Reps demo live on tablet instead of emailing PDFs.
              Individuals buy directly without needing a dealer for small orders.
              The common thread: <strong>eliminate the wait</strong>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Shared: Persona Flow Cards (v1 style — step pills, no wireframes)
// ═══════════════════════════════════════════════════════════════════

function PersonaFlowCards({ paths }: { paths: PersonaPath[] }) {
  const personaIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Building2,
    Briefcase,
    User,
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        How each audience navigates the redesigned site to accomplish their primary goal.
      </p>
      {paths.map((persona) => {
        const a = accentColors[persona.accent] ?? accentColors.blue;
        const Icon = personaIconMap[persona.icon] ?? User;

        return (
          <Card key={persona.persona}>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className={cn("flex items-center justify-center w-10 h-10 rounded-xl", a.bg)}>
                    <Icon className={cn("h-5 w-5", a.text)} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{persona.persona}</CardTitle>
                    <CardDescription>{persona.trafficShare} of traffic</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  <Target className="h-3 w-3 mr-1" />
                  {persona.goal}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2 overflow-x-auto pb-2">
                {persona.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 shrink-0">
                    <div className={cn("flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border min-w-[130px]", a.border, a.bg)}>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white", a.dot)}>
                          {i + 1}
                        </span>
                        <span className={cn("text-xs font-semibold", a.text)}>{step.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">{step.node}</p>
                      <p className="text-[10px] text-slate-400 text-center">{step.action}</p>
                    </div>
                    {i < persona.steps.length - 1 && <ArrowRight className={cn("h-4 w-4 shrink-0", a.text)} />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Shared: Comparison Table
// ═══════════════════════════════════════════════════════════════════

function ComparisonTable({ data }: { data: Comparison[] }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Side-by-side comparison of the current tablex.com and the proposed redesign across {data.length} key areas.
      </p>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-slate-400 font-semibold w-[160px]">Area</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-red-400 font-semibold">Current State</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-emerald-500 font-semibold">Future State</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={row.area} className={cn("border-b border-slate-50", i % 2 === 0 ? "bg-white" : "bg-slate-50/50")}>
                    <td className="px-5 py-3.5 font-semibold text-slate-900 align-top">{row.area}</td>
                    <td className="px-5 py-3.5 text-slate-500 align-top">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-300 shrink-0 mt-1.5" />
                        {row.current}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 align-top">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                        {row.future}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Impact summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-5">
            <p className="text-[10px] uppercase tracking-wider text-red-400 font-semibold">Current Problems</p>
            <p className="text-3xl font-bold text-red-700 mt-1">{data.length}</p>
            <p className="text-xs text-red-500 mt-1">Areas with significant gaps</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-5">
            <p className="text-[10px] uppercase tracking-wider text-emerald-500 font-semibold">Net-New Capabilities</p>
            <p className="text-3xl font-bold text-emerald-700 mt-1">{architectureStats.newPages}</p>
            <p className="text-xs text-emerald-500 mt-1">Pages that don&apos;t exist today</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-5">
            <p className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold">Authenticated Areas</p>
            <p className="text-3xl font-bold text-blue-700 mt-1">{architectureStats.authenticatedPages}</p>
            <p className="text-xs text-blue-500 mt-1">Gated behind dealer/rep login</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 shrink-0">
            <ChevronRight className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-800">From Brochure Site to Business Platform</p>
            <p className="text-sm text-amber-700 mt-2">
              The current tablex.com is a marketing brochure with a contact form. The redesign transforms
              it into a business platform — with self-service quoting, dealer/rep portals, direct purchasing
              for small orders, and real-time pricing. Every capability gap identified in the audit has a
              corresponding solution in the proposed architecture.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Shared: Small components
// ═══════════════════════════════════════════════════════════════════

function PrincipleCards({ principles }: { principles: DesignPrinciple[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {principles.map((p) => {
        const Icon = iconMap[p.icon] ?? Zap;
        return (
          <Card key={p.title} hover>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-green/10">
                  <Icon className="h-4 w-4 text-brand-green" />
                </div>
                <p className="text-sm font-semibold text-slate-900">{p.title}</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function StatCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card hover>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{architectureStats.totalSections}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">Main Sections</p>
        </CardContent>
      </Card>
      <Card hover>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{architectureStats.totalPages}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">Total Pages</p>
        </CardContent>
      </Card>
      <Card hover>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{architectureStats.newPages}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">Net-New Pages</p>
        </CardContent>
      </Card>
      <Card hover>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{architectureStats.authenticatedPages}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">Auth-Gated</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Wireframe Screen Components
// ═══════════════════════════════════════════════════════════════════

function WireframeLogin() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-1.5">
      <div className="w-14 h-2 bg-slate-200 rounded" />
      <div className="w-16 h-2.5 bg-slate-100 rounded border border-slate-200" />
      <div className="w-16 h-2.5 bg-slate-100 rounded border border-slate-200" />
      <div className="w-10 h-2.5 bg-brand-green/30 rounded mt-0.5" />
    </div>
  );
}

function WireframeProducts() {
  return (
    <div className="h-full flex flex-col gap-1.5">
      <div className="w-12 h-1.5 bg-slate-200 rounded" />
      <div className="grid grid-cols-2 gap-1 flex-1">
        <div className="bg-slate-100 rounded border border-slate-200" />
        <div className="bg-slate-100 rounded border border-slate-200" />
        <div className="bg-slate-100 rounded border border-slate-200" />
        <div className="bg-slate-100 rounded border border-slate-200" />
      </div>
    </div>
  );
}

function WireframeConfigurator() {
  return (
    <div className="h-full flex flex-col gap-1.5">
      <div className="flex-1 bg-slate-100 rounded border border-slate-200 flex items-center justify-center">
        <span className="text-[8px] text-slate-300 font-semibold">3D</span>
      </div>
      <div className="flex gap-1">
        <div className="flex-1 h-2 bg-slate-200 rounded" />
        <div className="w-6 h-2 bg-brand-green/30 rounded" />
      </div>
    </div>
  );
}

function WireframeQuote() {
  return (
    <div className="h-full flex flex-col gap-1">
      <div className="w-10 h-1.5 bg-slate-200 rounded" />
      <div className="flex-1 flex flex-col gap-0.5">
        <div className="h-2 bg-slate-100 rounded border border-slate-200" />
        <div className="h-2 bg-slate-100 rounded border border-slate-200" />
        <div className="h-2 bg-slate-100 rounded border border-slate-200" />
      </div>
      <div className="flex gap-1 mt-auto">
        <div className="flex-1 h-2 bg-slate-100 rounded border border-slate-200" />
        <div className="w-8 h-2 bg-blue-200/50 rounded" />
      </div>
    </div>
  );
}

function WireframeTracker() {
  return (
    <div className="h-full flex flex-col gap-1.5">
      <div className="w-12 h-1.5 bg-slate-200 rounded" />
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-emerald-300" />
        <div className="flex-1 h-1 bg-slate-200 rounded" />
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-amber-300" />
        <div className="flex-1 h-1 bg-slate-200 rounded" />
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-slate-200" />
        <div className="flex-1 h-1 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

function WireframeOrder() {
  return (
    <div className="h-full flex flex-col gap-1.5">
      <div className="w-10 h-1.5 bg-slate-200 rounded" />
      <div className="flex-1 bg-slate-100 rounded border border-slate-200 p-1.5">
        <div className="w-full h-1.5 bg-slate-200 rounded mb-1" />
        <div className="w-8 h-1.5 bg-slate-200 rounded" />
      </div>
      <div className="w-full h-3 bg-brand-green/30 rounded flex items-center justify-center">
        <span className="text-[6px] text-brand-green font-bold">SUBMIT PO</span>
      </div>
    </div>
  );
}

function WireframeDownloads() {
  return (
    <div className="h-full flex flex-col gap-1">
      <div className="w-12 h-1.5 bg-slate-200 rounded" />
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-blue-100 rounded border border-blue-200" />
        <div className="flex-1 h-1.5 bg-slate-200 rounded" />
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-blue-100 rounded border border-blue-200" />
        <div className="flex-1 h-1.5 bg-slate-200 rounded" />
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-blue-100 rounded border border-blue-200" />
        <div className="flex-1 h-1.5 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

function WireframeDashboard() {
  return (
    <div className="h-full flex flex-col gap-1">
      <div className="w-12 h-1.5 bg-slate-200 rounded" />
      <div className="grid grid-cols-2 gap-1 flex-1">
        <div className="bg-emerald-50 rounded border border-emerald-200 flex items-center justify-center">
          <span className="text-[7px] text-emerald-400 font-bold">$</span>
        </div>
        <div className="bg-blue-50 rounded border border-blue-200 flex items-center justify-center">
          <span className="text-[7px] text-blue-400 font-bold">#</span>
        </div>
      </div>
      <div className="h-4 bg-slate-100 rounded border border-slate-200" />
    </div>
  );
}

function WireframeSpaces() {
  return (
    <div className="h-full flex flex-col gap-1.5">
      <div className="w-14 h-1.5 bg-violet-200 rounded" />
      <div className="flex-1 grid grid-cols-2 gap-1">
        <div className="bg-violet-50 rounded border border-violet-200" />
        <div className="bg-violet-50 rounded border border-violet-200" />
        <div className="bg-violet-50 rounded border border-violet-200" />
        <div className="bg-violet-50 rounded border border-violet-200" />
      </div>
    </div>
  );
}

function WireframeCart() {
  return (
    <div className="h-full flex flex-col gap-1">
      <div className="w-8 h-1.5 bg-slate-200 rounded" />
      <div className="flex items-center gap-1 px-0.5">
        <div className="w-4 h-4 bg-slate-100 rounded border border-slate-200" />
        <div className="flex-1">
          <div className="h-1 bg-slate-200 rounded mb-0.5" />
          <div className="h-1 w-6 bg-slate-200 rounded" />
        </div>
      </div>
      <div className="flex items-center gap-1 px-0.5">
        <div className="w-4 h-4 bg-slate-100 rounded border border-slate-200" />
        <div className="flex-1">
          <div className="h-1 bg-slate-200 rounded mb-0.5" />
          <div className="h-1 w-6 bg-slate-200 rounded" />
        </div>
      </div>
      <div className="mt-auto w-full h-3 bg-brand-green/30 rounded flex items-center justify-center">
        <span className="text-[6px] text-brand-green font-bold">CHECKOUT</span>
      </div>
    </div>
  );
}

function WireframeSubmit() {
  return (
    <div className="h-full flex flex-col gap-1.5">
      <div className="w-12 h-1.5 bg-slate-200 rounded" />
      <div className="flex-1 bg-slate-50 rounded border border-slate-200 p-1.5 flex flex-col gap-1">
        <div className="h-1.5 bg-slate-200 rounded w-full" />
        <div className="h-1.5 bg-slate-200 rounded w-3/4" />
      </div>
      <div className="w-full h-3 bg-brand-green/30 rounded flex items-center justify-center">
        <span className="text-[6px] text-brand-green font-bold">SUBMIT</span>
      </div>
    </div>
  );
}
