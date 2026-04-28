"use client";

import { useState, useEffect } from "react";
import {
  Server,
  Database,
  Globe,
  Mail,
  Box,
  Sparkles,
  FileText,
  HardDrive,
  Github,
  Shield,
  Link2,
  CircleCheck,
  Clock,
  ChevronDown,
  ChevronRight,
  User,
  Building2,
  ExternalLink,
  ListChecks,
  CircleDashed,
  Zap,
  Lock,
  AlertTriangle,
  PackageCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusId =
  | "not_started"
  | "in_progress"
  | "dev_ready"
  | "prod_ready"
  | "handed_off";

type OwnerId = "danny" | "clearph" | "tablex";
type StartBlocker = "yes" | "partial" | "blocked";

interface Step {
  id: string;
  label: string;
  blockedOnClient?: boolean;
}

interface Service {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  url?: string;
  owner: OwnerId;
  canStartNow: StartBlocker;
  blockerReason?: string;
  handoffRequired: boolean;
  handoffNotes: string;
  costNote: string;
  steps: Step[];
}

interface ServiceGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  services: Service[];
}

interface ServiceState {
  status: StatusId;
  completedSteps: string[];
  lastpassRef: string;
  notes: string;
}

type TrackerState = Record<string, ServiceState>;

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "tablex-infra-tracker-v1";

const STATUS_META: Record<
  StatusId,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  not_started: {
    label: "Not Started",
    color: "text-slate-600",
    bg: "bg-slate-100",
    border: "border-slate-200",
    icon: CircleDashed,
  },
  in_progress: {
    label: "In Progress",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: Clock,
  },
  dev_ready: {
    label: "Dev Ready",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Zap,
  },
  prod_ready: {
    label: "Production Ready",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CircleCheck,
  },
  handed_off: {
    label: "Handed Off",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    icon: PackageCheck,
  },
};

const STATUS_ORDER: StatusId[] = [
  "not_started",
  "in_progress",
  "dev_ready",
  "prod_ready",
  "handed_off",
];

const OWNER_META: Record<
  OwnerId,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  danny: { label: "Danny (Personal)", icon: User, color: "text-blue-600" },
  clearph: { label: "Clear pH Design", icon: Building2, color: "text-purple-600" },
  tablex: { label: "TableX (Client)", icon: Building2, color: "text-amber-600" },
};

const START_META: Record<
  StartBlocker,
  { label: string; color: string; bg: string; border: string }
> = {
  yes: {
    label: "Can start now",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  partial: {
    label: "Partial — some blockers",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  blocked: {
    label: "Blocked on client",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
};

// ─── Services data ────────────────────────────────────────────────────────────

const GROUPS: ServiceGroup[] = [
  {
    id: "platform",
    label: "Platform & Hosting",
    icon: Server,
    services: [
      {
        id: "github",
        name: "GitHub",
        icon: Github,
        color: "#181717",
        url: "https://github.com",
        owner: "danny",
        canStartNow: "yes",
        handoffRequired: true,
        handoffNotes:
          "Org is owned by whichever GitHub user created it. Long-term: promote a TableX-owned user to Owner and step Danny down to Admin. Billing email can be swapped to digital@tablex.com once forwards work.",
        costNote: "Free for public/private repos with small team",
        steps: [
          { id: "org", label: "Create 'tablex-inc' organization (business/institution type)" },
          { id: "billing-email", label: "Set billing email (danny@clearph.com for now → digital@tablex.com later)" },
          { id: "repo", label: "Create 'tablex-site' repo (empty, private)" },
          { id: "branch-protect", label: "Enable branch protection on main (require PR review + CI)" },
          { id: "invite-team", label: "Invite Richie, Brian, Arabella (roles: Admin / Member / Member)" },
          { id: "vercel-link", label: "Authorize the Vercel GitHub app against the org" },
          { id: "supabase-link", label: "Authorize Supabase GitHub integration for CI preview branches" },
          { id: "handoff", label: "Promote TableX-owned user to Owner at handoff" },
        ],
      },
      {
        id: "vercel",
        name: "Vercel",
        icon: Server,
        color: "#000000",
        url: "https://vercel.com",
        owner: "danny",
        canStartNow: "yes",
        handoffRequired: true,
        handoffNotes:
          "Transfer Pro project to a TableX-owned team when the client is ready. Vercel supports project transfers without losing deploy history.",
        costNote: "Free Hobby now → $20/mo Pro at launch",
        steps: [
          { id: "signup", label: "Sign up at vercel.com with GitHub" },
          { id: "import", label: "Import the Phase 2 repo as a new project" },
          { id: "env", label: "Configure environment variables (Supabase keys, Resend, Sentry DSN)" },
          { id: "previews", label: "Confirm preview deployments work on pull requests" },
          { id: "domain", label: "Attach custom domain (staging subdomain first)", blockedOnClient: true },
          { id: "upgrade", label: "Upgrade to Pro ($20/mo) before production launch" },
          { id: "invite", label: "Invite Richie as a collaborator" },
          { id: "transfer", label: "Transfer to TableX team account at handoff" },
        ],
      },
      {
        id: "supabase",
        name: "Supabase",
        icon: Database,
        color: "#3ECF8E",
        url: "https://supabase.com",
        owner: "danny",
        canStartNow: "yes",
        handoffRequired: true,
        handoffNotes:
          "Create a new 'TableX Phase 2' project separate from the Phase 1 dashboard. Transfer ownership to a TableX-owned Supabase org at handoff.",
        costNote: "Free now → $25/mo Pro at launch",
        steps: [
          { id: "create", label: "Create new 'tablex-phase2' Supabase project" },
          { id: "migrations", label: "Run base migrations and RLS policies" },
          { id: "auth", label: "Configure auth providers (email + any SSO)" },
          { id: "service-role", label: "Generate service-role key for Payload CMS" },
          { id: "buckets", label: "Create storage buckets (glb-models, product-images)" },
          { id: "upgrade", label: "Upgrade to Pro ($25/mo) for daily backups before launch" },
          { id: "transfer", label: "Transfer to TableX Supabase org at handoff" },
        ],
      },
      {
        id: "cloudflare",
        name: "Cloudflare",
        icon: Globe,
        color: "#F38020",
        url: "https://cloudflare.com",
        owner: "danny",
        canStartNow: "partial",
        blockerReason:
          "Account can be created now, but adding the site requires TableX to update nameservers at their domain registrar.",
        handoffRequired: true,
        handoffNotes:
          "Once Phase 2 domain is confirmed, add TableX as an admin on the Cloudflare account, then step down.",
        costNote: "Free forever",
        steps: [
          { id: "signup", label: "Sign up for free Cloudflare account" },
          { id: "domain", label: "Add tablex.com (or chosen subdomain) as a site", blockedOnClient: true },
          { id: "nameservers", label: "Update nameservers at registrar", blockedOnClient: true },
          { id: "dns", label: "Add DNS records pointing to Vercel" },
          { id: "ssl", label: "Set SSL mode to Full (strict)" },
          { id: "proxy", label: "Enable proxy (orange cloud) for DDoS protection" },
          { id: "handoff", label: "Add TableX admin and remove personal access" },
        ],
      },
    ],
  },
  {
    id: "content",
    label: "Content & Media",
    icon: FileText,
    services: [
      {
        id: "payload",
        name: "Payload CMS 3",
        icon: FileText,
        color: "#000000",
        url: "https://payloadcms.com",
        owner: "clearph",
        canStartNow: "yes",
        handoffRequired: false,
        handoffNotes:
          "Lives inside the Next.js repo — no external account to hand off. Admin users are Supabase-auth users managed in the app.",
        costNote: "Free (open source, MIT)",
        steps: [
          { id: "install", label: "npm install payload @payloadcms/next @payloadcms/db-postgres" },
          { id: "config", label: "Initialize Payload config in the Next.js app" },
          { id: "adapter", label: "Point Drizzle Postgres adapter at Supabase" },
          { id: "collections", label: "Define base collections (Pages, Media, Products, Posts)" },
          { id: "access", label: "Wire admin UI access control to Supabase auth" },
          { id: "migrate", label: "Run first Payload migration against Supabase" },
          { id: "seed", label: "Seed example content for design review" },
        ],
      },
      {
        id: "cloudinary",
        name: "Cloudinary",
        icon: Box,
        color: "#3448C5",
        url: "https://cloudinary.com",
        owner: "danny",
        canStartNow: "yes",
        handoffRequired: true,
        handoffNotes:
          "Free tier covers the marketing site during build. Either transfer to TableX account at launch or keep under Clear pH umbrella if client prefers.",
        costNote: "Free tier (25 credits/mo)",
        steps: [
          { id: "signup", label: "Sign up for free Cloudinary account" },
          { id: "env", label: "Create 'tablex-phase2' product environment" },
          { id: "preset", label: "Configure unsigned upload preset for marketing images" },
          { id: "sdk", label: "Install next-cloudinary and wire up SDK" },
          { id: "test", label: "Verify image transforms and responsive URLs" },
          { id: "keys", label: "Add CLOUDINARY_URL to Vercel env vars" },
        ],
      },
      {
        id: "supabase-storage",
        name: "Supabase Storage",
        icon: HardDrive,
        color: "#3ECF8E",
        owner: "danny",
        canStartNow: "yes",
        handoffRequired: false,
        handoffNotes: "Included in the Supabase project — transfers with it.",
        costNote: "Included with Supabase",
        steps: [
          { id: "bucket-glb", label: "Create 'glb-models' bucket (public read)" },
          { id: "bucket-images", label: "Create 'product-images' bucket" },
          { id: "policies", label: "Set bucket RLS policies" },
          { id: "cache", label: "Configure cache-control headers for GLB delivery" },
          { id: "migrate", label: "Migrate existing 2,920 GLBs if starting fresh project" },
        ],
      },
      {
        id: "adobe-fonts",
        name: "Adobe Fonts (Typekit)",
        icon: FileText,
        color: "#FA0F00",
        url: "https://fonts.adobe.com",
        owner: "clearph",
        canStartNow: "yes",
        handoffRequired: true,
        handoffNotes:
          "Decision (2026-04-28): TableX does not have Adobe CC and is unlikely to in the foreseeable future. Using Clear pH's Adobe CC seat to serve fonts on tablex.com — license-compliant under Adobe Fonts terms for active CC subscribers building client sites. Continuity risk: fonts load via Adobe's CDN keyed to Clear pH's CC, so they stop loading if Clear pH ever cancels CC or if Clear pH stops being TableX's agency. Two migration paths at handoff: (a) TableX picks up a $50/yr Adobe Portfolio plan, or (b) migrate to a foundry-licensed self-hosted font once typefaces are picked (TableX-owned, no Adobe dependency).",
        costNote: "$0 (using Clear pH's Adobe CC)",
        steps: [
          { id: "typefaces", label: "Finalize typefaces during web-2a style guide phase" },
          { id: "web-project", label: "Create Adobe Fonts web project for the domain (under Clear pH CC)" },
          { id: "embed", label: "Add kit embed code to Next.js layout" },
          { id: "document-risk", label: "Document the Clear pH CC dependency in the project README + handoff doc" },
        ],
      },
    ],
  },
  {
    id: "animation",
    label: "Frontend Animation Stack",
    icon: Sparkles,
    services: [
      {
        id: "gsap",
        name: "GSAP",
        icon: Sparkles,
        color: "#88CE02",
        url: "https://gsap.com",
        owner: "clearph",
        canStartNow: "yes",
        handoffRequired: false,
        handoffNotes: "npm package — no account, no handoff.",
        costNote: "Free for commercial use (since 2024)",
        steps: [
          { id: "install", label: "npm install gsap" },
          { id: "plugins", label: "Register ScrollTrigger plugin" },
          { id: "hook", label: "Set up useGSAP React hook pattern" },
          { id: "proof", label: "Build first scroll-driven animation as proof" },
        ],
      },
      {
        id: "framer-motion",
        name: "Framer Motion",
        icon: Sparkles,
        color: "#0055FF",
        url: "https://www.framer.com/motion/",
        owner: "clearph",
        canStartNow: "yes",
        handoffRequired: false,
        handoffNotes: "npm package — no account, no handoff.",
        costNote: "Free (open source, MIT)",
        steps: [
          { id: "install", label: "npm install framer-motion" },
          { id: "lazy", label: "Wrap layout with LazyMotion for bundle optimization" },
          { id: "variants", label: "Establish motion variants convention in codebase" },
          { id: "proof", label: "Build first layout animation as proof" },
        ],
      },
      {
        id: "lenis",
        name: "Lenis",
        icon: Sparkles,
        color: "#000000",
        url: "https://lenis.darkroom.engineering/",
        owner: "clearph",
        canStartNow: "yes",
        handoffRequired: false,
        handoffNotes: "npm package — no account, no handoff.",
        costNote: "Free (open source, MIT)",
        steps: [
          { id: "install", label: "npm install lenis" },
          { id: "provider", label: "Add Lenis provider to root layout" },
          { id: "config", label: "Tune smooth-scroll easing and duration" },
          { id: "integrate", label: "Integrate with GSAP ScrollTrigger proxy" },
        ],
      },
    ],
  },
  {
    id: "comms",
    label: "Email & Notifications",
    icon: Mail,
    services: [
      {
        id: "resend",
        name: "Resend",
        icon: Mail,
        color: "#000000",
        url: "https://resend.com",
        owner: "danny",
        canStartNow: "partial",
        blockerReason:
          "Account and templates can be built now. Domain verification for production sending requires the TableX domain.",
        handoffRequired: true,
        handoffNotes:
          "Transfer workspace ownership to TableX at handoff, or keep under Clear pH with TableX as a team member.",
        costNote: "Free tier (3K emails/mo)",
        steps: [
          { id: "signup", label: "Sign up at resend.com" },
          { id: "workspace", label: "Create 'TableX Phase 2' workspace" },
          { id: "install", label: "Install resend + react-email packages" },
          { id: "templates", label: "Build initial email templates (quote, order, reset password)" },
          { id: "dns", label: "Add SPF/DKIM/DMARC records to the domain", blockedOnClient: true },
          { id: "verify", label: "Verify sending domain", blockedOnClient: true },
          { id: "keys", label: "Add RESEND_API_KEY to Vercel env vars" },
          { id: "transfer", label: "Transfer workspace to TableX at handoff" },
        ],
      },
    ],
  },
  {
    id: "monitoring",
    label: "Monitoring & Security",
    icon: Shield,
    services: [
      {
        id: "sentry",
        name: "Sentry",
        icon: Shield,
        color: "#362D59",
        url: "https://sentry.io",
        owner: "danny",
        canStartNow: "yes",
        handoffRequired: true,
        handoffNotes:
          "Transfer org ownership to TableX at handoff, keeping Clear pH as a member for ongoing support.",
        costNote: "Free tier (5K errors/mo)",
        steps: [
          { id: "signup", label: "Sign up at sentry.io" },
          { id: "org", label: "Create 'tablex-phase2' organization" },
          { id: "install", label: "Install @sentry/nextjs and run the wizard" },
          { id: "sourcemaps", label: "Configure source map upload in build" },
          { id: "envs", label: "Set up dev / staging / prod environments" },
          { id: "alerts", label: "Configure alert rules (email Danny + Richie)" },
          { id: "transfer", label: "Transfer org ownership to TableX at handoff" },
        ],
      },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Link2,
    services: [
      {
        id: "xero",
        name: "Xero API",
        icon: Link2,
        color: "#13B5EA",
        url: "https://developer.xero.com",
        owner: "danny",
        canStartNow: "partial",
        blockerReason:
          "Sandbox + demo company can be set up now. Production credentials require TableX's live Xero org.",
        handoffRequired: true,
        handoffNotes:
          "Production integration uses TableX's Xero org. At handoff, re-scope the OAuth app from the dev account to a TableX-owned developer account.",
        costNote: "Free (dev account); client-owned Xero subscription",
        steps: [
          { id: "signup", label: "Create free Xero developer account" },
          { id: "app", label: "Create OAuth app 'TableX Phase 2 Dev'" },
          { id: "demo", label: "Create demo company in Xero sandbox" },
          { id: "oauth", label: "Build OAuth 2.0 flow in Next.js" },
          { id: "sync", label: "Build invoice + contact sync against demo company" },
          { id: "webhooks", label: "Configure webhooks for payment events" },
          { id: "prod-keys", label: "Request production app credentials from TableX", blockedOnClient: true },
          { id: "link-org", label: "Connect to TableX live Xero org", blockedOnClient: true },
        ],
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildInitialState(): TrackerState {
  const state: TrackerState = {};
  GROUPS.flatMap((g) => g.services).forEach((svc) => {
    state[svc.id] = {
      status: "not_started",
      completedSteps: [],
      lastpassRef: "",
      notes: "",
    };
  });
  return state;
}

function allServices(): Service[] {
  return GROUPS.flatMap((g) => g.services);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SetupTrackerView() {
  const [state, setState] = useState<TrackerState>(() => buildInitialState());
  const [hydrated, setHydrated] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Load persisted state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as TrackerState;
        // Merge with defaults so new services added later still appear
        const merged = { ...buildInitialState(), ...parsed };
        setState(merged);
      }
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  // Persist on change (after initial hydration)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  // Mutators
  const updateService = (id: string, patch: Partial<ServiceState>) => {
    setState((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const toggleStep = (serviceId: string, stepId: string) => {
    setState((prev) => {
      const current = prev[serviceId];
      const has = current.completedSteps.includes(stepId);
      const next = has
        ? current.completedSteps.filter((s) => s !== stepId)
        : [...current.completedSteps, stepId];
      return { ...prev, [serviceId]: { ...current, completedSteps: next } };
    });
  };

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    allServices().forEach((s) => (next[s.id] = true));
    setExpanded(next);
  };

  const collapseAll = () => setExpanded({});

  // ─── Computed summary ──────────────────────────────────────────────────────
  const services = allServices();
  const totalSteps = services.reduce((sum, s) => sum + s.steps.length, 0);
  const completedSteps = services.reduce(
    (sum, s) => sum + (state[s.id]?.completedSteps.length ?? 0),
    0,
  );
  const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const statusCounts: Record<StatusId, number> = {
    not_started: 0,
    in_progress: 0,
    dev_ready: 0,
    prod_ready: 0,
    handed_off: 0,
  };
  services.forEach((s) => {
    const status = state[s.id]?.status ?? "not_started";
    statusCounts[status]++;
  });

  const canStartCount = services.filter((s) => s.canStartNow === "yes").length;
  const partialCount = services.filter((s) => s.canStartNow === "partial").length;
  const blockedCount = services.filter((s) => s.canStartNow === "blocked").length;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Top summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard
          label="Overall Progress"
          value={`${progressPct}%`}
          sub={`${completedSteps} / ${totalSteps} steps`}
          icon={ListChecks}
          tone="emerald"
        />
        <SummaryCard
          label="Can Start Now"
          value={`${canStartCount}`}
          sub={`of ${services.length} services`}
          icon={Zap}
          tone="blue"
        />
        <SummaryCard
          label="Partial Blockers"
          value={`${partialCount}`}
          sub="waiting on domain / keys"
          icon={Clock}
          tone="amber"
        />
        <SummaryCard
          label="Blocked on Client"
          value={`${blockedCount}`}
          sub="need TableX input"
          icon={AlertTriangle}
          tone="red"
        />
      </div>

      {/* Status breakdown strip */}
      <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-900">Status breakdown</p>
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="text-[11px] text-slate-500 hover:text-slate-700"
            >
              Expand all
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={collapseAll}
              className="text-[11px] text-slate-500 hover:text-slate-700"
            >
              Collapse all
            </button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_ORDER.map((status) => {
            const meta = STATUS_META[status];
            const Icon = meta.icon;
            return (
              <div
                key={status}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium",
                  meta.bg,
                  meta.border,
                  meta.color,
                )}
              >
                <Icon className="w-3 h-3" />
                {meta.label}
                <span className="ml-1 font-bold">{statusCounts[status]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* LastPass note callout */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Credentials live in LastPass — not here
            </p>
            <p className="text-xs text-blue-800 mt-1 leading-relaxed">
              This tracker stores progress and metadata only. For each service, the
              <strong> LastPass ref</strong> field holds the exact vault item name (e.g.{" "}
              <code className="bg-white/70 px-1 rounded">TableX | Vercel | Prod</code>) so
              you always know where to find the real secrets. Use a single shared folder{" "}
              <code className="bg-white/70 px-1 rounded">TableX - Phase 2</code> with the
              naming convention <code className="bg-white/70 px-1 rounded">TableX | Service | Env</code>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Service groups */}
      {GROUPS.map((group) => {
        const GroupIcon = group.icon;
        return (
          <div
            key={group.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-50 text-slate-700">
                <GroupIcon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">{group.label}</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {group.services.map((svc) => (
                <ServiceRow
                  key={svc.id}
                  service={svc}
                  state={state[svc.id]}
                  expanded={!!expanded[svc.id]}
                  onToggleExpand={() => toggleExpanded(svc.id)}
                  onToggleStep={(stepId) => toggleStep(svc.id, stepId)}
                  onUpdate={(patch) => updateService(svc.id, patch)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Client handoff checklist */}
      <ClientHandoffChecklist />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "emerald" | "blue" | "amber" | "red";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", tones[tone])}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
          <p className="text-[10px] text-gray-400">{sub}</p>
        </div>
      </div>
    </div>
  );
}

function ServiceRow({
  service,
  state,
  expanded,
  onToggleExpand,
  onToggleStep,
  onUpdate,
}: {
  service: Service;
  state: ServiceState;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleStep: (stepId: string) => void;
  onUpdate: (patch: Partial<ServiceState>) => void;
}) {
  const StatusIcon = STATUS_META[state.status].icon;
  const OwnerIcon = OWNER_META[service.owner].icon;
  const ServiceIcon = service.icon;
  const startMeta = START_META[service.canStartNow];

  const stepProgress = service.steps.length
    ? Math.round((state.completedSteps.length / service.steps.length) * 100)
    : 0;

  return (
    <div>
      {/* Header row — always visible */}
      <button
        onClick={onToggleExpand}
        className="w-full px-5 py-3 flex items-center gap-4 hover:bg-slate-50/50 transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        )}
        <div
          className="p-2 rounded-lg shrink-0"
          style={{ backgroundColor: `${service.color}15`, color: service.color }}
        >
          <ServiceIcon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-900">{service.name}</p>
            <span className="text-[11px] text-slate-400">{service.costNote}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 max-w-[200px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${stepProgress}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              {state.completedSteps.length}/{service.steps.length}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium",
              startMeta.bg,
              startMeta.border,
              startMeta.color,
            )}
          >
            {startMeta.label}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium",
              STATUS_META[state.status].bg,
              STATUS_META[state.status].border,
              STATUS_META[state.status].color,
            )}
          >
            <StatusIcon className="w-2.5 h-2.5" />
            {STATUS_META[state.status].label}
          </span>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 bg-slate-50/40 border-t border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-4">
            {/* Left: meta */}
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1">
                  Owner
                </p>
                <div className="flex items-center gap-1.5">
                  <OwnerIcon className={cn("w-3.5 h-3.5", OWNER_META[service.owner].color)} />
                  <span className="text-xs font-medium text-slate-700">
                    {OWNER_META[service.owner].label}
                  </span>
                </div>
              </div>

              {service.blockerReason && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1">
                    Blocker
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {service.blockerReason}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1">
                  Handoff plan
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {service.handoffNotes}
                </p>
              </div>

              {service.url && (
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  Visit service <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Middle: checklist */}
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-2">
                Action checklist
              </p>
              <ul className="space-y-1.5">
                {service.steps.map((step) => {
                  const done = state.completedSteps.includes(step.id);
                  return (
                    <li key={step.id}>
                      <button
                        onClick={() => onToggleStep(step.id)}
                        className="flex items-start gap-2 text-left w-full group"
                      >
                        <div
                          className={cn(
                            "w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center transition-colors",
                            done
                              ? "bg-emerald-500 border-emerald-500"
                              : "border-slate-300 group-hover:border-slate-400",
                          )}
                        >
                          {done && <CircleCheck className="w-3 h-3 text-white" />}
                        </div>
                        <span
                          className={cn(
                            "text-xs leading-relaxed",
                            done ? "text-slate-400 line-through" : "text-slate-700",
                          )}
                        >
                          {step.label}
                          {step.blockedOnClient && (
                            <span className="ml-1 inline-flex items-center gap-0.5 text-[9px] font-semibold text-red-600 uppercase">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              client
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Right: state inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold block mb-1">
                  Status
                </label>
                <select
                  value={state.status}
                  onChange={(e) => onUpdate({ status: e.target.value as StatusId })}
                  className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                >
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_META[s].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold block mb-1">
                  LastPass ref
                </label>
                <input
                  type="text"
                  value={state.lastpassRef}
                  onChange={(e) => onUpdate({ lastpassRef: e.target.value })}
                  placeholder="TableX | Vercel | Prod"
                  className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold block mb-1">
                  Notes
                </label>
                <textarea
                  value={state.notes}
                  onChange={(e) => onUpdate({ notes: e.target.value })}
                  rows={3}
                  placeholder="Quick notes, account email, 2FA method…"
                  className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/30 resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientHandoffChecklist() {
  const items = [
    {
      label: "Domain name and registrar access",
      detail:
        "Needed for Cloudflare DNS setup, Vercel custom domains, and Resend sending verification.",
    },
    {
      label: "Adobe Creative Cloud seat (or confirmation to buy Portfolio)",
      detail: "Needed to access Adobe Fonts for the final marketing site typography.",
    },
    {
      label: "Xero organization admin access",
      detail:
        "Needed to generate production OAuth credentials and link the integration to TableX's live org.",
    },
    {
      label: "Brand assets — logo, existing typefaces, color tokens",
      detail: "Needed for web-2a style guide phase; not blocking infrastructure setup.",
    },
    {
      label: "Billing email + payment method for Vercel Pro + Supabase Pro",
      detail: "Can stay on Clear pH card through dev and transfer at launch.",
    },
    {
      label: "TableX team members who should have account access at handoff",
      detail: "Needed for Supabase admin, Vercel collaborators, Sentry org members.",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-amber-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-amber-100 bg-amber-50/50 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">What we need from TableX</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Everything else can proceed on Clear pH / personal accounts.
          </p>
        </div>
      </div>
      <ul className="divide-y divide-gray-100">
        {items.map((item, i) => (
          <li key={i} className="px-5 py-3">
            <p className="text-sm font-medium text-slate-800">{item.label}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
