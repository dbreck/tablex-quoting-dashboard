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
import {
  type ScopeStatus,
  getDeliverableDays,
  getScopeStatus,
  getVariance,
} from "@/data/project-tracker";
import {
  useProjectTrackerStore,
  useDeliverableOverrides,
} from "@/store/project-tracker-store";
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
  Save,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";

const statusConfig: Record<ScopeStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  complete: { label: "Complete", icon: CheckCircle2, className: "text-green-600 bg-green-50" },
  "in-progress": { label: "In Progress", icon: Loader2, className: "text-amber-600 bg-amber-50" },
  planned: { label: "Planned", icon: Circle, className: "text-gray-400 bg-gray-50" },
};

const varianceStyle = {
  over: "text-amber-700 bg-amber-50 border-amber-200",
  under: "text-emerald-700 bg-emerald-50 border-emerald-200",
  neutral: "text-gray-500 bg-gray-50 border-gray-200",
} as const;

export default function ProjectScopePage() {
  const {
    tasks,
    baselinedAt,
    saveAllBaselines,
    clearAllBaselines,
    setRationale,
    setManualStatus,
  } = useProjectTrackerStore();
  const overrides = useDeliverableOverrides();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [confirmBaseline, setConfirmBaseline] = useState(false);

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const hasBaseline = baselinedAt !== null;
  const totalDays = DELIVERABLES.reduce(
    (sum, d) => sum + (d.status === "complete" ? 0 : getDeliverableDays(d, overrides[d.id])),
    0,
  );

  const handleBaselineClick = () => {
    if (hasBaseline && !confirmBaseline) {
      setConfirmBaseline(true);
      return;
    }
    saveAllBaselines();
    setConfirmBaseline(false);
  };

  const handleClearBaseline = () => {
    clearAllBaselines();
    setConfirmBaseline(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scope</h1>
          <p className="mt-1 text-sm text-gray-500">
            Workstreams and deliverables for the Phase 2 build.
            {hasBaseline && (
              <>
                {" "}Baselined {new Date(baselinedAt!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasBaseline && !confirmBaseline && (
            <button
              onClick={handleClearBaseline}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1"
              title="Clear baseline snapshot"
            >
              Clear
            </button>
          )}
          {confirmBaseline ? (
            <>
              <span className="text-xs text-amber-700 mr-1">Overwrite existing baseline?</span>
              <button
                onClick={() => setConfirmBaseline(false)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBaselineClick}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
              >
                <Save className="h-3 w-3" />
                Overwrite
              </button>
            </>
          ) : (
            <button
              onClick={handleBaselineClick}
              className={cn(
                "inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg font-medium transition-colors",
                hasBaseline
                  ? "border border-gray-200 text-gray-700 hover:bg-gray-50"
                  : "bg-brand-green text-white hover:bg-brand-green/90"
              )}
            >
              <Save className="h-4 w-4" />
              {hasBaseline ? "Update baseline" : "Save baseline"}
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <SummaryCard icon={Package} label="Deliverables" value={formatNumber(DELIVERABLES.length)} accent="text-brand-green" />
        <SummaryCard icon={Clock} label="Total Days" value={formatNumber(totalDays)} accent="text-purple-600" sub={`${formatNumber(TOTAL_HOURS)} hrs`} />
        <SummaryCard icon={DollarSign} label="Estimated Cost" value={formatCurrency(TOTAL_COST)} accent="text-emerald-600" />
        <SummaryCard
          icon={hasBaseline ? CheckCircle2 : AlertCircle}
          label="Baseline"
          value={hasBaseline ? "Set" : "Not set"}
          accent={hasBaseline ? "text-emerald-600" : "text-gray-400"}
          sub={hasBaseline ? new Date(baselinedAt!).toLocaleDateString() : "Snapshot to track drift"}
        />
      </div>

      {/* Workstream cards */}
      <div className="space-y-4">
        {WORKSTREAMS.map((ws) => {
          const isOpen = expanded[ws.id] ?? false;
          const deliverables = getDeliverablesByWorkstream(ws.id);
          const hours = getWorkstreamHours(ws.id);
          const cost = getWorkstreamCost(ws.id);
          const days = deliverables.reduce(
            (sum, d) => sum + (d.status === "complete" ? 0 : getDeliverableDays(d, overrides[d.id])),
            0,
          );
          const Icon = ws.icon;

          return (
            <div key={ws.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggle(ws.id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-lg"
                  style={{ backgroundColor: ws.color + "15", color: ws.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">{ws.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{ws.description}</p>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 mr-2">
                  <span>{deliverables.length} deliverables</span>
                  <span>{formatNumber(days)} d</span>
                  <span>{formatNumber(hours)} hrs</span>
                  <span className="font-medium text-gray-700">{formatCurrency(cost)}</span>
                </div>
                {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 divide-y divide-gray-100">
                  {deliverables.map((d) => {
                    const override = overrides[d.id];
                    const scopeStatus = getScopeStatus(d, override);
                    const status = statusConfig[scopeStatus];
                    const StatusIcon = status.icon;
                    const phase = PROJECT_PHASES.find((p) => p.id === d.phase);
                    const days = getDeliverableDays(d, override);
                    const variance = getVariance(days, override?.baselineDays);

                    // Task progress for this deliverable (working-reality layer)
                    const deliverableTasks = tasks.filter((t) => t.deliverableId === d.id);
                    const doneTasks = deliverableTasks.filter((t) => t.column === "done").length;
                    const totalTasks = deliverableTasks.length;
                    const taskPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

                    return (
                      <div key={d.id} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Name + phase + status */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-medium text-gray-900">{d.name}</h4>
                              {phase && (
                                <span
                                  className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium text-white"
                                  style={{ backgroundColor: phase.color }}
                                >
                                  {phase.name}
                                </span>
                              )}
                              <select
                                value={override?.manualStatus ?? scopeStatus}
                                onChange={(e) =>
                                  setManualStatus(
                                    d.id,
                                    e.target.value === "__reset" ? null : (e.target.value as ScopeStatus),
                                  )
                                }
                                onClick={(e) => e.stopPropagation()}
                                className={cn(
                                  "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border-0 cursor-pointer",
                                  status.className,
                                )}
                                title={override?.manualStatus ? "Manually set — click to reset to default" : "Click to override"}
                              >
                                <option value="planned">Planned</option>
                                <option value="in-progress">In Progress</option>
                                <option value="complete">Complete</option>
                                {override?.manualStatus && <option value="__reset">— Reset to default —</option>}
                              </select>
                              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium", status.className, "pointer-events-none hidden")}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                            </div>

                            {/* Description */}
                            <p className="mt-1 text-xs text-gray-500">{d.description}</p>

                            {/* Days + baseline variance chip */}
                            <div className="mt-2 flex items-center gap-2 text-xs">
                              <span className="font-medium text-gray-900">
                                {formatNumber(days)} d
                              </span>
                              <span className="text-gray-300">·</span>
                              <span className="text-gray-400">{formatNumber(d.estimatedHours)} hrs</span>
                              {override?.baselineDays != null && (
                                <>
                                  <span className="text-gray-300">·</span>
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium",
                                      varianceStyle[variance.tone],
                                    )}
                                  >
                                    {variance.tone === "over" ? (
                                      <TrendingUp className="h-2.5 w-2.5" />
                                    ) : variance.tone === "under" ? (
                                      <TrendingDown className="h-2.5 w-2.5" />
                                    ) : null}
                                    baseline {formatNumber(override.baselineDays)} d
                                    {variance.percent !== null && variance.percent !== 0 && (
                                      <span>· {variance.percent > 0 ? "+" : ""}{variance.percent}%</span>
                                    )}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Rationale */}
                            <RationaleRow
                              initialValue={override?.rationale ?? ""}
                              onSave={(value) => setRationale(d.id, value)}
                            />

                            {/* Task progress (working-reality layer — complementary) */}
                            {totalTasks > 0 && (
                              <div className="mt-2 flex items-center gap-2">
                                <div className="flex-1 max-w-[200px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${taskPercent}%`, backgroundColor: ws.color }}
                                  />
                                </div>
                                <span className="text-[10px] text-gray-400">
                                  {doneTasks}/{totalTasks} tasks ({taskPercent}%)
                                </span>
                              </div>
                            )}

                            {/* Requirements */}
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
                            <p className="text-sm font-medium text-gray-900">
                              {d.status === "complete" ? "0" : formatNumber(d.estimatedHours)} hrs
                            </p>
                            <p className="text-xs text-gray-500">
                              {d.status === "complete" ? "$0" : formatCurrency(d.estimatedHours * d.hourlyRate)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Subtotal — {ws.name}</span>
                    <div className="text-right text-sm font-semibold text-gray-900">
                      <span>{formatNumber(days)} d</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span>{formatNumber(hours)} hrs</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span>{formatCurrency(cost)}</span>
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

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg bg-gray-50", accent)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
          {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function RationaleRow({
  initialValue,
  onSave,
}: {
  initialValue: string;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [editing, setEditing] = useState(false);

  const commit = () => {
    if (value !== initialValue) onSave(value);
    setEditing(false);
  };

  if (!editing && !value) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="mt-2 text-xs italic text-gray-400 hover:text-gray-600 transition-colors text-left"
      >
        Add rationale — how did we arrive at this estimate?
      </button>
    );
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="mt-2 text-xs italic text-gray-600 hover:text-gray-900 transition-colors text-left block"
      >
        <span className="text-gray-400 not-italic mr-1">Rationale:</span>
        {value}
      </button>
    );
  }

  return (
    <textarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commit();
        if (e.key === "Escape") {
          setValue(initialValue);
          setEditing(false);
        }
      }}
      autoFocus
      rows={2}
      placeholder="e.g. Based on Marina Pointe v1 build, +20% for interactive map"
      className="mt-2 w-full text-xs text-gray-700 border border-gray-200 rounded-md px-2.5 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-brand-green/50"
    />
  );
}
