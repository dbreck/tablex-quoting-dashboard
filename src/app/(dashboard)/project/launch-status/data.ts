/**
 * Launch Status — tablex.com go-live plan for Monday 2026-09-21.
 *
 * Rewritten 2026-09-18 for the team meeting. Source of truth for the mechanics is
 * tablex-site/docs/launch-checklist.md + docs/launch-rollback.md; tracker ids are
 * the Sprint 8 `web-cutover-*` rows. When something changes, edit HERE — the page
 * components only render.
 *
 * Flipped to the as-run record 2026-09-21 after the 9/20 cutover.
 */

export type ItemStatus = "done" | "ready" | "open" | "blocked";

export const GO_LIVE = {
  date: "LIVE — cut over Sunday, September 20, 2026, 19:53–20:05 ET",
  window: "Ran a day early on Danny's call; announcement Mon 9/21 ~16:20 ET (330 dealers/reps + 110 past requesters)",
  decidedBy: "Brian 9/08 · Mark + Jim concurred · Danny confirmed 9/09",
  updated: "September 21, 2026",
};

/* ------------------------------------------------------------------ */
/* Countdown phases (Overview)                                          */
/* ------------------------------------------------------------------ */

export interface Phase {
  key: string;
  when: string;
  title: string;
  summary: string;
  tone: "past" | "now" | "next" | "day" | "after";
}

export const PHASES: Phase[] = [
  {
    key: "built",
    when: "Through Wed 9/17",
    title: "Build complete",
    summary: "Site, portals, quoting, CRM, SpeX, analytics, branded email — all shipped to the staging address.",
    tone: "past",
  },
  {
    key: "prep",
    when: "Thu 9/18 – Fri 9/19",
    title: "Infra prep + sign-off",
    summary: "Fonts allowlist, Vercel domains, DNS snapshot, TTLs lowered, Brian's final walkthrough.",
    tone: "past",
  },
  {
    key: "freeze",
    when: "Sat 9/19 – Sun 9/20",
    title: "Code freeze",
    summary: "No new features deploy. Fixes only. Final hand-QA. Go / no-go call by Sunday evening.",
    tone: "past",
  },
  {
    key: "cutover",
    when: "Sun 9/20 · 19:53–20:05 ET",
    title: "Cutover",
    summary: "Cloudflare DNS → Vercel, certs, auth + Xero origins, launch flag, redeploy, verification sweep.",
    tone: "past",
  },
  {
    key: "watch",
    when: "Mon 9/21 – Fri 9/25",
    title: "Week-one watch",
    summary: "404s, Search Console, first real quotes through the desk, dealer announcement, fast fixes.",
    tone: "now",
  },
];

/* ------------------------------------------------------------------ */
/* Runbook (Cutover tab)                                                */
/* ------------------------------------------------------------------ */

export interface RunbookStep {
  title: string;
  detail: string;
  owner: string;
  status: ItemStatus;
  time?: string;
  tracker?: string;
}

export interface RunbookGroup {
  title: string;
  when: string;
  blurb: string;
  steps: RunbookStep[];
}

export const RUNBOOK: RunbookGroup[] = [
  {
    title: "Before Monday — infra prep",
    when: "Thu 9/18 → Fri 9/19",
    blurb: "Everything here can happen days ahead and none of it changes what visitors see today.",
    steps: [
      {
        title: "Adobe Fonts: allow tablex.com + www on kit juc1jwq, republish",
        detail: "Typekit kits are domain-scoped. Without this, Acumin silently falls back to a system font the moment DNS moves.",
        owner: "Danny",
        status: "done",
        tracker: "web-cutover-fonts",
      },
      {
        title: "Vercel: add tablex.com + www.tablex.com to the tablex-site project",
        detail: "Recommend apex (tablex.com) as canonical with www redirecting to it — matches how www already points at the apex today. Vercel will show both hosts as pending until DNS flips.",
        owner: "Danny",
        status: "done",
        tracker: "web-cutover-vercel-domains",
      },
      {
        title: "Cloudflare: export the tablex.com DNS zone",
        detail: "The snapshot is what a rollback restores to. Saved outside the zone (repo + vault).",
        owner: "Danny",
        status: "done",
      },
      {
        title: "Cloudflare: lower TTL on apex A + www CNAME to 5 minutes",
        detail: "Done a day ahead so resolvers pick up Monday's change quickly — and so a rollback is quick too.",
        owner: "Danny",
        status: "done",
      },
      {
        title: "Supabase: confirm plan tier + backups on the site database",
        detail: "There is no point-in-time recovery today. Decide whether to upgrade before launch; at minimum confirm the nightly backup exists.",
        owner: "Danny",
        status: "done",
      },
      {
        title: "Legacy WordPress: keep Flywheel running 30 days after launch",
        detail: "Old host still answers; zone export in ~/Documents/Clear ph/Clients/TableX/Claude/dns/ is the rollback.",
        owner: "Danny + Brian",
        status: "done",
        tracker: "web-legacy-wp-afterlife",
      },
      {
        title: "Revert demo-mode auth + rotate QA passwords",
        detail: "Training fixtures (danny+dealer / danny+rep / Heartland test dealer) stay for staff practice; demo passwords get rotated.",
        owner: "Danny",
        status: "done",
        tracker: "web-demo-auth-revert",
      },
      {
        title: "Staff accounts: Jim, Caleb, Richie",
        detail: "Patty + Sam created 9/17, Caleb 9/18 (passwords shared out-of-band); Brian + Mark are admins. Jim + Richie still open.",
        owner: "Danny",
        status: "open",
        tracker: "web-user-roster",
      },
      {
        title: "Feedback widget back on",
        detail: "Hidden on prod right now so the staff training videos record clean. Re-enable in the launch deploy.",
        owner: "Danny",
        status: "done",
      },
    ],
  },
  {
    title: "Before Monday — content + approvals",
    when: "Due Sun 9/20",
    blurb: "The go / no-go gate. If these are not green Sunday night, we hold.",
    steps: [
      {
        title: "Brian's final full-site walkthrough + sign-off",
        detail: "Plan approved 9/18; Brian sent the announcement himself 9/21",
        owner: "Brian",
        status: "done",
        tracker: "web-brian-final-signoff",
      },
      {
        title: "Final hand-QA: keyboard, reduced motion, iPad, Safari, mobile drawer",
        detail: "Motion QA suites 9/19–9/20 against prod + Danny's device checks",
        owner: "Kayla",
        status: "done",
        tracker: "web-launch-hand-qa",
      },
      {
        title: "Go / no-go call",
        detail: "Brian + Danny, Sunday evening. Criteria: sign-off in, infra prep all green, rollback snapshot saved.",
        owner: "Brian + Danny",
        status: "done",
      },
    ],
  },
  {
    title: "Sunday — the switch (done 9/20, 19:53–20:05 ET)",
    when: "Sun 9/20 evening",
    blurb: "Ran in about an hour. Nothing here touched email.",
    steps: [
      {
        time: "6:00",
        title: "Cloudflare DNS: point the web records at Vercel",
        detail: "Apex A → Vercel's address, www CNAME → cname.vercel-dns.com, DNS-only (grey cloud). MX, SPF, DMARC, autodiscover and the Resend records are NOT touched.",
        owner: "Danny",
        status: "done",
        tracker: "web-cutover-dns-0921",
      },
      {
        time: "6:05",
        title: "Wait for Vercel to issue certificates",
        detail: "Both hostnames read Valid in the Vercel domains panel. Usually minutes with the TTL lowered on Friday.",
        owner: "Danny",
        status: "done",
      },
      {
        time: "6:20",
        title: "Supabase Auth: site_url → https://tablex.com",
        detail: "One setting. Every login, reset, invite and signup email builds its link from it (templates were rebuilt for this on 9/16). Takes effect after a 3–5 minute lag.",
        owner: "Danny",
        status: "done",
        tracker: "web-cutover-auth-origins",
      },
      {
        time: "6:25",
        title: "Xero: nothing to do on cutover day",
        detail: "Since 9/20 the OAuth callback is derived from the request host, so tablex.com works the moment DNS lands — no env var, no redeploy. Both tablex.com callbacks are already registered on the Xero app 'TableX CRM Sync' (done 9/20) alongside the vercel.app and localhost entries. The read-only sync never touches the redirect URI.",
        owner: "Danny",
        status: "done",
        tracker: "web-cutover-xero-redirect",
      },
      {
        time: "6:30",
        title: "Flip the launch flag and redeploy",
        detail: "NEXT_PUBLIC_SITE_LAUNCHED=true is baked in at build time, so the redeploy is what actually opens the site to search engines. Same deploy re-enables the feedback widget.",
        owner: "Danny",
        status: "done",
        tracker: "web-cutover-robots-flip",
      },
    ],
  },
  {
    title: "Verification sweep (started Sun 9/20 20:02 ET)",
    when: "Sun 9/20 → Mon 9/21 AM",
    blurb: "Prove it before anyone is told. Any red here decides the rollback level (see Rollback).",
    steps: [
      { time: "7:00", title: "Every route answers 200 on tablex.com", detail: "Scripted sweep of the public routes plus a hand check of home, a series page, SpeX, /quote/cart, /login.", owner: "Danny", status: "done" },
      { time: "7:05", title: "robots.txt allows + sitemap.xml lists the site", detail: "And no page carries noindex.", owner: "Danny", status: "done" },
      { time: "7:10", title: "Legacy URLs redirect", detail: "Sample of the 203 mapped old-site URLs land on the right new pages.", owner: "Danny", status: "done" },
      { time: "7:15", title: "Fonts render as Acumin", detail: "Proves the Adobe allowlist took.", owner: "Danny", status: "done" },
      { time: "7:20", title: "Forms deliver", detail: "Resend reports Delivered but INKY PhishFence quarantines own-domain-from-external mail; vendor allow rule for send.tablex.com requested via Brian 9/21.", owner: "Danny", status: "blocked" },
      { time: "7:25", title: "Auth round trip on tablex.com", detail: "Password reset email link lands on tablex.com; throwaway customer signup → confirm → My quotes → order request without PO. Delete the throwaway.", owner: "Danny", status: "done" },
      { time: "7:35", title: "Email still works", detail: "Send + receive on a tablex.com mailbox. Confirms DNS hygiene on the M365 records.", owner: "Danny + Sam", status: "done" },
      { time: "7:40", title: "OG preview + a quote PDF", detail: "Paste tablex.com into a link preview; open one quote PDF and check the wordmark + pricing.", owner: "Danny + Mark", status: "done" },
      { time: "8:00", title: "Green light to the team", detail: "Staff sign-in email 9/18; announcement 9/21", owner: "Danny", status: "done" },
    ],
  },
  {
    title: "Week one (Mon 9/21 → Fri 9/25)",
    when: "Mon 9/21 → Fri 9/25",
    blurb: "Small, fast fixes. No feature work until the watch week closes.",
    steps: [
      { title: "Google Search Console: verify tablex.com, submit the sitemap", detail: "The property may already exist from the old site.", owner: "Danny", status: "done" },
      { title: "Desk watch: first real quote requests and self-quotes", detail: "Sam + Patty work them in /ops; Danny on call for anything that looks wrong.", owner: "Sam + Patty", status: "open" },
      { title: "404 report from Vercel logs", detail: "Catch any legacy URL the redirect map missed; add redirects same day.", owner: "Danny", status: "open" },
      { title: "Dealer + rep announcement", detail: "Sent Mon 9/21 ~16:20 ET via Resend broadcasts (UTM-tagged)", owner: "Brian", status: "done" },
      { title: "Search Console coverage check", detail: "Old URLs dropping out, new URLs indexing.", owner: "Danny", status: "open" },
      { title: "Legacy Gravity Forms export", detail: "Warranty, freight, spiff and quote-request entries + 1.7 GB of uploads out of WordPress before it is shut down (due 10/21).", owner: "Danny", status: "open", tracker: "web-legacy-forms-export" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Cloudflare / DNS (DNS tab)                                           */
/* ------------------------------------------------------------------ */

export interface DnsRecord {
  host: string;
  type: string;
  today: string;
  monday: string;
  touch: boolean;
  note?: string;
}

/** Live-checked 2026-09-18 AM (dig). Nameservers are Cloudflare's. */
export const DNS_RECORDS: DnsRecord[] = [
  { host: "tablex.com", type: "A", today: "141.193.213.10 / .11 (old WordPress host)", monday: "CNAME → 0b46d1ecc1fe774e.vercel-dns-017.com (done 9/20 19:53)", touch: true, note: "DNS-only / grey cloud" },
  { host: "www", type: "CNAME", today: "tablex.com", monday: "CNAME → 0b46d1ecc1fe774e.vercel-dns-017.com (done 9/20)", touch: true, note: "DNS-only / grey cloud" },
  { host: "tablex.com", type: "MX", today: "tablex-com.mail.protection.outlook.com", monday: "unchanged", touch: false, note: "Microsoft 365 email" },
  { host: "autodiscover", type: "CNAME", today: "Microsoft 365", monday: "unchanged", touch: false },
  { host: "tablex.com", type: "TXT (SPF)", today: "Microsoft 365 + Resend", monday: "include:amazonses.com added 9/21", touch: true },
  { host: "_dmarc", type: "TXT", today: "did not exist", monday: "ADDED 9/21 10:50 ET — p=none, rua → Cloudflare DMARC Management", touch: true },
  { host: "Resend records", type: "TXT / CNAME", today: "forms@tablex.com sending", monday: "unchanged", touch: false, note: "Site + auth email sender" },
];

export const DNS_RULES = [
  "Two records were changed on 9/20; SPF + DMARC were touched 9/21 for mail deliverability. Everything else is as exported.",
  "Email is on Microsoft 365 and is not part of this cutover. If email breaks Monday, something was touched that should not have been — restore from the export.",
  "DNS-only (grey cloud) for the two web records. Vercel terminates TLS and serves the site; Cloudflare's proxy adds nothing here and can interfere with certificate issuance.",
  "TTLs were lowered to 5 minutes beforehand so the change propagated quickly and a rollback would be just as quick.",
  "The old WordPress host stays running for 30 days after 9/20. That is what makes a DNS rollback meaningful.",
];

/* ------------------------------------------------------------------ */
/* Rollback (Rollback tab)                                              */
/* ------------------------------------------------------------------ */

export interface RollbackLevel {
  level: number;
  name: string;
  when: string;
  how: string;
  time: string;
  decides: string;
  touchesDns: boolean;
}

export const ROLLBACK: RollbackLevel[] = [
  {
    level: 1,
    name: "App rollback",
    when: "The site is broken but the domain is fine — errors, a bad deploy, auth misbehaving after a code change.",
    how: "Vercel instant rollback to the previous production build. Fix forward on a branch, redeploy. Rollback target as of 9/21: promote `ci4bvhtbc` (7 days prod retention).",
    time: "Under 2 minutes",
    decides: "Danny",
    touchesDns: false,
  },
  {
    level: 2,
    name: "Launch-flag rollback",
    when: "The launch flag itself caused the problem — indexing too early, a launch-gated feature misbehaving.",
    how: "Set the flag back to false and redeploy. Site keeps serving on tablex.com, hidden from search engines again.",
    time: "One build (~5 minutes)",
    decides: "Danny",
    touchesDns: false,
  },
  {
    level: 3,
    name: "DNS rollback",
    when: "tablex.com will not resolve, certificates will not issue, or the cutover itself is the problem.",
    how: "Re-create the apex A records from the 9/20 zone export (old host still answers). Revert Supabase site_url and the Xero callback. Old WordPress serves again.",
    time: "5–15 minutes to propagate",
    decides: "Danny, Brian informed immediately",
    touchesDns: true,
  },
];

export const ROLLBACK_NOTES = [
  "Try Level 1 first. It covers most 'the site is broken' cases and touches nothing customers depend on.",
  "Data is the one thing a rollback does not undo. Quotes, orgs and contacts live in Supabase; there is no point-in-time recovery today, so backups are confirmed before Monday.",
  "The full runbook is written so someone other than Danny could run it: tablex-site/docs/launch-rollback.md.",
];

/* ------------------------------------------------------------------ */
/* Team (Team tab)                                                      */
/* ------------------------------------------------------------------ */

export interface Role {
  who: string;
  role: string;
  monday: string[];
  beforehand: string[];
}

export const TEAM: Role[] = [
  {
    who: "Danny",
    role: "Runs the cutover",
    beforehand: ["Infra prep list (fonts, Vercel domains, zone export, TTLs, backups)", "Staff accounts + demo-auth revert", "Sunday go / no-go with Brian"],
    monday: ["DNS switch, certs, auth + Xero origins, launch deploy", "Verification sweep", "Rollback decision (Levels 1–2 alone; Level 3 with Brian informed)", "8:00 AM green light message"],
  },
  {
    who: "Brian",
    role: "Owns the go decision",
    beforehand: ["Final full-site walkthrough + sign-off (due Sunday)", "Open copy rulings + Southern NJ rep call"],
    monday: ["Available 7:00–9:00 AM for the green light or a hold", "Dealer + rep announcement (recommend Tuesday)", "Field any customer-facing questions"],
  },
  {
    who: "Mark",
    role: "Pricing + product truth",
    beforehand: ["Confirm the Sept price book questions still open (accessories, freight, Ultra D-shape, Artisan sizes)", "Review the Artisan shelf on SpeX"],
    monday: ["Spot-check one SpeX price and one quote PDF on tablex.com", "Watch Xero — internal go-live has been running since 9/14"],
  },
  {
    who: "Sam + Patty",
    role: "The quote desk",
    beforehand: ["Log in to /ops with the new accounts", "Watch the staff training videos (Help → Training videos in /ops, live 9/18)"],
    monday: ["Work the first real quote requests and self-quotes as they arrive", "Confirm a tablex.com email sends and receives at 7:35", "Flag anything odd to Danny immediately"],
  },
  {
    who: "Kayla",
    role: "Design QA",
    beforehand: ["Final hand-QA on the frozen build: keyboard, reduced motion, iPad, Safari, mobile drawer"],
    monday: ["Visual pass on tablex.com once live"],
  },
  {
    who: "Caleb · Jim · Richie",
    role: "Accounts + photography",
    beforehand: ["Accounts created before Monday", "Caleb: remaining photography gaps are post-launch swaps"],
    monday: ["Nothing required"],
  },
];

export const COMMS = [
  { when: "Sunday evening", what: "Go / no-go", who: "Brian + Danny, by phone or text" },
  { when: "Monday ~8:00 AM", what: "“We’re live” — verified, plus what to watch for", who: "Danny → Brian, Mark, Sam, Patty, Richie" },
  { when: "Monday, all day", what: "Issue reports → Danny, one channel", who: "Everyone" },
  { when: "Monday 9/21, 16:20 ET (done)", what: "Dealer + rep announcement sent by Brian via Resend; past-requesters broadcast too", who: "Brian" },
  { when: "Friday 9/25", what: "Week-one wrap: 404s, Search Console, first quotes, fix list", who: "Danny → team" },
];

/* ------------------------------------------------------------------ */
/* Open items (Open Items tab)                                          */
/* ------------------------------------------------------------------ */

export interface OpenItem {
  what: string;
  why: string;
  owner: string;
  due: string;
  gate: boolean;
  status: ItemStatus;
}

export const OPEN_ITEMS: OpenItem[] = [
  { what: "Brian's final walkthrough + sign-off", why: "The go / no-go gate", owner: "Brian", due: "Sun 9/20", gate: true, status: "done" },
  { what: "Infra prep list green (fonts, Vercel domains, zone export, TTLs, backups)", why: "Monday's hour depends on it", owner: "Danny", due: "Fri 9/19", gate: true, status: "done" },
  { what: "Staff accounts for Jim + Richie (Caleb done 9/18)", why: "Everyone who needs the desk or portal has a login", owner: "Danny", due: "Fri 9/19", gate: false, status: "open" },
  { what: "Feedback widget back on", why: "Off while training videos record; returns in the launch deploy", owner: "Danny", due: "Mon 9/21", gate: false, status: "done" },
  { what: "Demo-auth revert + QA password rotation", why: "Training fixtures stay, demo passwords go", owner: "Danny", due: "Fri 9/19", gate: false, status: "done" },
  { what: "Cloudflare Turnstile keys in Vercel", why: "Spam protection on contact, quote and signup forms; forms work without it", owner: "Danny", due: "Week one", gate: false, status: "done" },
  { what: "sales@tablex.com mailbox → desk notifications", why: "Wired as the public contact address 9/20; delivery blocked by INKY until the vendor adds the send.tablex.com allow rule", owner: "TableX IT", due: "Whenever ready", gate: false, status: "blocked" },
  { what: "Dekko power-tile renders: redistribution rights", why: "Four OEM renders on /products/accessories; asked 8/06, unanswered. Fallback: pull the four images before Monday.", owner: "Danny → Byrne (Conor Regin)", due: "Fri 9/19", gate: false, status: "blocked" },
  { what: "Southern New Jersey rep: CFM / Chris Ivan", why: "CFM / Chris Ivan per Brian's September listing, 9/21", owner: "Brian", due: "Week one", gate: false, status: "done" },
  { what: "Legacy WordPress afterlife + Gravity Forms export", why: "Keep Flywheel 30 days for rollback; export claims/quote entries + 1.7 GB uploads by 10/21", owner: "Danny + Brian", due: "10/21", gate: false, status: "open" },
  { what: "Sept price book confirmations", why: "Does the increase hit accessories, options, freight; Ultra D-shaped rows; Artisan 42×60 / 42×84; App -B / -S", owner: "Brian + Mark", due: "Week one", gate: false, status: "open" },
  { what: "Drop Supabase auth rate limits back to defaults", why: "Raised for the launch announcement", owner: "Danny", due: "After the announcement", gate: false, status: "open" },
  { what: "GA4: star the six funnel key events", why: "Key event starring in the GA4 UI", owner: "Danny", due: "Week one", gate: false, status: "open" },
  { what: "Staging environment staging.tablex.com", why: "Second Supabase project + staging branch + deployment environment", owner: "Danny", due: "9/26", gate: false, status: "open" },
  { what: "Xero review backlog (~1,482 pending contacts)", why: "Ongoing desk work to assign and review new Xero imports", owner: "Sam + Patty", due: "Ongoing", gate: false, status: "open" },
  { what: "INKY allow rule for send.tablex.com", why: "Mail-to-@tablex.com triage: vendor allow rule needed for deliverability", owner: "Brian → IT vendor", due: "ASAP", gate: false, status: "blocked" },
];

/* ------------------------------------------------------------------ */
/* Already done (Overview)                                              */
/* ------------------------------------------------------------------ */

export const SHIPPED = [
  "9/21: ops desk notifications (bell + polled feed), Puddle casters removed, trapezoid tabletops restored, announcements sent",
  "9/21: header Account ▾ + Search panels; Find-a-Rep limited to Brian's listing; portal Downloads; DMARC + SES SPF; brand images on tablex.com",
  "9/20 evening: GO-LIVE — DNS → Vercel, certs, site_url, launch flag, GA4 gtag bridge, admin-only feedback widget, sales@ as the public contact",
  "9/20: Clarity live, prelaunch polish + cosmetics pass, footer seal + About team card, Xero go-live prep (host-derived callback)",
  "9/19: sitewide editorial motion + Forge peel route transition",
  "News: 3 real posts live, placeholders removed (9/18)",
  "Launch punch list shipped 9/17: final wordmark everywhere, branded HTML email, GTM + GA4, rollback runbook, deploy process",
  "Login rework: password-first sign-in, self-serve reset, invites land on set-password; auth email templates on the live domain",
  "Self-serve customer accounts + list-price self-quotes; ordering requires an account, PO optional",
  "Test data cleansed 9/18: the quotes table is empty, the next real quote is TX-2026-0001",
  "1,241 legacy tablex.com quote requests (2022 → today) imported into the site CRM on 160 organizations",
  "Eleven staff training videos for the quote desk recorded and rendered",
  "September 2026 price book is the one live book; Xero internal go-live has been running since 9/14",
  "SpeX Studio realism, edge bands, casters, Artisan shelf, accessories — all on prod",
];
