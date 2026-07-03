"use client";

import { cn, formatCurrency } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Pencil, ShieldCheck, Plus, Printer } from "lucide-react";

// ─── Annotation Types ────────────────────────────────────────────────────────

type AnnotationType = "changed" | "clarification" | "added";

interface Annotation {
  id: string;
  type: AnnotationType;
  label: string;
  original?: string;
  changed: string;
  rationale: string;
}

const annotationConfig: Record<AnnotationType, { icon: typeof Pencil; bg: string; text: string; border: string; badge: string; label: string }> = {
  clarification: { icon: ShieldCheck, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", label: "Scope Clarification" },
  changed: { icon: Pencil, bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", label: "Text Changed" },
  added: { icon: Plus, bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", badge: "bg-blue-100 text-blue-700", label: "New Content" },
};

// ─── Annotations Data ────────────────────────────────────────────────────────

const ANNOTATIONS: Annotation[] = [
  {
    id: "a",
    type: "changed",
    label: "Web Style Guide",
    original: '"8+ page website"',
    changed: '"Up to 8 pages" with explicit page list: Home, About, Products (catalog), Product Detail, Dealers/Reps, Gallery, Contact, Blog',
    rationale: '"8+" is open-ended. Capping at 8 named pages prevents scope creep into unlimited page builds.',
  },
  {
    id: "b",
    type: "clarification",
    label: "CMS Integration",
    changed: "Volume cap: up to 25 CMS-managed pages. The existing 6,098 SKU catalog will be bulk-imported via script, not entered through the CMS content editor.",
    rationale: "Client may assume CMS means hand-entering 6K products. Clarifying that catalog data is script-loaded prevents mismatched expectations.",
  },
  {
    id: "c",
    type: "clarification",
    label: "3D Configurator",
    changed: "Scoped to existing 11 series with 2,920 pre-built GLB models already in Supabase storage. New series or models beyond the current library require a separate scope.",
    rationale: "Prevents assumption that the configurator handles unlimited future product lines without additional work.",
  },
  {
    id: "d",
    type: "clarification",
    label: "CRM Data Migration",
    changed: "Volume caps: ~900 organizations, ~500 contacts, 13 rep groups. Data must be provided in CSV format. Data cleaning/normalization capped at 8 hours — additional cleaning billed hourly.",
    rationale: "Migration scope is bounded by current data volume. CSV requirement and cleaning cap prevent open-ended data wrangling.",
  },
  {
    id: "e",
    type: "changed",
    label: "CPQ Discount Tiers",
    original: '"50/20/x" flexible discount structure',
    changed: "Exactly 4 discount tiers: 50/20, 50/20/5, 50/20/10, 50/20/15. No custom tier builder.",
    rationale: "Confirmed with TableX — only 4 tiers exist. Prevents building a complex custom discount engine.",
  },
  {
    id: "f",
    type: "added",
    label: "Design Revisions",
    changed: "All design phases include 2 rounds of revisions. Additional revision rounds billed at the applicable hourly rate ($150/hr design, $185/hr development).",
    rationale: "Without a revision cap, design phases can loop indefinitely. Industry standard is 2 rounds.",
  },
  {
    id: "g",
    type: "clarification",
    label: "Xero Integration",
    changed: "Go-forward sync only — no historical data migration. Client is responsible for Xero account configuration, chart of accounts setup, and tax settings.",
    rationale: "Historical sync is a separate (large) project. Xero config is client-side responsibility.",
  },
  {
    id: "h",
    type: "clarification",
    label: "Website QA & Launch Support",
    changed: "Up to 5 business days of post-launch support for bug fixes and critical issues. Feature requests or enhancements after launch are billed separately.",
    rationale: "Open-ended 'support' can stretch for months. 5 business days is a clear boundary.",
  },
  {
    id: "i",
    type: "changed",
    label: "Timeline",
    original: '"8-10 Weeks"',
    changed: '"16-20 Weeks" to match actual project plan with design phases, build sprints, and QA.',
    rationale: "Original estimate was unrealistic. Updated to match the Gantt chart in the proposal section.",
  },
  {
    id: "j",
    type: "added",
    label: "Payment Schedule",
    changed: "4 milestone payments of 25% ($15,890 each): (1) Project Kickoff, (2) Design Sign-off ~Week 7, (3) Build Complete ~Week 17, (4) Launch ~Week 20.",
    rationale: "Ties payment to deliverable milestones rather than time-based billing. Protects both parties.",
  },
];

// ─── Annotation Badge Component ──────────────────────────────────────────────

function AnnotationIcon({ id }: { id: string }) {
  const annotation = ANNOTATIONS.find((a) => a.id === id);
  if (!annotation) return null;

  const config = annotationConfig[annotation.type];
  const Icon = config.icon;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center justify-center w-5 h-5 rounded-full print:hidden cursor-help transition-transform hover:scale-110",
            config.bg,
            config.text,
            "border",
            config.border
          )}
          aria-label={`Annotation ${id}: ${config.label}`}
        >
          <Icon className="w-3 h-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-80 text-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide", config.badge)}>
              {config.label}
            </span>
            <span className="text-xs text-gray-400 font-mono">{annotation.id}</span>
          </div>
          <p className="text-xs font-semibold text-gray-900">{annotation.label}</p>
          {annotation.original && (
            <div className="rounded bg-red-50 border border-red-100 px-2.5 py-1.5">
              <p className="text-[10px] uppercase tracking-wide text-red-400 font-semibold mb-0.5">Original</p>
              <p className="text-xs text-red-700">{annotation.original}</p>
            </div>
          )}
          <div className={cn("rounded px-2.5 py-1.5 border", config.bg, config.border)}>
            <p className={cn("text-[10px] uppercase tracking-wide font-semibold mb-0.5", config.text)}>
              {annotation.original ? "Changed To" : "Added"}
            </p>
            <p className="text-xs text-gray-700">{annotation.changed}</p>
          </div>
          <div className="rounded bg-gray-50 border border-gray-100 px-2.5 py-1.5">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-0.5">Rationale</p>
            <p className="text-xs text-gray-600">{annotation.rationale}</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Line Items Data ─────────────────────────────────────────────────────────

interface LineItem {
  number: number;
  title: string;
  hours: number;
  cost: number;
  sections: Section[];
}

interface Section {
  heading: string;
  description?: string;
  deliverables?: string[];
  annotations?: string[];
}

const LINE_ITEMS: LineItem[] = [
  {
    number: 1,
    title: "Website Design & Development",
    hours: 120,
    cost: 19960,
    sections: [
      {
        heading: "Web Style Guide & Site Design",
        description: "Complete visual identity system for tablex.com including typography, color palette, spacing, component library, and responsive design tokens. Up to 8 page designs.",
        deliverables: [
          "Brand-aligned design system with reusable components",
          "Desktop and mobile layouts for all 8 pages: Home, About, Products, Product Detail, Dealers/Reps, Gallery, Contact, Blog",
          "Interactive prototypes for key user flows",
        ],
        annotations: ["a", "f"],
      },
      {
        heading: "CMS Integration & Content Architecture",
        description: "Headless CMS setup for content management by non-technical staff. Content modeling, API integration, and editorial workflow configuration.",
        deliverables: [
          "CMS content models for pages, blog posts, and media",
          "Up to 25 CMS-managed pages with structured content",
          "6,098 SKU catalog bulk import via automated script",
          "Editorial workflow with draft/publish states",
        ],
        annotations: ["b"],
      },
      {
        heading: "3D Table Configurator",
        description: "Interactive 3D product configurator allowing dealers and customers to visualize table configurations with real-time material and finish swapping.",
        deliverables: [
          "WebGL-based 3D viewer with orbit controls",
          "Material and finish swapping for existing 11 series (2,920 GLB models)",
          "Size filtering and configuration options",
          "Integration with quoting system for configured products",
        ],
        annotations: ["c"],
      },
      {
        heading: "Website QA & Launch",
        description: "Cross-browser testing, performance optimization, accessibility audit, and production deployment.",
        deliverables: [
          "Cross-browser testing (Chrome, Safari, Firefox, Edge)",
          "Mobile responsiveness verification",
          "Core Web Vitals optimization",
          "Up to 5 business days post-launch support",
        ],
        annotations: ["h"],
      },
    ],
  },
  {
    number: 2,
    title: "Dealer/Rep Portal",
    hours: 48,
    cost: 8250,
    sections: [
      {
        heading: "Portal Design & Development",
        description: "Authenticated portal for dealers and rep groups to access pricing, place quote requests, track orders, and manage their accounts.",
        deliverables: [
          "Role-based access control (dealer vs. rep group views)",
          "Dealer dashboard with order history and quote status",
          "Rep group dashboard with assigned dealer overview",
          "Quote request submission workflow",
        ],
        annotations: ["f"],
      },
    ],
  },
  {
    number: 3,
    title: "CRM Design & Development",
    hours: 53,
    cost: 9070,
    sections: [
      {
        heading: "CRM System",
        description: "Customer relationship management system for tracking organizations, contacts, interactions, and sales pipeline.",
        deliverables: [
          "Organization management (~900 orgs, ~500 contacts, 13 rep groups)",
          "Contact profiles with interaction history",
          "Sales pipeline and opportunity tracking",
          "Data migration from CSV — cleaning/normalization capped at 8 hours",
        ],
        annotations: ["d"],
      },
    ],
  },
  {
    number: 4,
    title: "Quoting System (CPQ)",
    hours: 103,
    cost: 18250,
    sections: [
      {
        heading: "Configure-Price-Quote Engine",
        description: "Full CPQ system for building, pricing, and managing table quotes with automated discount calculations and PDF generation.",
        deliverables: [
          "Visual table configurator with series/finish/edge selection",
          "Automated pricing with 4 discount tiers: 50/20, 50/20/5, 50/20/10, 50/20/15",
          "Quote PDF generation and email delivery",
          "Quote versioning and approval workflow",
          "Quote-to-order conversion",
        ],
        annotations: ["e"],
      },
      {
        heading: "CPQ Design",
        description: "UI/UX design for the quoting interface, configurator workflow, and quote management screens.",
        deliverables: [
          "Configurator step-by-step flow design",
          "Quote summary and comparison views",
          "Mobile-responsive quote management interface",
        ],
        annotations: ["f"],
      },
    ],
  },
  {
    number: 5,
    title: "Xero Integration",
    hours: 47,
    cost: 8030,
    sections: [
      {
        heading: "Accounting Integration",
        description: "Two-way sync between QuoteX and Xero for invoices, payments, and contact management.",
        deliverables: [
          "OAuth2 connection setup with Xero API",
          "Invoice sync: QuoteX → Xero (go-forward only, no historical migration)",
          "Payment status sync: Xero → QuoteX",
          "Contact/organization sync",
          "Client responsible for Xero account configuration and chart of accounts",
        ],
        annotations: ["g"],
      },
    ],
  },
];

const TOTAL = LINE_ITEMS.reduce((sum, item) => sum + item.cost, 0);
const TOTAL_HOURS = LINE_ITEMS.reduce((sum, item) => sum + item.hours, 0);

// ─── Page Component ──────────────────────────────────────────────────────────

export default function EstimatePage() {
  return (
    <div className="space-y-6">
      {/* Print Styles */}
      <style>{`
        @media print {
          nav, aside, header, [data-sidebar], [class*="Sidebar"], [class*="border-b border-gray-200 mb-6"] { display: none !important; }
          .print\\:hidden { display: none !important; }
          body { background: white !important; }
          * { box-shadow: none !important; border-color: #e5e7eb !important; }
          @page { margin: 0.75in; }
        }
      `}</style>

      {/* Legend + Print */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-gray-500">Legend:</span>
          {(Object.entries(annotationConfig) as [AnnotationType, typeof annotationConfig[AnnotationType]][]).map(([type, config]) => (
            <span key={type} className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", config.badge)}>
              <config.icon className="w-3 h-3" />
              {config.label}
            </span>
          ))}
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>

      {/* Estimate Document */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Clear pH Design</h1>
              <p className="text-xs text-gray-500 mt-1">St. Petersburg, FL</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">Estimate #1294</p>
              <p className="text-xs text-gray-500 mt-0.5">Date: 03/09/2026</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Prepared For</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">Table X</p>
                <p className="text-xs text-gray-500">tablex.com</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Subject</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">TableX | Website, CRM, & CPQ<br />Design & Development</p>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="divide-y divide-gray-100">
          {LINE_ITEMS.map((item) => (
            <div key={item.number} className="px-8 py-6">
              {/* Section Header */}
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">
                  <span className="text-gray-400 mr-2">{item.number}.</span>
                  {item.title}
                  <span className="text-xs font-normal text-gray-400 ml-2">({item.hours} hrs)</span>
                </h2>
                <p className="text-base font-bold text-gray-900 tabular-nums">{formatCurrency(item.cost)}</p>
              </div>

              {/* Sub-sections */}
              <div className="space-y-4">
                {item.sections.map((section, si) => (
                  <div key={si} className="ml-5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-sm font-semibold text-gray-800">{section.heading}</h3>
                      {section.annotations?.map((aid) => (
                        <AnnotationIcon key={aid} id={aid} />
                      ))}
                    </div>
                    {section.description && (
                      <p className="text-xs text-gray-600 leading-relaxed mb-2">{section.description}</p>
                    )}
                    {section.deliverables && (
                      <ul className="space-y-1">
                        {section.deliverables.map((d, di) => (
                          <li key={di} className="text-xs text-gray-600 flex items-start gap-2">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t-2 border-gray-200 px-8 py-5">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({TOTAL_HOURS} hrs)</span>
                <span className="tabular-nums">{formatCurrency(TOTAL)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Tax</span>
                <span>{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(TOTAL)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="border-t border-gray-200 px-8 py-6 space-y-5 bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Notes & Terms</h2>

          <div>
            <h3 className="text-xs font-semibold text-gray-800 mb-1">Outside of Scope</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              The following are explicitly outside the scope of this estimate: content writing/copywriting, professional photography, video production, SEO campaign management, paid advertising setup, third-party software licensing fees (Xero, etc.), historical data migration from Xero, custom report development beyond standard dashboards, and any work not described in the line items above.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-800 mb-1">Restrictions</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              This estimate is based on the scope described above. Changes to requirements, additional features, or expanded scope will be quoted separately. Client is responsible for providing all content (text, images, product data) in a timely manner. Delays in content delivery may affect the project timeline.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xs font-semibold text-gray-800">Timeline</h3>
              <AnnotationIcon id="i" />
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Estimated project duration is 16-20 weeks from kickoff, subject to timely client feedback and content delivery. Design phases run weeks 1-7, development weeks 3-17, and QA/launch weeks 17-20. Specific milestone dates will be established at project kickoff.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-800 mb-1">Rates</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Design & QA: $150/hr. Development: $185/hr. Additional work beyond the scope of this estimate will be billed at the applicable hourly rate with prior client approval.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xs font-semibold text-gray-800">Payment Schedule</h3>
              <AnnotationIcon id="j" />
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Payment is structured across 4 milestones, each at 25% of the total ({formatCurrency(TOTAL / 4)}):
            </p>
            <ol className="mt-1.5 space-y-1 list-decimal list-inside">
              <li className="text-xs text-gray-600"><span className="font-medium">Project Kickoff</span> — due upon signed agreement</li>
              <li className="text-xs text-gray-600"><span className="font-medium">Design Sign-off</span> — due ~Week 7</li>
              <li className="text-xs text-gray-600"><span className="font-medium">Build Complete</span> — due ~Week 17</li>
              <li className="text-xs text-gray-600"><span className="font-medium">Launch</span> — due ~Week 20</li>
            </ol>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-800 mb-1">Liability</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Clear pH Design&apos;s total liability under this agreement shall not exceed the total amount paid by the client. Clear pH Design is not liable for any indirect, incidental, or consequential damages including lost profits, data loss, or business interruption.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-800 mb-1">Agreement</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              This estimate is valid for 30 days from the date issued. Acceptance of this estimate constitutes agreement to the terms and conditions outlined herein. Work will commence upon receipt of the signed agreement and first milestone payment.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-800 mb-1">Confidentiality</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Both parties agree to keep confidential any proprietary information shared during the course of this project, including but not limited to business strategies, pricing data, customer lists, and technical specifications. This obligation survives the completion or termination of the project.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
