"use client";

import { formatCurrency } from "@/lib/utils";
import {
  Server,
  Database,
  Globe,
  Mail,
  Box,
  Layers,
  FileText,
  HardDrive,
  CircleCheck,
  DollarSign,
  Sparkles,
  Link2,
  Shield,
  ExternalLink,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StackPick {
  name: string;
  provider: string;
  role: string;
  monthlyCost: number; // 0 = free
  annualCost: number;  // 0 if monthly-only or free
  costNote?: string;   // overrides display when set (e.g. "Free", "Included")
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  url?: string;
}

interface StackGroup {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  picks: StackPick[];
}

// ─── The decided stack ────────────────────────────────────────────────────────

const STACK: StackGroup[] = [
  {
    id: "platform",
    label: "Platform & Hosting",
    description: "Where the application runs and where its data lives.",
    icon: Server,
    picks: [
      {
        name: "Vercel",
        provider: "Vercel Inc.",
        role: "Next.js hosting, edge network, preview deploys, CI/CD",
        monthlyCost: 20,
        annualCost: 240,
        icon: Server,
        color: "#000000",
        url: "https://vercel.com",
      },
      {
        name: "Supabase",
        provider: "Supabase Inc.",
        role: "Postgres database, auth, row-level security, file storage",
        monthlyCost: 25,
        annualCost: 300,
        icon: Database,
        color: "#3ECF8E",
        url: "https://supabase.com",
      },
      {
        name: "Cloudflare",
        provider: "Cloudflare",
        role: "DNS, DDoS protection, edge network",
        monthlyCost: 0,
        annualCost: 0,
        costNote: "Free",
        icon: Globe,
        color: "#F38020",
        url: "https://cloudflare.com",
      },
    ],
  },
  {
    id: "content",
    label: "Content & Media",
    description: "How marketing and product content gets managed and delivered.",
    icon: FileText,
    picks: [
      {
        name: "Payload CMS 3",
        provider: "Payload (open source, MIT)",
        role: "Headless CMS — runs inside the Next.js app, uses the same Supabase Postgres",
        monthlyCost: 0,
        annualCost: 0,
        costNote: "Free (OSS)",
        icon: FileText,
        color: "#000000",
        url: "https://payloadcms.com",
      },
      {
        name: "Cloudinary",
        provider: "Cloudinary",
        role: "Marketing site image and video CDN with on-the-fly transforms",
        monthlyCost: 0,
        annualCost: 0,
        costNote: "Free tier",
        icon: Box,
        color: "#3448C5",
        url: "https://cloudinary.com",
      },
      {
        name: "Supabase Storage",
        provider: "Supabase",
        role: "3D GLB model delivery for the Spec Studio configurator",
        monthlyCost: 0,
        annualCost: 0,
        costNote: "Included",
        icon: HardDrive,
        color: "#3ECF8E",
      },
      {
        name: "Adobe Fonts (Typekit)",
        provider: "Adobe",
        role: "Premium typography for the marketing site",
        monthlyCost: 0,
        annualCost: 50,
        costNote: "$0–50/yr",
        icon: FileText,
        color: "#FA0F00",
        url: "https://fonts.adobe.com",
      },
    ],
  },
  {
    id: "frontend",
    label: "Frontend Animation Stack",
    description: "The trifecta that gives the marketing site its premium feel — directly lifted from JSI's stack.",
    icon: Sparkles,
    picks: [
      {
        name: "GSAP",
        provider: "GreenSock (free for commercial use)",
        role: "Scroll-driven animations, parallax, complex timeline sequencing",
        monthlyCost: 0,
        annualCost: 0,
        costNote: "Free",
        icon: Sparkles,
        color: "#88CE02",
        url: "https://gsap.com",
      },
      {
        name: "Framer Motion",
        provider: "Framer (open source, MIT)",
        role: "React component-level animations, hover, layout, gestures",
        monthlyCost: 0,
        annualCost: 0,
        costNote: "Free (OSS)",
        icon: Sparkles,
        color: "#0055FF",
        url: "https://www.framer.com/motion/",
      },
      {
        name: "Lenis",
        provider: "Studio Freight (open source, MIT)",
        role: "Smooth-scroll behavior — the buttery page scroll feel",
        monthlyCost: 0,
        annualCost: 0,
        costNote: "Free (OSS)",
        icon: Sparkles,
        color: "#000000",
        url: "https://lenis.darkroom.engineering/",
      },
    ],
  },
  {
    id: "comms",
    label: "Email & Notifications",
    description: "Transactional email for quotes, orders, and system notifications.",
    icon: Mail,
    picks: [
      {
        name: "Resend",
        provider: "Resend",
        role: "Transactional email delivery via React Email templates",
        monthlyCost: 0,
        annualCost: 0,
        costNote: "Free tier (3K/mo)",
        icon: Mail,
        color: "#000000",
        url: "https://resend.com",
      },
    ],
  },
  {
    id: "monitoring",
    label: "Monitoring & Security",
    description: "Error tracking, observability, and baseline security.",
    icon: Shield,
    picks: [
      {
        name: "Sentry",
        provider: "Sentry",
        role: "Error tracking and performance monitoring with first-class Next.js integration",
        monthlyCost: 0,
        annualCost: 0,
        costNote: "Free tier",
        icon: Shield,
        color: "#362D59",
        url: "https://sentry.io",
      },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    description: "Third-party systems we sync with.",
    icon: Link2,
    picks: [
      {
        name: "Xero API",
        provider: "Xero Ltd.",
        role: "Accounting sync — invoices, payments, contacts (TableX-owned subscription)",
        monthlyCost: 0,
        annualCost: 0,
        costNote: "Client-owned",
        icon: Link2,
        color: "#13B5EA",
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function totalMonthly(): number {
  return STACK.flatMap((g) => g.picks).reduce((sum, p) => sum + p.monthlyCost, 0);
}

function totalAnnual(): number {
  return STACK.flatMap((g) => g.picks).reduce((sum, p) => sum + (p.annualCost || p.monthlyCost * 12), 0);
}

function formatPickCost(pick: StackPick): string {
  if (pick.costNote) return pick.costNote;
  if (pick.monthlyCost === 0 && pick.annualCost === 0) return "Free";
  if (pick.monthlyCost === 0 && pick.annualCost > 0) return `${formatCurrency(pick.annualCost)}/yr`;
  return `${formatCurrency(pick.monthlyCost)}/mo`;
}

// ─── View ─────────────────────────────────────────────────────────────────────

export default function FinalStackView() {
  const monthly = totalMonthly();
  const annual = totalAnnual();
  const totalServices = STACK.reduce((sum, g) => sum + g.picks.length, 0);
  const freeServices = STACK.flatMap((g) => g.picks).filter(
    (p) => p.monthlyCost === 0 && p.annualCost === 0,
  ).length;

  return (
    <div className="space-y-6">
      {/* Hero Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Monthly</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(monthly)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Annual</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(annual)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Services</p>
              <p className="text-lg font-bold text-gray-900">{totalServices}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Free / OSS</p>
              <p className="text-lg font-bold text-gray-900">{freeServices} of {totalServices}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Headline callout */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <CircleCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-900">Final stack — decided April 2026</p>
            <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
              Two paid services ({formatCurrency(monthly)}/mo total): Vercel and Supabase. Everything else is
              either free, open source, or included in an existing subscription. Stack is validated by
              direct comparison against JSI Furniture (the gold-standard competitor in the category) and
              all open questions on Payload + Postgres + Next.js 16 compatibility have been verified as of
              April 7, 2026.
            </p>
          </div>
        </div>
      </div>

      {/* Stack groups */}
      {STACK.map((group) => {
        const GroupIcon = group.icon;
        return (
          <div key={group.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-50 text-slate-700">
                <GroupIcon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900">{group.label}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{group.description}</p>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {group.picks.map((pick) => {
                const PickIcon = pick.icon;
                return (
                  <div key={pick.name} className="px-5 py-3 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                    <div
                      className="p-2 rounded-lg shrink-0"
                      style={{ backgroundColor: `${pick.color}15`, color: pick.color }}
                    >
                      <PickIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900">{pick.name}</p>
                        <p className="text-[11px] text-slate-400">{pick.provider}</p>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{pick.role}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-slate-900">{formatPickCost(pick)}</p>
                      {pick.url && (
                        <a
                          href={pick.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-[10px] text-slate-400 hover:text-slate-600 mt-0.5"
                        >
                          visit <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Why this stack */}
      <div className="rounded-lg border border-slate-200 bg-white px-5 py-5">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">Why this stack</p>
            <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <li className="flex items-start gap-2">
                <CircleCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Data sovereignty.</strong> Every piece of TableX data — product catalog, quotes,
                  CRM, orders, content — lives in <em>one</em> Postgres database we control (Supabase).
                  No vendor lock-in for the things that matter.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CircleCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>One deployment.</strong> Marketing site, dashboard, CMS admin, and the Spec Studio
                  configurator all ship from a single Next.js app on Vercel. No microservices, no separate
                  CMS server, no second database to back up.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CircleCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Competitive parity.</strong> The animation stack (GSAP + Framer Motion + Lenis),
                  CMS choice (Payload), and media CDN (Cloudinary) are the same combination JSI Furniture
                  uses — the best site in the contract furniture category.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CircleCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Cost discipline.</strong> {freeServices} of {totalServices} services are free or
                  open source. The two paid ones are non-negotiable platform infrastructure (hosting and
                  database). Nothing recurring beyond what we strictly need.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CircleCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Verified, not assumed.</strong> Every &ldquo;will this work?&rdquo; question on
                  Payload 3 + Postgres + Next.js 16 was checked against the live docs and the latest release
                  (Payload 3.81.0, April 1 2026) before being locked in.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pointer to research notes */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4">
        <p className="text-xs text-blue-900 leading-relaxed">
          <strong>📚 Looking for the rationale behind these picks?</strong> The full research with alternatives,
          comparison tables, and the JSI competitor stack teardown is preserved in the{" "}
          <strong>Research Notes (v1)</strong> view. Use the dropdown in the top-right to switch between
          views.
        </p>
      </div>
    </div>
  );
}
