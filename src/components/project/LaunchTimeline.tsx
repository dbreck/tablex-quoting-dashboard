"use client";

// Self-contained, date-based Gantt for the launch program. Milestones live in
// Supabase (write-through store); lanes/owners/statuses are static config.
// Drag a bar to move it, drag an edge to resize, click to edit. Not related to
// the week-based GanttChart (that renders the static Deliverable/phase model).

import { useMemo, useRef, useState } from "react";
import { Download, Plus, Printer, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  LAUNCH_LANES,
  LAUNCH_OWNERS,
  LAUNCH_STATUS,
  OWNER_IDS,
  STATUS_IDS,
  type LaneId,
  type LaunchMilestone,
  type OwnerId,
  type StatusId,
} from "@/data/launch-timeline";
import {
  useLaunchMilestones,
  useLaunchTimelineStore,
} from "@/store/launch-timeline-store";

// ─── Date helpers (self-contained) ───────────────────────────────────────────

const MS = 86400000;
const DAYW = 22; // px per day
const LEFT_W = 300; // px, sticky label rail
const TODAY_COLOR = "#ef4444";
const WEEK_LINE = "#eef1f4";

const ymd = (s: string): Date => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const dayNum = (dt: Date): number =>
  Math.floor(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()) / MS);
const fromDay = (n: number): Date => {
  const d = new Date(n * MS);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};
const toISO = (dt: Date): string =>
  `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
    dt.getDate(),
  ).padStart(2, "0")}`;
const fmt = (dt: Date): string =>
  dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });

interface Range {
  sN: number;
  total: number;
}
function computeRange(milestones: LaunchMilestone[]): Range {
  let min = Infinity;
  let max = -Infinity;
  for (const m of milestones) {
    min = Math.min(min, dayNum(ymd(m.start)));
    max = Math.max(max, dayNum(ymd(m.end)));
  }
  if (!isFinite(min)) {
    const t = dayNum(new Date());
    min = t;
    max = t + 28;
  }
  let s = fromDay(min);
  while (s.getDay() !== 1) s = fromDay(dayNum(s) - 1); // back to Monday
  let e = fromDay(max);
  while (e.getDay() !== 0) e = fromDay(dayNum(e) + 1); // forward to Sunday
  e = fromDay(dayNum(e) + 1); // trailing day
  const sN = dayNum(s);
  return { sN, total: dayNum(e) - sN + 1 };
}

const weekLineBg = `repeating-linear-gradient(90deg, transparent 0, transparent ${
  DAYW * 7 - 1
}px, ${WEEK_LINE} ${DAYW * 7 - 1}px, ${WEEK_LINE} ${DAYW * 7}px)`;

function newId(): string {
  return `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Drag + editor types ─────────────────────────────────────────────────────

interface DragSession {
  id: string;
  mode: "move" | "l" | "r";
  startX: number;
  moved: boolean;
  os: number;
  oe: number;
  el: HTMLDivElement;
  rangeStart: number;
  live: { s: number; en: number } | null;
}

interface EditorState {
  mode: "new" | "edit";
  id: string | null;
  title: string;
  lane: LaneId;
  owner: OwnerId;
  start: string;
  end: string;
  status: StatusId;
  note: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LaunchTimeline() {
  const milestones = useLaunchMilestones();
  const addMilestone = useLaunchTimelineStore((s) => s.addMilestone);
  const updateMilestone = useLaunchTimelineStore((s) => s.updateMilestone);
  const deleteMilestone = useLaunchTimelineStore((s) => s.deleteMilestone);

  const [collapsed, setCollapsed] = useState<Set<LaneId>>(() => new Set());
  const [editor, setEditor] = useState<EditorState | null>(null);

  const dragRef = useRef<DragSession | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);

  const range = useMemo(() => computeRange(milestones), [milestones]);
  const trackW = range.total * DAYW;
  const todayN = dayNum(new Date());
  const showToday = todayN >= range.sN && todayN < range.sN + range.total;
  const todayX = (todayN - range.sN) * DAYW;

  const months = useMemo(() => {
    const segs: { left: number; width: number; label: string }[] = [];
    let d = range.sN;
    while (d < range.sN + range.total) {
      const dt = fromDay(d);
      const mStart = Math.max(dayNum(new Date(dt.getFullYear(), dt.getMonth(), 1)), range.sN);
      const mNext = dayNum(new Date(dt.getFullYear(), dt.getMonth() + 1, 1));
      const segEnd = Math.min(mNext, range.sN + range.total);
      segs.push({
        left: (mStart - range.sN) * DAYW,
        width: (segEnd - mStart) * DAYW,
        label: `${dt.toLocaleDateString("en-US", { month: "long" })} ${dt.getFullYear()}`,
      });
      d = mNext;
    }
    return segs;
  }, [range]);

  const weeks = useMemo(() => {
    const out: { left: number; label: string }[] = [];
    for (let w = 0; w < range.total; w += 7) {
      out.push({ left: w * DAYW, label: fmt(fromDay(range.sN + w)) });
    }
    return out;
  }, [range]);

  // ─── Drag handlers ─────────────────────────────────────────────────────────

  function onBarPointerDown(e: React.PointerEvent<HTMLDivElement>, m: LaunchMilestone) {
    const el = e.currentTarget;
    const handle = (e.target as HTMLElement).dataset.handle;
    const mode: DragSession["mode"] = handle === "l" ? "l" : handle === "r" ? "r" : "move";
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    dragRef.current = {
      id: m.id,
      mode,
      startX: e.clientX,
      moved: false,
      os: dayNum(ymd(m.start)),
      oe: dayNum(ymd(m.end)),
      el,
      rangeStart: range.sN,
      live: null,
    };
    el.style.cursor = "grabbing";
    e.preventDefault();
  }

  function onBarPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = dragRef.current;
    if (!d) return;
    if (Math.abs(e.clientX - d.startX) > 3) d.moved = true;
    const dd = Math.round((e.clientX - d.startX) / DAYW);
    let s = d.os;
    let en = d.oe;
    if (d.mode === "move") {
      s += dd;
      en += dd;
    } else if (d.mode === "l") {
      s = Math.min(d.os + dd, d.oe);
    } else {
      en = Math.max(d.oe + dd, d.os);
    }
    d.live = { s, en };
    d.el.style.left = `${(s - d.rangeStart) * DAYW}px`;
    d.el.style.width = `${Math.max((en - s + 1) * DAYW, 8)}px`;
    const tip = tipRef.current;
    if (tip) {
      tip.textContent = `${fmt(fromDay(s))} – ${fmt(fromDay(en))}`;
      tip.style.left = `${e.clientX + 14}px`;
      tip.style.top = `${e.clientY + 14}px`;
      tip.style.opacity = "1";
    }
  }

  function onBarPointerUp(e: React.PointerEvent<HTMLDivElement>, m: LaunchMilestone) {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    d.el.style.cursor = "";
    if (tipRef.current) tipRef.current.style.opacity = "0";
    try {
      d.el.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (d.moved && d.live) {
      const start = toISO(fromDay(d.live.s));
      const end = toISO(fromDay(d.live.en));
      if (start !== m.start || end !== m.end) {
        void updateMilestone(m.id, { start, end });
      } else {
        // no net change — restore exact position from state
        d.el.style.left = `${(dayNum(ymd(m.start)) - range.sN) * DAYW}px`;
        d.el.style.width = `${(dayNum(ymd(m.end)) - dayNum(ymd(m.start)) + 1) * DAYW}px`;
      }
    } else {
      openEdit(m);
    }
  }

  function onBarPointerCancel(m: LaunchMilestone) {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    if (tipRef.current) tipRef.current.style.opacity = "0";
    d.el.style.cursor = "";
    d.el.style.left = `${(dayNum(ymd(m.start)) - range.sN) * DAYW}px`;
    d.el.style.width = `${(dayNum(ymd(m.end)) - dayNum(ymd(m.start)) + 1) * DAYW}px`;
  }

  // ─── Editor ────────────────────────────────────────────────────────────────

  function openEdit(m: LaunchMilestone) {
    setEditor({
      mode: "edit",
      id: m.id,
      title: m.title,
      lane: m.lane,
      owner: m.owner,
      start: m.start,
      end: m.end,
      status: m.status,
      note: m.note,
    });
  }

  function openNew(lane: LaneId) {
    const today = new Date();
    setEditor({
      mode: "new",
      id: null,
      title: "",
      lane,
      owner: "clearph",
      start: toISO(today),
      end: toISO(fromDay(dayNum(today) + 6)),
      status: "todo",
      note: "",
    });
  }

  function saveEditor() {
    if (!editor) return;
    let start = editor.start || editor.end || toISO(new Date());
    let end = editor.end || start;
    if (dayNum(ymd(end)) < dayNum(ymd(start))) {
      const t = start;
      start = end;
      end = t;
    }
    const title = editor.title.trim() || "Untitled milestone";
    if (editor.mode === "edit" && editor.id) {
      void updateMilestone(editor.id, {
        title,
        lane: editor.lane,
        owner: editor.owner,
        start,
        end,
        status: editor.status,
        note: editor.note.trim(),
      });
    } else {
      const maxSort = milestones.reduce((mx, m) => Math.max(mx, m.sortOrder), 0);
      const now = new Date().toISOString();
      void addMilestone({
        id: newId(),
        lane: editor.lane,
        title,
        owner: editor.owner,
        start,
        end,
        status: editor.status,
        note: editor.note.trim(),
        sortOrder: maxSort + 1,
        createdAt: now,
        updatedAt: now,
      });
    }
    setEditor(null);
  }

  function deleteEditor() {
    if (editor?.id) void deleteMilestone(editor.id);
    setEditor(null);
  }

  // ─── Toolbar actions ───────────────────────────────────────────────────────

  function exportJson() {
    const blob = new Blob([JSON.stringify(milestones, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tablex-launch-timeline.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function toggleLane(id: LaneId) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 px-4 py-3">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="font-semibold uppercase tracking-wide text-gray-400">Owner</span>
          {OWNER_IDS.map((id) => (
            <span key={id} className="inline-flex items-center gap-1.5 text-gray-600">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ background: LAUNCH_OWNERS[id].color }}
              />
              {LAUNCH_OWNERS[id].label}
            </span>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportJson} className="gap-1.5">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button size="sm" onClick={() => openNew("web")} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Milestone
          </Button>
        </div>
      </div>

      {/* Gantt */}
      <div className="max-h-[70vh] overflow-auto">
        <div className="relative" style={{ minWidth: "max-content" }}>
          {/* Month band */}
          <div className="sticky top-0 z-30 flex">
            <div
              className="sticky left-0 z-40 flex flex-col justify-end border-b border-r border-gray-200 bg-gray-50 px-4 py-1.5"
              style={{ width: LEFT_W }}
            >
              <span className="text-sm font-bold text-gray-900">Workstream</span>
              <span className="text-[11px] text-gray-400">{milestones.length} milestones</span>
            </div>
            <div
              className="relative border-b border-gray-200 bg-gray-50"
              style={{ width: trackW, height: 44 }}
            >
              {months.map((seg, i) => (
                <div
                  key={i}
                  className="absolute flex items-center border-l border-gray-200 text-[11px] font-bold uppercase tracking-wide text-gray-500"
                  style={{ left: seg.left, width: seg.width, top: 0, height: "100%", paddingLeft: 9 }}
                >
                  {seg.label}
                </div>
              ))}
              {showToday && (
                <>
                  <div
                    className="absolute top-0 bottom-0 z-10"
                    style={{ left: todayX, width: 2, background: TODAY_COLOR }}
                  />
                  <div
                    className="absolute z-20 rounded px-1.5 text-[10px] font-bold"
                    style={{
                      left: todayX,
                      top: 4,
                      transform: "translateX(-50%)",
                      color: TODAY_COLOR,
                      background: "#fff",
                    }}
                  >
                    Today
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Week ticks */}
          <div className="sticky z-20 flex" style={{ top: 44 }}>
            <div
              className="sticky left-0 z-30 flex items-center border-b border-r border-gray-200 bg-gray-50 px-4"
              style={{ width: LEFT_W, height: 26 }}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Week of
              </span>
            </div>
            <div
              className="relative border-b border-gray-200 bg-gray-50"
              style={{ width: trackW, height: 26 }}
            >
              {weeks.map((w, i) => (
                <div
                  key={i}
                  className="absolute flex items-center border-l border-gray-100 pl-1.5 text-[10px] tabular-nums text-gray-400"
                  style={{ left: w.left, width: DAYW * 7, top: 0, height: "100%" }}
                >
                  {w.label}
                </div>
              ))}
              {showToday && (
                <div
                  className="absolute top-0 bottom-0 z-10"
                  style={{ left: todayX, width: 2, background: TODAY_COLOR }}
                />
              )}
            </div>
          </div>

          {/* Lanes */}
          {LAUNCH_LANES.map((lane) => {
            const items = milestones.filter((m) => m.lane === lane.id);
            const isCollapsed = collapsed.has(lane.id);
            return (
              <div key={lane.id}>
                {/* Lane header */}
                <div className="flex border-b border-gray-200 bg-gray-50/80">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={!isCollapsed}
                    onClick={() => toggleLane(lane.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleLane(lane.id);
                      }
                    }}
                    className="sticky left-0 z-20 flex cursor-pointer items-center gap-2.5 border-r border-gray-200 bg-gray-50 px-4 py-2.5 text-left"
                    style={{ width: LEFT_W }}
                  >
                    <span
                      className="h-6 w-1 flex-none rounded"
                      style={{ background: lane.stripe }}
                    />
                    <span
                      className="flex-none text-gray-400 transition-transform"
                      style={{ transform: isCollapsed ? "rotate(-90deg)" : "none" }}
                    >
                      ▾
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-bold text-gray-900">
                        {lane.name}
                      </span>
                      <span className="block truncate text-[11px] text-gray-500">
                        {lane.blurb}
                      </span>
                    </span>
                    <span className="ml-auto text-[11px] font-bold tabular-nums text-gray-400">
                      {items.length}
                    </span>
                    <button
                      type="button"
                      aria-label={`Add milestone to ${lane.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        openNew(lane.id);
                      }}
                      className="flex h-6 w-6 flex-none items-center justify-center rounded-md border border-gray-200 bg-white text-gray-400 hover:border-brand-green hover:text-brand-green"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div
                    className="relative"
                    style={{ width: trackW, height: 47, backgroundImage: weekLineBg }}
                  >
                    {showToday && (
                      <div
                        className="absolute top-0 bottom-0"
                        style={{ left: todayX, width: 2, background: TODAY_COLOR, opacity: 0.5 }}
                      />
                    )}
                  </div>
                </div>

                {/* Task rows */}
                {!isCollapsed &&
                  items.map((m) => {
                    const owner = LAUNCH_OWNERS[m.owner];
                    const s0 = dayNum(ymd(m.start));
                    const e0 = dayNum(ymd(m.end));
                    const left = (s0 - range.sN) * DAYW;
                    const width = Math.max((e0 - s0 + 1) * DAYW, 8);
                    return (
                      <div key={m.id} className="flex border-b border-gray-100">
                        {/* Left label */}
                        <div
                          className="sticky left-0 z-10 flex flex-col justify-center gap-0.5 border-r border-gray-200 bg-white px-4 py-2"
                          style={{ width: LEFT_W }}
                        >
                          <div className="flex items-center gap-2">
                            <StatusDot status={m.status} />
                            <span
                              className="truncate text-[12.5px] font-semibold text-gray-800"
                              title={m.title}
                            >
                              {m.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 pl-4 text-[11px] text-gray-400">
                            <span className="inline-flex items-center gap-1 font-semibold text-gray-500">
                              <span
                                className="h-2 w-2 rounded-sm"
                                style={{ background: owner.color }}
                              />
                              {owner.label}
                            </span>
                            <span className="font-mono tabular-nums">
                              {fmt(ymd(m.start))} – {fmt(ymd(m.end))}
                            </span>
                          </div>
                        </div>
                        {/* Track */}
                        <div
                          className="relative"
                          style={{ width: trackW, height: 40, backgroundImage: weekLineBg }}
                        >
                          {showToday && (
                            <div
                              className="absolute top-0 bottom-0"
                              style={{ left: todayX, width: 2, background: TODAY_COLOR, opacity: 0.4 }}
                            />
                          )}
                          <Bar
                            milestone={m}
                            left={left}
                            width={width}
                            color={owner.color}
                            onPointerDown={(e) => onBarPointerDown(e, m)}
                            onPointerMove={onBarPointerMove}
                            onPointerUp={(e) => onBarPointerUp(e, m)}
                            onPointerCancel={() => onBarPointerCancel(m)}
                            onActivate={() => openEdit(m)}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Drag tooltip */}
      <div
        ref={tipRef}
        className="pointer-events-none fixed z-[200] rounded-md bg-gray-900 px-2 py-1 font-mono text-[11px] text-white opacity-0 transition-opacity"
        style={{ left: 0, top: 0 }}
      />

      {/* Editor */}
      <Dialog open={editor !== null} onOpenChange={(o) => !o && setEditor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editor?.mode === "new" ? "New milestone" : "Edit milestone"}</DialogTitle>
          </DialogHeader>
          {editor && (
            <div className="grid gap-4">
              <Field label="Milestone">
                <input
                  type="text"
                  value={editor.title}
                  autoFocus
                  onChange={(e) => setEditor({ ...editor, title: e.target.value })}
                  placeholder="e.g. Client review — round 1"
                  className={inputCls}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Workstream">
                  <select
                    value={editor.lane}
                    onChange={(e) => setEditor({ ...editor, lane: e.target.value as LaneId })}
                    className={inputCls}
                  >
                    {LAUNCH_LANES.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Owner">
                  <select
                    value={editor.owner}
                    onChange={(e) => setEditor({ ...editor, owner: e.target.value as OwnerId })}
                    className={inputCls}
                  >
                    {OWNER_IDS.map((id) => (
                      <option key={id} value={id}>
                        {LAUNCH_OWNERS[id].label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start">
                  <input
                    type="date"
                    value={editor.start}
                    onChange={(e) => setEditor({ ...editor, start: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="End">
                  <input
                    type="date"
                    value={editor.end}
                    onChange={(e) => setEditor({ ...editor, end: e.target.value })}
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="Status">
                <select
                  value={editor.status}
                  onChange={(e) => setEditor({ ...editor, status: e.target.value as StatusId })}
                  className={inputCls}
                >
                  {STATUS_IDS.map((id) => (
                    <option key={id} value={id}>
                      {LAUNCH_STATUS[id].label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Notes">
                <textarea
                  value={editor.note}
                  onChange={(e) => setEditor({ ...editor, note: e.target.value })}
                  rows={2}
                  placeholder="Dependencies, hand-offs, open questions…"
                  className={`${inputCls} resize-y`}
                />
              </Field>
              <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                {editor.mode === "edit" && (
                  <button
                    type="button"
                    onClick={deleteEditor}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                )}
                <div className="ml-auto flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditor(null)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={saveEditor}>
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</span>
      {children}
    </label>
  );
}

function StatusDot({ status }: { status: StatusId }) {
  const cls: Record<StatusId, string> = {
    todo: "border-gray-400",
    active: "border-brand-green bg-brand-green",
    done: "border-gray-400 bg-gray-400",
    blocked: "border-red-500 bg-red-500",
  };
  return <span className={`h-2.5 w-2.5 flex-none rounded-full border-[1.5px] ${cls[status]}`} />;
}

interface BarProps {
  milestone: LaunchMilestone;
  left: number;
  width: number;
  color: string;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: () => void;
  onActivate: () => void;
}

function Bar({
  milestone: m,
  left,
  width,
  color,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onActivate,
}: BarProps) {
  const style: React.CSSProperties = {
    left,
    width,
    top: 7,
    height: 26,
    background: color,
  };
  const status = m.status;
  const boxShadow =
    status === "active"
      ? "0 0 0 2px #8dc63f, 0 1px 2px rgba(0,0,0,.18)"
      : status === "blocked"
        ? "inset 0 0 0 2px #dc2626, 0 1px 2px rgba(0,0,0,.18)"
        : "0 1px 2px rgba(0,0,0,.18)";
  style.boxShadow = boxShadow;
  if (status === "done") style.opacity = 0.5;
  if (status === "blocked") {
    style.backgroundImage =
      "repeating-linear-gradient(45deg, rgba(0,0,0,.14) 0 6px, transparent 6px 12px)";
  }

  return (
    <div
      role="button"
      tabIndex={0}
      title={`${m.title} — drag to move, click to edit`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => onPointerUp(e)}
      onPointerCancel={onPointerCancel}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
      className="absolute flex touch-none select-none items-center gap-1.5 overflow-hidden rounded-md px-2 text-[12px] font-semibold text-white"
      style={{ ...style, cursor: "grab" }}
    >
      <span data-handle="l" className="absolute left-0 top-0 h-full w-2.5 cursor-ew-resize" />
      {status === "done" && <span className="text-[11px]">✓</span>}
      {status === "blocked" && <span className="text-[11px]">⚠</span>}
      <span className="truncate">{m.title}</span>
      <span data-handle="r" className="absolute right-0 top-0 h-full w-2.5 cursor-ew-resize" />
    </div>
  );
}
