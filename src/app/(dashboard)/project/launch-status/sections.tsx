"use client";

/**
 * Launch Status — the six tab sections. Pure presentation over ./data.
 */

import {
  COMMS,
  DNS_RECORDS,
  DNS_RULES,
  GO_LIVE,
  OPEN_ITEMS,
  PHASES,
  ROLLBACK,
  ROLLBACK_NOTES,
  RUNBOOK,
  SHIPPED,
  TEAM,
} from "./data";
import {
  Card,
  CardHeading,
  FlowStep,
  OwnerChip,
  SectionIntro,
  StatTile,
  StatusChip,
  Warning,
} from "./components";

const TONE: Record<string, { ring: string; badge: string; label: string }> = {
  past: { ring: "border-emerald-200 bg-emerald-50/60", badge: "bg-emerald-500 text-white", label: "Done" },
  now: { ring: "border-brand-green bg-white shadow-sm ring-2 ring-brand-green/20", badge: "bg-brand-green text-white", label: "Now" },
  next: { ring: "border-gray-200 bg-white", badge: "bg-gray-200 text-gray-700", label: "Next" },
  day: { ring: "border-brand-navy bg-brand-navy text-white", badge: "bg-white text-brand-navy", label: "Go-live" },
  after: { ring: "border-gray-200 bg-gray-50", badge: "bg-gray-200 text-gray-700", label: "After" },
};

/* ================================================================== */
/* 1 · Overview                                                        */
/* ================================================================== */

export function OverviewSection() {
  const allSteps = RUNBOOK.flatMap((g) => g.steps);
  const mondaySteps = RUNBOOK.filter((g) => g.title.startsWith("Sunday —")).flatMap((g) => g.steps);
  const gates = OPEN_ITEMS.filter((i) => i.gate);
  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="overflow-hidden rounded-2xl bg-brand-navy text-white">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-end md:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">tablex.com go-live</p>
            <h2 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">{GO_LIVE.date}</h2>
            <p className="mt-2 max-w-xl text-sm text-white/80">{GO_LIVE.window}</p>
          </div>
          <div className="text-sm text-white/70 md:text-right">
            <p>Decided: {GO_LIVE.decidedBy}</p>
            <p className="mt-1">Plan updated {GO_LIVE.updated}</p>
          </div>
        </div>
      </div>

      {/* Phase strip */}
      <div className="grid gap-3 md:grid-cols-5">
        {PHASES.map((p) => {
          const t = TONE[p.tone];
          const dark = p.tone === "day";
          return (
            <div key={p.key} className={`flex flex-col rounded-xl border p-4 ${t.ring}`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${t.badge}`}>
                  {t.label}
                </span>
                <span className={`text-[11px] font-medium ${dark ? "text-white/70" : "text-gray-500"}`}>{p.when}</span>
              </div>
              <p className={`mt-3 text-sm font-bold ${dark ? "text-white" : "text-gray-900"}`}>{p.title}</p>
              <p className={`mt-1 text-xs leading-relaxed ${dark ? "text-white/80" : "text-gray-600"}`}>{p.summary}</p>
            </div>
          );
        })}
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile value="LIVE" label="Since Sun 9/20" sub="20:05 ET · a day early" accent />
        <StatTile value="2" label="DNS records change" sub="Apex A + www CNAME. Email untouched." />
        <StatTile value={`${mondaySteps.length}`} label="Cutover steps" sub="Ran 19:53–20:05 ET, one person" />
        <StatTile value={`${gates.length}`} label="Go / no-go gates" sub={`${allSteps.length} tracked steps in total`} accent />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeading>The switch in five moves</CardHeading>
          <div className="mt-4">
            {[
              { t: "Point the domain at the new site", d: "Two Cloudflare records. Email stays exactly where it is." },
              { t: "Certificates issue", d: "Vercel secures tablex.com and www — a few minutes." },
              { t: "Move the logins + Xero to tablex.com", d: "One Supabase setting, one Xero callback." },
              { t: "Flip the launch flag, redeploy", d: "Opens the site to search engines. Feedback widget comes back." },
              { t: "Verify, then tell the team", d: "Routes, redirects, fonts, forms, auth, email. Green light ~8:00 AM." },
            ].map((s, i, arr) => (
              <FlowStep key={s.t} n={i + 1} title={s.t} detail={s.d} last={i === arr.length - 1} />
            ))}
          </div>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeading>Go / no-go gates (cleared)</CardHeading>
            <ul className="mt-4 space-y-3">
              {gates.map((g) => (
                <li key={g.what} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{g.what}</p>
                    <p className="text-xs text-gray-500">{g.why}</p>
                  </div>
                  <OwnerChip owner={g.owner} />
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
              Both gates cleared before the switch. Kept here as the record.
            </p>
          </Card>
          <Card>
            <CardHeading>If something goes wrong</CardHeading>
            <p className="mt-3 text-sm text-gray-600">
              Three rollback levels, fastest first. Level 1 puts the previous build back in under two minutes without
              touching the domain. Only a failed DNS cutover reaches Level 3. Details on the Rollback tab.
            </p>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeading>Already shipped for launch</CardHeading>
        <ul className="mt-4 grid gap-x-8 gap-y-2 md:grid-cols-2">
          {SHIPPED.map((s) => (
            <li key={s} className="flex gap-2.5 text-sm text-gray-700">
              <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ================================================================== */
/* 2 · Cutover runbook                                                 */
/* ================================================================== */

export function RunbookSection() {
  return (
    <div className="space-y-8">
      <SectionIntro title="The runbook, in order">
        <p>
          Five groups: two before Monday, two on Monday morning, one for the week after. Each step names its owner.
          Times are approximate and assume a 6:00 AM ET start.
        </p>
      </SectionIntro>

      {RUNBOOK.map((g) => (
        <Card key={g.title} className="p-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 px-5 py-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">{g.title}</h3>
              <p className="mt-0.5 text-sm text-gray-500">{g.blurb}</p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">{g.when}</span>
          </div>
          <ol className="divide-y divide-gray-100">
            {g.steps.map((s) => (
              <li key={s.title} className="flex gap-4 px-5 py-3.5">
                <span className="w-12 shrink-0 pt-0.5 text-right text-xs font-bold tabular-nums text-gray-400">
                  {s.time ?? ""}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                    <OwnerChip owner={s.owner} />
                    <StatusChip status={s.status} />
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{s.detail}</p>
                  {s.tracker && (
                    <p className="mt-1 font-mono text-[11px] text-gray-400">{s.tracker}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Card>
      ))}
    </div>
  );
}

/* ================================================================== */
/* 3 · Cloudflare DNS                                                  */
/* ================================================================== */

export function DnsSection() {
  return (
    <div className="space-y-8">
      <SectionIntro title="Cloudflare domain switchover">
        <p>
          tablex.com is managed at Cloudflare and pointed at the old WordPress host. The cutover changed two
          records so the domain serves the new site from Vercel. Everything else in the zone stayed as exported.
        </p>
      </SectionIntro>

      <Warning title="Email is not part of this cutover.">
        tablex.com mail runs on Microsoft 365. The MX, SPF, DMARC and autodiscover records are not touched, and neither
        are the Resend records that send the site&rsquo;s own email. The zone is exported on Friday so any mistake can be
        restored in minutes.
      </Warning>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3">Record</th>
              <th className="px-5 py-3">Before</th>
              <th className="px-5 py-3">After cutover</th>
              <th className="px-5 py-3">Changes?</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {DNS_RECORDS.map((r) => (
              <tr key={`${r.host}-${r.type}`} className={r.touch ? "bg-amber-50/40" : ""}>
                <td className="px-5 py-3">
                  <p className="font-semibold text-gray-900">{r.host}</p>
                  <p className="text-xs text-gray-500">{r.type}</p>
                </td>
                <td className="px-5 py-3 text-gray-700">{r.today}</td>
                <td className="px-5 py-3 text-gray-700">
                  {r.monday}
                  {r.note && <p className="text-xs text-gray-500">{r.note}</p>}
                </td>
                <td className="px-5 py-3">
                  {r.touch ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gray-400" /> No
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeading>Ground rules</CardHeading>
          <ul className="mt-4 space-y-3">
            {DNS_RULES.map((r) => (
              <li key={r} className="flex gap-2.5 text-sm text-gray-700">
                <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-navy" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeading>What visitors experience</CardHeading>
          <div className="mt-4 space-y-3 text-sm text-gray-700">
            <p>
              With the TTL lowered on Friday, most visitors see the new site within five minutes of the change. A few
              corporate resolvers may hold the old address a little longer, so a short mixed window is normal, not a
              problem.
            </p>
            <p>
              Old bookmarks and search results keep working: 203 legacy URLs are mapped to their new pages and redirect
              permanently.
            </p>
            <p>
              The staging address (tablex-site.vercel.app) keeps serving the same site, so nothing anyone has open
              breaks mid-morning.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ================================================================== */
/* 4 · Rollback                                                        */
/* ================================================================== */

export function RollbackSection() {
  return (
    <div className="space-y-8">
      <SectionIntro title="Rollback — three levels, fastest first">
        <p>
          Every level is written down so it can be run under pressure by someone who is not Danny. Pick the level that
          matches the problem; do not skip ahead to DNS unless DNS is the problem.
        </p>
      </SectionIntro>

      <div className="grid gap-4 lg:grid-cols-3">
        {ROLLBACK.map((l) => (
          <Card key={l.level} className={l.touchesDns ? "border-rose-200" : ""}>
            <div className="flex items-center justify-between">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white ${
                  l.touchesDns ? "bg-rose-600" : "bg-brand-navy"
                }`}
              >
                {l.level}
              </span>
              <span className="text-xs font-semibold text-gray-500">{l.time}</span>
            </div>
            <h3 className="mt-3 text-base font-bold text-gray-900">{l.name}</h3>
            <p className="mt-2 text-xs font-bold uppercase tracking-wide text-gray-400">When</p>
            <p className="mt-0.5 text-sm text-gray-700">{l.when}</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-gray-400">How</p>
            <p className="mt-0.5 text-sm text-gray-700">{l.how}</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-gray-400">Decides</p>
            <p className="mt-0.5 text-sm text-gray-700">{l.decides}</p>
            <p className={`mt-4 text-xs font-semibold ${l.touchesDns ? "text-rose-700" : "text-emerald-700"}`}>
              {l.touchesDns ? "Touches DNS (web records only)" : "No DNS change"}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeading>Good to know</CardHeading>
        <ul className="mt-4 space-y-3">
          {ROLLBACK_NOTES.map((n) => (
            <li key={n} className="flex gap-2.5 text-sm text-gray-700">
              <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-navy" />
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ================================================================== */
/* 5 · Team                                                            */
/* ================================================================== */

export function TeamSection() {
  return (
    <div className="space-y-8">
      <SectionIntro title="Who does what">
        <p>
          One person ran the switch. Everyone else had a short list before Sunday and a short list on Sunday. The
          desk was the first place a real problem would show up, so Sam and Patty were the eyes that morning.
        </p>
      </SectionIntro>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TEAM.map((t) => (
          <Card key={t.who}>
            <h3 className="text-base font-bold text-gray-900">{t.who}</h3>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-green">{t.role}</p>
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-gray-400">Before the switch</p>
            <ul className="mt-1.5 space-y-1.5">
              {t.beforehand.map((b) => (
                <li key={b} className="flex gap-2 text-sm text-gray-700">
                  <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-gray-400">Cutover + week one</p>
            <ul className="mt-1.5 space-y-1.5">
              {t.monday.map((m) => (
                <li key={m} className="flex gap-2 text-sm text-gray-700">
                  <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-navy" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card className="p-0">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-bold text-gray-900">Communication plan</h3>
          <p className="mt-0.5 text-sm text-gray-500">Few messages, clear senders, one channel for problems.</p>
        </div>
        <ul className="divide-y divide-gray-100">
          {COMMS.map((c) => (
            <li key={c.when + c.what} className="grid gap-1 px-5 py-3.5 md:grid-cols-[180px_1fr_260px] md:items-center">
              <span className="text-sm font-semibold text-gray-900">{c.when}</span>
              <span className="text-sm text-gray-700">{c.what}</span>
              <span className="text-xs text-gray-500 md:text-right">{c.who}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ================================================================== */
/* 6 · Open items                                                      */
/* ================================================================== */

export function OpenItemsSection() {
  const gates = OPEN_ITEMS.filter((i) => i.gate);
  const rest = OPEN_ITEMS.filter((i) => !i.gate);
  const Row = ({ i }: { i: (typeof OPEN_ITEMS)[number] }) => (
    <li className="grid gap-2 px-5 py-3.5 md:grid-cols-[1fr_140px_110px_90px] md:items-center">
      <div>
        <p className="text-sm font-semibold text-gray-900">{i.what}</p>
        <p className="text-xs text-gray-500">{i.why}</p>
      </div>
      <span className="text-xs font-medium text-gray-700">{i.owner}</span>
      <span className="text-xs text-gray-500">{i.due}</span>
      <StatusChip status={i.status} />
    </li>
  );
  return (
    <div className="space-y-8">
      <SectionIntro title="Everything still open">
        <p>
          The two gates decided whether to proceed; both cleared 9/20. The rest are real but do not move the date; each has an owner
          and a due window.
        </p>
      </SectionIntro>

      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-bold text-gray-900">Go / no-go gates</h3>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {gates.length} items · cleared 9/20
          </span>
        </div>
        <ul className="divide-y divide-gray-100">
          {gates.map((i) => (
            <Row key={i.what} i={i} />
          ))}
        </ul>
      </Card>

      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-bold text-gray-900">Not blocking, still owed</h3>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            {rest.length} items
          </span>
        </div>
        <ul className="divide-y divide-gray-100">
          {rest.map((i) => (
            <Row key={i.what} i={i} />
          ))}
        </ul>
      </Card>
    </div>
  );
}
