"use client";

import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Briefcase, User, AlertTriangle } from "lucide-react";
import { personas, staffInsight } from "@/data/cpq-gap-analysis";

const personaIcons: Record<string, React.ReactNode> = {
  Palette: <Palette className="h-5 w-5" />,
  Briefcase: <Briefcase className="h-5 w-5" />,
  User: <User className="h-5 w-5" />,
};

const personaAccent: Record<string, { bg: string; text: string; badge: "success" | "warning" | "secondary" }> = {
  Designer: { bg: "bg-violet-100", text: "text-violet-600", badge: "secondary" },
  Rep: { bg: "bg-blue-100", text: "text-blue-600", badge: "success" },
  "End User": { bg: "bg-emerald-100", text: "text-emerald-600", badge: "warning" },
};

export default function UserPersonasClient() {
  return (
    <div>
      <Header
        title="User Personas"
        subtitle="Three distinct user types with different needs, pricing visibility, and workflows"
      />

      {/* Persona Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {personas.map((p) => {
          const accent = personaAccent[p.role] ?? { bg: "bg-slate-100", text: "text-slate-600", badge: "secondary" as const };
          return (
            <Card key={p.role} hover>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${accent.bg} ${accent.text}`}>
                    {personaIcons[p.icon]}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{p.role}</p>
                    <p className="text-sm text-slate-500">{p.goal}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">
                    Pricing Visibility
                  </p>
                  <Badge variant={accent.badge} className="text-xs">
                    {p.pricing}
                  </Badge>
                </div>

                <blockquote className="border-l-2 border-slate-200 pl-3 text-sm italic text-slate-500">
                  &ldquo;{p.quote}&rdquo;
                </blockquote>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Staff Insight Callout */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-800">
              Insight: Root Cause of Slow Quoting is Fear of Mistakes
            </p>
            <p className="text-sm text-amber-700 mt-2">
              {staffInsight.implication}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
