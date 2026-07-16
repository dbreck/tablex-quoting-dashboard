"use client";

/**
 * Launch Status — the seven tab sections. Pure presentation over ./data.
 */

import {
  CRM_POINTS,
  CUTOVER_STEPS,
  MISSING_BASES,
  NEEDS,
  OPS_ACTIONS,
  QUOTE_NOTIFICATIONS,
  QUOTE_STAGES,
  RESOURCES,
  SERIES_NO_3D,
  SITE_MAP,
  SPEX_COVERAGE,
  SPEX_FILE_SPEC,
  XERO_STATS,
  XERO_SYNC_STEPS,
  siteMapCounts,
} from "./data";
import {
  BarRow,
  Card,
  CompositionBar,
  FlowStep,
  SectionIntro,
  StatTile,
  StatusChip,
  STATUS_META,
} from "./components";

/* ================================================================== */
/* 1 · Overview                                                        */
/* ================================================================== */

export function OverviewSection() {
  const counts = siteMapCounts();
  const blocking = NEEDS.filter((n) => n.launchBlocking);
  return (
    <div className="space-y-8">
      <SectionIntro title="Where we are">
        <p>
          <strong className="text-gray-900">The website is functionally complete.</strong> Every
          public page, the 3D configurator, the quoting pipeline, all three logged-in portals
          (dealer, rep, TableX operations), the CRM, and the Xero connection are built and running
          on the staging address today. Nothing on this page is planned work — it all exists and
          can be clicked right now.
        </p>
        <p>
          What separates us from go-live is <strong className="text-gray-900">not code</strong>.
          It&rsquo;s a short infrastructure switch-over on our side (pointing tablex.com at the new
          site), and a set of content and business inputs on the TableX side — sign-off, a handful
          of decisions, and the real files and data listed under{" "}
          <em>What we need from TableX</em>.
        </p>
      </SectionIntro>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile value="60+" label="Pages live" sub="Public site, portals, and operations" accent />
        <StatTile value="16" label="Series pages" sub="Plus 8 collections and 7 space types" />
        <StatTile value="4" label="Login roles" sub="Admin · staff · dealer · rep" />
        <StatTile
          value={`${Math.round((counts.done / counts.total) * 100)}%`}
          label="Functional areas done"
          sub={`${counts.done} of ${counts.total} — see the Site Map tab`}
          accent
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
            To go live — our side (days, not weeks)
          </h3>
          <div className="mt-4">
            {CUTOVER_STEPS.map((s, i) => (
              <FlowStep
                key={s.step}
                n={i + 1}
                title={s.step}
                detail={s.detail}
                last={i === CUTOVER_STEPS.length - 1}
              />
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
            Launch-gating from TableX
          </h3>
          <ul className="mt-4 space-y-3">
            {blocking.map((n) => (
              <li key={n.what} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{n.what}</p>
                  <p className="text-sm text-gray-600">
                    {n.why} <span className="text-gray-400">·</span>{" "}
                    <span className="font-medium text-gray-500">{n.owner}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
            Everything else we need (photography, resource files, news content, 3D assets…) makes
            the site better but does <strong>not</strong> hold the launch — full list on the last
            tab.
          </p>
        </Card>
      </div>
    </div>
  );
}

/* ================================================================== */
/* 2 · Site map                                                        */
/* ================================================================== */

export function SiteMapSection() {
  const counts = siteMapCounts();
  return (
    <div className="space-y-8">
      <SectionIntro title="Every part of the site, and where it stands">
        <p>
          Green means built, working, and verified on staging. Amber means the functionality is
          live but part of its content or data is still to come. Gray means the feature is fully
          built and waiting only on content.
        </p>
      </SectionIntro>

      <Card>
        <CompositionBar
          total={counts.total}
          segments={[
            { label: STATUS_META.done.label, value: counts.done, color: STATUS_META.done.bar },
            {
              label: STATUS_META.partial.label,
              value: counts.partial,
              color: STATUS_META.partial.bar,
            },
            {
              label: STATUS_META.blocked.label,
              value: counts.blocked,
              color: STATUS_META.blocked.bar,
            },
          ]}
        />
      </Card>

      <div className="space-y-6">
        {SITE_MAP.map((group) => (
          <div key={group.title}>
            <div className="mb-3 flex items-baseline gap-3">
              <h3 className="text-base font-bold text-gray-900">{group.title}</h3>
              <p className="text-xs text-gray-500">{group.blurb}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {group.areas.map((area) => (
                <div
                  key={area.name}
                  className="flex flex-col rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">{area.name}</p>
                    <StatusChip status={area.status} />
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-gray-400">
                    {area.routes.join(" · ")}
                  </p>
                  {area.note && <p className="mt-2 text-xs text-gray-600">{area.note}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/* 3 · Spex 3D assets                                                  */
/* ================================================================== */

export function SpexSection() {
  const total = SPEX_COVERAGE.native + SPEX_COVERAGE.procedural + SPEX_COVERAGE.missing;
  const maxUnlock = Math.max(...MISSING_BASES.map((b) => b.unlocks));
  const askOneTotal = MISSING_BASES.reduce((s, b) => s + b.unlocks, 0);
  return (
    <div className="space-y-8">
      <SectionIntro title="Spex Studio — 3D model coverage">
        <p>
          Every table combination the configurator offers is <strong>quotable today</strong>. The
          gap is purely visual: of the {total.toLocaleString()} offered combinations, 72% render a
          real 3D preview and the rest show a placeholder until we have the geometry. Closing the
          gap needs a small, specific set of files from Neal — listed below with exactly how much
          each one unlocks.
        </p>
      </SectionIntro>

      <Card>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">
          How the {total.toLocaleString()} combinations render today
        </h3>
        <CompositionBar
          total={total}
          segments={[
            { label: "Real CAD model", value: SPEX_COVERAGE.native, color: "bg-emerald-500" },
            { label: "Drawn by code", value: SPEX_COVERAGE.procedural, color: "bg-sky-500" },
            { label: "Placeholder (no 3D yet)", value: SPEX_COVERAGE.missing, color: "bg-amber-500" },
          ]}
        />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
            Ask 1 — six base models ({askOneTotal} combos for 6 files)
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Our code can draw any rectangular, square, round, or oval top — it just needs one clean
            model of each base style to put underneath. Best value first:
          </p>
          <div className="mt-4 space-y-2.5">
            {MISSING_BASES.map((b) => (
              <BarRow
                key={b.code}
                label={b.name}
                value={b.unlocks}
                max={maxUnlock}
                suffix="combos unlock"
              />
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
              Ask 2 — the offer lists for six series
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              These series have no 3D at all yet (still quotable). Before any modeling, we need
              the <strong>data</strong>: which shapes, sizes, and bases each one actually offers.
              With the lists — and the six bases from Ask 1 — most render with zero extra modeling.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SERIES_NO_3D.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-700"
                >
                  {s}
                </span>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
              What Neal should NOT model
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Tabletops (drawn parametrically, including knife-edge), D-Shape/Boat outlines (we
              recommend handling those in code on our side — 438 combos, zero modeling hours),
              and any textures or materials — finishes are applied in code.
            </p>
          </Card>
        </div>
      </div>

      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
          File spec (matches our existing pipeline)
        </h3>
        <ul className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
          {SPEX_FILE_SPEC.map((s) => (
            <li key={s} className="flex gap-2">
              <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
              {s}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ================================================================== */
/* 4 · Resources                                                       */
/* ================================================================== */

export function ResourcesSection() {
  return (
    <div className="space-y-8">
      <SectionIntro title="The Resources section — built, and waiting for files">
        <p>
          All five resource pages are live with honest &ldquo;email us and we&rsquo;ll send
          it&rdquo; states — we deliberately publish <strong>no placeholder downloads and no
          unverifiable claims</strong>. Every real file TableX hands us goes straight onto its
          page. Today the count of published files is zero, so this section is effectively a
          request list.
        </p>
      </SectionIntro>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3">Page</th>
              <th className="px-5 py-3">What it will offer</th>
              <th className="px-5 py-3">Today</th>
              <th className="px-5 py-3">What we need</th>
            </tr>
          </thead>
          <tbody>
            {RESOURCES.map((r) => (
              <tr key={r.name} className="border-b border-gray-100 last:border-0">
                <td className="px-5 py-3.5 align-top">
                  <p className="font-semibold text-gray-900">{r.name}</p>
                  <StatusChip status="blocked" />
                </td>
                <td className="px-5 py-3.5 align-top text-gray-600">{r.offering}</td>
                <td className="px-5 py-3.5 align-top text-gray-600">{r.state}</td>
                <td className="px-5 py-3.5 align-top font-medium text-gray-800">{r.needs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <p className="text-sm text-amber-900">
          <strong>The good news:</strong> there is zero development work between receiving these
          files and publishing them. The dealer portal&rsquo;s Downloads page shares the same
          pipeline — one drop of files lights up both.
        </p>
      </Card>
    </div>
  );
}

/* ================================================================== */
/* 5 · Xero                                                            */
/* ================================================================== */

export function XeroSection() {
  return (
    <div className="space-y-8">
      <SectionIntro title="Xero — connected, read-only, already useful">
        <p>
          The site is connected to TableX&rsquo;s Xero account today.{" "}
          <strong className="text-gray-900">
            It only reads — by construction, it cannot write anything back to Xero.
          </strong>{" "}
          It mirrors contacts and open receivable balances into the CRM so the operations team
          sees who owes what next to each account, without leaving the site.
        </p>
      </SectionIntro>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          value={XERO_STATS.contactsCached.toLocaleString()}
          label="Contacts mirrored"
          sub="Refreshed on every sync"
          accent
        />
        <StatTile
          value={String(XERO_STATS.customersLinked)}
          label="Dealers linked"
          sub="Xero contact ↔ CRM organization"
        />
        <StatTile
          value={XERO_STATS.withAddress.toLocaleString()}
          label="With mailing address"
          sub="Captured for the dealer directory"
        />
        <StatTile
          value={String(XERO_STATS.openArRows)}
          label="Open A/R balances"
          sub="Visible on each org’s CRM page"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
            What the Sync button does (today, on demand)
          </h3>
          <div className="mt-4">
            {XERO_SYNC_STEPS.map((s, i) => (
              <FlowStep
                key={s.step}
                n={i + 1}
                title={s.step}
                detail={s.detail}
                last={i === XERO_SYNC_STEPS.length - 1}
              />
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
              The review queue
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Anything the sync can&rsquo;t match automatically waits in a queue where the team
              can <strong>Link</strong> it to an existing organization, <strong>Create</strong> a
              new dealer org from it, or <strong>Ignore</strong> it. Filters narrow the queue to
              contacts with open balances or to Xero-flagged customers — the fast path for
              separating real dealers from one-off vendors.
            </p>
          </Card>
          <Card>
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
              In production
            </h3>
            <ul className="mt-3 space-y-2.5 text-sm text-gray-600">
              <li className="flex gap-2">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                <span>
                  <strong className="text-gray-800">Now → books migration (~Jul 17):</strong> the
                  books are mid-migration, so today&rsquo;s data is mostly conversion artifacts. A
                  date-cutoff filter keeps that noise out of the receivables numbers.
                </span>
              </li>
              <li className="flex gap-2">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                <span>
                  <strong className="text-gray-800">After clean books:</strong> one sync + a pass
                  through the customers filter imports the real dealer roster — names, addresses,
                  phones — with no re-typing.
                </span>
              </li>
              <li className="flex gap-2">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                <span>
                  <strong className="text-gray-800">Phase two (green-lit for August):</strong>{" "}
                  deeper integration — pushing accepted quotes toward invoicing and reading payment
                  status back. Scoped separately; nothing here depends on it.
                </span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* 6 · Quotes & CRM                                                    */
/* ================================================================== */

const ACTOR_STYLE: Record<string, string> = {
  Dealer: "bg-sky-50 text-sky-700 border-sky-200",
  TableX: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Either: "bg-gray-100 text-gray-600 border-gray-200",
};

export function QuotesCrmSection() {
  return (
    <div className="space-y-8">
      <SectionIntro title="How a quote moves through TableX operations">
        <p>
          A dealer builds tables in Spex Studio, submits the cart, and from that moment the quote
          desk drives everything from <span className="font-mono text-xs">/ops/quotes</span>. Six
          stages, clear ownership at each step, email notifications on every hand-off — and no
          dollar amounts ever shown on the site itself. Pricing travels in the quote PDF and the
          desk&rsquo;s note.
        </p>
      </SectionIntro>

      <Card>
        <h3 className="mb-5 text-sm font-bold uppercase tracking-wide text-gray-500">
          The pipeline (quote numbers look like TX-2026-0042)
        </h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          {QUOTE_STAGES.map((s, i) => (
            <div key={s.key} className="relative rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-gray-400">STEP {i + 1}</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${ACTOR_STYLE[s.actor]}`}
                >
                  {s.actor}
                </span>
              </div>
              <p className="mt-1.5 text-sm font-bold text-gray-900">{s.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Revising loops back to Submitted as many times as needed; Archive is available to the
          desk at any point.
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
            What the desk can do on a quote
          </h3>
          <ul className="mt-4 space-y-4">
            {OPS_ACTIONS.map((a) => (
              <li key={a.name}>
                <p className="text-sm font-semibold text-gray-900">{a.name}</p>
                <p className="mt-0.5 text-sm text-gray-600">{a.detail}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
            Who gets emailed, when
          </h3>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {QUOTE_NOTIFICATIONS.map((n) => (
                <tr key={n.event} className="border-b border-gray-100 last:border-0">
                  <td className="py-2.5 pr-3 font-medium text-gray-800">{n.event}</td>
                  <td className="py-2.5 text-gray-600">{n.who}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-gray-500">
            Reps see their assigned dealers&rsquo; quotes read-only — including the final PDF —
            but never act on them.
          </p>
        </Card>
      </div>

      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
          The CRM underneath it
        </h3>
        <ul className="mt-4 grid gap-3 lg:grid-cols-2">
          {CRM_POINTS.map((p) => (
            <li key={p} className="flex gap-2 text-sm text-gray-600">
              <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
              {p}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ================================================================== */
/* 7 · What we need from TableX                                        */
/* ================================================================== */

export function NeedsSection() {
  const blocking = NEEDS.filter((n) => n.launchBlocking);
  const rest = NEEDS.filter((n) => !n.launchBlocking);

  const NeedRow = ({ n }: { n: (typeof NEEDS)[number] }) => (
    <div className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-gray-900">{n.what}</p>
        <span className="shrink-0 rounded-full bg-brand-navy px-2.5 py-0.5 text-[11px] font-semibold text-white">
          {n.owner}
        </span>
      </div>
      <p className="text-sm text-gray-600">{n.why}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <SectionIntro title="Everything we&rsquo;re waiting on, in one place">
        <p>
          Split by urgency: the first group gates the launch itself; the second makes the site
          better and can land any time — each item goes live as soon as we receive it, with no
          development in between.
        </p>
      </SectionIntro>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          Gates the launch ({blocking.length})
        </h3>
        <div className="grid gap-3 lg:grid-cols-2">
          {blocking.map((n) => (
            <NeedRow key={n.what} n={n} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Lands whenever ready ({rest.length})
        </h3>
        <div className="grid gap-3 lg:grid-cols-2">
          {rest.map((n) => (
            <NeedRow key={n.what} n={n} />
          ))}
        </div>
      </div>
    </div>
  );
}
