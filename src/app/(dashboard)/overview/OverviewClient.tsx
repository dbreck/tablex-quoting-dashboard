"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
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
    </div>
  );
}
