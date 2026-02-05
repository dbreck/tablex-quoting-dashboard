"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { workflowSteps, type WorkflowStep, type PainPoint } from "@/data/workflow-steps";
import {
  FileText,
  Calculator,
  FileOutput,
  Send,
  ShoppingCart,
  AlertTriangle,
  ArrowRight,
  Unlink,
  BarChart3,
  Package,
  Clock,
} from "lucide-react";

const stepIcons = [FileText, Calculator, FileOutput, Send, ShoppingCart];

const severityColors = {
  high: "border-red-300 bg-red-50",
  medium: "border-amber-300 bg-amber-50",
  low: "border-slate-200 bg-slate-50",
};

const severityBadge = {
  high: "error" as const,
  medium: "warning" as const,
  low: "secondary" as const,
};

export default function OverviewPage() {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const activeStep = workflowSteps.find((s) => s.id === selectedStep);

  return (
    <div>
      <Header
        title="Workflow Overview"
        subtitle="TableX quoting process analysis and bottleneck identification"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Total Quotes</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">3,637</p>
                <p className="text-xs text-slate-400 mt-1">Feb 2023 – Present</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-green/10">
                <BarChart3 className="h-6 w-6 text-brand-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Product SKUs</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">~9,068</p>
                <p className="text-xs text-slate-400 mt-1">In Quote Table catalog</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Avg Turnaround</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">~4h</p>
                <p className="text-xs text-slate-400 mt-1">Request to quote sent</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Disconnected Sheets</p>
                <p className="text-3xl font-bold text-red-600 mt-1">5</p>
                <p className="text-xs text-slate-400 mt-1">No automated links</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-100">
                <Unlink className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Finding Callout */}
      <Card className="mb-8 border-brand-navy/20 bg-brand-navy/5">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-navy/10 shrink-0">
            <AlertTriangle className="h-5 w-5 text-brand-navy" />
          </div>
          <div>
            <p className="font-semibold text-brand-navy">Key Finding</p>
            <p className="text-sm text-slate-600 mt-1">
              None of the 5 spreadsheets (Quote Queue, Quote Table, Quote Template, NET Template, Sales Order)
              are linked to each other. Every quote requires manual data entry across multiple disconnected files,
              creating significant inefficiency and error risk.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Process Flow */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quoting Process Flow</CardTitle>
          <CardDescription>Click a step to view identified pain points and bottlenecks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {workflowSteps.map((step, i) => {
              const Icon = stepIcons[i];
              const isSelected = selectedStep === step.id;
              const painCount = step.painPoints.length;
              const highCount = step.painPoints.filter((p) => p.severity === "high").length;

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => setSelectedStep(isSelected ? null : step.id)}
                    className={`relative flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all cursor-pointer min-w-[120px] ${
                      isSelected
                        ? "bg-brand-green/10 ring-2 ring-brand-green"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${
                        isSelected
                          ? "bg-brand-green text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-medium text-slate-900 text-center leading-tight">
                      {step.name}
                    </span>
                    <span className="text-[10px] text-slate-400">{step.tool}</span>

                    {/* Pain point indicator */}
                    {painCount > 0 && (
                      <div className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                        {highCount > 0 ? highCount : painCount}
                      </div>
                    )}

                    {/* Manual re-entry badge */}
                    {i > 0 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge variant="error" className="text-[9px] px-1.5 py-0">
                          Manual
                        </Badge>
                      </div>
                    )}
                  </button>

                  {/* Arrow between steps */}
                  {i < workflowSteps.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-slate-300 shrink-0 mx-1" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pain Point Details */}
      {activeStep && (
        <div className="animate-fade-in">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Pain Points: {activeStep.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeStep.painPoints.map((pain, i) => (
              <PainPointCard key={i} pain={pain} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PainPointCard({ pain }: { pain: PainPoint }) {
  return (
    <Card className={`${severityColors[pain.severity]} border-2`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <AlertTriangle
              className={`h-5 w-5 ${
                pain.severity === "high"
                  ? "text-red-500"
                  : pain.severity === "medium"
                  ? "text-amber-500"
                  : "text-slate-400"
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-slate-900">{pain.title}</p>
              <Badge variant={severityBadge[pain.severity]} className="text-[10px]">
                {pain.severity}
              </Badge>
            </div>
            <p className="text-sm text-slate-600">{pain.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
