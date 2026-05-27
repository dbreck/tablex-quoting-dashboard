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

**Status (2026-05-26):** DS published + validated (A/B/C) + distinctiveness pass done. `00-DESIGN-SYSTEM.md` §8a "Distinctiveness mandates" (M1–M6, surface-tiered) breaks the "warm-field + orange + black = Anthropic" recipe — direction is *contrast & depth, not cooling*. Grade claude.ai/design handoffs at the CODE level (curl the tarball → grep tokens/fonts/shadows). Handoffs are read-to-grade only — never implement design output in this repo; production impl → `tablex-site`. **Session 3 (Public Marketing wireframing) in progress; the A2 Home design was scrapped 2026-05-26 (overlap/clip cruft from iterating) — restart Home fresh.** Full state + fresh-start carry-list: auto-memory `project-claude-design-ds-published.md`.

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
