"use client";

/**
 * Order Workflow — Timeline tab. Week-by-week Gantt over ./timeline-data (all
 * dates live there). Day-column grid at lg+, stacked week cards below lg.
 */

import { Card, CardHeading, SectionIntro, StatTile } from "../launch-status/components";
import {
  BARS,
  LANES,
  MARKERS,
  SPEX_RISK,
  SPEX_STATUS,
  TIMELINE,
  type Bar,
  type BarTone,
  type ISODate,
  type LaneKey,
  type Marker,
  type MarkerKind,
} from "./timeline-data";

/* ------------------------------------------------------------------ */
/* Date helpers (UTC, so the grid never shifts with the viewer's zone) */
/* ------------------------------------------------------------------ */

const DAY_MS = 86_400_000;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toUtc(d: ISODate): number {
  const [y, m, day] = d.split("-").map(Number);
  return Date.UTC(y, m - 1, day);
}

function dayIndex(d: ISODate): number {
  return Math.round((toUtc(d) - toUtc(TIMELINE.gridStart)) / DAY_MS);
}

function fmt(d: ISODate, withWeekday = true): string {
  const t = new Date(toUtc(d));
  const md = `${t.getUTCMonth() + 1}/${t.getUTCDate()}`;
  return withWeekday ? `${WEEKDAYS[t.getUTCDay()]} ${md}` : md;
}

function fmtRange(a: ISODate, b: ISODate): string {
  return a === b ? fmt(a) : `${fmt(a)} – ${fmt(b)}`;
}

const DAY_COUNT = dayIndex(TIMELINE.gridEnd) + 1;
const DAYS = Array.from({ length: DAY_COUNT }, (_, i) => {
  const t = new Date(toUtc(TIMELINE.gridStart) + i * DAY_MS);
  return { i, dom: t.getUTCDate(), dow: t.getUTCDay(), month: t.getUTCMonth() + 1 };
});
const COL_PCT = 100 / DAY_COUNT;
const LABEL_COL = "11.5rem";
const GRID_COLS = `${LABEL_COL} repeat(${DAY_COUNT}, minmax(0, 1fr))`;
const center = (i: number) => `${(i + 0.5) * COL_PCT}%`;

/** Greedy row packing: each bar takes the first row it fits in. */
function packRows(bars: Bar[]): Bar[][] {
  const rows: { end: number; bars: Bar[] }[] = [];
  const sorted = [...bars].sort((a, b) => dayIndex(a.start) - dayIndex(b.start));
  for (const bar of sorted) {
    const s = dayIndex(bar.start);
    const row = rows.find((r) => r.end < s);
    if (row) {
      row.bars.push(bar);
      row.end = dayIndex(bar.end);
    } else {
      rows.push({ end: dayIndex(bar.end), bars: [bar] });
    }
  }
  return rows.map((r) => r.bars);
}

/* ------------------------------------------------------------------ */
/* Visual tokens                                                       */
/* ------------------------------------------------------------------ */

const HATCH =
  "bg-[repeating-linear-gradient(135deg,var(--color-gray-100)_0,var(--color-gray-100)_6px,white_6px,white_12px)]";

const BAR_TONE: Record<BarTone, string> = {
  core: "border-brand-navy bg-brand-navy text-white",
  carry: "border-2 border-dashed border-brand-navy bg-white text-brand-navy",
  spex: "border-amber-400 bg-amber-100 text-amber-900",
  xero: "border-sky-400 bg-sky-100 text-sky-900",
  ongoing: "border-dashed border-gray-300 bg-gray-50 text-gray-600",
  buffer: `border-gray-300 text-gray-700 ${HATCH}`,
  owed: "border-rose-300 bg-rose-50 text-rose-900",
};

const TAG_TONE: Record<BarTone, string> = {
  core: "bg-white/15 text-white",
  carry: "bg-brand-navy text-white",
  spex: "bg-amber-400 text-amber-950",
  xero: "bg-sky-500 text-white",
  ongoing: "bg-gray-200 text-gray-700",
  buffer: "bg-gray-200 text-gray-700",
  owed: "bg-rose-200 text-rose-900",
};

const MARKER_TONE: Record<MarkerKind, { dot: string; text: string }> = {
  live: { dot: "bg-brand-green ring-brand-green/30", text: "text-gray-900" },
  gate: { dot: "bg-brand-navy ring-brand-navy/20", text: "text-gray-900" },
  relaunch: { dot: "bg-amber-500 ring-amber-200", text: "text-amber-900" },
  cutover: { dot: "bg-sky-600 ring-sky-200", text: "text-sky-900" },
  due: { dot: "bg-rose-500 ring-rose-200", text: "text-rose-900" },
};

const LANE_ACCENT: Record<LaneKey, string> = {
  workflow: "border-l-brand-navy",
  spex: "border-l-amber-400",
  xero: "border-l-sky-400",
  owes: "border-l-rose-300",
  gates: "border-l-brand-green",
};

function AssumedChip() {
  return (
    <span
      title="Working assumption, not a stated date"
      className="ml-1 inline-flex shrink-0 items-center rounded-full border border-current px-1.5 text-[9px] font-bold uppercase tracking-wide opacity-70"
    >
      date assumed
    </span>
  );
}

function Diamond({ kind, className = "" }: { kind: MarkerKind; className?: string }) {
  return <span aria-hidden className={`h-3.5 w-3.5 shrink-0 rotate-45 rounded-[2px] ring-4 ${MARKER_TONE[kind].dot} ${className}`} />;
}

function markerWhen(m: Marker): string {
  return `${m.approx ? "~" : ""}${fmt(m.date)}`;
}

/* ------------------------------------------------------------------ */
/* Gantt grid (lg+)                                                    */
/* ------------------------------------------------------------------ */

function BarCell({ bar, row }: { bar: Bar; row: number }) {
  const s = dayIndex(bar.start);
  const e = dayIndex(bar.end);
  return (
    <div className="relative z-[1] px-0.5 py-0.5" style={{ gridColumn: `${s + 2} / ${e + 3}`, gridRow: row }}>
      <div
        title={`${bar.label} · ${fmtRange(bar.start, bar.end)}\n${bar.detail}`}
        className={`flex h-full min-h-[2.25rem] items-center gap-1.5 overflow-hidden rounded-md border px-2 py-1 text-[11px] font-semibold leading-tight ${BAR_TONE[bar.tone]} ${
          bar.continues ? "rounded-r-none border-r-0" : ""
        }`}
      >
        {bar.tag && <span className={`shrink-0 rounded px-1 py-px text-[10px] font-bold ${TAG_TONE[bar.tone]}`}>{bar.tag}</span>}
        <span className="min-w-0 truncate">{bar.label}</span>
        {bar.assumed && <AssumedChip />}
        {bar.continues && <span aria-hidden className="ml-auto shrink-0 pl-1">→</span>}
      </div>
    </div>
  );
}

function MarkerCell({ m, row }: { m: Marker; row: number }) {
  const i = dayIndex(m.date);
  const flip = i > DAY_COUNT - 6; // near the right edge: label goes left
  return (
    <div
      className="relative z-[1] h-9"
      style={{ gridColumn: `${i + 2} / ${i + 3}`, gridRow: row }}
      title={`${m.label} · ${markerWhen(m)}\n${m.detail}`}
    >
      <Diamond kind={m.kind} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45" />
      <span
        className={`absolute top-1/2 flex -translate-y-1/2 items-center whitespace-nowrap rounded bg-white/90 px-1 text-[11px] font-semibold leading-tight ${MARKER_TONE[m.kind].text} ${
          flip ? "right-[calc(50%+0.8rem)]" : "left-[calc(50%+0.8rem)]"
        }`}
      >
        {m.share && <span className="mr-1 font-bold text-brand-green">{m.share}</span>}
        {m.label}
        <span className="ml-1 font-normal text-gray-500">
          {m.approx ? "~" : ""}
          {fmt(m.date, false)}
        </span>
        {m.assumed && <AssumedChip />}
      </span>
    </div>
  );
}

function GanttGrid() {
  const todayI = dayIndex(TIMELINE.today);
  const keyI = dayIndex(TIMELINE.keyDate);
  const kickI = dayIndex(TIMELINE.kickoff);

  return (
    <div>
      {/* Flags: today + key date */}
      <div className="grid" style={{ gridTemplateColumns: `${LABEL_COL} minmax(0, 1fr)` }}>
        <div />
        <div className="relative h-6">
          <span
            className="absolute bottom-1 whitespace-nowrap rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white"
            style={{ left: `calc(${center(todayI)} - 0.5rem)` }}
          >
            Today {fmt(TIMELINE.today)}
          </span>
          <span
            className="absolute bottom-1 -translate-x-1/2 whitespace-nowrap rounded bg-brand-green px-1.5 py-0.5 text-[10px] font-bold text-white"
            style={{ left: center(keyI) }}
          >
            {TIMELINE.keyDateLabel}
          </span>
        </div>
      </div>

      {/* Weeks */}
      <div className="grid" style={{ gridTemplateColumns: GRID_COLS }}>
        <div />
        {kickI > 0 && (
          <div className="flex items-end px-1 pb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400" style={{ gridColumn: `2 / ${kickI + 2}` }}>
            Prep
          </div>
        )}
        {TIMELINE.weeks.map((w) => (
          <div key={w.key} className="min-w-0 border-l-2 border-gray-300 px-2 pb-1" style={{ gridColumn: `${dayIndex(w.start) + 2} / ${dayIndex(w.end) + 3}` }}>
            <p className="text-xs font-bold text-gray-900">
              {w.label} <span className="font-normal text-gray-500">{fmtRange(w.start, w.end)}</span>
            </p>
            <p className="truncate text-[11px] text-gray-500">{w.theme}</p>
          </div>
        ))}
      </div>

      {/* Day ticks */}
      <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: GRID_COLS }}>
        <div />
        {DAYS.map((d) => {
          const weekend = d.dow === 0 || d.dow === 6;
          const isKey = d.i === keyI;
          return (
            <div key={d.i} className="py-1 text-center leading-none">
              <span className={`block text-[9px] uppercase ${weekend ? "text-gray-300" : "text-gray-400"}`}>{WEEKDAYS[d.dow][0]}</span>
              <span
                className={`mx-auto mt-0.5 block w-fit rounded px-0.5 text-[11px] tabular-nums ${
                  isKey ? "bg-brand-green font-bold text-white" : weekend ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {d.dom === 1 ? `${d.month}/1` : d.dom}
              </span>
            </div>
          );
        })}
      </div>

      {/* Lanes with the overlay behind them */}
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0" style={{ left: LABEL_COL }}>
          {DAYS.filter((d) => d.dow === 0 || d.dow === 6).map((d) => (
            <div key={d.i} className="absolute inset-y-0 bg-gray-100/80" style={{ left: `${d.i * COL_PCT}%`, width: `${COL_PCT}%` }} />
          ))}
          {kickI > 0 && <div className={`absolute inset-y-0 opacity-60 ${HATCH}`} style={{ left: 0, width: `${kickI * COL_PCT}%` }} />}
          {TIMELINE.weeks.map((w) => (
            <div key={w.key} className="absolute inset-y-0 w-0.5 bg-gray-300" style={{ left: `${dayIndex(w.start) * COL_PCT}%` }} />
          ))}
          <div className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-brand-green" style={{ left: center(keyI) }} />
          <div className="absolute inset-y-0 -translate-x-1/2 border-l-2 border-dashed border-rose-500" style={{ left: center(todayI) }} />
        </div>

        {LANES.map((lane) => {
          const rows = packRows(BARS.filter((b) => b.lane === lane.key));
          const markers = MARKERS.filter((m) => m.lane === lane.key);
          const span = Math.max(1, rows.length + (markers.length ? 1 : 0));
          return (
            <div key={lane.key} className="grid border-b border-gray-200 last:border-b-0" style={{ gridTemplateColumns: GRID_COLS }}>
              <div className={`relative z-[1] border-l-4 bg-white py-2 pl-3 pr-2 ${LANE_ACCENT[lane.key]}`} style={{ gridColumn: 1, gridRow: `1 / span ${span}` }}>
                <p className="text-sm font-semibold leading-tight text-gray-900">{lane.label}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-gray-500">{lane.sub}</p>
              </div>
              {rows.map((row, ri) => row.map((bar) => <BarCell key={bar.id} bar={bar} row={ri + 1} />))}
              {markers.map((m) => (
                <MarkerCell key={m.id} m={m} row={rows.length + 1} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stacked week cards (below lg)                                       */
/* ------------------------------------------------------------------ */

const PERIODS: { key: string; label: string; start: ISODate; end: ISODate; theme: string }[] = [
  ...(dayIndex(TIMELINE.kickoff) > 0
    ? [
        {
          key: "prep",
          label: "Before kickoff",
          start: TIMELINE.gridStart,
          end: (() => {
            const t = new Date(toUtc(TIMELINE.kickoff) - DAY_MS);
            return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}-${String(t.getUTCDate()).padStart(2, "0")}` as ISODate;
          })(),
          theme: "Today through the day before work starts",
        },
      ]
    : []),
  ...TIMELINE.weeks.map((w) => ({ key: w.key, label: w.label, start: w.start, end: w.end, theme: w.theme })),
];

function StackedWeeks() {
  return (
    <div className="space-y-4">
      {PERIODS.map((p) => {
        const ps = dayIndex(p.start);
        const pe = dayIndex(p.end);
        // A bar belongs to the period it STARTS in (ongoing bars are not repeated).
        const bars = BARS.filter((b) => dayIndex(b.start) >= ps && dayIndex(b.start) <= pe);
        const markers = MARKERS.filter((m) => dayIndex(m.date) >= ps && dayIndex(m.date) <= pe);
        if (!bars.length && !markers.length) return null;
        return (
          <Card key={p.key}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className="text-sm font-bold text-gray-900">
                {p.label} <span className="font-normal text-gray-500">{fmtRange(p.start, p.end)}</span>
              </p>
              <p className="text-xs text-gray-500">{p.theme}</p>
            </div>
            <ul className="mt-3 space-y-2">
              {LANES.flatMap((lane) => [
                ...markers
                  .filter((m) => m.lane === lane.key)
                  .map((m) => (
                    <li key={m.id} className="flex items-start gap-3 rounded-lg border border-gray-200 px-3 py-2">
                      <Diamond kind={m.kind} className="mt-1" />
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold ${MARKER_TONE[m.kind].text}`}>
                          {m.share && <span className="mr-1 text-brand-green">{m.share}</span>}
                          {m.label} <span className="font-normal text-gray-500">· {markerWhen(m)}</span>
                          {m.assumed && <AssumedChip />}
                        </p>
                        <p className="text-xs text-gray-600">
                          {lane.label}. {m.detail}
                        </p>
                      </div>
                    </li>
                  )),
                ...bars
                  .filter((b) => b.lane === lane.key)
                  .map((b) => (
                    <li key={b.id} className={`rounded-lg border px-3 py-2 ${BAR_TONE[b.tone]}`}>
                      <p className="text-sm font-semibold">
                        {b.tag && <span className={`mr-1.5 rounded px-1 py-px text-[10px] font-bold ${TAG_TONE[b.tone]}`}>{b.tag}</span>}
                        {b.label}
                        {b.assumed && <AssumedChip />}
                      </p>
                      <p className="mt-0.5 text-xs opacity-80">
                        {lane.label} · {fmtRange(b.start, b.end)}
                        {b.continues ? " and beyond" : ""}
                      </p>
                    </li>
                  )),
              ])}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

function Legend() {
  const items: { cls: string; label: string }[] = [
    { cls: BAR_TONE.core, label: "Build" },
    { cls: BAR_TONE.carry, label: "Rest of P1, after the core" },
    { cls: BAR_TONE.spex, label: "SpeX catalog (isolated)" },
    { cls: BAR_TONE.xero, label: "Xero" },
    { cls: BAR_TONE.owed, label: "TableX owes" },
    { cls: BAR_TONE.buffer, label: "Rework buffer" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-gray-600">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <span aria-hidden className={`h-3 w-5 rounded border ${it.cls}`} />
          {it.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <Diamond kind="gate" className="h-2.5 w-2.5 ring-2" /> Gate / milestone
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden className="h-3 border-l-2 border-dashed border-rose-500" /> Today
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden className="h-3 w-0.5 bg-brand-green" /> {TIMELINE.keyDateLabel}
      </span>
    </div>
  );
}

export function TimelineSection() {
  const gates = MARKERS.filter((m) => m.kind === "gate");
  return (
    <div className="space-y-6">
      <SectionIntro title="Four weeks, Wed 10/14 to Fri 11/07">
        <p>
          SpeX Studio goes first: the October price book and the action-tracker corrections land on staging by Sun 10/18
          for TableX&rsquo;s test week, and SpeX returns to the public on Brian&rsquo;s date, Mon 10/26. The order workflow
          follows: P1 core builds the week of 10/21 and the first sales order issues on Mon 10/26, the day Xero takes over
          invoicing. Hover a bar for its detail.
        </p>
      </SectionIntro>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile value="4 weeks" label={fmtRange(TIMELINE.kickoff, TIMELINE.end)} sub="Redrawn Wed 10/14 after Brian's round-2 answer" />
        <StatTile value="Mon 10/26" label="SpeX public + first SO" sub="SpeX corrections on staging Mon 10/19; Xero starts 10/26" />
        <StatTile value={`${gates.length} milestones`} label="Acceptance points" sub={gates.map((g) => `${g.label.split(" · ")[0]} ${markerWhen(g)}`).join(" · ")} />
      </div>

      <Card className="hidden lg:block">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardHeading>Week by week</CardHeading>
          <Legend />
        </div>
        <div className="mt-4">
          <GanttGrid />
        </div>
      </Card>

      <div className="space-y-3 lg:hidden">
        <CardHeading>Week by week</CardHeading>
        <Legend />
        <StackedWeeks />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="border-amber-300 bg-amber-50/60">
          <CardHeading>SpeX Studio · isolated lane</CardHeading>
          <p className="mt-2 text-lg font-bold text-amber-900">{SPEX_STATUS.headline}</p>
          <p className="mt-1 text-sm leading-relaxed text-amber-950/80">{SPEX_STATUS.body}</p>
          <ul className="mt-3 space-y-1.5 text-sm text-amber-950/90">
            {BARS.filter((b) => b.lane === "spex").map((b) => (
              <li key={b.id}>
                <span className="font-semibold">{fmtRange(b.start, b.end)}:</span> {b.detail}
              </li>
            ))}
            {MARKERS.filter((m) => m.lane === "spex").map((m) => (
              <li key={m.id}>
                <span className="font-semibold">{markerWhen(m)}:</span> {m.label}. {m.detail}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-amber-900/70">Independent of P1–P5, but it lands the same week and may cause rework to the plan.</p>
        </Card>

        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5">
          <p className="text-sm font-bold text-rose-800">{SPEX_RISK.title}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-rose-900/80">
            {SPEX_RISK.why.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-rose-800">What slips, in order</p>
          <ol className="mt-2 space-y-2">
            {SPEX_RISK.slips.map((s, i) => (
              <li key={s.what} className="flex gap-3 rounded-lg border border-rose-200 bg-white px-3 py-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">{i + 1}</span>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">{s.what}</p>
                  <p className="text-gray-600">{s.to}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm font-semibold text-rose-900">{SPEX_RISK.holds}</p>
        </div>
      </div>

      <Card>
        <CardHeading>TableX owes</CardHeading>
        <ul className="mt-3 divide-y divide-gray-100">
          {[
            ...BARS.filter((b) => b.lane === "owes").map((b) => ({ id: b.id, when: fmt(b.end), label: b.label, detail: b.detail, assumed: b.assumed, sort: dayIndex(b.end) })),
            ...MARKERS.filter((m) => m.lane === "owes").map((m) => ({ id: m.id, when: markerWhen(m), label: m.label, detail: m.detail, assumed: m.assumed, sort: dayIndex(m.date) })),
          ]
            .sort((a, b) => a.sort - b.sort)
            .map((o) => (
              <li key={o.id} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:gap-4">
                <span className="w-28 shrink-0 text-sm font-bold tabular-nums text-rose-700">
                  by {o.when}
                  {o.assumed && <AssumedChip />}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{o.label}</p>
                  <p className="text-sm text-gray-600">{o.detail}</p>
                </div>
              </li>
            ))}
        </ul>
      </Card>
    </div>
  );
}
