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

To launch a Claude Code session with all diagrams appended to the system prompt, run `./bin/cca` (dashboard-internal work only — it loads ~32k tokens of diagrams; skip it for tablex-site orchestration).

Regenerate with `/arch-map` when the architecture drifts.

## Design system (claude.ai/design bundle)

The authoritative TableX brand bundle lives at `docs/TableX Design System/Design Finals/` — the upload set for the published claude.ai/design Design System. **DS is published + validated.** Grade claude.ai/design handoffs at the CODE level (grep tokens/fonts/shadows). Home landed as a multi-file JSX bundle at `public/comps/home-full-build/` — nitpick fixes are direct `src/*.jsx` edits there (exception to "never implement design output here"; production impl → `tablex-site`). Content-honesty bans apply (see Standing rulings). State: memory `project-claude-design-ds-published.md` + `project-comps-home-bundle-v2.md`.

- Brand source-of-truth: `Brand-Quick-Guide.png` (6 Pantone swatches + Acumin Pro specimens), `Home-01.png`/`Home-01.jpg` (canonical homepage hi-fi — the `.jpg` is the usable 2.6MB export), `TableX.fig`
- Authoritative master spec: `00-DESIGN-SYSTEM.md` (palette, type, anti-AI-slop block)
- Operator's manual for the claude.ai/design session: `13-SESSION-PLAN.md` — read FIRST before opening claude.ai/design
- Full 86-page wireframe briefs in `05`–`12-PAGE-BRIEFS-*.md` grouped by route group

**Brand palette (Pantone-derived, exact):** Forge `#000000` · Iron `#191919` · Saddle `#75400E` · Moss `#8A8962` · Canvas `#EAE5DE` · **Ember `#F26721`** (single accent, one per fold). Adobe Fonts kit: `juc1jwq` (NOT `ucn5jze` — that's Peregrine).

**Stale & superseded** (do not upload to claude.ai/design): `docs/TableX Design System/DESIGN.md`, all `Homepage v2/v3/v4.html`, all `browse-all*.html`, `Assets/fonts/` (FreightSans era), `colors_and_type.css`. Left in place for archaeology.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Supabase (`@supabase/ssr`) · Zustand 5 · Monday.com GraphQL · React Three Fiber · Radix UI · Recharts · Plotly · `@hello-pangea/dnd`

## Commands

```sh
npm run dev      # dev server on :3000 (:3001 when tablex-site holds :3000)
npm run build    # production build
npm run start    # production server
npm run lint     # eslint
```

## Invariants worth preserving

- **Hours are canonical; days are derived** (`hoursToDays = h / 8` rounded to 0.5). Baselines stored in days.
- **Laminate pricing: summary tab of the 2026 sheet is authoritative** (Brian 6/5) — Core = "Wilsonart 2 or More" list, Select = +15%, Luxe = +35% (rounded up within category). **Luxe *patterns* = +35** (Brian's "round up to highest markup in category" rule governs). Detail tabs feed stock/banding fields only. `hasMatchingEdgeband` is OFFER-level (always false for patterns). Full rulings in `src/data/finish-catalog.ts` header.
- **Task IDs** are `${deliverableId}-r${idx}` (seeded) or `nanoid(10)` (user-created). Monday's External ID column must match one of these — never title.
- **Zustand selectors must return stable refs** — derive new arrays/objects inside `useMemo` in the hook body, not in the selector. Otherwise React error #185.
- **Scope (frozen quote) vs Tasks (working reality) are separate layers** — `getScopeStatus()` reads overrides; `computeDeliverableStatus()` rolls up from tasks. Keep these paths distinct.
- **Monday sync is manual only** — no polling, no auto-push. Every sync round is ~10k Monday complexity units.
- **All Monday queries must pass `MONDAY_BOARD_ID`** explicitly (`src/lib/monday/schema.ts`). Token is workspace-scoped; our code must act board-scoped.
- **`DELIVERABLES` in `src/data/project-phase2.ts` is static** — never mutate at runtime. Put mutable fields in `DeliverableOverride` in the store.
- **Permission gates are client-side layouts** (`AuthProvider.isAdmin`, `profile.can_access_proposal`). Middleware only enforces "logged in"; API routes that take privileged actions must re-verify via `createAdminClient()`.

## Cross-repo orchestration (this dashboard → tablex-site)

This dashboard is the **orchestrator** for tablex-site execution work. The PM tracker (`project_tasks` in Supabase `ofweciopslhrepobqpco`) is the canonical task store. Sibling repo lives at `~/Applications/tablex-site` (repo `TableX-Inc/tablex-site`, Vercel `dbreckxs-projects/tablex-site`).

- **Never hand `tablex-site/docs/architecture/target-state.md` to an executing agent.** It's a spec (end-state), not a plan (next-steps). Specs cause drift.
- **Write per-session execution briefs** at `tablex-site/docs/plans/{slug}.md`. Template: `tablex-site/docs/plans/sprint-2.md`. Required sections: stay-vanilla rules, pre-flight, per-task with subtask + AC tracker IDs verbatim, end-to-end verification, reporting back.
- **Briefs reference tracker IDs verbatim** so the agent can mark `subtasks` / `acceptance_criteria` jsonb without title matching. Never paraphrase task titles.
- **Workflow charter** at `~/.claude/plans/woolly-booping-sonnet.md`. Memory: `feedback-cross-repo-brief-workflow.md`.
- **Stay-vanilla rules accumulate.** Every off-rails event in the executing agent becomes a numbered rule in the next brief's pre-flight.

## Current state (2026-07-10)

**Repos:** tablex-site `main` = `72ef1fa` (prod ● Ready, auto-deploys from `main`). Dashboard `main` = `128c18e` (Vercel hub `danny@clearph.com`, repo `github.com/dbreck/tablex-quoting-dashboard`).

**tablex-site is feature-complete and pre-launch.** Every public route + all 4 portals (dealer / rep / ops / spex) built, verified, prod-green. `robots` still `Disallow: /` (pre-launch guard) — flip `NEXT_PUBLIC_SITE_LAUNCHED` + redeploy at cutover. Launch runbook: `tablex-site/docs/launch-checklist.md`. Remaining to launch:
- **Danny:** Adobe Fonts kit `juc1jwq` allowlist tablex.com+www & republish · Vercel Domains (apex decision) · legacy-WP afterlife · DNS cutover (**DON'T touch MX/M365**) · Supabase Auth `site_url` + redirect allowlist · Xero prod redirect URI (`https://tablex.com/api/xero/callback` + flip `XERO_REDIRECT_URI`).
- **Brian:** final sign-off · mfg/origin decision · rep territory data · news content (Payload `payload` schema is live but zero content authored — `web-2b-r1` content-blocked).

**Recent arcs (full play-by-play in vault Sessions/ + memory files):** series-page redesign + 16-series imagery (`db820e2`) · Spex configurator JSI-style redesign (`8cc313e`) + native GLBs (`0cd37b0`) · quote desk + Spex UX cloud run (`38bbfb8..dbc5952`, landed direct to main — report `docs/reports/2026-07-04-quote-desk-spex-ux-run.md`) · Mark's Spex edge feedback → edge offer 8→2 (`pvc-3mm` default + `knife-edge`) both repos · EmberBand Figma treatment + `CollectionsStack` home fold · Xero read-only CRM sync + staff role + impersonation (`72ef1fa`) · **DASHBOARD** Launch Timeline `/project/launch-timeline` (migration 027, [[project-master-launch-timeline]]).

**Currently owed (carried / human-gated):**
- Read `docs/reports/2026-07-04-quote-desk-spex-ux-run.md`, then behavioral smoke: quote submit→email, `/ops/quotes` actions, Spex cart badge + `/quote/cart`. Reconcile tracker `web-quote-desk-0704` (in-progress).
- Brian emails in danny@clearph.com to send/review: `r5884822648646559323` (10-item input list).
- Caleb photography gaps: `tablex-site/docs/photography-coverage-gaps.md` (outdoor/Element biggest — ZERO outdoor shots exist; Elite hero+colorblock; Artisan/Justice/Puddle colorblock; Revel in-use; Stretch T-base-rect classroom).
- 3D modeler brief: `docs/spex-3d-needs-2026-07-02.md` (6 base GLBs + offer lists; `spex-glb-infra` glb-4 asset-blocked — no Frame / Exclaim Q-X base geometry, no honest stand-in).
- CD quote-to-cash diagram session: `docs/agendas/2026-07-10-quote-xero-flow.{json,-cd-prompt.md}` → export to `tablex-site/docs/diagrams/`.
- Xero real dealer import waits on Brian's cleaned books (~7/17). A test import of the 30 AR-bearing dealers is live in tablex-site `organizations` as `source='xero-test'` (reversible: `delete … where source='xero-test'`).
- /about pull-quote says "Brian Craig, CEO" but signature = VP Sales & Marketing (Danny's call, left as-is).

**Sprint 6 = `sprint-Vx6Lqn`** (7/09→7/22). Launch `web-5-r3` detached + undated (Aug; video possibly Sep 1). Backlog human-gated: `s4-mfg-decision` (Brian), locator data, news content, portal E2E.

## Standing rulings & recurring gotchas

**Content honesty — hard bans on public surfaces (a comp/DS never overrides these):**
- ZERO manufacturing in Jasper — ships/distributes only (no welders/shop-floor/tours copy). **Made-in-America (Brian 7/09): the MiA seal RETURNS to the footer (footer-only — put it back on), and About links to a dedicated Made-in-America details page (replaces the killed `/about/manufacturing` — see `dec-mfg-page`). RETAINED but PENDING verification of assembly-vs-manufacturing origin for specific product lines (mtg notes 7/09).** Footer also carries "Shipped from Jasper, Indiana".
- `617` / `12,338` stats banned on public surfaces (ClearPH pitch-deck only).
- "mass-produced" + the `manufactur-` stem are banned (Danny 7/04).
- "Configurable SKUs" → "Configurations". No fabricated SKUs anywhere; Spex shows a real-catalog **configuration code**, never an invented SKU / price / lead-time — **don't "fix" these as bugs.**
- Never fabricate: per-series marketing copy (bespoke copy is **Foundation-only**; the other 15 series use honest fallbacks — memory `feedback-preserve-comp-copy.md`), imagery (flag greybox `data-swap-later`, never invent), contract #s, download tiles.

**Pricing:** `Tablex_Pricing_6.10.24.xlsx` = component/top pricing only (no per-series base price) → **prices stay OFF cards; no dollar figures render anywhere.** Quote pricing travels in the attached PDF + `desk_note` free text. Dealer tier discount (50/20) is a stateable fact; list price is public. Don't revisit without a real base-price source. (Laminate invariant: see Invariants above.)

**Design / fidelity:** a claude.ai/design comp port is DONE only at **0 real deltas at BOTH 1920×1080 AND 1280×800** (memory `feedback-comp-assembly-fidelity.md`). Replicate the comp's layout MECHANISM, not its 1920-resolved values — use the fluid `.text-h1/.text-lede` utilities + `--spacing-container/section` steps. Build agents get comp SCREENSHOTS, not just JSX. `/products/browse` = e-comm utility surface (Forge-hero / checkbox-pill); `/products`, `/finishes`, `/spaces` stay editorial. Nav dropdowns deliberately omitted (DS Don'ts — hub pages ARE the megamenu).

**Dual-Supabase (critical — never cross them):** TRACKER `ofweciopslhrepobqpco` = PM `project_tasks`, personal account, **default `supabase` MCP**. tablex-site Postgres `sfwegefbgudsgricduat` = TableX-Inc org, **`supabase-tablex` MCP**.

**Tracker write gotchas (`project_tasks`):** status lives in the **`column`** field (reserved word — quote it), not `status`. `deliverable_id` MUST be a real `DELIVERABLES` id (`web-1/2a/2b/2c/3/4/5`, `portal-2`…; Spex → `web-3`). `assignee` FK → `team_members` (Caleb=`UDXcXYLU`; else lowercase first-name). `priority` is NOT NULL (batch INSERT rolls back whole on a missing one). Sprints in the `sprints` table (`status='complete'` to close).

**Spex render path (verification trap):** offers ≡ `MODEL_AVAILABILITY` cross-product → most literal-shape combos are NATIVE (baked GLBs — a native render proves nothing about our procedural code). Procedural fires only in the cross-product holes. Confirm via network: `bases/*.glb` = procedural stand-in, `glb-models/…` = native.

**Seeded logins (tablex-site prod):** admin `danny@clearph.com / tablex-admin-2026!` (→ /ops via /portal) · staff `staff@example.com / tablex-staff-2026!` · dealer `dealer@example.com / tablex-dealer-2026!` · rep `rep@example.com`. Impersonate switcher role colors: a=Ember `#F26721` · s=Moss `#8A8962` · d=Saddle `#75400E` · r=Iron `#191919`. (`dealer@example.com` is an unroutable seed address — its Resend emails always bounce; test dealer email with a real address.)

**Xero:** OAuth app "TableX CRM Sync" (`2b22ea93-5ea9-44c8-98c0-9ca192ccf0de`, danny@clearph.com dev login). Post-Mar-2026 apps get **granular scopes only** (`accounting.invoices.read`, not the retired broad scope). Read-only — **never writes Xero.** Books MID-MIGRATION (Move My Ledger, ~7/17); all open invoices are Dec-2020 artifacts (not owed) — `ar_issued_after` cutoff hides them. Suppliers stay out of CRM; the sync does NOT capture Xero's IsCustomer/IsSupplier flag, so the real dealer import must come from Brian's named list or a re-sync that captures type. Review queue (`/ops/xero`) has an open-AR filter + bulk-ignore for triage (`68eff5c`).

**Recurring tooling gotchas:** push to tablex-site `main` prints a "pull request" advisory but SUCCEEDS (ref updates). chrome-devtools screenshots only write inside a workspace root; `fullPage` saves to a temp path (Read it back). Lazy-loaded below-fold `next/image` shows the fallback bg in a first screenshot — verify via `evaluate_script` naturalWidth or re-shoot after scroll. `resize_page` (chrome-devtools) reflows; claude-in-chrome `resize_window` does NOT. Dashboard dev = **:3001** when tablex-site holds :3000 (check `lsof -iTCP:3000 -sTCP:LISTEN`). `vercel ls` column-mangles when piped — use `vercel inspect <url>` or match deploy `created` to `git log -1 --format=%cI`.

**History:** full per-session play-by-play lives in vault `Sessions/` + memory files (`~/.claude/projects/.../memory/`). This file holds current state + standing rulings only — don't re-accrete a dated chronology here.
