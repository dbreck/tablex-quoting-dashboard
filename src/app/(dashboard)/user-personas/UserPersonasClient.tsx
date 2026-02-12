"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Briefcase,
  User,
  ChevronRight,
  Monitor,
  Tablet,
  Smartphone,
  Laptop,
  AlertCircle,
  Quote,
  Target,
  Lightbulb,
  Globe,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { personas, type Persona } from "@/data/user-personas";

const personaIcons: Record<string, typeof Building2> = {
  Building2,
  Briefcase,
  User,
};

const accentConfig = {
  blue: {
    bg: "bg-blue-50",
    bgStrong: "bg-blue-100",
    text: "text-blue-600",
    textMuted: "text-blue-500",
    border: "border-blue-200",
    borderActive: "border-blue-400",
    ring: "ring-blue-400/30",
    dot: "bg-blue-400",
    badge: "info" as const,
  },
  green: {
    bg: "bg-emerald-50",
    bgStrong: "bg-emerald-100",
    text: "text-emerald-600",
    textMuted: "text-emerald-500",
    border: "border-emerald-200",
    borderActive: "border-emerald-400",
    ring: "ring-emerald-400/30",
    dot: "bg-emerald-400",
    badge: "success" as const,
  },
  amber: {
    bg: "bg-amber-50",
    bgStrong: "bg-amber-100",
    text: "text-amber-600",
    textMuted: "text-amber-500",
    border: "border-amber-200",
    borderActive: "border-amber-400",
    ring: "ring-amber-400/30",
    dot: "bg-amber-400",
    badge: "warning" as const,
  },
};

const deviceIcons: Record<string, typeof Monitor> = {
  Desktop: Monitor,
  Laptop: Laptop,
  Tablet: Tablet,
  Mobile: Smartphone,
};

export default function UserPersonasClient() {
  const [activePersona, setActivePersona] = useState<string>("dealer");
  const active = personas.find((p) => p.id === activePersona) ?? personas[0];
  const a = accentConfig[active.accent];
  const Icon = personaIcons[active.icon] ?? User;

  return (
    <div>
      <Header
        title="User Personas"
        subtitle="Three audience segments that shape every website design decision"
      />

      {/* Persona Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {personas.map((p) => {
          const config = accentConfig[p.accent];
          const PIcon = personaIcons[p.icon] ?? User;
          const isActive = p.id === activePersona;
          return (
            <button
              key={p.id}
              onClick={() => setActivePersona(p.id)}
              className={cn(
                "text-left rounded-xl border-2 p-5 transition-all",
                isActive
                  ? `${config.borderActive} ${config.bg} ring-2 ${config.ring}`
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg",
                  isActive ? config.bgStrong : "bg-slate-100"
                )}>
                  <PIcon className={cn("h-5 w-5", isActive ? config.text : "text-slate-400")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-semibold", isActive ? "text-slate-900" : "text-slate-700")}>
                    {p.role}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{p.subtitle}</p>
                </div>
                <Badge variant={isActive ? config.badge : "secondary"} className="text-[10px] shrink-0">
                  {p.trafficShare}
                </Badge>
              </div>
              <p className={cn("text-xs leading-relaxed", isActive ? "text-slate-600" : "text-slate-400")}>
                {p.summary}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Persona Detail */}
      <div className="space-y-6">

        {/* Key Insight Banner */}
        <Card className={cn(a.border, a.bg)}>
          <CardContent className="p-5 flex items-start gap-4">
            <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg shrink-0", a.bgStrong)}>
              <Lightbulb className={cn("h-5 w-5", a.text)} />
            </div>
            <div>
              <p className={cn("font-semibold text-sm", a.text)}>Key Insight</p>
              <p className="text-sm text-slate-700 mt-1">{active.keyInsight}</p>
            </div>
          </CardContent>
        </Card>

        {/* Demographics + Goals row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Demographics */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Icon className={cn("h-4 w-4", a.text)} />
                <h3 className="text-sm font-semibold text-slate-900">Demographics</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Age</p>
                  <p className="text-sm font-medium text-slate-700">{active.demographics.ageRange}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Experience</p>
                  <p className="text-sm font-medium text-slate-700">{active.demographics.experience}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Location</p>
                  <p className="text-sm font-medium text-slate-700">{active.demographics.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className={cn("h-4 w-4", a.text)} />
                <h3 className="text-sm font-semibold text-slate-900">Goals</h3>
              </div>
              <ul className="space-y-2">
                {active.goals.map((g, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <ChevronRight className={cn("h-4 w-4 mt-0.5 shrink-0", a.textMuted)} />
                    {g.text}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Pain Points + Deal Breakers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pain Points */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <h3 className="text-sm font-semibold text-slate-900">Pain Points</h3>
              </div>
              <div className="space-y-3">
                {active.painPoints.map((pp, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{pp.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{pp.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deal Breakers */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="h-4 w-4 text-red-500" />
                <h3 className="text-sm font-semibold text-slate-900">Deal Breakers</h3>
              </div>
              <ul className="space-y-2">
                {active.dealBreakers.map((db, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-300 mt-2 shrink-0" />
                    {db}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Website Behavior */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <Globe className={cn("h-4 w-4", a.text)} />
              <h3 className="text-sm font-semibold text-slate-900">Website Behavior</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Session Flow */}
              <div className="lg:col-span-2">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-3">Typical Session Flow</p>
                <div className="space-y-2">
                  {active.websiteBehavior.sessionFlow.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={cn(
                        "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 mt-0.5",
                        a.bgStrong, a.text
                      )}>
                        {i + 1}
                      </div>
                      <p className="text-sm text-slate-600">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Device Split */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-3">Device Usage</p>
                <div className="space-y-3">
                  {active.websiteBehavior.deviceSplit.map((d) => {
                    const DIcon = deviceIcons[d.device] ?? Monitor;
                    return (
                      <div key={d.device}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <DIcon className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-xs text-slate-600">{d.device}</span>
                          </div>
                          <span className="text-xs font-medium text-slate-700">{d.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", a.dot)}
                            style={{ width: `${d.pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Website Implications + Info Priorities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Website Implications */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className={cn("h-4 w-4", a.text)} />
                <h3 className="text-sm font-semibold text-slate-900">Website Implications</h3>
              </div>
              <div className="space-y-3">
                {active.websiteImplications.map((imp, i) => (
                  <div key={i} className={cn("rounded-lg p-3", a.bg)}>
                    <p className={cn("text-xs font-semibold", a.text)}>{imp.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{imp.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Info Priorities */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className={cn("h-4 w-4", a.text)} />
                <h3 className="text-sm font-semibold text-slate-900">Information Priorities</h3>
              </div>
              <ol className="space-y-2">
                {active.websiteBehavior.infoPriorities.map((p, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className={cn(
                      "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0",
                      i < 3 ? `${a.bgStrong} ${a.text}` : "bg-slate-100 text-slate-400"
                    )}>
                      {i + 1}
                    </span>
                    {p}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Quotes */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Quote className={cn("h-4 w-4", a.text)} />
              <h3 className="text-sm font-semibold text-slate-900">In Their Words</h3>
            </div>
            <div className={cn(
              "grid gap-4",
              active.quotes.length > 2 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"
            )}>
              {active.quotes.map((q, i) => (
                <blockquote
                  key={i}
                  className={cn("rounded-lg p-4 border-l-3", a.bg, a.border)}
                >
                  <p className="text-sm italic text-slate-600 leading-relaxed">
                    &ldquo;{q}&rdquo;
                  </p>
                </blockquote>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
