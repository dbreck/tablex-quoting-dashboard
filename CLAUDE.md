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
- **Laminate pricing: summary tab of the 2026 sheet is authoritative** (Brian 6/5) — Core = "Wilsonart 2 or More" list, Select = +15%, Luxe = +35% (rounded up within category; Luxe *patterns* print +20, pending call). Detail tabs feed stock/banding fields only. `hasMatchingEdgeband` is OFFER-level (always false for patterns). Full rulings in `src/data/finish-catalog.ts` header.
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
- **Vercel CLI**: tablex-site lives under team `dbreckxs-projects` (account `dbreckx`, NOT personal `dbreck`); `vercel redeploy` needs `--scope dbreckxs-projects`. "Sensitive" Vercel env vars are write-only (can't `env pull` them).
