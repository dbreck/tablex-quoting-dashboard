"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  ShieldAlert,
  GitBranch,
  AlertTriangle,
  CalendarClock,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RiskDialog } from "@/components/project/RiskDialog";
import { DecisionDialog } from "@/components/project/DecisionDialog";
import {
  useRisks,
  useDecisions,
} from "@/store/risks-decisions-store";
import { useTeam } from "@/store/project-tracker-store";
import { DELIVERABLES } from "@/data/project-phase2";
import {
  RISK_CATEGORIES,
  RISK_STATUSES,
  DECISION_STATUSES,
  severityLevel,
  isRiskPastTrigger,
  type Risk,
  type Decision,
  type RiskStatus,
  type RiskCategory,
  type DecisionStatus,
} from "@/data/risks-decisions";
import { cn } from "@/lib/utils";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RisksDecisionsPage() {
  const risks = useRisks();
  const decisions = useDecisions();
  const [tab, setTab] = useState<"risks" | "decisions">("risks");
  const [riskDialogOpen, setRiskDialogOpen] = useState(false);
  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [editingDecision, setEditingDecision] = useState<Decision | null>(null);

  const openRisks = useMemo(
    () => risks.filter((r) => r.status === "open" || r.status === "mitigating"),
    [risks],
  );
  const openDecisions = useMemo(
    () => decisions.filter((d) => d.status !== "reversed"),
    [decisions],
  );

  function openNewRisk() {
    setEditingRisk(null);
    setRiskDialogOpen(true);
  }
  function openNewDecision() {
    setEditingDecision(null);
    setDecisionDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risks &amp; Decisions</h1>
          <p className="mt-1 text-sm text-gray-500">
            First-class log of open risks and key calls. Severity = probability ×
            impact. Decided-on dates are contractual artifacts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openNewRisk}>
            <ShieldAlert className="h-4 w-4" />
            Log risk
          </Button>
          <Button onClick={openNewDecision}>
            <GitBranch className="h-4 w-4" />
            Log decision
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "risks" | "decisions")}>
        <TabsList>
          <TabsTrigger value="risks">
            Risks
            <span className="ml-2 text-xs text-slate-400 tabular-nums">
              {openRisks.length}/{risks.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="decisions">
            Decisions
            <span className="ml-2 text-xs text-slate-400 tabular-nums">
              {openDecisions.length}/{decisions.length}
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="risks">
          <RisksTab
            risks={risks}
            onEdit={(r) => {
              setEditingRisk(r);
              setRiskDialogOpen(true);
            }}
            onCreate={openNewRisk}
          />
        </TabsContent>
        <TabsContent value="decisions">
          <DecisionsTab
            decisions={decisions}
            onEdit={(d) => {
              setEditingDecision(d);
              setDecisionDialogOpen(true);
            }}
            onCreate={openNewDecision}
          />
        </TabsContent>
      </Tabs>

      <RiskDialog
        open={riskDialogOpen}
        onOpenChange={setRiskDialogOpen}
        risk={editingRisk}
      />
      <DecisionDialog
        open={decisionDialogOpen}
        onOpenChange={setDecisionDialogOpen}
        decision={editingDecision}
      />
    </div>
  );
}

// ─── Risks tab ────────────────────────────────────────────────────────────────

const riskStatusChip: Record<RiskStatus, string> = {
  open: "bg-red-50 text-red-700 border-red-200",
  mitigating: "bg-amber-50 text-amber-800 border-amber-200",
  accepted: "bg-slate-100 text-slate-600 border-slate-200",
  closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  realized: "bg-purple-50 text-purple-700 border-purple-200",
};

function severityChipCls(level: "low" | "med" | "high"): string {
  if (level === "high") return "bg-red-100 text-red-700 border-red-300";
  if (level === "med") return "bg-amber-100 text-amber-800 border-amber-300";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function RisksTab({
  risks,
  onEdit,
  onCreate,
}: {
  risks: Risk[];
  onEdit: (r: Risk) => void;
  onCreate: () => void;
}) {
  const [statusFilter, setStatusFilter] = useState<RiskStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<RiskCategory | "all">("all");
  const team = useTeam();
  const today = todayISO();

  const filtered = useMemo(() => {
    return risks.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
      return true;
    });
  }, [risks, statusFilter, categoryFilter]);

  if (risks.length === 0) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="No risks logged yet"
        description="Capture anything that could derail the project — integration breakage, resourcing gaps, scope creep, vendor delays."
        onCreate={onCreate}
        createLabel="Log first risk"
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as RiskStatus | "all")}
          options={[
            { id: "all", label: "All" },
            ...RISK_STATUSES.map((s) => ({ id: s.id, label: s.label })),
          ]}
        />
        <FilterSelect
          label="Category"
          value={categoryFilter}
          onChange={(v) => setCategoryFilter(v as RiskCategory | "all")}
          options={[
            { id: "all", label: "All" },
            ...RISK_CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
          ]}
        />
        <div className="ml-auto text-xs text-slate-400 tabular-nums">
          {filtered.length} of {risks.length}
        </div>
      </div>
      <div className="space-y-1.5">
        {filtered.map((r) => {
          const deliverable = r.deliverableId
            ? DELIVERABLES.find((d) => d.id === r.deliverableId)
            : undefined;
          const owner = r.mitigationOwner
            ? team.find((m) => m.id === r.mitigationOwner)
            : undefined;
          const pastTrigger = isRiskPastTrigger(r, today);
          const sev = severityLevel(r.severity);

          return (
            <button
              key={r.id}
              onClick={() => onEdit(r)}
              className="w-full text-left bg-white rounded-xl border border-slate-200 p-3.5 hover:border-brand-green hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "h-10 w-10 rounded-lg flex flex-col items-center justify-center border text-xs font-semibold tabular-nums",
                    severityChipCls(sev),
                  )}
                  title={`P${r.probability} × I${r.impact} = ${r.severity}`}
                >
                  {r.severity}
                  <span className="text-[8px] font-normal uppercase tracking-wider opacity-70 -mt-0.5">
                    sev
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                      {r.title}
                    </h3>
                    <span
                      className={cn(
                        "inline-flex items-center text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded border",
                        riskStatusChip[r.status],
                      )}
                    >
                      {r.status}
                    </span>
                    <span className="inline-flex items-center text-[10px] uppercase tracking-wider text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded">
                      {r.category}
                    </span>
                    {pastTrigger && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded border border-red-300 bg-red-50 text-red-700">
                        <AlertTriangle className="h-3 w-3" />
                        past trigger
                      </span>
                    )}
                  </div>
                  {r.description && (
                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                      {r.description}
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    {deliverable && (
                      <span className="inline-flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        {deliverable.name}
                      </span>
                    )}
                    {owner && <span>Owner: {owner.name}</span>}
                    {r.triggerDate && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        trigger {formatDate(r.triggerDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center text-sm text-slate-400 py-8">
            No risks match these filters.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Decisions tab ───────────────────────────────────────────────────────────

const decisionStatusChip: Record<DecisionStatus, string> = {
  proposed: "bg-blue-50 text-blue-700 border-blue-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  implemented: "bg-slate-100 text-slate-600 border-slate-200",
  reversed: "bg-amber-50 text-amber-800 border-amber-200",
};

function DecisionsTab({
  decisions,
  onEdit,
  onCreate,
}: {
  decisions: Decision[];
  onEdit: (d: Decision) => void;
  onCreate: () => void;
}) {
  const [statusFilter, setStatusFilter] = useState<DecisionStatus | "all">("all");
  const [reversibilityFilter, setReversibilityFilter] = useState<
    "all" | "one_way_door" | "two_way_door"
  >("all");
  const team = useTeam();

  const filtered = useMemo(() => {
    return decisions.filter((d) => {
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (reversibilityFilter !== "all" && d.reversibility !== reversibilityFilter)
        return false;
      return true;
    });
  }, [decisions, statusFilter, reversibilityFilter]);

  if (decisions.length === 0) {
    return (
      <EmptyState
        icon={GitBranch}
        title="No decisions logged yet"
        description="Capture calls as they're made — stakeholder approvals, architecture choices, scope trades. The decided-on date matters."
        onCreate={onCreate}
        createLabel="Log first decision"
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as DecisionStatus | "all")}
          options={[
            { id: "all", label: "All" },
            ...DECISION_STATUSES.map((s) => ({ id: s.id, label: s.label })),
          ]}
        />
        <FilterSelect
          label="Reversibility"
          value={reversibilityFilter}
          onChange={(v) =>
            setReversibilityFilter(v as "all" | "one_way_door" | "two_way_door")
          }
          options={[
            { id: "all", label: "All" },
            { id: "two_way_door", label: "Two-way door" },
            { id: "one_way_door", label: "One-way door" },
          ]}
        />
        <div className="ml-auto text-xs text-slate-400 tabular-nums">
          {filtered.length} of {decisions.length}
        </div>
      </div>
      <div className="space-y-1.5">
        {filtered.map((d) => {
          const deliverable = d.deliverableId
            ? DELIVERABLES.find((x) => x.id === d.deliverableId)
            : undefined;
          const decidedByMember = d.decidedByMemberId
            ? team.find((m) => m.id === d.decidedByMemberId)
            : undefined;
          const decidedByLabel =
            decidedByMember?.name ?? d.decidedByExternal ?? "—";
          const isOneWay = d.reversibility === "one_way_door";

          return (
            <button
              key={d.id}
              onClick={() => onEdit(d)}
              className="w-full text-left bg-white rounded-xl border border-slate-200 p-3.5 hover:border-brand-green hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center border",
                    isOneWay
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-emerald-50 text-emerald-600 border-emerald-200",
                  )}
                  title={isOneWay ? "One-way door" : "Two-way door"}
                >
                  <GitBranch className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                      {d.title}
                    </h3>
                    <span
                      className={cn(
                        "inline-flex items-center text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded border",
                        decisionStatusChip[d.status],
                      )}
                    >
                      {d.status}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded border",
                        isOneWay
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-slate-50 text-slate-600 border-slate-200",
                      )}
                    >
                      {isOneWay ? "one-way" : "two-way"}
                    </span>
                  </div>
                  {d.decision && (
                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                      {d.decision}
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" />
                      {formatDate(d.decidedOn)}
                    </span>
                    <span>Decided by: {decidedByLabel}</span>
                    {deliverable && (
                      <span className="inline-flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        {deliverable.name}
                      </span>
                    )}
                    {d.taskId && (
                      <span className="font-mono text-[10px] text-slate-400">
                        {d.taskId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center text-sm text-slate-400 py-8">
            No decisions match these filters.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared pieces ───────────────────────────────────────────────────────────

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <label className="inline-flex items-center gap-2 text-xs text-slate-600">
      <span className="font-medium">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-green"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  onCreate,
  createLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onCreate: () => void;
  createLabel: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
      <Icon className="h-10 w-10 text-slate-300 mx-auto" />
      <h3 className="mt-3 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">{description}</p>
      <div className="mt-5">
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4" />
          {createLabel}
        </Button>
      </div>
    </div>
  );
}
