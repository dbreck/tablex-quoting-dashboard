"use client";

import Link from "next/link";
import {
  Layers,
  LayoutTemplate,
  Library,
  Package,
  Box,
  ArrowRight,
  AppWindow,
  Map as MapIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  computeSiteMapStats,
  siteMapGroups,
} from "@/data/site-map";
import { architectureStats } from "@/data/future-site-architecture";
import { wireframePages } from "@/data/wireframe-pages";
import { comps } from "@/data/comps";

export default function ContentDashboardPage() {
  const siteMapStats = computeSiteMapStats(siteMapGroups);

  const cards = [
    {
      href: "/content/site-map",
      icon: MapIcon,
      label: "Site Map",
      description:
        "Canonical IA for tablex.com — every page Phase 2 will ship, by route group and audience tier. Replaces the old Content Map.",
      stat: `${siteMapStats.totalPages} pages · ${siteMapStats.totalGroups} groups · ${siteMapStats.newPages} new`,
      accent: "bg-brand-green/10 text-brand-green",
      featured: true,
    },
    {
      href: "/content/comps",
      icon: AppWindow,
      label: "Comps",
      description:
        "High-fidelity homepage & marketing comps from claude.ai/design. Each opens full-screen in a new tab.",
      stat: `${comps.length} comp${comps.length === 1 ? "" : "s"} · opens in new tab`,
      accent: "bg-orange-500/10 text-orange-600",
    },
    {
      href: "/site-architecture",
      icon: Layers,
      label: "Site Architecture",
      description:
        "3 IA drafts for tablex.com — transparent pricing, self-service CPQ, and quote-back flow.",
      stat: `${architectureStats.totalSections} sections · ${architectureStats.totalPages} pages · ${architectureStats.newPages} new`,
      accent: "bg-violet-500/10 text-violet-600",
    },
    {
      href: "/wireframes",
      icon: LayoutTemplate,
      label: "Wireframes",
      description:
        "Page & system-level wireframes for every marketing, discovery, action, and portal surface.",
      stat: `${wireframePages.length} site pages · System set available`,
      accent: "bg-emerald-500/10 text-emerald-600",
    },
    {
      href: "/product-library",
      icon: Library,
      label: "Product Library",
      description:
        "Marketing catalog of the 16 TableX series with archetype copy and rep mapping.",
      stat: "16 series · Foundation + collections view",
      accent: "bg-sky-500/10 text-sky-600",
    },
    {
      href: "/catalog",
      icon: Package,
      label: "Catalog",
      description:
        "Laminates, finishes, and materials — filterable by brand, tier, and stock.",
      stat: "66 laminates · 2026 Wilsonart + Formica",
      accent: "bg-amber-500/10 text-amber-600",
    },
    {
      href: "/configurator",
      icon: Box,
      label: "Configurator",
      description:
        "Interactive 3D base + top + finish + edge picker for every TableX series.",
      stat: "Spec Studio — 3D viewer",
      accent: "bg-indigo-500/10 text-indigo-600",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-medium">
            Website Redesign · Content
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Content</h1>
        <p className="mt-1 text-sm text-slate-500">
          Plan, draft, and visualize everything that will ship on tablex.com. The Content Map is the living source of truth — the rest of these tabs are reference artifacts that feed it.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.href} href={c.href} className="group">
              <Card
                hover
                className={c.featured ? "border-brand-green/40 ring-1 ring-brand-green/20" : ""}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-xl ${c.accent}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    {c.featured && (
                      <Badge className="bg-brand-green text-white text-[9px]">
                        NEW
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-3 flex items-center gap-1.5 text-base">
                    {c.label}
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                  </CardTitle>
                  <CardDescription>{c.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {c.stat}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
