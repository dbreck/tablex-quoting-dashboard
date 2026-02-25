"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { competitorAnalysis } from "@/data/competitor-analysis";
import {
  BarChart3,
  Globe,
  Target,
  ArrowRight,
  Workflow,
  Route,
  ScanBarcode,
  DollarSign,
  ClipboardList,
  Truck,
  Package,
  Box,
  Users,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react";

const sections = [
  {
    title: "Website Redesign",
    description: "Current site audit, user personas, and what we're building",
    icon: Globe,
    accent: "blue",
    highlights: [
      "3 user personas defined (Dealer, Rep, Individual)",
      "164 content items inventoried",
      "3D configurator with 2,920 models",
    ],
    pages: [
      { name: "User Personas", href: "/user-personas", icon: Users },
      { name: "WP Site Audit", href: "/wp-site-audit", icon: Globe },
      { name: "Catalog", href: "/catalog", icon: Package },
      { name: "Configurator", href: "/configurator", icon: Box },
    ],
  },
  {
    title: "Business Intelligence & Operations",
    description: "How TableX operates today and where the friction is",
    icon: BarChart3,
    accent: "green",
    highlights: [
      "3,637 quotes analyzed (Feb 2023 – Present)",
      "6+ disconnected touchpoints identified",
      "617 hours/year wasted on manual re-entry",
    ],
    pages: [
      { name: "Quoting Process", href: "/quoting-process", icon: Workflow },
      { name: "Customer Journey", href: "/customer-journey", icon: Route },
      { name: "SKU Decoder", href: "/sku-decoder", icon: ScanBarcode },
      { name: "Pricing", href: "/pricing", icon: DollarSign },
      { name: "Queue", href: "/queue", icon: ClipboardList },
      { name: "Freight", href: "/freight", icon: Truck },
      { name: "Competitor Analysis", href: "/competitor-analysis", icon: ShieldAlert },
    ],
  },
  {
    title: "Quoting System & CRM",
    description: "Back-office quoting, CPQ evaluation, build-vs-buy",
    icon: Target,
    accent: "amber",
    highlights: [
      "39 CPQ rules documented",
      "SKU-based architecture confirmed",
      "Build-vs-buy analysis pending",
    ],
    pages: [
      { name: "CPQ Gap Analysis", href: "/cpq-gap-analysis", icon: Target },
    ],
  },
];

const accentStyles = {
  green: {
    card: "border-brand-green/20 hover:border-brand-green/40",
    iconBg: "bg-brand-green/10",
    iconText: "text-brand-green",
    bullet: "text-brand-green",
    linkHover: "hover:text-brand-green",
  },
  blue: {
    card: "border-blue-200 hover:border-blue-300",
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
    bullet: "text-blue-500",
    linkHover: "hover:text-blue-600",
  },
  amber: {
    card: "border-amber-200 hover:border-amber-300",
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
    bullet: "text-amber-500",
    linkHover: "hover:text-amber-600",
  },
};

const threatVariants = {
  High: "warning",
  Medium: "info",
  Low: "secondary",
} as const;

export default function OverviewClient() {
  return (
    <div>
      <Header
        title="TableX Dashboard"
        subtitle="Research, analysis, and design across three workstreams"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {sections.map((section) => {
          const styles = accentStyles[section.accent as keyof typeof accentStyles];
          return (
            <Card
              key={section.title}
              className={`transition-colors ${styles.card}`}
            >
              <CardContent className="p-6">
                {/* Section header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${styles.iconBg}`}>
                    <section.icon className={`h-5 w-5 ${styles.iconText}`} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">{section.title}</h2>
                    <p className="text-xs text-slate-500">{section.description}</p>
                  </div>
                </div>

                {/* Highlights */}
                <ul className="space-y-1.5 mb-5">
                  {section.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${styles.iconBg} shrink-0`} />
                      {h}
                    </li>
                  ))}
                </ul>

                {/* Divider */}
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Pages</p>
                  <div className="space-y-1">
                    {section.pages.map((page) => (
                      <Link
                        key={page.href}
                        href={page.href}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-50 ${styles.linkHover} transition-colors group`}
                      >
                        <page.icon className={`h-4 w-4 shrink-0 text-slate-400 group-hover:${styles.iconText}`} />
                        <span className="flex-1">{page.name}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 border-slate-200/90">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <ShieldAlert className="h-4 w-4 text-slate-700" />
                </div>
                <h2 className="text-base font-semibold text-slate-900">Competitor Analysis</h2>
              </div>
              <p className="text-sm text-slate-600 max-w-3xl">{competitorAnalysis.method}</p>
            </div>
            <Badge variant="outline">As of {competitorAnalysis.asOf}</Badge>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-5">
            {competitorAnalysis.competitors.map((competitor) => (
              <div
                key={competitor.name}
                className="rounded-xl border border-slate-200 bg-slate-50/40 p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{competitor.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {competitor.mentionCount} quote mention
                      {competitor.mentionCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Badge variant={threatVariants[competitor.threat]}>{competitor.threat} Threat</Badge>
                </div>

                <p className="text-sm text-slate-700 mb-3">{competitor.overlap}</p>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {competitor.findings[0]}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/competitor-analysis"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900 transition-colors"
          >
            View Full Competitor Analysis
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
