"use client";

import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Server,
  Database,
  Globe,
  Mail,
  Shield,
  BarChart3,
  Box,
  Link2,
  ChevronDown,
  ChevronRight,
  Check,
  Clock,
  AlertCircle,
  DollarSign,
  Layers,
  FileText,
  HardDrive,
  CircleCheck,
  CircleX,
  MessageSquareText,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Cadence = "monthly" | "annual" | "one-time" | "usage";
type Status = "current" | "recommended" | "optional" | "future";

interface Alternative {
  name: string;
  provider: string;
  monthlyCost: string; // display string (e.g. "$20/mo", "$5–50/mo", "Included")
  tier: string;
  pros: string[];
  cons: string[];
}

interface Service {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  category: string;
  status: Status;
  currentTier: string;
  recommendedTier: string;
  monthlyCost: number; // for monthly/annual services, normalized to monthly
  annualCost: number; // actual annual cost (may include discount)
  cadence: Cadence;
  notes: string[];
  url?: string;
  alternatives?: Alternative[];
}

interface CostSummary {
  label: string;
  monthly: number;
  annual: number;
}

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<Status, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  current: { label: "Active", icon: Check, className: "text-emerald-600 bg-emerald-50" },
  recommended: { label: "Recommended", icon: Clock, className: "text-blue-600 bg-blue-50" },
  optional: { label: "Optional", icon: AlertCircle, className: "text-amber-600 bg-amber-50" },
  future: { label: "Phase 2+", icon: Clock, className: "text-purple-600 bg-purple-50" },
};

// ─── Infrastructure Services ──────────────────────────────────────────────────

const SERVICES: Service[] = [
  // ── Hosting & Compute ──
  {
    id: "vercel",
    name: "Vercel",
    provider: "Vercel Inc.",
    description: "Frontend hosting, edge functions, CI/CD, preview deployments, and analytics.",
    icon: Server,
    color: "#000000",
    category: "Hosting & Compute",
    status: "current",
    currentTier: "Pro",
    recommendedTier: "Pro",
    monthlyCost: 20,
    annualCost: 240,
    cadence: "monthly",
    notes: [
      "Currently active — hosting QuoteX dashboard",
      "Pro tier includes: 1TB bandwidth, 1000 builds/mo, serverless functions",
      "Per-seat pricing: $20/mo per team member",
      "Preview deployments for every PR — great for client review",
      "Analytics and Web Vitals included",
    ],
    alternatives: [
      {
        name: "Cloudflare Pages",
        provider: "Cloudflare",
        monthlyCost: "$20/mo (Pro)",
        tier: "Pro — 10,000 builds/mo, unlimited bandwidth",
        pros: [
          "200+ edge data centers — best global latency",
          "Workers for serverless compute with near-zero cold starts",
          "R2 object storage ($0.015/GB, no egress fees) for 3D models",
          "Built-in DDoS protection and WAF",
        ],
        cons: [
          "Next.js support via @cloudflare/next-on-pages — not first-party",
          "Some Next.js features (ISR, middleware) have edge-case limitations",
          "Less polished preview deployment UX than Vercel",
          "Vercel literally makes Next.js — tighter integration is hard to beat",
        ],
      },
      {
        name: "Railway",
        provider: "Railway Corp.",
        monthlyCost: "$5–50/mo (usage-based)",
        tier: "Pay-as-you-go — per-resource pricing",
        pros: [
          "Transparent, predictable pricing — no surprise bills",
          "Integrated Postgres databases included",
          "Built-in observability and monitoring",
          "Great for background jobs, cron tasks, and workers",
        ],
        cons: [
          "Traditional container hosting, not edge-optimized",
          "No preview deployments per PR (manual branch deploys)",
          "Smaller ecosystem than Vercel/Netlify",
          "Next.js runs as a Node server, not on edge network",
        ],
      },
    ],
  },
  {
    id: "supabase",
    name: "Supabase",
    provider: "Supabase Inc.",
    description: "Postgres database, auth, row-level security, realtime subscriptions, and file storage.",
    icon: Database,
    color: "#3ECF8E",
    category: "Hosting & Compute",
    status: "current",
    currentTier: "Pro",
    recommendedTier: "Pro",
    monthlyCost: 25,
    annualCost: 300,
    cadence: "monthly",
    notes: [
      "Currently active — database, auth, and 3D model storage",
      "Pro tier: 8GB database, 250GB bandwidth, 100GB storage",
      "Row-level security for multi-tenant dealer/rep access",
      "Auth handles login, password reset, role management",
      "Storage hosts 2,920+ GLB 3D models",
      "Realtime subscriptions available for live quote updates",
    ],
    alternatives: [
      {
        name: "Neon",
        provider: "Neon Inc.",
        monthlyCost: "$19/mo (Pro)",
        tier: "Pro — 100 compute hours, autoscaling",
        pros: [
          "Serverless Postgres — scales to zero when idle (no charges)",
          "Superior database branching for CI/CD and preview environments",
          "$6/mo cheaper than Supabase Pro for pure Postgres",
          "Point-in-time recovery and logical replication",
        ],
        cons: [
          "Database only — no auth, file storage, or realtime included",
          "Would need separate services for auth (Clerk/Auth.js), storage (R2/S3), realtime",
          "Rebuilding Supabase's bundled features adds complexity and cost",
          "Smaller community than Supabase",
        ],
      },
      {
        name: "Appwrite",
        provider: "Appwrite (open-source)",
        monthlyCost: "$15/mo (Cloud) · Free self-hosted",
        tier: "Pro — full platform (DB + auth + storage + functions)",
        pros: [
          "Full BaaS platform like Supabase — DB, auth, storage, functions",
          "Open-source and self-hostable (Docker)",
          "Cloud tier at $15/mo is $10 cheaper than Supabase",
          "Built-in realtime, webhooks, and scheduled functions",
        ],
        cons: [
          "Uses MariaDB internally, not Postgres — different SQL dialect",
          "Smaller community and ecosystem than Supabase",
          "Self-hosted requires significant DevOps overhead",
          "Less mature RLS model — permissions are SDK-level, not database-level",
        ],
      },
    ],
  },

  // ── Domain & DNS ──
  {
    id: "domain",
    name: "Domain & DNS",
    provider: "Cloudflare / Registrar",
    description: "Domain registration, DNS management, SSL certificates, and DDoS protection.",
    icon: Globe,
    color: "#F48120",
    category: "Domain & DNS",
    status: "recommended",
    currentTier: "N/A",
    recommendedTier: "Free (Cloudflare) + domain",
    monthlyCost: 2,
    annualCost: 20,
    cadence: "annual",
    notes: [
      "tablex.com domain already registered (client-owned)",
      "Recommend Cloudflare for DNS — free tier includes DDoS protection, CDN, SSL",
      "~$15-20/yr for domain renewal depending on registrar",
      "Vercel handles SSL cert provisioning automatically",
    ],
  },

  // ── CMS ──
  {
    id: "cms",
    name: "Headless CMS",
    provider: "Evaluating — see comparison below",
    description: "Content management for website pages, blog posts, product descriptions, and media library.",
    icon: FileText,
    color: "#F03E2F",
    category: "Content Management",
    status: "recommended",
    currentTier: "N/A",
    recommendedTier: "Strapi (self-hosted)",
    monthlyCost: 7,
    annualCost: 84,
    cadence: "monthly",
    notes: [
      "Needed for website content management by non-technical staff",
      "Leaning toward Strapi self-hosted on Railway (~$7/mo) — see comparison below",
      "Self-hosted = all content data lives in our own Postgres database",
      "No document limits, no vendor lock-in, no dataset restrictions",
      "A TableX competitor is already using Strapi successfully",
      "Trade-off: slightly more DevOps than a managed SaaS (updates, backups)",
    ],
  },

  // ── Email ──
  {
    id: "email-transactional",
    name: "Transactional Email",
    provider: "Resend",
    description: "Quote delivery, order confirmations, password resets, and system notifications.",
    icon: Mail,
    color: "#000000",
    category: "Email & Notifications",
    status: "recommended",
    currentTier: "N/A",
    recommendedTier: "Free (3K emails/mo)",
    monthlyCost: 0,
    annualCost: 0,
    cadence: "monthly",
    notes: [
      "Supabase handles auth emails (password reset, invite) on its own",
      "Need transactional email for: quote PDFs, order confirmations, notifications",
      "React Email: build email templates as React + Tailwind components — same stack as the app",
      "Free tier: 100 emails/day (~3,000/mo) — covers 200 quotes/month + system emails easily",
      "Pro tier: $20/mo for 50K emails if volume grows post-launch",
      "First-class Next.js SDK (@resend/next) with webhook support",
    ],
    alternatives: [
      {
        name: "Postmark",
        provider: "ActiveCampaign",
        monthlyCost: "$15/mo (no free tier)",
        tier: "Starter — 10,000 emails/mo",
        pros: [
          "Industry-best delivery speed — under 10 seconds average",
          "Transactional-only policy keeps IP reputation pristine",
          "Excellent inbound email processing",
          "Most reliable deliverability in the industry",
        ],
        cons: [
          "No free tier — $15/mo minimum from day one",
          "No native React Email support — render HTML separately",
          "Less modern developer experience than Resend",
          "Overkill reliability for 200 quotes/month volume",
        ],
      },
      {
        name: "Plunk",
        provider: "Plunk (open-source)",
        monthlyCost: "$9/mo (Cloud) · Free self-hosted",
        tier: "Cloud — 10,000 emails/mo (uses AWS SES)",
        pros: [
          "Open-source and self-hostable — aligns with data sovereignty",
          "React Email template support",
          "Cloud tier at $9/mo is affordable",
          "Could self-host on Railway alongside CMS (~$5–7/mo)",
        ],
        cons: [
          "Small team, small community — higher bus-factor risk",
          "Less mature than Resend or Postmark",
          "Self-hosted requires managing your own SES credentials and reputation",
          "Limited documentation compared to established providers",
        ],
      },
    ],
  },

  // ── 3D / CDN ──
  {
    id: "cdn-3d",
    name: "3D Model CDN",
    provider: "Supabase Storage + Vercel Edge",
    description: "Delivery of 3D GLB models for the table configurator with edge caching.",
    icon: Box,
    color: "#8B5CF6",
    category: "Media & CDN",
    status: "current",
    currentTier: "Supabase Storage",
    recommendedTier: "Supabase Storage",
    monthlyCost: 0,
    annualCost: 0,
    cadence: "monthly",
    notes: [
      "Currently served from Supabase Storage (included in Pro plan)",
      "2,920 GLB files, ~1.5GB total storage",
      "Vercel edge network provides automatic CDN caching",
      "If bandwidth becomes an issue, consider Cloudflare R2 ($0.015/GB after 10GB free)",
      "No additional cost expected at current scale",
    ],
    alternatives: [
      {
        name: "Cloudflare R2",
        provider: "Cloudflare",
        monthlyCost: "$0.015/GB/mo (no egress fees)",
        tier: "Pay-as-you-go — S3-compatible",
        pros: [
          "Zero egress fees — biggest cost advantage over S3/other storage",
          "S3-compatible API — easy migration from any S3-like storage",
          "Global edge caching via Cloudflare's CDN network",
          "Best upgrade path if 3D model bandwidth becomes expensive",
        ],
        cons: [
          "Separate service to manage (not bundled like Supabase Storage)",
          "At current scale (~1.5GB), savings are negligible vs included storage",
          "Adds another vendor dependency",
          "No built-in admin UI for managing files",
        ],
      },
      {
        name: "Bunny.net",
        provider: "Bunny.net",
        monthlyCost: "$1/mo + $0.005/GB bandwidth",
        tier: "Pay-as-you-go — 114 global PoPs",
        pros: [
          "Cheapest dedicated CDN — as low as $0.005/GB bandwidth",
          "114 points of presence globally — great for international dealers",
          "Bunny Storage included — simple file management",
          "Edge rules and optimization for media delivery",
        ],
        cons: [
          "Another service to manage outside the Supabase ecosystem",
          "Minimal savings at current bandwidth levels",
          "Less developer-focused than Cloudflare",
          "No S3-compatible API — uses their own upload API",
        ],
      },
    ],
  },

  // ── Xero ──
  {
    id: "xero",
    name: "Xero API",
    provider: "Xero Ltd.",
    description: "Accounting integration — invoice sync, payment tracking, contact management.",
    icon: Link2,
    color: "#13B5EA",
    category: "Integrations",
    status: "future",
    currentTier: "N/A",
    recommendedTier: "Partner Program",
    monthlyCost: 0,
    annualCost: 0,
    cadence: "monthly",
    notes: [
      "TableX already has a Xero subscription (client-owned)",
      "API access included with their existing Xero plan — no additional cost",
      "Xero Partner Program: free API access for app developers",
      "Rate limits: 60 calls/min per tenant — sufficient for sync workload",
      "OAuth2 app registration required (free)",
      "No additional infrastructure cost for the integration",
    ],
  },

  // ── Monitoring ──
  {
    id: "monitoring",
    name: "Monitoring & Error Tracking",
    provider: "Sentry / Vercel",
    description: "Error tracking, performance monitoring, uptime alerts, and log aggregation.",
    icon: BarChart3,
    color: "#362D59",
    category: "Monitoring & Security",
    status: "recommended",
    currentTier: "N/A",
    recommendedTier: "Free–Team",
    monthlyCost: 0,
    annualCost: 0,
    cadence: "monthly",
    notes: [
      "Vercel includes basic analytics and Web Vitals (already active)",
      "Sentry: free tier covers 5K errors/mo — sufficient for launch",
      "Team tier ($26/mo) if we need performance tracing and session replay",
      "Supabase dashboard has built-in database monitoring",
      "Recommendation: start with free tiers, upgrade only if needed",
      "Cost shown as $0 — free tiers adequate for Phase 2 launch",
    ],
    alternatives: [
      {
        name: "Highlight.io",
        provider: "Highlight (open-source)",
        monthlyCost: "$0 (free: 500 sessions, 1K errors)",
        tier: "Free — session replay + errors + logs",
        pros: [
          "All-in-one: session replay + error tracking + logs in one tool",
          "Open-source and self-hostable (Apache 2.0)",
          "See exactly what a dealer was doing in Spec Studio when an error occurred",
          "Active development, modern UI, growing community",
        ],
        cons: [
          "Smaller ecosystem and community than Sentry",
          "Self-hosted requires ClickHouse + Kafka (heavy infrastructure)",
          "Less mature error grouping and deduplication",
          "Session replay SDK can impact client-side performance",
        ],
      },
      {
        name: "GlitchTip",
        provider: "GlitchTip (open-source)",
        monthlyCost: "$18/mo (Cloud) · Free self-hosted",
        tier: "Cloud — 100K events/mo, unlimited users",
        pros: [
          "Lightweight self-hosted Sentry — runs on just 512MB RAM",
          "Uses Sentry's SDK (@sentry/nextjs) — proven Next.js integration",
          "Could self-host on Railway for ~$5–7/mo",
          "MIT license, true data sovereignty",
        ],
        cons: [
          "Much fewer features than Sentry (no session replay, basic perf monitoring)",
          "Very small team (2–3 developers)",
          "No profiling, no cron monitoring, no release tracking",
          "UI is functional but basic compared to Sentry",
        ],
      },
    ],
  },

  // ── Security ──
  {
    id: "security",
    name: "Security & Compliance",
    provider: "Supabase RLS + Vercel + Cloudflare",
    description: "Row-level security, DDoS protection, rate limiting, and data encryption.",
    icon: Shield,
    color: "#EF4444",
    category: "Monitoring & Security",
    status: "current",
    currentTier: "Included",
    recommendedTier: "Included",
    monthlyCost: 0,
    annualCost: 0,
    cadence: "monthly",
    notes: [
      "Supabase RLS enforces data access at the database level",
      "All data encrypted at rest (AES-256) and in transit (TLS 1.3)",
      "Vercel provides automatic SSL and edge security",
      "Cloudflare free tier adds DDoS protection and WAF basics",
      "Supabase Auth handles secure session management",
      "No additional security tooling cost for Phase 2",
    ],
  },

  // ── Staging ──
  {
    id: "staging",
    name: "Staging Environment",
    provider: "Vercel + Supabase",
    description: "Separate staging environment for QA testing and client review before production deploys.",
    icon: Layers,
    color: "#F59E0B",
    category: "DevOps",
    status: "optional",
    currentTier: "N/A",
    recommendedTier: "Branch-based",
    monthlyCost: 0,
    annualCost: 0,
    cadence: "monthly",
    notes: [
      "Vercel Preview Deployments already provide per-PR staging (included in Pro)",
      "Supabase branching available on Pro for separate staging database",
      "Alternative: separate Supabase project on free tier for staging DB",
      "Vercel branch environments auto-deploy on push — no extra config needed",
      "No additional cost if using branch-based approach",
    ],
  },
];

// ─── Derived data ─────────────────────────────────────────────────────────────

const CATEGORIES = [...new Set(SERVICES.map((s) => s.category))];

// ─── CMS Comparison ───────────────────────────────────────────────────────────

interface CmsOption {
  name: string;
  model: string;
  freeTier: string;
  paidTier: string;
  docLimit: string;
  storage: string;
  dataOwnership: string;
  nextjsFit: string;
  collaboration: string;
  pros: string[];
  cons: string[];
}

const CMS_OPTIONS: CmsOption[] = [
  {
    name: "Strapi",
    model: "Open-source, self-hosted",
    freeTier: "Community Edition — unlimited, no restrictions",
    paidTier: "Growth $15/mo (features) · Cloud $99+/mo (hosted)",
    docLimit: "Unlimited (self-hosted)",
    storage: "Whatever your server has",
    dataOwnership: "Full — data lives in your own Postgres",
    nextjsFit: "Auto-generates REST + GraphQL APIs",
    collaboration: "Traditional sequential editing",
    pros: [
      "No document limits — 6K+ SKU catalog is no problem",
      "All data in your own database — full ownership and portability",
      "Free forever for self-hosted commercial use",
      "A TableX competitor is already using it",
      "Plugin ecosystem for custom fields and workflows",
    ],
    cons: [
      "Requires hosting — Node.js app on Railway/Render (~$7/mo)",
      "More DevOps than a managed SaaS (updates, backups)",
      "No real-time collaborative editing",
      "Admin UI less polished than Sanity Studio",
    ],
  },
  {
    name: "Sanity",
    model: "Cloud SaaS (fully managed)",
    freeTier: "10K docs, 250K API reqs/mo, public datasets only",
    paidTier: "Growth $15/user/mo (~$30-45/mo for 2-3 editors)",
    docLimit: "10K free · 25K on Growth · custom on Enterprise",
    storage: "100GB assets included",
    dataOwnership: "Vendor-managed — content in Sanity's proprietary Content Lake",
    nextjsFit: "GROQ queries, real-time preview, React-based Studio",
    collaboration: "Google Docs-style live editing",
    pros: [
      "Zero ops — fully managed, nothing to host or maintain",
      "Real-time collaborative editing (great for teams)",
      "GROQ is powerful for complex nested content queries",
      "Visual editing and live preview with Next.js",
      "Polished Studio UI — customizable with React components",
    ],
    cons: [
      "10K document ceiling on free (risky with TableX catalog)",
      "Public-only datasets on free — no draft/private content",
      "Growth tier adds $30-45/mo for small team",
      "Vendor lock-in — proprietary Content Lake, not portable",
      "Your content data lives on someone else's platform",
    ],
  },
  {
    name: "Payload",
    model: "Open-source, self-hosted (or Payload Cloud)",
    freeTier: "Unlimited — MIT license, no restrictions",
    paidTier: "Cloud $30/mo (hosted) · Self-hosted free",
    docLimit: "Unlimited (self-hosted)",
    storage: "Whatever your server has",
    dataOwnership: "Full — data in your own Postgres or MongoDB",
    nextjsFit: "Built on Next.js — runs in the same app, shared codebase",
    collaboration: "Draft/publish workflow, version history",
    pros: [
      "Runs inside your Next.js app — single deployment, no separate server",
      "TypeScript-native with auto-generated types",
      "All data in your own database",
      "Most modern of the three — built for Next.js from the ground up",
      "Rich field types, access control, and hooks built-in",
    ],
    cons: [
      "Newer/smaller community than Strapi or Sanity",
      "Adds complexity to main app deployment",
      "Admin UI functional but less polished than Sanity",
      "Fewer third-party plugins than Strapi",
    ],
  },
  {
    name: "Directus",
    model: "Open-source, self-hosted",
    freeTier: "Community Edition — unlimited, no restrictions",
    paidTier: "Cloud $99+/mo (hosted) · Self-hosted free",
    docLimit: "Unlimited (self-hosted — it's just SQL)",
    storage: "Whatever your server/database has",
    dataOwnership: "Full — wraps your existing Postgres (even Supabase's)",
    nextjsFit: "REST + GraphQL APIs, webhooks for ISR",
    collaboration: "Roles, field-level permissions, activity log, comments",
    pros: [
      "Wraps your existing database — could point at Supabase's Postgres directly",
      "Best data sovereignty: if you remove Directus, your data is untouched",
      "No document limits — 6K+ entries is trivial (it's raw SQL)",
      "Built-in automation/flows engine for workflows and notifications",
      "Auto-generates admin UI from your schema — no custom modeling needed",
    ],
    cons: [
      "No visual/inline editing — traditional admin panel",
      "Next.js integration is DIY (no official SDK or preview helpers)",
      "Self-hosted requires managing updates and backups",
      "Admin UI less polished than Sanity Studio or Contentful",
    ],
  },
  {
    name: "Contentful",
    model: "Cloud SaaS (fully managed)",
    freeTier: "25K entries, 5 users, 50 content types, 2 locales",
    paidTier: "Team $300/mo · Enterprise $2,000+/mo",
    docLimit: "25K free · higher on paid · unlimited on Enterprise",
    storage: "50GB assets free, more on paid",
    dataOwnership: "Vendor-managed — proprietary cloud, Contentful-specific export format",
    nextjsFit: "Official JS SDK, rich-text renderer, Live Preview, ISR webhooks",
    collaboration: "Scheduled publishing, workflows, comments, tasks, audit logs",
    pros: [
      "Most polished editing experience for non-technical marketing staff",
      "Best-in-class collaboration features (workflows, scheduling, comments)",
      "25K entries on free tier — more than enough for 6K SKUs",
      "Strong Next.js integration with official SDK and Live Preview",
      "Most mature ecosystem — largest community, extensive documentation",
    ],
    cons: [
      "Cloud-only — no self-hosting, no data sovereignty",
      "Team tier at $300/mo is expensive for a small team",
      "Vendor lock-in — proprietary content model format",
      "Content modeling is flat (no true relational joins, only references)",
      "Your content data lives on someone else's platform",
    ],
  },
];

function getCostSummaries(): CostSummary[] {
  const current = SERVICES.filter((s) => s.status === "current");
  const recommended = SERVICES.filter((s) => s.status === "recommended");
  const all = SERVICES;

  return [
    {
      label: "Current (Active)",
      monthly: current.reduce((sum, s) => sum + s.monthlyCost, 0),
      annual: current.reduce((sum, s) => sum + s.annualCost, 0),
    },
    {
      label: "Recommended Additions",
      monthly: recommended.reduce((sum, s) => sum + s.monthlyCost, 0),
      annual: recommended.reduce((sum, s) => sum + s.annualCost, 0),
    },
    {
      label: "Total (All Services)",
      monthly: all.reduce((sum, s) => sum + s.monthlyCost, 0),
      annual: all.reduce((sum, s) => sum + s.annualCost, 0),
    },
  ];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InfrastructurePage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const summaries = getCostSummaries();

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalMonthly = SERVICES.reduce((sum, s) => sum + s.monthlyCost, 0);
  const totalAnnual = SERVICES.reduce((sum, s) => sum + s.annualCost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Infrastructure & Costs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Platform services, hosting, and recurring costs for Phase 2 operations.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50 text-green-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Monthly (estimated)</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalMonthly)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Annual (estimated)</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalAnnual)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Services</p>
              <p className="text-lg font-bold text-gray-900">{SERVICES.length} total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Cost Summary</h2>
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-2.5 text-left font-medium text-gray-500">Category</th>
              <th className="px-5 py-2.5 text-right font-medium text-gray-500">Monthly</th>
              <th className="px-5 py-2.5 text-right font-medium text-gray-500">Annual</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((s, i) => (
              <tr
                key={s.label}
                className={cn(
                  "border-b border-gray-100",
                  i === summaries.length - 1 && "bg-gray-50 font-semibold"
                )}
              >
                <td className="px-5 py-3 text-gray-900">{s.label}</td>
                <td className="px-5 py-3 text-right text-gray-900">{formatCurrency(s.monthly)}/mo</td>
                <td className="px-5 py-3 text-right text-gray-900">{formatCurrency(s.annual)}/yr</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Services by Category */}
      {CATEGORIES.map((category) => {
        const categoryServices = SERVICES.filter((s) => s.category === category);
        return (
          <div key={category} className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{category}</h2>
            {categoryServices.map((service) => {
              const isOpen = expanded[service.id] ?? false;
              const status = statusConfig[service.status];
              const StatusIcon = status.icon;
              const Icon = service.icon;

              return (
                <div
                  key={service.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggle(service.id)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                      style={{ backgroundColor: service.color + "15", color: service.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-900">{service.name}</h3>
                        <span className="text-xs text-gray-400">{service.provider}</span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium",
                            status.className
                          )}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{service.description}</p>
                    </div>
                    <div className="hidden sm:block text-right shrink-0 mr-2">
                      <p className="text-sm font-medium text-gray-900">
                        {service.monthlyCost === 0 ? "Included" : `${formatCurrency(service.monthlyCost)}/mo`}
                      </p>
                      {service.annualCost > 0 && (
                        <p className="text-xs text-gray-500">{formatCurrency(service.annualCost)}/yr</p>
                      )}
                    </div>
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">Current Tier</p>
                          <p className="text-sm text-gray-900 font-medium mt-0.5">{service.currentTier}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">Recommended</p>
                          <p className="text-sm text-gray-900 font-medium mt-0.5">{service.recommendedTier}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">Billing</p>
                          <p className="text-sm text-gray-900 font-medium mt-0.5 capitalize">{service.cadence}</p>
                        </div>
                      </div>
                      <ul className="space-y-1.5">
                        {service.notes.map((note, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                            <span
                              className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                              style={{ backgroundColor: service.color }}
                            />
                            {note}
                          </li>
                        ))}
                      </ul>

                      {/* Alternatives */}
                      {service.alternatives && service.alternatives.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-gray-200">
                          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-3">
                            Alternatives Considered
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {service.alternatives.map((alt) => (
                              <div
                                key={alt.name}
                                className="rounded-lg border border-gray-200 bg-white p-3"
                              >
                                <div className="flex items-baseline justify-between mb-2">
                                  <div>
                                    <p className="text-xs font-semibold text-gray-900">{alt.name}</p>
                                    <p className="text-[10px] text-gray-400">{alt.provider}</p>
                                  </div>
                                  <p className="text-[10px] font-medium text-gray-500 shrink-0 ml-2">
                                    {alt.monthlyCost}
                                  </p>
                                </div>
                                <p className="text-[10px] text-gray-500 mb-2">{alt.tier}</p>
                                <div className="space-y-2">
                                  <ul className="space-y-0.5">
                                    {alt.pros.map((pro, i) => (
                                      <li key={i} className="text-[11px] text-gray-600 flex items-start gap-1.5">
                                        <CircleCheck className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                                        {pro}
                                      </li>
                                    ))}
                                  </ul>
                                  <ul className="space-y-0.5">
                                    {alt.cons.map((con, i) => (
                                      <li key={i} className="text-[11px] text-gray-600 flex items-start gap-1.5">
                                        <CircleX className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                                        {con}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Data Sovereignty Callout */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <HardDrive className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 font-medium">Data Ownership Consideration</p>
            <p className="text-xs text-amber-700 mt-1">
              Every SaaS platform we add is another place where business data lives.
              Right now the core stack is tight: <strong>Vercel</strong> (code/hosting) + <strong>Supabase</strong> (database, auth, files).
              The CMS decision below is the biggest factor — a self-hosted CMS keeps all content in the same
              Postgres database alongside quotes, orders, and CRM data. A cloud CMS adds another vendor
              dependency and another place data needs to be exported from if we ever migrate.
            </p>
          </div>
        </div>
      </div>

      {/* CMS Comparison */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">CMS Comparison</h2>
          <p className="text-sm text-gray-500 mt-1">Evaluating headless CMS options for the website content layer.</p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-700 w-36" />
                {CMS_OPTIONS.map((cms) => (
                  <th key={cms.name} className="px-4 py-3 text-left font-semibold text-gray-900">
                    {cms.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {([
                ["Model", "model"],
                ["Free Tier", "freeTier"],
                ["Paid Tier", "paidTier"],
                ["Document Limit", "docLimit"],
                ["Storage", "storage"],
                ["Data Ownership", "dataOwnership"],
                ["Next.js Fit", "nextjsFit"],
                ["Collaboration", "collaboration"],
              ] as const).map(([label, key]) => (
                <tr key={key} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2.5 font-medium text-gray-500 whitespace-nowrap">{label}</td>
                  {CMS_OPTIONS.map((cms) => (
                    <td
                      key={cms.name}
                      className={cn(
                        "px-4 py-2.5 text-gray-700",
                        key === "dataOwnership" && cms.dataOwnership.startsWith("Full") && "text-emerald-700 font-medium",
                        key === "dataOwnership" && cms.dataOwnership.startsWith("Vendor") && "text-amber-700"
                      )}
                    >
                      {cms[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pros/Cons Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {CMS_OPTIONS.map((cms) => (
            <div key={cms.name} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">{cms.name}</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">{cms.model}</p>
              </div>
              <div className="px-4 py-3 space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-emerald-600 font-semibold mb-1">Pros</p>
                  <ul className="space-y-1">
                    {cms.pros.map((pro, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                        <CircleCheck className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-red-500 font-semibold mb-1">Cons</p>
                  <ul className="space-y-1">
                    {cms.cons.map((con, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                        <CircleX className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CMS Analysis */}
      <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-5 py-5">
        <div className="flex items-start gap-3">
          <MessageSquareText className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-3">
            <p className="text-sm text-indigo-900 font-semibold">CMS Analysis &mdash; Where Our Thinking Stands</p>
            <p className="text-xs text-indigo-800 leading-relaxed">
              The core stack (Vercel + Supabase + Resend + Sentry) is solid and I wouldn&apos;t change any of it.
              The CMS is the one decision that deserves a harder look. The current lean is <strong>Strapi</strong> self-hosted
              on Railway (~$7/mo), which means a <em>second Postgres database</em> living on a separate server. Your product
              catalog, quotes, CRM, orders &mdash; all of that is already in Supabase&apos;s Postgres. Strapi would create its own
              schema in its own database. That&apos;s two databases to back up, two to monitor, and content data living
              separately from everything else.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Strapi */}
              <div className="rounded-lg bg-white/70 border border-indigo-100 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">SAFE BET</span>
                  <p className="text-xs font-semibold text-indigo-900">Strapi</p>
                </div>
                <p className="text-[11px] text-indigo-700 leading-relaxed">
                  Biggest community, a TableX competitor already uses it, proven at scale. The pragmatic choice.
                  Trade-off: separate Railway server (~$7/mo) and a second Postgres database to maintain.
                </p>
              </div>

              {/* Directus */}
              <div className="rounded-lg bg-white/70 border border-indigo-100 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700">WORTH A LOOK</span>
                  <p className="text-xs font-semibold text-indigo-900">Directus</p>
                </div>
                <p className="text-[11px] text-indigo-700 leading-relaxed">
                  Wraps your <em>existing</em> Supabase Postgres &mdash; one database, one source of truth. If you remove
                  Directus, your tables are untouched. Strongest data sovereignty story. Eliminates the ~$7/mo Railway cost.
                  Downside: auto-generated admin UI (functional, not as polished), Next.js integration is DIY.
                </p>
              </div>

              {/* Payload */}
              <div className="rounded-lg bg-white/70 border border-indigo-100 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700">DARK HORSE</span>
                  <p className="text-xs font-semibold text-indigo-900">Payload</p>
                </div>
                <p className="text-[11px] text-indigo-700 leading-relaxed">
                  Runs <em>inside</em> the Next.js app &mdash; same Vercel deployment, same codebase, same Postgres.
                  Zero additional infrastructure cost. TypeScript-native with auto-generated types.
                  Concern: newer/smaller community for a client project where long-term support matters.
                </p>
              </div>
            </div>

            <p className="text-xs text-indigo-800 leading-relaxed">
              <strong>Bottom line:</strong> Strapi is the safe call. Directus is the most architecturally interesting
              option for <em>this specific project</em> because the data is already in Supabase. Payload is the most
              developer-elegant but the newest bet. All three self-hosted options keep data ownership in our hands &mdash;
              Sanity and Contentful are included as references but the cloud-only model and vendor lock-in make them
              harder to recommend given our data sovereignty preference.
            </p>
          </div>
        </div>
      </div>

      {/* Stack Assessment */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-5">
        <div className="flex items-start gap-3">
          <CircleCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm text-emerald-900 font-semibold">Overall Stack Assessment</p>
            <div className="text-xs text-emerald-800 leading-relaxed space-y-1.5">
              <p>
                <strong>Vercel</strong> &mdash; Right choice. They make Next.js; no one integrates better. Cloudflare Pages
                is close on paper but the first-party DX gap is real. <em>Keep.</em>
              </p>
              <p>
                <strong>Supabase</strong> &mdash; Right choice. The bundled platform (Postgres + Auth + Storage + Realtime)
                at $25/mo is hard to beat. Neon is cheaper for raw Postgres but you&apos;d need 3&ndash;4 separate services to
                replace what Supabase bundles. <em>Keep.</em>
              </p>
              <p>
                <strong>Resend</strong> &mdash; Right choice. React Email templates (JSX + Tailwind) match the existing
                stack perfectly. Free tier covers launch volume. Postmark is the fallback if delivery speed ever
                becomes critical. <em>Keep.</em>
              </p>
              <p>
                <strong>Sentry</strong> &mdash; Right choice. Best Next.js integration in the industry, generous free tier.
                Highlight.io is worth revisiting later if session replay for the Spec Studio becomes valuable. <em>Keep.</em>
              </p>
              <p>
                <strong>CMS</strong> &mdash; The one open question. Strapi is the safe bet, Directus is the architecturally
                superior option for this project, Payload is the most developer-native. <em>Decision pending.</em>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Note */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4">
        <p className="text-sm text-blue-800 font-medium">Key Takeaway</p>
        <p className="text-xs text-blue-700 mt-1">
          Phase 2 infrastructure runs on just three paid services — Vercel ($20/mo), Supabase ($25/mo), and
          CMS hosting (~$7/mo). Everything else either has a free tier sufficient for launch or is included with
          existing subscriptions. Total recurring cost is approximately <strong>{formatCurrency(totalMonthly)}/month</strong>.
          As usage scales post-launch, expect modest increases for email delivery and monitoring — budget
          an additional $30-50/mo for growth.
        </p>
      </div>
    </div>
  );
}
