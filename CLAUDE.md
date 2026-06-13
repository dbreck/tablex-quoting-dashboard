# tablex-quoting-dashboard

Internal CPQ + project-tracking dashboard for TableX.

## Architecture

Architecture and flow diagrams live in `docs/diagrams/`.

- [Structure map](docs/diagrams/architecture.md) — top-level folders, key relationships, conventions
- [Routing flow](docs/diagrams/routing-flow.md) — URL → middleware → layout → page
- [Monday sync flow](docs/diagrams/monday-sync-flow.md) — Stage 2 pull/reconcile/push engine
- [Zustand store flow](docs/diagrams/zustand-store-flow.md) — store slices, persist/migrate, consumers
- [Supabase auth flow](docs/diagrams/supabase-auth-flow.md) — middleware, AuthProvider, permission gates
- [Data model flow](docs/diagrams/data-model-flow.md) — static seeds → stores → UI
- [Component composition](docs/diagrams/component-composition.md) — who contains who
- [`architecture.html`](docs/diagrams/architecture.html) — interactive viewer (open in a browser)

To launch a Claude Code session with all diagrams appended to the system prompt, run `./bin/cca`.

Regenerate with `/arch-map` when the architecture drifts.

## Design system (claude.ai/design bundle)

The authoritative TableX brand bundle lives at `docs/TableX Design System/Design Finals/`. It's the upload set for the published claude.ai/design Design System.

**Status (2026-06-06):** DS published + validated + §8a distinctiveness pass. **Home LANDED** (Kayla-recreation trunk, 5/27), Brian's feedback iterated (6/5), and served as a **multi-file JSX bundle** at `public/comps/home-full-build/` — nitpick fixes are direct `src/*.jsx` edits there (exception to "never implement design output here"; production impl still → `tablex-site`). Grade claude.ai/design handoffs at the CODE level (grep tokens/fonts/shadows). Next page: `/about` (`15-ABOUT-KICKOFF.md`, manufacturing-scrubbed). Content honesty (Brian 6/5): **zero manufacturing in Jasper** (shipping/distribution only — no welders/shop-floor/tours copy ever) and **617/12,338 stats banned on public surfaces** (ClearPH pitch-deck only). State: auto-memory `project-claude-design-ds-published.md` + `project-comps-home-bundle-v2.md`.

- Brand source-of-truth: `Brand-Quick-Guide.png` (6 Pantone swatches + Acumin Pro specimens), `Home-01.png` (canonical homepage hi-fi), `TableX.fig`
- Authoritative master spec: `00-DESIGN-SYSTEM.md` (palette, type, anti-AI-slop block)
- Operator's manual for the claude.ai/design session: `13-SESSION-PLAN.md` — read FIRST before opening claude.ai/design
- Full 86-page wireframe briefs in `05`–`12-PAGE-BRIEFS-*.md` grouped by route group

**Brand palette (Pantone-derived, exact):** Forge `#000000` · Iron `#191919` · Saddle `#75400E` · Moss `#8A8962` · Canvas `#EAE5DE` · **Ember `#F26721`** (single accent, one per fold). Adobe Fonts kit: `juc1jwq` (NOT `ucn5jze` — that's Peregrine).

**Stale & superseded** (do not upload to claude.ai/design): `docs/TableX Design System/DESIGN.md`, all `Homepage v2/v3/v4.html`, all `browse-all*.html`, `Assets/fonts/` (FreightSans era), `colors_and_type.css`. Left in place for archaeology.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Supabase (`@supabase/ssr`) · Zustand 5 · Monday.com GraphQL · React Three Fiber · Radix UI · Recharts · Plotly · `@hello-pangea/dnd`

## Commands

```sh
npm run dev      # dev server on :3000
npm run build    # production build
npm run start    # production server
npm run lint     # eslint
```

## Invariants worth preserving

- **Hours are canonical; days are derived** (`hoursToDays = h / 8` rounded to 0.5). Baselines stored in days.
- **Laminate pricing: summary tab of the 2026 sheet is authoritative** (Brian 6/5) — Core = "Wilsonart 2 or More" list, Select = +15%, Luxe = +35% (rounded up within category). **Luxe *patterns* resolved 6/13 to +35** (was +20 as printed on the summary tab; Brian's "round up to highest markup in category" rule governs — receipt-confirmed to Brian to object if intentional). Detail tabs feed stock/banding fields only. `hasMatchingEdgeband` is OFFER-level (always false for patterns). Full rulings in `src/data/finish-catalog.ts` header.
- **Task IDs** are `${deliverableId}-r${idx}` (seeded) or `nanoid(10)` (user-created). Monday's External ID column must match one of these — never title.
- **Zustand selectors must return stable refs** — derive new arrays/objects inside `useMemo` in the hook body, not in the selector. Otherwise React error #185.
- **Scope (frozen quote) vs Tasks (working reality) are separate layers** — `getScopeStatus()` reads overrides; `computeDeliverableStatus()` rolls up from tasks. Keep these paths distinct.
- **Monday sync is manual only** — no polling, no auto-push. Every sync round is ~10k Monday complexity units.
- **All Monday queries must pass `MONDAY_BOARD_ID`** explicitly (`src/lib/monday/schema.ts`). Token is workspace-scoped; our code must act board-scoped.
- **`DELIVERABLES` in `src/data/project-phase2.ts` is static** — never mutate at runtime. Put mutable fields in `DeliverableOverride` in the store.
- **Permission gates are client-side layouts** (`AuthProvider.isAdmin`, `profile.can_access_proposal`). Middleware only enforces "logged in"; API routes that take privileged actions must re-verify via `createAdminClient()`.

## Cross-repo orchestration (this dashboard → tablex-site)

This dashboard is the **orchestrator** for tablex-site execution work. The PM tracker (`project_tasks` in Supabase `ofweciopslhrepobqpco`) is the canonical task store.

- **Never hand `tablex-site/docs/architecture/target-state.md` to an executing agent.** It's a spec (end-state), not a plan (next-steps). Specs cause drift.
- **Write per-session execution briefs** at `tablex-site/docs/plans/{slug}.md`. Template: `tablex-site/docs/plans/sprint-2.md` (2026-05-10). Required sections: stay-vanilla rules, pre-flight, per-task with subtask + AC tracker IDs verbatim, end-to-end verification, reporting back.
- **Briefs reference tracker IDs verbatim** so the agent can mark `subtasks` / `acceptance_criteria` jsonb without title matching. Never paraphrase task titles.
- **Workflow charter** at `~/.claude/plans/woolly-booping-sonnet.md` (2026-05-10). Memory: `feedback-cross-repo-brief-workflow.md`.
- **Tracker access:** the dashboard's tracker is on the **personal Supabase account** (`mcp__supabase__*` after the 2026-05-10 PAT switch). Don't reach for `supabase-tablex` — that's the TableX-Inc org, which only owns the tablex-site Postgres.
- **Stay-vanilla rules accumulate.** Every off-rails event in the executing agent becomes a numbered rule in the next brief's pre-flight. Sprint 2's brief has 8 such rules; do not regress.

### State as of 2026-06-06 (Sprint 4 executed early, from THIS session — Danny authorized direct dev)

- **tablex-site is LIVE at tablex-site.vercel.app**: real homepage (13-fold comp scroll), 16-route skeleton, component library + `/styleguide`, working contact/quote forms. Deploys are GREEN — the "parked infra" assumption is stale; confirm `UnParkVcl4` remnants with Danny, then retire Sprint 4 stay-vanilla rules 1/2/4.
- **Email pipeline done**: tablex.com verified in Resend (domain id `99ce1378-…`, DNS via Cloudflare API — scoped token + RESEND_API_KEY in tablex-site `.env.local`); sender `forms@tablex.com`; submissions → `digital@tablex.com` (override: `CONTACT_FORM_TO` Vercel env). Prod form → delivered email, verified.
- **FIDELITY GATE (load-bearing, TWO-VIEWPORT as of 6/7)**: a claude.design comp port is DONE only when `tablex-site/scripts/fidelity/` audit reports REAL DELTAS: 0 at **BOTH 1920×1080 AND 1280×800** (text-keyed getComputedStyle diff vs the comp + screenshot fold-pair eyeball). 1920-only passing is NOT done — the 6/6 "zero deltas" hid total divergence below 1920 (site had hard-coded the comp's 1920-resolved values where the comp uses fluid clamp()/vh + bespoke @media collapse points). **Build agents get comp fold SCREENSHOTS, not just JSX; the comp beats abstract style rules** (only hard bans survive: MiA, 617/12,338, welders). Memory: `feedback-comp-assembly-fidelity.md`.
- **Fluid type system (6/7, hardened DS)**: tablex-site `globals.css` now has `.text-h1/.text-h2/.text-h3/.text-lede` (the comp's exact clamp() formulas, size/leading/tracking ONLY) + comp's 4-step gutter/section @media steps on `--spacing-container`/`--spacing-section` (140/80/40/22 · 128/96/72/56 at 1280/900/560). New pages USE THESE — never hard-code 1920px-resolved sizes. Comp collapse breakpoints are bespoke per fold — port via `max-[Npx]:` variants, not `sm:/lg:`. Eyebrow/nav line-height tokens are 1.55 (comp inherits body leading).
- **Sprint 5 brief rule candidates**: (1) no constants exported from "use server" modules into client components — use a shared module; (2) `pnpm lint` stays at ZERO (cleared this session); (3) never invent routes — `#` placeholders for unbuilt groups; (4) semantic type utilities must not set color/weight (cascade traps — `.text-lead`/`.text-caption` bugs fixed); (5) check native-dep arch (`pnpm install --force` fixes wrong-arch binaries, e.g. lightningcss x64-on-arm64); (6) fidelity gate is the acceptance criterion for any comp port — at BOTH viewports; (7) replicate the comp's layout MECHANISM, not just its values — two flex-vs-block traps so far (hero `justify-center` vs comp's padding-based placement; wordmark img needed `self-start` because flex-stretch + SVG xMidYMid centered it in a full-width box); (8) use the fluid utilities (`.text-h1/.text-lede` etc.) instead of arbitrary clamp values where they apply.
- **Vercel CLI**: tablex-site lives under team `dbreckxs-projects` (account `dbreckx` = `digital@tablex.com`, NOT personal `dbreck`); `vercel redeploy` needs `--scope dbreckxs-projects`. "Sensitive" Vercel env vars are write-only (can't `env pull` them). **As of 6/9 the CLI is logged in as `danny@clearph.com`** (the hub, now a member of the TableX Pro team) — `vercel switch` to `dbreckxs-projects` for tablex-site. Full cross-service login map: memory `reference-account-matrix.md`.

### State as of 2026-06-09/10 (Sprint 4 ungated build queue executed from THIS session)
- **Sprint 4 = `sprint-ZhcdZw`** (Supabase `ofweciopslhrepobqpco`, default `supabase` MCP), populated via dynamic workflow (26 ordered tasks, 5 tracks). 8 pages built + pushed to tablex-site `main` (auto-deploys prod), all eslint+tsc clean, content-honesty greps clean: `/about`, `/about/warranty`, `/quote`+`/quote/quick`, `/find-rep`+`[slug]`, `/spaces`+`[slug]`(×5), `/resources`+5 subpages, `/about/contracts`. Data port done (`src/data/series.ts`+`finishes.ts`, ported VERBATIM from dashboard — 16 series, laminate invariant preserved). All `in-review` in the tracker.
- **Patterns established this push** (reuse for remaining pages): flagged **greybox placeholders** (`data-swap-later` divs) for any missing photo — NEVER fabricate imagery; `src/data/spaces.ts` is data-driven (lead series DERIVED from series.ts `workspaces` tag, not hardcoded); `src/components/resources/ResourceScaffold.tsx` + `ResourceEmptyState` for asset-less resource subpages (honest empty-states + `/contact` fallback, no fake download tiles); contracts use "to be confirmed" number placeholders (never fabricate contract #s); brief-built pages compose existing `marketing/` + `home/` primitives (TriBlock/BigStat/StatStrip/DualCTA/PullQuotePanel) + inline folds.
- **Per-page verify loop**: `pnpm exec eslint <file>` + `pnpm exec tsc --noEmit` + curl :3017 render-200 + rendered banned-term grep → commit+push `main` → mark tracker `in-review`. (Dev server runs on :3017; headless Chrome screenshot path = `--headless=new --remote-debugging-port=9222` + chrome-devtools MCP.)
- **STILL GATED (Danny to unblock):** 2 design comps (`/finishes` Kayla, `/products` Caleb) → catalog hubs; Brian origin decision + static-vs-Payload call → `/series`+`/news`; Kayla's scrubbed careers brief → `/about/careers`; `UnParkVcl4` infra → Payload models; `s4-assets` photography → swaps all greybox. QA/SEO/301 tail runs after pages land.
- **Workflow-agent gotcha:** the Sprint-4 planner agent miscounted series as 18 (it's **16** — verified by hand; the count was interface field + fn param). Always verify agent-reported counts against the source.

### State as of 2026-06-10 EOD (PUBLIC SITE COMPLETE — supersedes "STILL GATED" above)
- **tablex-site main = `556f211`, tree clean, deploys green. Every public route exists and is verified.** This session (2 dynamic workflows + 4 agents): hubs `/finishes`+`/products` passed the TWO-VIEWPORT fidelity gate (0/0 at 1920+1280, adversarial + screenshot backstop); built `/finishes/solid-surface`+`/finishes/custom` (Brian never got the fabrication email → honest quote-only default) + `/products/collections`; **SEO launch tail** (`df0cb0b`: canonicals ×33 pages, sitemap.ts 49 URLs, robots + `NEXT_PUBLIC_SITE_LAUNCHED` noindex guard — FLIP AT CUTOVER + redeploy, default OG, **70-rule 301 map covering all 202 legacy URLs, adversarially verified**); images (products 16→1.4MB, chips PNG→WebP 12.5→1.4MB); Lighthouse Perf 95–99/BP 100; **Payload News+Pages modeled** (migration applied prod; **`push:false` set — dev was silently push-mode against prod DB**; catalog deliberately NOT modeled = static-for-launch, no dual-truth); mobile QA sweep 38 routes @390 (2 real bugs fixed; 9 cosmetic = greybox-caption artifacts, self-resolve with photos); **chrome reconcile vs Home comp** (footer double-gutter fixed, nav ember active dot added, home re-gated 0/0); nav wired to live routes (Login/Account stay `#` until portals).
- **Fidelity tooling (reusable):** `tmp/fidelity-hubs/capture.js` + `overflow.js` (puppeteer-core, one Chrome per run, workflow-parallel-safe); comp server = `python3 -m http.server 8077` in `tmp/comps-hubs/finishes/` — **that ONE zip dir holds BOTH hub comps + Home** (Products zip = older `p_*` generation, ignore).
- **Launch runbook:** `tablex-site/docs/launch-checklist.md`. Footguns pre-documented: Adobe Fonts kit `juc1jwq` needs tablex.com in its domain allowlist; DNS cutover must NOT touch MX/M365 records; `NEXT_PUBLIC_` env changes need a redeploy.
- **Danny-gated:** send Brian Gmail draft `r1655885163917828953` (custom-fab ruling + `/about` "We make tables"/"crafted" voice question — Danny: leave /about as-is until Brian rules); photography drop `s4-assets` (swaps all greybox + clears the 9 cosmetic QA findings); a11y Ember-contrast/target-size/TriBlock-h3 = leave as-is (Danny 6/10).
- **Tracker (sprint-ZhcdZw):** UnParkVcl4 done · s4-finishes, web-3-r0, web-3-r3, web-5-r0, web-5-r1, web-5-r2, web-4-r0 in-review · web-5-r3 doc done/in-progress (execution at cutover).
- **NEXT ARC (fresh session): PORTALS + SPEX STUDIO** — briefs `Design Finals/09` (Spex), `10` (dealer), `11` (rep), `12` (admin). Core Brian-confirmed requirement: dealer login → tier discount (50/20) + net pricing; list price public. Payload is booted (push:false, migrations-only schema writes).

### State as of 2026-06-12 (PORTALS + SPEX ARC COMPLETE — supersedes "NEXT ARC" above)

- **tablex-site main = `3f9fdc1`, prod green, behaviorally verified.** Portals arc all 3 chunks SHIPPED: dealer portal (6/10, `53fa1d6`) · **Spex Studio MVP** (`2fbe1d6`: 3D configurator w/ code-split three.js, quotes flow draft→submitted, 90-day share links, landing + 16 series configurators) · **rep portal thin + admin ops** (`d24ddd9`: /rep dash/dealers/invite/account, **/ops/users + /ops/orgs — NOT /admin, proven build-collision with Payload's catch-all**, variant-driven portal shell, /portal role resolver) · polish (`310a68b`: (spex) route group drops marketing footer on tool surfaces, configurators indexable at canonical bare URLs + sitemap, /rep/quotes/[id], admin Ops↔portal nav) · email sub (`3f9fdc1`: sales@/reps@ → digital@tablex.com — mailboxes don't exist; flip-back rule in commit msg).
- **Workflow model ruling (standing):** ALL workflow subagents run `model:'opus'` (Opus 4.8); Fable 5 is orchestrator-only. The 6/10 quota burn was agents inheriting `claude-fable-5[1m]`.
- **Supabase Auth SMTP → Resend wired** (`sfwegefbgudsgricduat`, sender `TableX <forms@tablex.com>`, Management API — `smtp_port` must be a STRING). Magic-link + invite emails verified delivered. Launch checklist §7 added: flip auth `site_url` (still vercel.app) + redirect allowlist at cutover.
- **Sprint `sprint-ZhcdZw`: zero buildable dev tasks.** All arc tasks + page builds in-review awaiting Danny. Backlog is human-gated: s4-assets photography (Kayla), s4-mfg-decision (Brian/Arabella), web-5-r3 cutover execution.
- **Open asks:** sales@/reps@ mailbox creation (Brian agenda) · rep brief fiction vs real enums (no editor role, no Tier 10/20) → content reconcile · seeded logins: danny@clearph.com / tablex-admin-2026! (admin → /ops via /portal), dealer@example.com / tablex-dealer-2026!.
- **Session-start economy:** skip `./bin/cca` for tablex-site orchestration sessions (it loads ~32k tokens of dashboard-internal diagrams) — plain `claude` + CLAUDE.md + memory is the right context. Use cca only when building dashboard features.

### State as of 2026-06-13 (Q&A SESSION — real laminate textures + Brian voice/pricing shipped)

- **tablex-site main = `7a19ee4`, both prod deploys ● Ready/green.** Dashboard main = `2375674`.
- **Real full-sheet laminate textures on Spex 3D tops** (`6d6e27d`): replaced the 6/12 chip-tiling fix with photographic Wilsonart sheet scans. **The dashboard had NO laminate textures (flat hex)** — acquired fresh from Wilsonart's `productimage/imagedownload/?id=N` endpoint (ZIP → 2000px `fullsheet_5x12.png`). 63/66 SKUs (1280px WebP, 3.3MB, lazy-loaded); 3 holdouts on chip/hex fallback. `useFinishMaterial.ts` got a sheet branch (`SHEET_INCHES=60`, unclamped — small tops show a seamless sub-window). Full method + name-drift notes: memory `reference-wilsonart-laminate-textures.md`.
- **Brian replied to both 6/12 emails** (were unread): custom-fab = no in-house fab, keep generic (confirms build); About voice = **design/deliver/build** → scrubbed+shipped (`7a19ee4`: home hero/About/careers/Artisan — "tablemaker"→"table company", "crafted"→"well-built"/"Built right", "Craftsmanship"→"Considered detail"). **Receipt-reply draft `r3946889989474093118`** in danny@clearph.com — Danny to send.
- **Luxe patterns +20→+35** shipped BOTH repos (Brian's "round up to highest in category" rule; was the documented ⚠ OPEN item). Invariant notes resolved in finish-catalog.ts + tablex-site finishes.ts + this file's laminate invariant line.
- **Accept pass: 13/25 in-review tasks flipped to `done`** (objective gates: fidelity 0/0, adversarial 301/SEO, Lighthouse, runtime role-matrix smoke, prod behavioral). **12 left in-review for Danny's click-through** (10 content pages + 2 Spex) — guided script at `docs/agendas/2026-06-13-accept-pass-clickthrough.md`; **next session leads with it one-item-at-a-time** (directive at top of MEMORY.md).
- **Flags:** /about pull-quote says "Brian Craig, CEO" but sig = VP Sales & Marketing (left as-is, Danny's call). New backlog task `spex-glb-infra` (Frame/Quad GLB import to light up justice+exclaim). Push to tablex-site main still prints a "pull request" advisory but succeeds.
