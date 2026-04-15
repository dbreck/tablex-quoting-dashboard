"use client";

import { useState } from "react";
import {
  WORKSTREAMS,
  DELIVERABLES,
  PROJECT_PHASES,
  getDeliverablesByWorkstream,
  getWorkstreamHours,
  getWorkstreamCost,
  TOTAL_HOURS,
  TOTAL_COST,
} from "@/data/project-phase2";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  Package,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";

const statusConfig = {
  complete: { label: "Complete", icon: CheckCircle2, className: "text-green-600 bg-green-50" },
  "in-progress": { label: "In Progress", icon: Loader2, className: "text-amber-600 bg-amber-50" },
  planned: { label: "Planned", icon: Circle, className: "text-gray-400 bg-gray-50" },
};

export default function AdminScopePage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Phase 2 — Project Scope</h1>
        <p className="mt-1 text-sm text-gray-500">
          Workstreams, deliverables, and estimated effort for the Phase 2 build.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard icon={Package} label="Total Deliverables" value={formatNumber(DELIVERABLES.length)} accent="text-brand-green" />
        <SummaryCard icon={Clock} label="Total Hours" value={formatNumber(TOTAL_HOURS)} accent="text-blue-600" />
        <SummaryCard icon={DollarSign} label="Estimated Cost" value={formatCurrency(TOTAL_COST)} accent="text-emerald-600" />
      </div>

      <div className="space-y-4">
        {WORKSTREAMS.map((ws) => {
          const isOpen = expanded[ws.id] ?? false;
          const deliverables = getDeliverablesByWorkstream(ws.id);
          const hours = getWorkstreamHours(ws.id);
          const cost = getWorkstreamCost(ws.id);
          const Icon = ws.icon;

          return (
            <div key={ws.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button onClick={() => toggle(ws.id)} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ backgroundColor: ws.color + "15", color: ws.color }}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">{ws.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{ws.description}</p>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 mr-2">
                  <span>{deliverables.length} deliverables</span>
                  <span>{formatNumber(hours)} hrs</span>
                  <span className="font-medium text-gray-700">{formatCurrency(cost)}</span>
                </div>
                {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 divide-y divide-gray-100">
                  {deliverables.map((d) => {
                    const phase = PROJECT_PHASES.find((p) => p.id === d.phase);
                    const status = statusConfig[d.status];
                    const StatusIcon = status.icon;
                    return (
                      <div key={d.id} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-medium text-gray-900">{d.name}</h4>
                              {phase && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium text-white" style={{ backgroundColor: phase.color }}>{phase.name}</span>}
                              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium", status.className)}>
                                <StatusIcon className="w-3 h-3" />{status.label}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">{d.description}</p>
                            {d.requirements.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {d.requirements.map((req) => (
                                  <li key={req} className="text-xs text-gray-600 flex items-start gap-1.5">
                                    <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: ws.color }} />
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-medium text-gray-900">{d.status === "complete" ? "0" : formatNumber(d.estimatedHours)} hrs</p>
                            <p className="text-xs text-gray-500">{d.status === "complete" ? "$0" : formatCurrency(d.estimatedHours * d.hourlyRate)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Subtotal — {ws.name}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">{formatNumber(hours)} hrs</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(cost)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; accent: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg bg-gray-50", accent)}><Icon className="w-5 h-5" /></div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
