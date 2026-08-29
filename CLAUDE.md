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

**▶ Working the DS? Start at `docs/TableX Design System/ds-live/SYNC-NOTES.md`.** That directory is a
1:1 local mirror of the live claude.ai/design project (`278dcca1-d9ba-4193-a33e-33374cb52ff5`), synced
2026-07-25 — 50 cards across 7 groups (Brand · Colors · Type · Spacing · Components · Application ·
UI Kit). Serve it with `cd "docs/TableX Design System/ds-live" && python3 serve.py` → http://localhost:4321
(the gallery rescans on every reload). Memory: [[project-design-system-sync]] + [[project-tablex-ds-drift-corrections]].

- **`_ds_bundle.js` is the compiled artifact the cards actually render** — the `.jsx` files are source.
  Editing source alone leaves every rendered card stale. Patch both. Reorders (not just relabels) must
  be applied in the bundle too or props mispair with labels.
- **Pull path:** `DesignSync` is **main-session only** (absent from the subagent registry — a fan-out
  cannot fetch), and design-*system* projects have **no zip export**. Use the app's own
  `OmeletteService/GetFile` RPC from a logged-in tab, then strip the `data-omelette-injected`
  style/script pair it inserts after `<head>`. **Push path:** `finalize_plan` (requires `writes` AND
  `deletes`) → `write_files` with `localPath`, which reads from disk so content never enters context.
- **Design exploration ≠ DS project (Danny 8/10):** new design work is NOT pushed into the DS
  project (token-inefficient). Each exploration gets a **NEW regular claude.ai/design project**
  with the TableX DS set as its design system (e.g. "Accessories" `bcdc58f4-…`). Retrieval from
  those: **zip export** (regular projects have it; DesignSync only sees design-system projects) —
  Danny downloads, we unpack. GetFile RPC = fallback.
- **Fonts/assets are already local** — all 8 Acumin `.otf` + 13 of 15 photos in
  `public/comps/home-full-build/`; the rest in `Design Finals/`. Don't try to fetch them.
- The top-level `preview/`, `ui_kits/website/`, `colors_and_type.css` in that folder are the
  **superseded FreightSans generation** — archaeology. Never merge them with `ds-live`.

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

## "ship it" — straight to production (startup mode, 7/25)

**"ship it" / "make it live" / "push it live" = merge to `main`, push, confirm the Vercel production
deploy went green.** No PR, no review gate, no staging hop — `tablex-site` `main` auto-deploys to
prod and Danny wants to see real changes on the real site. Flow: commit on a branch → `git merge
--ff-only` into `main` (a fast-forward means the tree is identical to what was already built, so no
re-build; anything else gets a combined local build first) → `git push origin main` → poll
`vercel ls` until the Production row reads `● Ready` → spot-check live. GitHub's PR-required rule on
`main` gets bypassed on push — that warning is expected here, not a problem. This authorizes
**deploys only**: destructive migrations, DNS/MX, and anything else on the confirm-first list still
get surfaced. Interim rule — revisit when real dev/staging procedures land.
Memory: [[feedback-ship-it-straight-to-prod]].

## Cross-repo orchestration (this dashboard → tablex-site)

This dashboard is the **orchestrator** for tablex-site execution work. The PM tracker (`project_tasks` in Supabase `ofweciopslhrepobqpco`) is the canonical task store. Sibling repo lives at `~/Applications/tablex-site` (repo `TableX-Inc/tablex-site`, Vercel `dbreckxs-projects/tablex-site`).

- **Never hand `tablex-site/docs/architecture/target-state.md` to an executing agent.** It's a spec (end-state), not a plan (next-steps). Specs cause drift.
- **Write per-session execution briefs** at `tablex-site/docs/plans/{slug}.md`. Template: `tablex-site/docs/plans/sprint-2.md`. Required sections: stay-vanilla rules, pre-flight, per-task with subtask + AC tracker IDs verbatim, end-to-end verification, reporting back.
- **Briefs reference tracker IDs verbatim** so the agent can mark `subtasks` / `acceptance_criteria` jsonb without title matching. Never paraphrase task titles.
- **Workflow charter** at `~/.claude/plans/woolly-booping-sonnet.md`. Memory: `feedback-cross-repo-brief-workflow.md`.
- **Stay-vanilla rules accumulate.** Every off-rails event in the executing agent becomes a numbered rule in the next brief's pre-flight.

## Current state (2026-08-04) — ACCESSORIES ARC SHIPPED (`main`=`2e0c0f4`, 4 prod deploys green)

**The accessories gap is closed.** `/products/accessories` rebuilt as a live-priced catalog + SpeX Studio gained an Accessories picker + the price book gained revision **r4**. Memory [[project-accessories-2026-08-04]]. Five commits: `ce4e505` page · `18a3966` picker · `20552ea` r4 backfill · `b0549be` Dekko imagery · `2e0c0f4` white-tile fix.

- **`/products/accessories`** — hub-hero mechanism, 5 category sections, **244 book models priced live** from the active book at request time (ISR `revalidate=300`, NOT hardcoded — the count is derived). `src/data/accessories.ts` = taxonomy, joins on VERBATIM `model_number` only (book category strings are OCR-dirty). Legacy `/accessories/*` + `/options` now 308 here (were → /products/browse). SiteHeader overlay + search index wired; /spaces accessory strip links the anchors.
- **SpeX accessory picker (no 3D yet)** — curated roster `src/data/accessory-options.ts` + client-safe `src/lib/spex/accessories.ts` + server-only `src/lib/pricing/accessory-pricing.ts` (**THE single resolver — the price route is now a thin wrapper over it, so route and quote desk cannot disagree**). `SpexSelection.accessories` rides the config jsonb **only when non-empty** → accessory-free configs stringify byte-identically (cart de-dupe, share replay, desk parsing provably unaffected). **`configCode` NEVER carries accessory codes** — suffixes attach to book-resolved models only.
- **PRICE BOOK IS NOW "January 2026 List (r4)"** (`04ee213e-…`, effective 8/04, **2,951 items**). Backfilled 2 rows the book PRINTS but the original extraction dropped: `VT-MFM` splitter $159 (p.224) + `-MD` MINI drawer $104 (p.231), both re-read page-by-page from the PDF first. New `scripts/pricing/apply-accessory-backfill.ts` = the ADD analogue of the surge-correction script. Record: `data/pricing/2026-01-list/price-corrections-2026-08-04.md`. Map regenerated vs r4 → **all 2,657 rows byte-identical, provenance header only**.
- **Gotchas burned this session:** series-catalog slugs are **UPPERCASE** ("ELITE") — compat rules need `ruleSlugsInclude`, a raw `.includes(slug)` silently never fires · `price_book_option_charges.series_code` stores **"08 Series"** not "08" (prefix `.like`) · React 19 forbids closure mutation during render (derive subheads purely) · a table split across a `Fold` loses column alignment — collapse rows instead · Dekko blocks `curl` (403) but WebFetch retrieves their PDFs fine.
- **Honesty calls:** grommets stay quote-only ON PURPOSE — the book says $45 each but p.231's own example says `-GR.D` adds **$89, not $90** · toolbar sums accessories only when EVERY selected one prices · desk `accessoryRefs` are reference-only, `LinePricing` keeps authority.
- **Imagery:** 4 power tiles now use Dekko's own 300ppi OEM renders (extracted from their sell sheets) — ⚠ **confirm redistribution rights before launch. ASKED 8/06 (email SENT to Brad Dove, unanswered; thread now runs through Byrne/Conor Regin — NDA signed 8/10, re-raise rights with the file delivery). Pre-launch blocker until answered.** `AccessoryImage.onWhite` flag (measured by sampling border pixels, not guessed) puts white-sweep shots on WHITE tiles — a tan tile made their background read as a hard rectangle. **Rejected `mix-blend-multiply`: it darkens light products, and the Villa render is white.**
- **⚠ CORRECTION — the SpeX viewer DOES orbit BELOW the worksurface.** An earlier "we only need the visible top" assumption was wrong (Danny 8/04). Accessory models need the full body: housing, flanges, end-face outlet, cord.
- **3D accessory brief for Neal written, NOT SENT — and now needs RE-SCOPING first (8/06):** `docs/spex-3d-accessories-2026-08-04.md` + `docs/spex-3d-accessories-refs/` (⚠ `/docs/` is GITIGNORED here — local only). Villa fully dimensioned (8.63 × 2.94 × 2.17, cutout 3.00 × 5.25 R.125, cover 3.25 × 5.5). **Modeling split: fixed geometry (power units, casters) → Neal models; parametric (panels 10×36–10×96, grommets, leg covers) → we build in code.** File spec matches his existing pipeline (meters, Z-up, no materials); the ONE difference is origin = mating surface, not ground plane. **8/06: Mark opened a direct line to DEKKO** (rep **Brad Dove `brad@dekko.com`**, thread `19fd3540037a0062`) — if Dekko ships CAD for Villa/Villa2/Cove/grommet/infeed/Daisy-T/keystones, ASK 1+2 evaporate and Neal's fixed-geometry work shrinks to the 3 casters. **Don't send Neal the brief as-written — wait on Dekko, then cut it down.** Reply DRAFTED not sent: `r1091996396313993032` (STEP primary; Villa as pilot; full body not just the lid; no optimization/textures). **⚠ Vendor asks get the SHORT spec — meters/Z-up/`acc_*` names/mating origin are OUR pipeline, never a manufacturer's job.** Memory [[reference-spex-3d-accessory-assets]].
- **Client review email DRAFTED, NOT SENT** — Gmail draft `r1328118608952568301`, To Brian/Mark/Kayla, CC Arabella.
- ~~NEXT SESSION = /products/accessories REDESIGN~~ **SUPERSEDED 8/09 — see the "8/09 BROWSE TWO-MODE REDESIGN PLANNED" block below.** The 8/04 prompt (`docs/accessories-redesign-prompt-2026-08-04.md`) produced the wireframe round whose option 1c became the new direction; that prompt is now superseded by `docs/browse-redesign-prompt-2026-08-09.md`. Sticky category nav already shipped (`0e8cae6`). **Data layer is fully decoupled — a rebuild is a page-file change and nothing else.**

## Current state (2026-08-28 PM) — HOME LOOK BOOK STACK CARDS + ENVIRONMENTAL BAND SHIPPED (tablex-site `main`=`9c9d08c`, deploy ● Ready, live-verified)

**All 5 home "Featured Collections" stack-card panels (App/Solo/Element/Stretch/Exclaim) now
carry Look Book real-shot crops; the Revel/Occasional card is REMOVED; EnvironmentalBand =
`element-feature-02-4k.png` arch scene @ `object-[center_75%]`.** This push also carried the
morning's `64d9c3e`+`27b6762` (below) — nothing unpushed. Memory
[[project-home-lookbook-cards-2026-08-28]] has the reusable crop pipeline + final colorPos set.

- Cards = `public/images/home/lookbook-<slug>.webp` (1600w portrait ~0.77): lookbook left-page
  framing then **~15% looser** (Danny's standing preference). Only App's source needed hflip
  (in-scene readable text = flip test). New optional `StackCard.alt`; staircase peek count now
  derives from `CARDS.length - 1` (was hardcoded for 6 cards).
- **`photo-featured-bases.png` provenance settled:** the 1080p June claude.ai/design comp asset
  IS the original — nothing larger exists (Drive/videos/legacy swept). Bigger = re-generate.
- Danny eyeball owed: Stretch card headline sits on a light beige ceiling (weakest white-text
  ground); scrim = one-liner if wanted.

## Current state (2026-08-28 AM) — DAISYLINK RESEND INCORPORATED + MERCHANDISED SERIES ORDER (pushed with the PM ship)

**Byrne's "Daisy Link & Connectors" resend (5 STEPs) is fully in SpeX Studio; /products +
nav series order is now merchandised.** Detail: memory
[[reference-spex-3d-accessory-assets]] (8/28 block) + vault session log.

- **`64d9c3e` series order:** `marketedSeries` = **Foundation, Ultra, Elite, Trig** first
  (same set as browse `FEATURED`), rest alpha — drives /products hub + nav mega panel;
  `seriesCatalog` untouched (dashboard-port order). No Brian ruling on ranking exists (the
  April FLAGSHIP/VALUE/QUICK-SHIP badge ask died unanswered; the OLD site nav was itself
  merchandised: Ultra/Foundation/Fundamental/Trig top) — **Danny emailing Brian for the real
  ranking**; browse's post-featured tail still catalog-order (offered alpha, unruled).
- **`27b6762` DaisyLink:** 5 STEPs identified from PRODUCT roots (`42AP1 20A`=VAP plug
  infeed · `42 FF`=kit-included 12.3″ FF cable · `DAISY-T`=VT-MFM · HDMI/RJ45 keystones),
  converted (new origin semantics: under-table hardware = z0 at part top; keystones =
  flange face) + uploaded to `glb-models/accessories/`. Viewer: `geometry.companions` +
  **"top" anchor** — both Villa units render their flush cover (acc_villa-grom-f) in the
  tabletop, DL kit adds one FF cable. **Honesty rule: companions = ONLY what the SKU ships
  with; infeed/Daisy-T/keystones stay unrendered (no picker entry) but GLBs are bucket-ready.**
  Browser-verified 36/60/96, studio+classic, no console errors. Pipeline artifacts +
  8/28 report section in `~/Documents/Clear ph/Clients/TableX/3D Files/Dekko/_converted-glb/`.
- Residual CAD gaps (Cove 6″ round · hinged grommet · FM jumpers · Villa 2C/convenience DL ·
  Cove DL USB plates) listed in conversion-report.md; imagery rights + Neal draft send still open.

## Current state (2026-08-26 NIGHT) — DEKKO 3D FILES → SPEX ACCESSORY VIEWER SHIPPED (tablex-site `main`=`00ff5f8`, deploy ● Ready, live-verified)

**Byrne delivered the Dekko STEP CAD (15 files, Villa+Cove) and it went from raw delivery to
prod the same night**: SpeX viewer now renders Villa corded + Villa Daisylink GLBs under the
tabletop and procedural grommets at p.231 placement-letter locations. Full detail + gotchas in
memory [[reference-spex-3d-accessory-assets]] (8/26 block); reports:
`tablex-site/docs/reports/2026-08-26-spex-accessory-geometry-pilot.md` + `identification-report.md`
and `conversion-report.md` in `~/Documents/Clear ph/Clients/TableX/3D Files/Dekko/`.

- **Key facts:** all 7 numeric-named STEPs = Dekko PUBLIC part numbers (3 are Daisylink Sys-42
  bases — the empty "Daisy Link & Connectors" zip only owes interconnects: infeeds/Daisy-T/
  keystones; Danny requested resend). 12 GLBs converted (cascadio+trimesh, meters/Z-up, mating-
  plane origin, `acc_body/face/cord/metal` meshes) and uploaded to `glb-models/accessories/`;
  2 wired, 10 await passes. **Villa anchor = UNDERSIDE (body entirely z≤0 — the 8/04 "deck
  protrudes" assumption was wrong); Cove + grommet covers = TOP-surface drop-ins (unwired).**
  Grommets are procedural, never the VIL-GROM GLBs (those are Villa system covers).
- **Neal re-scope EXECUTED:** fresh Gmail draft `r3126663444885169282` (To Neal CC Brian,
  casters-only: LC-SC/LC1.5/SLC.3, stem-top origin) — **Danny send owed**; the 8/04 brief doc is
  now internal reference only.
- **Open:** Byrne resend + imagery rights (STILL unanswered, pre-launch blocker — re-raise with
  Conor together) · grommet letters on round tops = Mark/Brian question (viewer clamps into the
  silhouette as fallback) · remaining viewer passes (Cove anchors, -PD power placement letters,
  double kits, finish codes) listed in the pilot report · pre-existing `Toast.tsx`
  `react-hooks/refs` lint error (8/26 sweep, non-blocking).

## Current state (2026-08-26 PM) — FEEDBACK-BOARD TO DO SWEPT, 44 CARDS (tablex-site `main`=`b807605`, deploy ● Ready, live-verified via alias)

**The board's To Do column is down to one card.** Two commits: `b714faf` (Danny's 30 imagery
cards #355–387 — `inUseImagePos: center bottom` ×10 · colorblock swaps ×8 (App/Element/Exclaim/
VertiGo/Surge/Solo/Trig/Foundation, real shots + ColorBock @2560w) · NEW `spexImageScale` 1.35 ×6 ·
Foundation+Element configRender → nested Trans Shadow renders · Primary 80%/Ultra 73%) + `b807605`
(all 14 Site Audit PR#4/PR#5 cards #326–354, four parallel agents — highlights: SpecSheet `inert` ·
Xero mid-run 401 refresh + batched suggestion writes · `getActivePriceBook` React `cache()` +
`s-maxage=300` · desk feeds `resolveSpexPricing` its batched lookup via new `prefetched` param +
`accessoryModelCandidates` · **NEW `src/lib/series-links.ts`** owns the SpeX gate + hrefs (8 sites
migrated — extend it, never hand-roll) · browse explore pill `tabIndex=-1` + hover scoped
`group-has-[[data-series-link]:hover]`). 43 cards → review w/ comments; **#372 Exclaim
privacy-shield configRender stays todo — the shot in the slot is the ONLY such asset anywhere
(Drive+Dropbox verified); re-render ask filed in coverage-gaps #4.** #364 (SpeX qualifier line)
answered in comment — Danny to rule keep/cut/reword. Selector→fold map for future pin cards +
gotchas (deployment URLs 302 behind Vercel auth — verify via `tablex-site.vercel.app`):
memory [[project-board-todo-sweep-2026-08-26]].

## Current state (2026-08-26) — WHERE IT FITS SCENES SHIPPED ON 13 SERIES PAGES (tablex-site `main`=`d62fe3b`, deploy ● Ready, live-verified)

**Caleb completed 33 of 41 rows on the "TableX Series Pages - Real Shot List" sheet
(`1lh3dqg7BXKjhaAsl9WqOAJsqqsEn3fpoOd0DwioiJtQ`) — all processed and live.** Four parallel
agents visually QC'd all 43 Drive files (8000×4500), picked variants, cropped 4:3 at the
table's focal center, converted to `public/images/products/<slug>-<space>.webp` (cwebp q85,
1600×1200, 32 new files); wired via the existing `whereItFitsImages` field in
`series-detail.ts` (source filename commented per entry; Foundation's 2 XL entries kept).
**Element outdoor — the site's oldest photography gap — is CLOSED.** Unshot sheet rows
(honest space-photo fallback keeps rendering): Revel-Training · Justice-Training ·
VertiGo ×2 · Solo-Workplace/Training · Trig ×2. **Danny-eyeball flags (shipped as-is,
swappable):** Ultra-Workplace has an Apple-logo MacBook prop · Surge-Workplace whiteboard =
garbled AI pseudo-text · Justice-Cafe menu board reads "MOCNA" · Elite-Conference reads
private-office not conference. Variant picks + rationale: memory
[[project-where-it-fits-shipped-2026-08-26]].

## Current state (2026-08-25) — CALEB PHOTO ANSWERS DRAFTED + BRIAN'S MiA PIVOT (no code)

**Caleb's 8/19 spec questions (open-items thread `1a01a9504dcc7180`) answered in Gmail draft
`r-296426095177948346` — SEND OWED** (he nudged 8/24; Danny promised "asap today" and didn't).
Draft answers, grounded in tablex-site data: spaces scenes → Public Spaces = Puddle/Exclaim,
Healthcare = Foundation/Justice (from `series-detail.ts` `whereItFitsSpaces`; landscape OK, we
crop 4:5 at the table) · **warranty joint = pillar-to-legs structural WELD** (my call — matches
the "Frames, legs, structural joints" coverage row; Danny may swap to the underside mount) ·
grain = wood edge-to-edge, NO props (his attached refs = Freepik props-flat-lays → redirected to
the /finishes hero designer's-desk ask) · panels = Neal renders fine, match the 2 live on-white
shots, same table/angle across all five. Older-asks priority: Elite in-situ → Stretch classroom
→ finishes hero. Gotcha: Gmail MCP has no attachment-fetch tool — filenames only.

**⚠ Brian 8/21 (same thread): wants OFF "Made in America"** — FTC-compliance nerves (competitors
think they're import-only; a future import decision could kill the seal). Proposal: **"Family
Owned & Operated" + a non-flag icon.** Danny acked 8/24, NOT scoped. Touches
/about/made-in-america, the footer seal, and the MiA standing ruling below — likely supersedes
the pending per-line assembly-vs-origin verification. Byrne nudge `r-6804022004425057828` still
unsent (hard launch blocker). Memory [[project-placeholder-audit-2026-08-18]].

## Current state (2026-08-19 PM) — BROWSE CARDS (JSI) + TOP SHAPE FACET (tablex-site `main`=`2d14af3` PUSHED, deploy unverified by request)

**/products/browse series cards reworked to Danny's JSI spec + rail gained a "Top shape" facet.**
Memory [[project-browse-redesign-2026-08-09]] (8/19 update block) has the detail.

- **Cards:** trait pills → Pattern #17 metadata slash line (`slashTokens`, 13px) · identical
  swatch row + "106 finishes" REMOVED (same value on all 16 — Danny hasn't eyeballed, revertible) ·
  EXPLORE (outline → series page) + SPEX STUDIO (Ember pill → `/spex-studio/{slug}`, gated
  `inConfigurator` — Revel Explore-only). **Supersedes the P3 "enhanced Configure/Compare pills"
  ruling.** Card = outer div + Link block + sibling buttons (Link can't nest interactive children).
- **NEW `src/data/series-shape-facet.ts` is server-only by inheritance** (series-shapes →
  spex-book-map): computed in browse `page.tsx`, passed as plain records; client `import type`
  ONLY. Route stays static+ISR 5m. Labels normalized (Rectangular/Soft Rect→Rectangle ·
  Racetrack Oval→Racetrack · D-Shaped→D-Shape · Squircle→Slab); `?shape=` pass-through like
  `?app=`. Build-time throw guards against future tile truncation.
- **Facets NOT added without Brian/Mark:** casters (Elite answer pending) · price · height ·
  base type — Special T has them, our data can't back them honestly.
- **Deploy `e1v9hnod6` was Building at hand-off — Danny waived verification; glance next session.**
- **Also 8/19 PM:** the 8/11 "TableX Top Shapes" artifact's SVG downloads fixed (blob `<a download>`
  is sandbox-inert; now uses the `downloads` capability — which is ⛔ on publicly-shared artifacts,
  so Danny turned public sharing off; share pins also freeze viewers on old versions). 12 shape
  SVGs uploaded to Drive folder "Table-Top Shapes" (`1PPB9yDgmxyZD0D6ZDPZBbh5z6-vHqh_4`) — that's
  the team distribution path now.

## Current state (2026-08-19) — PLACEHOLDER REMEDIATION EXECUTED (tablex-site `main`=`9f0c833`, deploys ● Ready)

**The 8/18 audit's 23 slots are fully dispositioned: 7 filled / 13 owned / 3 intentional.** Brief
closed with final accounting inside (`tablex-site/docs/plans/placeholder-remediation.md`); memory
[[project-placeholder-audit-2026-08-18]] updated. Five commits: `3f7a912` (P0 sitemap +
Revel in-use) · `4fd4ed5` (spaces fold wiring) · `9d0b178` (docs) · `23c487d`+`9f0c833`
(/about story fold — Danny's `built-around-people-01.jpeg`, `~/Documents/Clear ph/Clients/
TableX/Assets/About/`, served as `about-story.webp`; Danny live-verified the last deploy).

- **Filled (7):** `/series/revel` in-use (`revel-inuse.webp` ← Drive `New 6-15-26/Revel/Revel2.png`
  — the "blocked on photography" call was stale, the asset existed) + **5 of 7 `/spaces/*` "What
  works here" folds** (Danny ruled: wire it). New `SpaceEntry.detailImage`; scenes pre-cropped
  1120×1400 at the table's focal center (no `detailPos` field needed); public-spaces + healthcare
  keep the honest greybox fallback. Plus the /about story card (8/19 PM).
- **KEY DISCOVERY: Drive `Horizontal Real Shots/WHERE IT FITS/` (Caleb, 8/13–18)** — 17
  use-case-keyed in-situ scenes (Workplace ×6, Café ×3, Outdoor ×3, Training ×3, Conference ×2),
  shot for exactly the spaces fold. Also: the 8/11 "V2 drop" = 44 files, ALL table imagery
  (ColorBlock/Trans/WhiteBG) — zero accessory content; the Dropbox Modesty Panel folder holds only
  the in-use Exclaim shot + an opaque-panel Revel shot that matches no null family honestly.
- **Owned greyboxes (13) all have a named owner in `photography-coverage-gaps.md`** (Danny approved
  "add all"): spaces ×2 → gap #1 · warranty joint/leg macros ×2 → #2 (no macro exists anywhere in
  Drive/Dropbox) · butcher-block grain ×2 → #3 (the new 8/13 `ButcherBlock3`+`_Extended.tif` are
  still SCENES — re-confirmed, keep not re-litigating) · 5 accessory panel families → #4 ·
  Daisylink infeeds + data keystones → **Byrne thread: nudge REPLY DRAFTED `r-6804022004425057828`**
  (to Conor, cc Mark/Brian/wiser; files + imagery-rights ask) — **send still owed, or Mark
  pushes Conor directly (floated in the 8/19 team email).**
- **8/19 team email SENT** (`r3476890660610392634`, Danny sent post-meeting): open items by
  owner with page links — Brian (OSU sign-off, manufactur- OK, territories, news, fits/casters/
  list exposure), Mark (r4 rows + grommet $45-vs-$89, codes 01/02/03/09/17/43 + Foundation 30,
  Element-33 green light, T-vs-TT, Elite casters), Caleb (gaps #1–4 + Elite/Stretch/finishes-hero),
  Kayla (home hero, poem fold, about hero, two-Ember, ops caps), launch date reset. **Answers to
  these drive the next sessions.**
- **P0 shipped:** sitemap spex entries now derive through the `inConfigurator` gate;
  `/spex-studio/revel` gone from `sitemap.xml` (16 spex lines = hub + 15).
- **Gotchas:** a killed-then-restarted `next start` can silently lose the port race to the OLD
  server — `lsof` + process start-time before trusting a verification curl · zsh does NOT
  word-split unquoted `$VAR` in `for` loops (a sweep loop silently ran zero routes).

**Also 8/18: `/products/collections` DELETED** (`b95bac0`, live 404). It was Brian's own 3/19
idea, parked by his own card #99 ("Series not Collection... introduce Collections after the
launch"), and had gone orphan — nothing linked to it, cards were non-links, 5 of 8 groupings
duplicated a series page or a `/spaces` use-case. History + the 4-item rebuild gate live in
`tablex-site/docs/plans/collections-post-launch.md`; the page itself is recoverable at
`git show 5640fc2:"src/app/(frontend)/products/collections/page.tsx"`. ⚠ `door-collections.webp`
is NOT part of that set — it's live on `/products`. Danny told Brian himself (8/19) — nothing
owed there. Memory [[project-collections-retired-2026-08-18]].

## Current state (2026-08-18) — PATTERN #17 RULES BAKED INTO DS + SITE POLICED (tablex-site `main`=`5640fc2`, both deploys ● Ready, live-verified)

**Full detail: memory [[project-pattern17-policing-2026-08-18]] + vault session log.** Two DS pushes (16 writes, plans `…b9c4a8ee83d7` / `…054f85202713`) + two prod commits (`067e487` grammar/glyphs/scale, `5640fc2` compare row + compact weight).

- **DS now STATES the StatStrip rules** it previously only implied — scale ladder, fixed colors, variant selection, and the NEW ground rule (see Standing rulings above). `03-COMPONENT-PATTERNS.md` #17 was REWRITTEN (it still taught the retired positional asterisk + leading separators + 22–28px scale — and SKILL.md routes generation at the pattern docs, so that stale text was what the design tool actually read).
- **⚠ `_ds_manifest.json` drift is now a THREE-instance pattern, and it's the highest-value thing to check first.** The slash-strip rule card was registered `1080x1100` against a real 1720 — **the pane was clipping off the scale-ladder + Do/Don't sections, i.e. the rules Danny said didn't exist**. Now 2470 after the ground section. **After ANY `@dsCard` marker change, grep the manifest.** Measure card height in a browser (`document.querySelector('.card').getBoundingClientRect().height`) — don't estimate.
- **The pane's "Add usage notes" field stores APP-SIDE ONLY** — nothing typed there reaches the file tree or survives regeneration. Durable rules go in the `@dsCard` subtitle + card body + pattern doc.
- **Site swept on all four dimensions** (grammar / glyph / color / scale) across 31 files: leading separators gone from all 6 hub-hero crumbs + /products eyebrows + trait strips · Ember misassignment to `/` fixed · `·`/`&middot;` retired as a separator on every marketing surface (~70, incl. the whole accessory data layer) · scale ladder applied · counts derived from `laminateCatalog`/`powderCoatFinishes`. **`&middot;` entities evade a `·` grep — always grep both.**
- **Exempt on purpose:** ops/portal surfaces + quote PDF (application layer) · styleguide "term · value" doc lockups.
- **Owed to Danny:** FinishesTeaser dark strip is borderline (items white/78% = muted, but slashes stone-300 where the rule wants ~40% white) — one-line fix, NOT shipped · the home finishes fold jumped 15–18px → 30px and wants an eyeball.
- **Gotcha:** polling `vercel ls` inside a shell loop with `grep` captures nothing (column mangling) — poll with `vercel inspect <url>`, or read the table unpiped.

## Current state (2026-08-14) — PUNCH-LIST AUDIT → BOARD + FINISHES PHOTOS SHIPPED (`main`=`e96eee5`, deploy ● Ready, live-verified)

**Full detail: memory [[project-punchlist-finishes-2026-08-14]].** This deploy ALSO confirmed the 8/10 browse arc (`201382e`) green on prod — that flag is closed.

- **Punch-list audit** (fresh-context agent, 65 routes; report `tablex-site/docs/reports/2026-08-14-frontend-punch-list.md`, committed). Two false-positive classes to remember: EmberBand filmstrip frames 6–8 report `naturalWidth 0` (lazy + off-screen in the auto-scroll track — NOT broken) · /products/collections tiles are real photos carrying a STALE `data-swap-later` flag (the `if (collection.img)` branch keeps it — card #306, 1-line cleanup).
- **/finishes fixes shipped:** 390px overflow (LaminateDoorArt 576px chip row → `max-[900px]:flex-wrap`) + Caleb's 8/03 `Specific Detail Shots` Drive drop imported (8 webps, local Drive mount — NEVER pull image binaries through the Drive MCP, base64 blows context) closing 7 greyboxes: hub doors 04/05/06, solid-surface folds + editorial band, custom macro slot. Grain swatch tiles stay pending (no usable flat-grain crop). ⚠ **Custom Graphics shots = OSU court branding (Kive) — Brian/Danny sign-off owed pre-launch** (flagged in code comments on both usages).
- **Board cards #301–315 filed** on the tablex feedback board as reporter **"Site Audit"** with real widget-grade pins. **NEW TOOLING for future reviews: `feedback-board-filing` skill** + `clearph-feedback/scripts/{file-findings.mjs,capture-selectors.browser.js}` (dry-run default, dedupe vs open cards; committed `d3b6f70`, unpushed). File audits to the board via the skill; md report keeps methodology/negatives.
- **Email state (8/14 catch-up):** Dekko thread rerouted to **BYRNE** — 8/06 reply to Brad Dove WAS sent (incl. imagery-rights ask, unanswered); Conor Regin `reginc@byrne.com` is the contact; **Mark signed the Byrne NDA 8/10; files + rights answer pending → NUDGE CONOR.** Caleb uploaded V2 transparent/white-BG product images 8/11 (Drive, `V2` suffix — unchecked). Kive access approved by Brian. Weekly meeting moved to Fri 8/14 11am EDT.

## Current state (2026-08-10) — BROWSE P1 BUILT, tablex-site `918d31d` LOCAL/UNPUSHED

**P1 (browse two-mode) is BUILT + fully verified, committed to tablex-site `main` locally — NOT pushed. Ship on Danny's word, then P2 (accessories editorial strip).** All checklist items passed: route static+ISR 5m · 1920/1280/390 · URL round-trips both modes (series facets ride the URL too — checklist requires reload-restore in BOTH modes) · cold-load `?item=` opens, Back closes (browse-params carries its OWN popstate listener — Next doesn't guarantee a router sync on popstate over native-history entries) · exactly 10 Villa 36/48 double kits N/A · r4 backfills ($45 grommet/$104 -MD) live · 7 greyboxes · no hardcoded $. New: `browse/{BrowseHero,BrowseClient,SeriesBrowse,AccessoryBrowse,AccessoryCard,AccessoryDetailModal,browse-params}` + `lib/pricing/accessory-rows.ts` + `marketing/browse/{CheckPill,FilterGroup}` (grew `appearance:"rows"` + `disableZeroCount` for P3); `BrowseAll.tsx` DELETED; `accessories.ts` gained verified-only `fits`. ⚠ Verification gotcha: `[role="dialog"]` probes false-positive on the SiteHeader mobile menu (aria-label "Menu", always in DOM). Hero finish count now derives 106 (was hardcoded 97). Memory [[project-browse-redesign-2026-08-09]].

## Current state (2026-08-09→10) — BROWSE TWO-MODE REDESIGN SHIPPED (P1+P2+facet overhaul; P3 remainder open)

**Danny's direction from the Accessories Wireframes round (claude.ai/design project `bcdc58f4-9b66-491c-a46a-6c545bb07313`, option 1c "two-speed"): split the speeds across two pages** — `/products/accessories` goes ALL-EDITORIAL and brief; ALL dense model/price data moves into `/products/browse`, which gains an **Accessories mode** (toggle: Table Series | Accessories, own filters, card click → detail modal/drawer). Ruling: **"design this interface fully before we do anything"** — no code until the design round settles it.

- **Execute from `docs/browse-redesign-plan-2026-08-09.md`** (checkbox plan) + `docs/browse-redesign-prompt-2026-08-09.md` (ready-to-paste claude.ai/design prompt, 3 versions: A modal detail · B in-card drawer · C hybrid; check detail at ~1280 — that width decides modal-vs-drawer). Both local (`docs/` gitignored).
- **Browse audit (verified):** "Design trait" facet = all 49 free-text tags alphabetized (~40 count-1, adjectives + facet duplicates) · Workspace facet doesn't discriminate (Workplace 16/16) · static pill counts → selectable zero-result combos · cards = one link, zero actions (no SpeX configure, no compare — `/products/compare` exists UNREACHABLE), identical swatch row on all 16 · no URL state · sort Featured(hardcoded)/A–Z.
- **Phasing:** P1 browse two-mode build → P2 accessories editorial strip-down (**⛔ NEVER before P1** or live price tables vanish from the site) → P3 series-side overhaul (curated Attributes facet via NEW site-side `series-attributes.ts` — `series.ts` must stay byte-identical to the dashboard port; live faceted counts; card action row; compare tray + `?add=` seeding).
- **Architecture traps pre-solved (in the plan doc):** browse `page.tsx` stays static+ISR 300, NEVER reads `searchParams` server-side (silently flips dynamic) · `BatchLookupResult.byModel` is a `Map` — not RSC-serializable, extract `buildRows()` → `src/lib/pricing/accessory-rows.ts` (plain pre-formatted records; client never computes a figure) · URL state client-owned via `browse-params.ts` (`pushState` on `?item=` so Back closes the modal) · modal template = `FinishPickerModal.tsx` (NO Radix in repo) · `<Link>` can't nest interactive children (series card → div + stretched-link) · 19th accessory card = "Table options" pseudo-family for the 7 suffix options · new `fits?: TableCompat[]` field VERIFIED-ONLY (power/wire = ask Brian).
- **8/10 PM: SHIPPED TO PROD — tablex-site `main`=`201382e` (`918d31d` P1 two-mode · `ec2239e` slide-over Lenis fix · `d71396d` Attributes facet · `201382e` P2 editorial accessories). Deploy CONFIRMED green 8/14 (live spot-checked with the `e96eee5` ship).**
  - **Facet overhaul (P3 piece pulled forward):** 49-tag Design-trait facet DELETED (42/49 count-1 adjectives; tags stay card chips) → NEW `src/data/series-attributes.ts`, 4 attrs derived ONLY from structured fields (Height-adjustable 9 / Nesting & folding 9 — moved OUT of Application, now 6 use-cases / Outdoor-rated 1 / Configurable online 15). Workspace dropped from rail (Workplace 16/16). URL `ws`/`tag` retired → validated `attr=`. NOT added without Brian: Mobile filter (nesting series roll but only App/Element/Solo tagged — false-negatives), specialty tops.
  - **P2:** /products/accessories = fully STATIC editorial (zero pricing imports, revalidate dropped): dark Power+data lead band, 3 alternating folds, compact carts row, options chip strip, slim downloads; folds link `?view=acc&cat=…`. **⚠ Design-export body copy FABRICATED fabric-wrapped/sliding privacy panels (catalog = laminate/frosted acrylic only)** — fold ¶s are accessories.ts ledes VERBATIM, only claim-free headlines carried. Power fold art = one-line swap pending Dekko.
  - **Lenis gotcha (burned twice):** ANY overlay/rail scroll container on a marketing page needs `data-lenis-prevent` (+ body lock for overlays, MobileNavDrawer pattern) or Lenis swallows its wheel and scrolls the page. `(spex)` templates never show the bug — that group doesn't mount Lenis.
  - **P3 REMAINDER:** `enhanced` Ember pill Configure/Compare on cards (RULED yes 8/10, unbuilt) · live cross-faceted counts + zero-count dimming · compare tray + `?add=` seeding.
- **8/10 AM: DESIGN ROUND DONE, ALL DANNY GATES CLEARED — P1 BUILDABLE.** Export unpacked at dashboard `docs/Accessories/` (4 `.dc.html` screens + `catalog-data.js`, DS attached under `_ds/`). **Rulings: detail mechanism = right-side slide-over panel (the export's `mechanism="modal"` variant — ⚠ its "drawer" means in-place card expansion, not a side panel) · SeriesMode `enhanced`=true (Ember pill Configure/Compare) · "From $X list" = YES, LIVE from the active book (cents, labeled, omitted when a family has unpriced models).**
- **Open:** Brian on `fits` for power/wire · Dekko rights still unanswered and P2 raises Villa render prominence.

## Current state (2026-08-02→03) — SPEX STUDIO 2.0 VISUALS = PROD DEFAULT (`ff0ba6f`, reconciled 8/03)

**8/02 autonomous cloud run (branch `claude/spex-studio-configurator-visuals-lcdp0v`, fast-forwarded onto tablex-site `main` = `ff0ba6f`; hook prod deploys green 8/03; Danny reviewed live and ruled "flip 2.0 to be the default"). Read `tablex-site/docs/reports/2026-08-02-spex-studio-visuals-run.md` before touching Spex visuals.** Memory [[project-spex-studio-visuals-2]].

- **Studio mode** (`visuals.ts` `DEFAULT_SPEX_VISUALS="studio"`): Lightformer env → local cubemap (no CDN HDRs) · dual footprint-fitted contact shadows (mushy blob gone) · **physical-inch UV/texture pipeline** (1 UV unit = 1″; fixes laminate scale drift + 1.6× grain stretch; mirrored-repeat bookmatch) · warm seamless-cyc backdrop · **drafting-grid floor** (12″/60″, render-layer-1-isolated). **Classic is byte-identical behind `?visuals=classic`** (0-pixel verified; param read from the NAVIGATION TIMING entry, not `location.search` — replaceState rewrites the query first); rollback = flip the constant.
- **Built-then-REMOVED same day at Danny's rulings:** Spaces scene backdrops ("a bit of a bust" — design kept in the report as history) · dashed witness-lines floor (`d8cc185` in branch history) · the soft-launch landing beta band (removed with the default flip).
- **Gotchas:** drei 10.7.7 ContactShadows — ANY `position` y-offset (even 0.001) renders the bake EMPTY, planes stay exactly y=0 · floor-plane geometry must set `layers` explicitly (bakes run layer-0 cameras; three.js layers don't inherit) · physical-UV fixes are studio-only (classic keeps the wrong math bug-for-bug).
- **Open:** 3 laminates on diamond-chip fallback (Nordic Linen + 2 Formica woodgrains — no vendor sheets) · 1280px scans soft at extreme zoom · revisit `envMapIntensity` if chrome bases ship. Also on main from 8/01: `whereItFitsSpaces` curated lists + corner-aware Catmull-Rom silhouettes (`abf71a8`, `e5a6842`).

## Current state (2026-07-31) — /products/browse TRANS SHADOW TILES — SHIPPED 7/31 PM (`74dc57a`)

**Danny-driven browse redesign — ~~uncommitted~~ SHIPPED with the hub-hero sweep as `74dc57a` (see the 7/31 PM ship note under the PL MASTER block); all live spot-checks pass.** Session log `2026-07-31-tablex-quoting-dashboard-browse-trans-shadow-tiles`.

- **NEW Trans Shadow generation is canonical sitewide:** Drive `Product Shots/Square Product Shots/Square Trans Shadow/` masters → `public/images/products/<slug>-trans.webp` (16 files, cwebp q85 @1600px); all 16 `spexImage` fields repointed with source-filename comments (old `<slug>-spex.webp` June gen left on disk unused). Ripple ACCEPTED: SpeX studio grid, series-page Configure-online spotlight, /products door art inherit (all `object-contain`; SpeX grid spot-verified — upgrade).
- **Browse tiles (Danny's spec):** `aspect-[533/630]` exact (0.846 — 533=13×41, doesn't reduce) · flat `bg-canvas` ground · `object-contain p-[3%]` · base `scale-[1.2]`/hover `1.24` · page body `bg-canvas`→`bg-white` so tiles read as fields. Foundation spotlight = same treatment at `scale-[1.7]` (landscape panel × square render fits by height).
- **Hover crossfade to the series ColorBlock** — Danny's deliberate editorial-on-product-surface exception to the 7/25 taxonomy (commented in code). Via `seriesImage(slug,"editorial")`, renders ONLY when `category==="colorblock"`; `colorBlockPos` centers the table; fade lives on a wrapper div so it can't fight NoGhostImage's load reveal.
- Gotchas: `motion-reduce:transform-none` would strip a base transform scale — use `motion-reduce:group-hover:scale-[…]` to freeze instead · square masters have baked margins, so bigger-than-contain = transform scale (overflow-hidden guards) · NoGhostImage tiles screenshot EMPTY pre-paint (wait ~2s, re-shoot).

## Current state (2026-07-30 EVE) — HUB-HERO SWEEP — SHIPPED 7/31 PM (`74dc57a`)

**Danny-driven design sweep — ~~uncommitted~~ SHIPPED 7/31 on Danny's "ship it": combined prod build green → `74dc57a` (with the browse tiles) + `33ea5c6` (pricing r3) → hook deploy `pf7td2not` Ready → live spot-checks pass (all 5 hub heroes, surge series hero, spex disc serving the new webps).** Full detail: session log `2026-07-30-tablex-quoting-dashboard-hub-hero-sweep-uncommitted`.

- **ALL five hub pages now share the /products hero mechanism** (full-bleed 90vh, `-mt-[78px]`, dual scrim, `/ Hub / crumb` eyebrow, `.text-h1`/`.text-lede`, bottom-left copy): /spaces (ElementOutdoorReal4), /finishes (raking-light photo; walnut bookmatch tile experiment superseded, tile left on disk; chips HIDDEN inline `display:none` — may return; h1 now "Details Define the Space."), /resources (white-table shot, `center 55%`), /about (trig-cropped sage room; lede = Brian story phrases + ONE invented sentence — **Danny eyeball owed**). SiteHeader overlay list grew: +/spaces +/resources +/about.
- **PullQuotePanel** (ALL consumers): single oversized Ember Acumin `“` opener — hung in left margin md+, stacked above on mobile; closing mark REMOVED. (Mirrored/U+201F alternates rejected: upside-down / fallback-font risk.)
- **Series pages**: h1 ↔ eyebrow SWAPPED (name is the h1; headline rides the eyebrow). Surge hero → `surge-colorblock-3-crop.webp` (landscape).
- **/products**: series-index numeric prefixes REMOVED; hero bg `center 40%`.
- **/spaces**: Outdoor tile finally real (`space-outdoor.webp`, new `SpaceEntry.imagePos` field, `center 72%`) — outdoor coverage-gap slot closed; grid hairlines/links bottom-anchored (`mt-auto`), rows `gap-y-16/20`; divider band = classroom scene, `clamp(560px,72vh,840px)`.
- **/spex-studio**: mask disc = AppColorblock2-crescent scene, `scale-[1.18]`, caption → App.
- New gotchas: mid-turn pasted images live at `~/.claude/image-cache/<session-id>/N.png` · claude-in-chrome `resize_window` reflow lands LATE · `/finishes/laminates` hero NOT hub-matched (flagged, unanswered).

## Current state (2026-07-31) — PL MASTER: ALL 8 ANSWERED · SURGE BUG FIXED AS JAN r3 · IMPORT HELD ON UPDATED WORKBOOK

**Brian answered all 8 questions inline 7/31** (msg `19fb85d60a4bf673`; Solo side-ruling `19fb44539265f91c`). **Every confirmed rule + the full import/schema/tier-selector design is codified in `tablex-site/docs/plans/2026-pl-master-import.md` — the import session reads THAT.** Memory [[project-2026-pl-master-workbook]]; workbook still in `~/Downloads/`, ⚠ internal COST master, never publish.

- **Surge "outlier" was OUR book's bug, FIXED LIVE:** Brian's "$989 is essentially our cost… PDF shows $2,049" → verified against `1.5.26-TableX-Pricelist.pdf`: 9 Surge FD/NE rows had absorbed their Static sibling's 3P/3K/3W at extraction (sibling of the 7/22 size-corrections family — sizes were re-read, prices weren't; book-wide sweep confirms exactly 9 rows). Published as **"January 2026 List (r3)"** (`b5d1ffdd-…`, effective 7/31) via `scripts/pricing/apply-surge-price-correction.ts`; live API confirms r3 active. Corrections table: `data/pricing/2026-01-list/price-corrections-2026-07-31.md`. Public SpeX never served a wrong number (STATIC-preferred); desk book-refs did. Regenerated `spex-model-map.json` + report (rows identical, provenance header only) shipped in `33ea5c6`.
- **Confirmed rules (highlights; full set in the plans doc):** tier $-adders deliberate (+15/+35% prices the TOP only — "Smith 3P WA 2+" col) · **knife edge = derived add-on** (50% rect/sq / 35% rounded of that col, round up, Ultra NA) · round all lists UP to whole dollars · casters $111=4, disc bases 5, Exclaim/App NA, Elite pending Mark · **Fundamental DISCONTINUED** (manual/on-request only) · VertiGo RA eliminated · conflicts = Revel scratch rows + Example tab (series/function tab wins) · **Solo → NEW series code 11; 33 becomes exclusively Element** (Element-33 wiring unblocked, do at import; ⛔ bucket `33/` GLBs = Fundamental geometry, re-key first).
- **Import HELD on Brian's UPDATED workbook:** must add Elite VTR + D-shape families, rounds verdict (his "only Trig's 6" answer misses the ~226 RD/drum models the Jan book prices — challenged), SL/Squircle pricing (75 models), 377-new-model verdicts, ACCESSORIES→OPTIONS relabel, Solo renumbered 11, Elite caster review. **Follow-up draft `r-6197595079564996918` awaiting Danny's review/send.** Tier picker builds AFTER import.

## Current state (2026-07-30)

**tablex-site `main` = `050b6df`, ALL LIVE** (7 hook-fired prod deploys, each verified; session log `2026-07-30-tablex-quoting-dashboard-colorblock-heroes-products-feedback`):

- **ALL 14 marketed series pages now open on a ColorBlock hero** — Danny hand-picked each from Drive `Horizontal Shots/ColorBock/<Series>/` (source filename in a comment above every `heroImage` in `series-detail.ts`; new webps named `<slug>-colorblock-<n>.webp`). **Supersedes "heroImage = Real Shots"** — do NOT revert heroes to Real Shots; old `*-hero.webp` files left on disk unused. Revel untouched (still real-shot hero; only series without `inUseImage`, so the in-situ fallback stays honest. ⚠ Artisan + Puddle: hero ≡ colorblock-fold asset (only one ColorBlock each exists) — on-page duplication, flag to Danny/Brian).
- **`COLORBLOCK_GAPS` = EMPTY** (`series-imagery.ts`): the Drive **horizontal** ColorBock folders were FULLY POPULATED all along (7/25 "empty" audit = Drive-mount hangs; memory corrected). Elite/Justice/Artisan/Puddle wired; /products index rows now uniform ColorBlock 15/15.
- **Brian's /products cards cleared to review** (feedback board): **#266** → /products hero is now FULL-BLEED (ExclaimXL + series-hero dual scrim, `hero-products-full.webp`). **#74 Revel** → no change needed; provenance nailed: Brian's 7/22 9:07am card comments ("leave everything as is") were superseded by HIS OWN words on the 7/22 11:00 weekly call (Fireflies `01KY06HP4V3JCRRQ4GJ23TB3R0` ~07:02: "take Revel completely out of the configurator… reintroduce as just a training table"). Both cards commented as the danny@clearph.com feedback user (`92d1ae3d`). Offered-but-unposted: a timeline comment on #74 so Brian isn't confused by his own stale comments.
- **TriBlock outer doors align to the page gutter** (`--spacing-container` on first-door left / last-door right; stacked = both) — SEE IT row now matches header margins.
- **Home fixes:** EnvironmentalBand taller + top-biased crop (`1920/820`, max-h 51rem, `object-[center_30%]`) — flip-table tops no longer clip · FinishesTeaser powder count now DERIVED (`powderCoatFinishes.length` = 40; was hardcoded stale "31 total" + "+19 more").
- **Gotchas hit:** dev/prod screenshot of a priority-image hero can catch PRE-PAINT (solid dark fold ≠ bug — re-shoot first) · `vercel inspect` takes a deployment URL, never a project name · React splits `{expr}` text nodes in served HTML — grep fragments, not sentences · transient macOS DNS outage (8.8.8.8 dead, raw IP fine) broke `git push`; 20s retry loop recovered it · feedback `task_comments` needs `site_id`; `feedback.users` column is `full_name`.

## Current state (2026-07-26→27)

**tablex-site `main` = `2852ebe`, ALL LIVE ON PROD** — but via CLI: ⚠ ~~the GitHub→Vercel auto-deploy hook is BROKEN~~ **HOOK CONFIRMED FIXED 7/29** (3 consecutive hook-fired prod deploys: `8b29f3c`, `21c4f6a`, `1a15f66`; `web-vercel-hook-fix` done) — "ship it" = plain push again (CLI `inspect`/`ls` still need `--scope dbreckxs-projects`; default context is dannys-projects). Nine commits `f8383ba`…`2852ebe`, memory [[project-nav-hub-first-megamenu]]:

- **Buttons ALL-CAPS sitewide + 280px pill min-width** (Kayla's Figma; `uppercase` class — source strings stay lowercase; compact contexts exempt; ops untouched). DS casing rule updated (lowercase pills RETIRED).
- **Hero = two-pill Figma composition** (#268 Ember pill REMOVED — Danny reverted Brian's ask; white pill is now the `/spex-studio` door; one-ember-per-fold restored) + **looping video bg** `public/videos/hero-03.mp4` (photo = buffering poster + reduced-motion fallback; 35% black cover). **Video pipeline: NEVER ship a premiere master — transcode** (`ffmpeg -crf 25 -preset slow -an -movflags +faststart` → 15Mbps/51MB → 2.5Mbps/8.6MB).
- **Demo hides** (inline `style={{display:"none"}}` so Danny re-enables per-element in devtools): hero wordmark + eyebrow + lede, header Request-a-Quote pill.
- **Nav ruling REVERSED → hub-first mega menu** (see Standing rulings): `NavMegaPanel` glass panel (`bg-canvas/[0.90] backdrop-blur-[6px] rounded-b-2xl`, type 16/15/12px, column block `max-w-[620px]`), truly transparent header over hero pages → `bg-canvas/[0.97]`+hairline on scroll/panel-open (old black scrim+blur RETIRED), `marketedSeries` in `src/data/series.ts` = the ONE lineup rule (catalog minus Revel — NOT `inConfigurator`) shared by /products hub and nav; drawer got Fold accordions + `[inert]` focus-trap fix.
- **DS synced BOTH ways 7/27:** both 7/26 waves (buttons + nav) pushed to claude.ai/design — 19 files, `Nav.jsx` read back verified. **New DS gotcha: `_ds_manifest.json` is a SECOND compiled artifact** (card subtitles/viewports) — re-sync it whenever an `@dsCard` marker changes, same trap family as `_ds_bundle.js`.
- **Open:** two-Ember collision when the quote pill returns (panel hub arrow shares the fold — quiet the pill while open, or exempt chrome?) · do /ops buttons adopt all-caps? (left sentence-case, separate language) · DS `structural-color-block` card is still soaked in banned shop-floor copy (pre-existing, flagged — Danny/Brian rewrite) · hand-QA owed: keyboard pass, reduced-motion, iPad two-tap, drawer accordions.

## Current state (2026-07-25)

**tablex-site `main` = `7a7b539`, both commits LIVE on prod** (deployments `fn5vdvh5f`, `fwtignepw`). Two systems codified the same way — **a shared module derives the answer so a call site cannot get it wrong**; extend those modules, never hand-roll:

- **`src/lib/slash-strip.ts`** — Pattern #17 punctuation (`a26dd92`). See the standing ruling below. 19 instances existed, 15 were wrong; 3 surfaces hand-rolled it inline. Fixed a live "31 paints" (should be 40).
- **`src/lib/series-imagery.ts`** — photography category from LAYOUT CONTEXT (`7a7b539`). See the standing ruling below. Verified live: **zero Real Shots on any product or editorial surface.** Memory [[project-imagery-taxonomy]] + [[reference-tablex-photography-library]].

**DS pushed to claude.ai/design `278dcca1`** (18 files, read back to verify): slash-strip rule card, imagery §6 + Patterns 14/15/19/21, `imagery-direction.html` rebuilt, series card / FeaturedCollections / EmberBand off macro crops onto real ColorBlock. Also fixed there: a **"Process / maker — shop floor… we give tours" imagery lane that told agents to commission banned photography**; `photo-collection-app.jpg` ≡ `photo-ember-circle-1.jpg` **byte-identical** (one asset doing three jobs → new "one asset, one role" rule); **Adobe kit ID said `ucn5jze`** (Peregrine — TableX is `juc1jwq`).

**⛔ Two Kive.ai AI-GENERATED images sit in the Drive real-photo library** — `Vertical Real Shots/New 6-15-26/{Justice,Ultra}/Generated with Kive.ai - kive-image-*.png`. All 16 folders swept; only these two. **That folder is the recommended import source for Revel's missing in-use shot** — quarantine before importing. No evidence either reached the site.

**Owed to Danny/Brian:** series-page hero (15 pages of full-bleed Real Shots — portrait ColorBlock into a landscape slot, design call) · Ember-band→ColorBlock was my call, revertible · **`01-BRAND-VOICE-AND-COPY-LIBRARY.md` still carries "Our welders are welders… we give tours", "FROM THE SHOP FLOOR" as an approved eyebrow, and §11 "we make the tables, in our Midwest shop"** (imagery instructions fixed; copy is Brian-adjacent) · delete the 2 Kive files · ColorBlock shoot for Justice/Puddle/Artisan/Elite. **Check `EliteXL.jpg` + `RevelXL2.jpg` first — both exist unused in Drive and may already answer two of Caleb's asks in `photography-coverage-gaps.md`.**

## Current state (2026-07-23)

**Repos:** tablex-site `main` = `d0d3fcd` (prod auto-deploys from `main`). Dashboard `main` = `baf5091` (Vercel hub `danny@clearph.com`, repo `github.com/dbreck/tablex-quoting-dashboard`).

**7/23 PM: DESK TIER SELECTOR + /ops/flow WALKTHROUGH + DEALER PRICING** (`f26c32b`→`d0d3fcd`, all live-verified; reports `tablex-site/docs/reports/2026-07-23-desk-tier-selector.md`; memory [[project-pricing-wired-2026-07-23]]): **Tier selector** (`f26c32b`, tracker `web-desk-tier-selector` in-review) — `setQuoteTier` (ops re-verified, `z.enum(TIER_VALUES)`, SEND_QUOTE_FROM race-guarded WHERE, writes `quotes.pricing_tier` ONLY, optional net recompute + coherent rollup) + `TierSelector` in the desk's Pricing summary (recompute checkbox default ON); `LinePricing` keyed on `lineId:tier:savedCents` (uncontrolled+key — inputs follow revalidation). Verified on TX-2026-0006: 50/20 → $366.40/−$549.60/×0.40; dealer + archived POSTs rejected. **`/ops/flow` two tabs** (`228c55e`, `db4e3a3`) — Pipeline (diagram; stale dashed book-edges fixed to solid) + Walkthrough (7-step quoting demo, real screenshot crops `public/images/ops-flow/` w/ lightbox `ShotFigure`; re-shoot crops when desk UI changes). **RULING SUPERSEDED (Danny, `d0d3fcd`): dealer quote page + send email now show FULL pricing once ISSUED** (quoted/accepted — same gate as the PDF; draft/submitted/revising leak nothing): hero net total, per-line list/net/total, subtotal→tier-discount→net block; email carries the same breakdown ("no reason they should have to open a pdf"). PDF = records, not discovery. **Rep surfaces still zero-dollar** (untouched; ask Danny re parity). Pre-existing PDF nits found (NOT fixed, out of scope): U+2212 minus renders blank (discount unsigned) + `fixed` footer/page numbers don't render — both reproduce in TX-2026-0005's PDF.

**7/23: PRICING WIRED — book → quote desk + SpeX, LIVE** (`8b2c6cc`→`5505fea`, 4 commits, adversarially reviewed pre-push + live-verified end-to-end; report `tablex-site/docs/reports/2026-07-23-pricing-wiring.md`; memory [[project-pricing-wired-2026-07-23]]): **Mark's typo ruling applied as book revision** — `scripts/pricing/apply-mark-typo-ruling.ts` cloned→renamed `08TC3036V26NE`→`08TC3048V26NE` (audit actor `mark-fleck`)→published; **"January 2026 List (r2)" (`f3a0424a`) is the Active book, ZERO size flags remain** (flag is derived from model digits — rename cleared it). NOTE: the original book's DB effective date is 2026-07-23 (Danny published same-day), not the 1/1 the docs assumed. **Runtime bridge** (`991dcce`): map generator also emits `src/data/pricing/spex-model-map.json` (server-only; regenerate+commit per revision); `src/lib/pricing/spex-book-map.ts` (config code→variants STATIC-first w/ doubled-size dialect; `getSeriesOfferedMatrix`); batch `lookupModelsListPrices`; `EDGE_PRICE_KEY_CHAIN` pvc-3mm→[3P,3P75] / knife-edge→[3K] only. **Desk** (`939c6c0`): per-line book reference (model/size/edge-resolved list/provenance, red oversize; honest no-match/no-edge fallbacks), editable line pricing (both-or-neither list+net enforced client+server, $0–$1M cents rail, `sku` re-derived server-side, "Use book price" prefill w/ server-computed net), subtotals roll over fully-priced lines only, Pricing summary card (tier ×factor / list / discount w/ `+$X` surcharge guard / net); **send-quote GENERATES its own PDF** (@react-pdf/renderer `quote-pdf.tsx` — manual upload REMOVED; ≥1 fully-priced line + note required; generate→upload→conditional-stamp never half-transitions). ~~Dealer/rep pages still render zero dollar figures~~ (SUPERSEDED same day — see 7/23 PM block: dealer page+email show full pricing once issued; rep still zero-dollar). **SpeX**: public `/api/spex/price` (LIST-only, validated, force-dynamic+5min cache), toolbar "List $X" live (derived cache-state, quote-only fallback), spec-sheet Catalog model row, red "Oversized pallet — $300 NET surcharge per order", base×size enforcement (size offered iff ANY base priced at that series+shape+size; book-absent CAD shapes hidden — Elite 22→10 shapes, Ultra TA gone; base-dialect combos stay selectable quote-only; unknown-to-book series untouched). Desk and API share one variant walk (can't disagree). Series-page "Live pricing" claim NOW TRUE. Review caught+fixed: partial-pricing rollup incoherence + double-signed discount (MAJOR), PDF effective-date UTC off-by-one, variant-walk divergence (latent), PDF size rail. Demo quote TX-2026-0005 now `quoted` w/ generated PDF attached (walked live: prefill→save→$3,329→send→PDF inspected page-by-page). **Follow-ups:** ~~multi-base `(N)` dialect~~ FIXED `169815e` (suffix-tolerant fallback, 91 codes — Ultra rounds price everywhere; same commit auto-prefills desk line inputs w/ book list+tier net per Danny's TX-2026-0003 walkthrough; remaining honest gaps there = Elite 20×36 V-base not sold + 3K N/A on Ultra rounds) · legacy T-Mold-era lines price manually by design · TableXpress/QS pricing unwired (19/50 map coverage) · orphaned bucket objects on re-send (ledgered).

**7/22–23: ADMIN ▸ PRICING SHIPPED + BOOK PUBLISHED** (`51235bd`→`cd32da4`, 9 commits; report `tablex-site/docs/reports/2026-07-22-admin-pricing.md`; full play-by-play in memory [[project-admin-pricing-2026-07]] + vault logs): the site DB is the pricing source of truth — versioned price books (3 migrations; published books DB-immutable incl. DELETE guard, Active derived from effective dates = cron-free scheduling, atomic expected-count bump RPC), seed pipeline from the Codex Jan-2026 extraction (2,949 models / 8,183 price cells, byte-clean CSV round-trip), `/ops/pricing` ADMIN-only workbench (virtualized grid: $ cells, Enter-walks-down editing incl. SIZES, flagged-sizes filter; % bump preview→apply over explicit scope; diff/audit; publish/revise/archive; CSV escape hatch). Adversarially reviewed pre-push (math HELD under 13.9M-check probe; 9 findings fixed `cff65ae`). **"January 2026 List" is PUBLISHED (effective 2026-01-01) = the active pricing record.** Extraction's 120 misaligned sizes were machine-resolved pre-publish (6-agent PDF re-read, 119 corrected w/ audit actor `pdf-verification`; 1 left flagged ON PURPOSE — `08TC3036V26NE`, the printed book itself is mis-typeset, Mark to referee). **SpeX↔book bridge SOLVED** (`c0624ee`): model numbers are a full grammar, SpeX availability tokens = same morphemes; `data/pricing/2026-01-list/spex-model-map.csv` (2,657 rows, 0 ambiguity) + report = Mark's pre-read; his task is VALIDATE not construct (4 bounded CAD-vs-book questions; ~~CAD `33` = legacy Fundamental trap~~ WRONG — Mark 7/23: 33 = Element). Meeting items shipped 7/23 (`1be30fa`/`633c814`/`cd32da4`, prod-verified): same-day-answer → "typically within one business day" sitewide (+ stale 31→40 powder-coat fix) · **Revel OUT of SpeX** (`SeriesEntry.inConfigurator:false`; hub=15 Base Series; `/spex-studio/revel` 404s; `/series/revel` keeps page minus configure doors — answers most of #74) · **`/ops/flow`** quote-to-cash SVG diagram (live-vs-planned honest, feedback-widget-annotatable, nav Operations→Quote Flow). ~~Book facts flagged to Brian (emailed): "+5% woodgrain laminates" (4 SKUs), sample-PO "50/10" not in tier enum, $125 lift-gate unstored~~ **ANSWERED 7/27 — see "7/27 BRIAN'S BOOK ANSWERS" below.** ~~NEXT SESSION = wire pricing~~ **DONE 7/23** (incl. the demo-walkthrough scope adds: editable line pricing, tier discount, auto-PDF) — see "7/23: PRICING WIRED" above. Demo quote `e029322b-803f-4b5c-9d32-f9569b368ee0` (TX-2026-0005) is now `quoted` with a generated PDF attached (dealer layout admits admins — walk both sides).

**7/23 MARK REPLIED** (Gmail thread "TableX pricing — now managed on the site", inline red): **#4 typo REFEREED — `08TC3036V26NE` should be `08TC3048V26NE`** (30×48 group placement was right; model number is the misprint) → ~~owed~~ **APPLIED 7/23 as book revision r2** (see "7/23: PRICING WIRED"). **#3 dims: "20 x 60" = 20" depth × 60" length** (configurator labeling convention confirmed). #1 he offered a working session (he replied to the FIRST email — hasn't absorbed that the map already exists); #2 deferred ("we can discuss"). **Ruling (Danny 7/23): NO working session — async instead.** Reply **SENT 7/23** (to Mark cc Brian+Arabella, w/ `spex-model-map.csv` attached). ~~Brian still silent on his 3 items~~ ANSWERED 7/27 (next block).

**7/27 BRIAN'S BOOK ANSWERS IN** (email to Danny cc Mark+Arabella, inline red; decisions stamped `dec-woodgrain-5pct` / `dec-tier-50-10` / `dec-freight-charges`; implementation task `web-book-rulings-0727` in Sprint 7): **(1) Woodgrain +5% is DEAD** — "no longer would apply to the end user since we are doing our 3 tiers: Core, Select & Luxe." Do NOT implement the book's +5% note. **(2) 50/10 IS a real tier — ADD to the enum** ("50/20 is our standard. 50/10 would be a tier we would need" — for difficult dealers who don't get 50/20). Touches `TIER_VALUES` z.enum, desk `TierSelector`, `setQuoteTier`, PDF/dealer surfaces. One dealer gets 50/20 **only when order total > $3000** — handle per-quote via the desk tier selector (manual desk call, no engine logic). **(3) Freight confirmed:** $125 lift gate "is correct" (still unstored — handle in quote system) **+ $300 oversized-skid charge for all skids ≥90"** (the existing SpeX "$300 NET oversized pallet surcharge" red note aligns). **50/10 WIRED LIVE same day (`8b29f3c`):** `pricing_tier` enum + `tier-options.ts` + `pricing.ts` (factor 0.45) + `INVITE_TIERS` — every selector/z.enum derives from those three modules; freight-charge storage is the task's remaining scope. That push ALSO fired a Git-integration prod deploy — **hook CONFIRMED FIXED 7/29** after two more hook-fired deploys (`21c4f6a` Lenis scroll-freeze fix, `1a15f66` image-radius standard); `web-vercel-hook-fix` → done.

**7/23 EVE — MARK'S VALIDATION ANSWERS IN** (same thread, msg `19f90251e26df98a`, inline red; recon in memory [[project-pricing-wired-2026-07-23]]): **(1) Map spot-check PASSED** ("checked about the first 20, all looked good") — the SpeX↔book map is VALIDATED. **(2) "33 is our current Element series"** — our "33 = legacy Fundamental" gotcha was WRONG (corrected in `series-shapes.ts` `5b58883` + memory; the book's Element pages price 33* models, 149 map rows exist). `ELEMENT.code` is still `null` → **wiring Element to code 33 = OPEN DECISION** (would unlock live pricing; touches config-code derivation, enforcement matrix, series-shapes fold — needs its own careful pass). He "doesn't remember a 30" — but **CAD 30 = OUR FOUNDATION** (book prices zero 30* models). **(3) Shape tokens: retired = exactly the 12 we already hide** (AS BU CR CS QD QR TA TE TN TR VW WG — enforcement matches, zero changes); current = BT D EL RT SL (all priced in the book where sold). **(4) CAD-only sizes = not offered CONFIRMED** (+ his archive ask — already satisfied: CAD data stays in `model-availability.ts` + map inputs, nothing deleted). **(#2 rule) "If it isn't printed in the book, then we cannot produce"** — in-the-book=orderable is now the CONFIRMED rule; custom sizes/shapes = call/email for pricing (current quote-only fallback framing already aligns). **Open asks for Mark (unanswered, worth one more email): name CAD/book series codes 01/02/03/09/17/43 (priced in the book, unclaimed in our catalog — likely incl. TableXpress/QS) + where does Foundation price (code 30 absent from the book)?** Base-token dialect (CAD T vs book TT) also still unasked/unanswered.

**7/22: SWEEP DAY — feedback board cleared to human-gated only** (`eddb3f2`→`9ff4198`, 5 commits, all live-verified; play-by-play in memory [[project-tablex-home-feedback-2026-07]] rounds 2–4 + vault session log):
- **`QuoteRepCTA`** (`src/components/marketing/QuoteRepCTA.tsx` — the /spaces "Let's Build It / Let's Talk" doors, per Brian's emailed mockup) is THE standard terminal for every quote+rep page (home, /products, accessories, quick-ship, spex-studio landing, spaces, series). Different-door terminals (collections, finishes hub/materials, warranty, careers, contracts, resources, news, MiA) untouched — flag to Brian if he wants those too.
- Six 7/22 home cards `e3316f8` (#253–272) + warranty terms sitewide + **TriBlock `hoverLight`** (uniform Iron doors → light to Canvas on hover; home-only opt-in) `145395d`.
- **TriBlock reframe: SEE IT / SPEC IT / SELL IT** (Richie's designer-first thesis — intent labels not role labels, look-door first; Danny approved verbatim; "SELL IT" = post-launch click-through validation candidate, softer alt "THE TRADE"). SPEC IT deep-links `/spex-studio/ultra` (straight into the configurator, Danny).
- **SpeX capital-X rename sitewide** `d0ab69d` (#264): rendered strings/metadata only — routes, `(spex)` group, and `Spex*` identifiers untouched ([[project-spex-studio-naming]]).
- **Board sweep `9ff4198`** (39 cards → review): /about rebuilt (#168–173 — "Built Around People. Driven by Service." + Brian's 6-¶ story, VP pull-quote = **old CEO flag RESOLVED**, "Three things we refuse to hedge on" fold ELIMINATED, "Your ___" marquee) · **/about/warranty rewritten** (#274–297 — 5-section coverage: Structural **Lifetime** / Surfaces 10yr + Materials&Workmanship Lifetime / Mechanical excl. casters 5yr + Nesting extrusions 10yr + "We do not cover labor." / Electrical 1yr / Casters+stems 1yr; claims → **sales@tablex.com** + label-photo step; Mark Fleck VP-Ops pull-quote; "see the full warranty" → real 2025 PDF in resources bucket; TableXpress terminal door 7–10 days — killed stale "two weeks") · series headline periods #256–263 (in `series.ts` — fixes /products rows + heroes together) · /finishes per-category explore doors → `/finishes/laminates?category=…` (#265; laminates page now ƒ request-rendered via searchParams) · marquee order aligned sitewide to #270 (Table/Space/Project/Vision/Way).

**7/21: BRIAN'S FEEDBACK-BOARD ARC — five boards worked in one day** (method [[reference-feedback-board-db-access]]; per-board detail in memory files): home `38b00bf` → products `e64f667` → spaces `34ded66`+`279c28b` (all 50 done, `/spaces/public-spaces` slug rename) → **finishes `1577261`** (40/42 shipped → `review`; REAL 40-color powdercoat roster + paint scans from the Jan 5 2026 price book p.9 replaced the invented 31; % upcharges banned from public display — tier names only; catalog counts stripped; "Your ___" marquee on all 4 finishes pages; knife-edge underside paints listed; request-samples = full-ring model; memory [[project-tablex-finishes-feedback-2026-07]]) → **series `b5f03dd`** (73/75 shipped → `review`, ZERO set-asides, all 15 series pages: Brian-authored ledes/philosophy copy verbatim in `series-detail.ts` — supersedes "bespoke copy Foundation-only"; "Design Philosophy" eyebrow; **"Shape the Experience" fold on every series** via new `series-shapes.ts` — CAD `MODEL_AVAILABILITY` for coded series + Jan 2026 price-book transcriptions for Trig/App/Element/Solo/Artisan (~~GOTCHA: availability block "33" = legacy Fundamental~~ CORRECTED 7/23: Mark says 33 = Element; the fold still uses book-transcribed shapes); trait strip = words not counts (#179); invented powder swatches → real roster scans, 31→40/99→108; "Browse all series" number-free; Ultra related Revel→Justice; memory [[project-tablex-series-feedback-2026-07]]).

**FEEDBACK-BOARD STATE (post-7/22 sweep — only human-gated cards remain):**
- **In `todo` for Danny + team (design/image, per Danny's rule — do NOT work):** #2 home hero photo · #171 /about poem-fold design · #175 team-vs-careers question · #176 stylize about-hero + photo behind · #266/#267 full hero images (/products, /spaces).
- **#268 home hero ember "build your table" pill** — shipped per Brian, Danny thinks it "looks terrible", commented on the card, addressing later. Don't touch.
- **#145 /finishes (in `todo`)** — Full Sheets accuracy. ANSWER READY: yes — real vendor full-sheet scans ([[reference-wilsonart-laminate-textures]]), 63/66 SKUs have one; per-laminate rollout feasible.
- **#74 /products (in `todo`)** — does Revel retire fully (catalog + SpeX + price list) or just leave the marketing lineup?
- **⚠️ manufactur- stem reintroduced by Brian's OWN 7/22 copy** (/about story "American manufacturer"/"dependable manufacturing", warranty hero "not just a manufacturer", Mark Fleck "every table we manufacture") — shipped verbatim per his cards; needs a conscious Danny/Brian sign-off against the 7/04 ban + pending MiA origin verification.
- **Interpretation calls to eyeball:** #169 story had a dropped word — restored as "has been [helping] our customers" · #172 read as eliminate the WHOLE "Three things" fold (not just its label) · #297 read as align warranty quick-ship door to the home TableXpress fold (branded TABLEXPRESS, 7–10 days).
- **Powder sectioning round owed** (Brian #158 "then we can section them out") · Series-not-Collections sitewide sweep · sitewide TableXpress rename (~39 refs, `/quick-ship` route) still DEFERRED · Jim Skillman founder-attribution confirm still owed (warranty-tier confirm now RESOLVED by #281–288) · Bronze (59) is genuinely light champagne · pattern-extended copy on 2 spaces detail pages.

**7/19: /resources REAL LIBRARY SHIPPED** (`c7e01ab` + polish `e26125a` hover-inset, `1d13e0b` linked breadcrumbs, `5f7fbd3` — all live-verified; memory [[project-resources-library]]): 63 PDFs curated from the legacy WP site (`~/Sites/tablex-og` public /pricing/ + /brochures/ pages) into new public Supabase bucket `resources` (tablex-site project; catalog `src/data/resources.ts` — every tile maps 1:1 to a real file). Brochures (Look Book + 10 series + 8 product + 8 option sheets) · price lists (Jan 5 2026 LIST book, complete + 19 sections, **un-gated** — public on legacy site; dealer NET stays unpublished) · Installation & Care (renamed; 9 install + 6 care + 2025 Warranty) · CAD reframed honestly (MRL external door + request CTA — no in-house library; legacy had none). StatStrip fabrications killed (counts now derived). New book editions → NEW dated bucket folder, never overwrite. **projectmatrix.com is DEAD** (Configura sunset it; confirmed refused from 3 networks) — card removed `5f7fbd3`; TableX "implemented ProjectMatrix" Aug 2020 (Servex), so the 2020 submission package / CET Commercial Interiors Library migration is the lead for missing Spex base geometry (Frame, Exclaim Q-X) — **ask Brian**. MRL is NOT a Spex-3D source (binders only hold what TableX uploaded; the Pro gate is dealer-tier category browse — TableX manufacturer access is free via whoever manages the binder, likely Patty). Danny-review flags: price-list un-gating + freight-zone dollar figures (shipping policy, carried from legacy page). Follow-up: wire `/dealer/downloads` to the same catalog.

**7/16–17: ClearPH feedback widget SHIPPED on tablex-site** (`a82f548`, memory [[project-feedback-widget-tablex-site]]): all 5 root layouts, client-injected embed + staff/admin HMAC cross-auth (`/api/feedback/token` mints the WP-plugin bridge token; secret server-only). Live-verified. Danny's 3 widget decisions RESOLVED 7/17 (gate as-shipped, no toggle, URL entries OK). **Auth-URL fallout: RESOLVED 7/17 PM** (the fresh session ran — memory [[project-portal-invite-auth-fix]], in-repo record `tablex-site/docs/launch-checklist.md` §7): site_url+allowlist repointed at the public alias, two-step `/auth/confirm` shipped (`454e1f4`+`f4246cb` — invites were ALSO broken by implicit-flow links + Outlook SafeLinks prefetch + a 2/hr email rate limit), invite-template origin HARDCODED. Re-stamp loop KILLED 7/17 PM: Danny DELETED the Supabase↔Vercel project connection (no toggle exists); site_url sticky; **env sync to Vercel is now MANUAL**. Feedback env vars in Vercel Production only (preview blocked by CLI 52 `env add` bug).

**7/17 PM: /ops/users USER MANAGEMENT COMPLETE** (`36024d3` remove/resend + `9a4355c` password provisioning, both live-verified — memory [[project-ops-users-user-management]]): "Add user" dialog defaults to **create-with-password** (no email; one-time credentials + copy button), invite-email mode secondary; row menu "Set password…" (admin-only; also activates pending invitees); invite accepts land on `/` (public home), not /ops. **Brian's missing invites root-caused: TableX M365 runs INKY PhishFence — own-domain-from-external (forms@tablex.com via Resend, DKIM-valid) gets quarantined; sender change to digital@ RULED OUT (stronger spoof). Standard path for tablex.com people = create w/ password + share credentials out-of-band.** All previously invited users removed by Danny 7/17 — recreate Brian/Mark/Richie via the new flow. Self-serve `/auth/set-password` page still unbuilt (full auth rework deferred per Danny).

**7/15–16 arc:** Xero contact capture shipped (see Xero ruling below) · **territory-from-Xero = definitively NO** (live probe: 0 tracking categories, 0 contact groups, 0 tracked line items, 13 suppliers all vendors — Find-a-Rep stays gated on Brian's territory list; probe re-runnable post-books) · **DASHBOARD: Launch Status mini-site** `/project/launch-status` (7 tabs, Brian-facing functionality report, 7/16 meeting; content lives in its `data.ts` — update status THERE, components just render; copy is deliberately clinical per Danny — no persuasive framing; all 7 tabs live-verified).

**tablex-site is feature-complete and pre-launch.** Every public route + all 4 portals (dealer / rep / ops / spex) built, verified, prod-green. `robots` still `Disallow: /` (pre-launch guard) — flip `NEXT_PUBLIC_SITE_LAUNCHED` + redeploy at cutover. Launch runbook: `tablex-site/docs/launch-checklist.md`. Remaining to launch:
- **Danny:** Adobe Fonts kit `juc1jwq` allowlist tablex.com+www & republish · Vercel Domains (apex decision) · legacy-WP afterlife · DNS cutover (**DON'T touch MX/M365**) · at cutover swap the hardcoded origin in the invite template → tablex.com (Supabase↔Vercel connection already deleted 7/17 — site_url is sticky, env sync manual) · Xero prod redirect URI (`https://tablex.com/api/xero/callback` + flip `XERO_REDIRECT_URI`).
- **Brian:** final sign-off · mfg/origin decision · rep territory data · news content (Payload `payload` schema is live but zero content authored — `web-2b-r1` content-blocked).

**Recent arcs (full play-by-play in vault Sessions/ + memory files):** series-page redesign + 16-series imagery (`db820e2`) · Spex configurator JSI-style redesign (`8cc313e`) + native GLBs (`0cd37b0`) · quote desk + Spex UX cloud run (`38bbfb8..dbc5952`, landed direct to main — report `docs/reports/2026-07-04-quote-desk-spex-ux-run.md`) · Mark's Spex edge feedback → edge offer 8→2 (`pvc-3mm` default + `knife-edge`) both repos · EmberBand Figma treatment + `CollectionsStack` home fold · Xero read-only CRM sync + staff role + impersonation (`72ef1fa`) · Xero review-queue v1.1 open-AR filter + bulk-ignore (`68eff5c`) · **Spex buttery UX pass 1** (7/11: double-buffered viewer/no-ghost + stay-open accordion + 23 GLB-generated silhouettes + hover warming + series switcher, `825d2e7..a9ff28b` — architecture rules in memory [[project-spex-configurator-redesign]]; **next session per Danny: apply these patterns sitewide**) · **DASHBOARD** Launch Timeline `/project/launch-timeline` (migration 027, [[project-master-launch-timeline]]) · **CRM ops buildout cloud run** (7/11: migration `crm_foundation_v1` — contacts/activities/rep_assignments/audit_log, type-aware `/ops/orgs/[orgId]`, audited tier/role changes, rep coverage + scoped rep portal w/ honest fallback, Xero seam; `69137bf..2e9f037`, reconciled+verified; brief `tablex-site/docs/plans/crm-ops-buildout.md`, memory [[project-crm-ops-buildout]]) · **Ops App Language v1 + pass-1 restyle** (7/11 eve: spec `tablex-site/docs/design/ops-app-language.md`; DS remixed w/ Application layer + 3 ops comps generated VIA claude.ai/design driven by Claude in-browser, export `docs/design/comps/ops/`; pass-1 cloud restyle `796972b..1b3085e` reconciled — report `docs/reports/2026-07-11-ops-app-language-pass-1.md`; memory [[project-ops-app-language]]) · **Ops pass-2 comp alignment** (7/12 cloud run, `e61386a` + report `a898934`, reconciled — pass-3 candidates for Danny in memory) · **Finishes redesign** (7/12–13: Claude drove claude.ai/design 2-screen rethink on REAL chip assets — comps `docs/design/comps/finishes/`, port cloud run `bfbe2c1`, LIVE; comp bug found: Fusion Maple mislabeled Core; memory [[project-finishes-redesign]]) · **Sitewide butter** (7/12–13 cloud run `00121b0..66df5f7`, LIVE: shared motion primitives `src/components/motion/{Fold,NoGhostImage,DrawnCheck}` + `src/lib/use-prefers-reduced-motion` — REUSE, don't reinvent; 32-surface ledger + next-Spex-pass punch list in `docs/reports/2026-07-12-sitewide-butter.md`; both runs merged `0ef8e96`, all prod markers PASS, tracker `finishes-1/2` `butter-1/2` done) · **Products hub redesign** (7/13, fully autonomous arc while Danny away: claude.ai/design comp on real assets — project "TableX Products Redesign", comp `docs/design/comps/products/` — → cloud port `9e8ec43` (mid-run Fable→Sonnet model switch for quota; model binds PER-MESSAGE in cloud UI) → merged + SiteHeader dark-overlay one-liner `c917b5a`, LIVE: /products = sixteen-series editorial index (verbatim headlines, `heroImage ?? inUseImage`, Elite honest in-use), real-art doors, all-8 collections band, 9,000+ Configurations stat; all 9 prod markers PASS, tracker `products-hub-1/2` done+verified; report `docs/reports/2026-07-13-products-hub-redesign.md` has 4 new rule candidates; memory [[project-products-hub-redesign]]) · **7/09 rulings applied** (7/14 direct-dev from orchestrator, Danny away: MiA seal→footer (footer-only) + `/about/made-in-america` + About fold + TIPS 230301 on contracts+quote + watch-demo pulled `c79238e`; rep quote-PDF download dealer-isolated + getRepQuote coverage- AND dealer-org-scoped `689a113` (closes 7/04 ledger item 7; house-org quotes now 404 on rep surface); adversarially reviewed pre-push, 9/9 prod markers + live impersonation access-matrix PASS; delegated-call rulings in `docs/design/comps/ERRATA.md` (ember-hover = per-language: marketing saddle / ops ember-deep; comp fixes = errata not regeneration) + tracker `ops-ui-5-pass3` backlog; report `docs/reports/2026-07-14-rulings-apply.md`; tracker `web-rulings-apply` done, 7 decision rows stamped APPLIED).

**Currently owed (carried / human-gated):**
- Behavioral smoke (7/03+7/04 reports READ 7/14): quote submit→email, `/ops/quotes` actions, Spex cart badge + `/quote/cart` — **+ positive rep-PDF download click** (needs a quoted+PDF quote on an assigned dealer; scoping/negative matrix live-verified 7/14). Tracker `web-quote-desk-0704` already done — the smoke itself is the gap.
- **Brian: per-line assembly-vs-origin verification (pending since 7/09)** — if it comes back mixed, revisit `/about/made-in-america` prose AND the footer seal TOGETHER (see 7/14 report ledger).
- Danny: eyeball the `/about/made-in-america` voice ("One lane, one country, thirty years running." is the only new-ish phrase) + the 7/14 delegated calls in `tablex-site/docs/design/comps/ERRATA.md` (comp-side fixes were documented, not made in claude.ai/design — say the word for a comp-fix session).
- Brian emails in danny@clearph.com to send/review: `r5884822648646559323` (10-item input list).
- Caleb photography gaps: `tablex-site/docs/photography-coverage-gaps.md` (outdoor/Element biggest — ZERO outdoor shots exist; Elite hero+colorblock; Artisan/Justice/Puddle colorblock; Revel in-use; Stretch T-base-rect classroom). **+3 from finishes redesign (7/13):** the `data-swap-later` greyboxes on /finishes — solid-surface corner detail, butcher block maple/walnut, etched-logo inlay macro.
- 3D modeler brief: `docs/spex-3d-needs-2026-07-02.md` (6 base GLBs + offer lists; `spex-glb-infra` glb-4 asset-blocked — no Frame / Exclaim Q-X base geometry, no honest stand-in).
- CD quote-to-cash diagram session: `docs/agendas/2026-07-10-quote-xero-flow.{json,-cd-prompt.md}` → export to `tablex-site/docs/diagrams/`.
- Xero real dealer import waits on Brian's cleaned books (~7/17) — the capture side is DONE (`596d746`, 7/15): sync persists IsCustomer/IsSupplier + picked mailing address + phone, `/ops/xero` has a Customers filter. Import = one sync + triage once books land. NOTE: Xero flags IsCustomer only after an ACCREC invoice exists — pre-migration books flag just 34 (30 already linked); expect the real number only from the cleaned books. A test import of the 30 AR-bearing dealers is live in tablex-site `organizations` as `source='xero-test'` (reversible: `delete … where source='xero-test'`).
- ~~/about pull-quote "Brian Craig, CEO" vs VP sig~~ RESOLVED 7/22 — Brian's #170 quote ships with "Vice President of Sales & Marketing".
- ~~/resources StatStrip fabricated claims~~ RESOLVED 7/19 — real library shipped (`c7e01ab`, [[project-resources-library]]). Danny still owes an eyeball on: price lists now PUBLIC (list book, matching legacy site) + freight-zone tables rendering dollar figures on /resources/price-lists.
- After the 7/16 Brian meeting: stamp new decisions into the tracker `decisions` table + refresh `/project/launch-status` `data.ts`.
- Feedback widget: Danny's 3 pending decisions (gate/toggle/URL entries) · sidebar open+save hand-smoke (synthetic clicks can't hit the widget iframe) · preview-scope env vars (add via Vercel dashboard or upgraded CLI).
- Danny: recreate the user roster (Brian, Mark, Richie, db@dbreck.com — all removed 7/17) via /ops/users "Add user" password mode + share credentials out-of-band. Auth-config PATCHes propagate to GoTrue with a ~3–5 min lag — don't send-test immediately.

**Sprint 6 = `sprint-Vx6Lqn`** (7/09→7/22). Launch `web-5-r3` detached + undated (Aug; video possibly Sep 1). Backlog human-gated: `s4-mfg-decision` (Brian), locator data, news content, portal E2E.

## Standing rulings & recurring gotchas

**Content honesty — hard bans on public surfaces (a comp/DS never overrides these):**
- ZERO manufacturing in Jasper — ships/distributes only (no welders/shop-floor/tours copy). **MADE-IN-AMERICA IS RETIRED SITEWIDE (Brian 8/21, EXECUTED 8/26 `1fbf2a1`, tracker `dec-family-owned` supersedes `dec-mia-seal`): the site makes ZERO origin claims anywhere — that's the point (FTC exposure; a future import decision must strand nothing).** The identity is **"Family Owned & Operated"**: footer mark = Danny's `family-owned-operated.svg` (white-fill, footer-only) → `/about/family-owned` (replaces the DELETED `/about/made-in-america` — no redirect, pre-launch); the rep-answers-origin-in-writing fold on that page is the ONE origin surface and claims nothing. Never (re)introduce "Made in America" / "American-made" / "American manufacturer/table company" on any public surface. Brian sign-off owed: story ¶1 rewrite ("a family-owned company"), careers rewrite, and the mark itself (its center emblem still reads flag-adjacent — his ask was non-flag). His print PDFs in /resources may still carry the old seal — his side. Footer keeps "Shipped from Jasper, Indiana" (shipping fact, not origin).
- `617` / `12,338` stats banned on public surfaces (ClearPH pitch-deck only).
- "mass-produced" + the `manufactur-` stem are banned (Danny 7/04) — **EXCEPTION 7/22: Brian's own authored card copy carries the stem on /about + /about/warranty** (shipped verbatim, pending his sign-off). Don't scrub those instances, don't write NEW ones.
- "Configurable SKUs" → "Configurations". No fabricated SKUs anywhere; Spex shows a real-catalog **configuration code**, never an invented SKU / price / lead-time — **don't "fix" these as bugs.**
- Never fabricate: per-series marketing copy (bespoke copy is **Foundation-only**; the other 15 series use honest fallbacks — memory `feedback-preserve-comp-copy.md`), imagery (flag greybox `data-swap-later`, never invent), contract #s, download tiles.

**Pricing:** `Tablex_Pricing_6.10.24.xlsx` = component/top pricing only (no per-series base price) → **prices stay OFF cards; no dollar figures render anywhere.** Quote pricing travels in the attached PDF + `desk_note` free text. Dealer tier discount (50/20) is a stateable fact; list price is public. Don't revisit without a real base-price source. (Laminate invariant: see Invariants above.)

**Image radii (7/29) — tier chosen by the LAYOUT, not the photo:** full-bleed/column-bleed = 0 · image card floating in whitespace = `rounded-img-card` (20px, DS signature) · dense utility tile (browse, SpeX picker) = `rounded-img-tile` (8px) · swatch/chip = `rounded-sm` · circle crops = `rounded-full`. **Never author a literal radius on an image wrapper** — tokens live in tablex-site `globals.css` `@theme`, reference on `/styleguide`; EmberBand `soft-rect` 36px mask exempt (comp variant). Memory [[project-image-radius-standard]].

**Lenis owns wheel scroll on all marketing pages (since May).** Its content ResizeObserver must watch an element whose box tracks document height — `content: document.body` (fixed 7/29, `21c4f6a`; `<html>` is `h-full` so the default starved it and scroll dead-stopped at a stale limit). Never height-pin `<body>`; scroll-freeze reports = check Lenis limit first; hidden/automation tabs throttle rAF and can't repro. Memory [[project-lenis-scroll-freeze-fix]].

**Sitewide conventions (7/22):** terminal quote+rep sections render `QuoteRepCTA` — never inline doors. The "Your ___" marquee order is Table/Space/Project/Vision/Way everywhere. Display name is **SpeX Studio** (capital X) in all copy; routes/identifiers stay `spex`/`Spex*`. Home TriBlock = intent doors SEE IT / SPEC IT / SELL IT with `hoverLight`.

**Photography taxonomy (Danny 7/25) — the category is chosen by the LAYOUT, not the photo:** **ColorBlock** (product on a solid color field) → EDITORIAL (series cards, index rows, collection cards, editorial bands, series heroes) · **Trans Shadow** (cutout + shadow) → STANDALONE PRODUCT (catalog/browse tiles, spec contexts, configurator tiles, comparison rows) · **Real Shots** (real rooms) → **IN-SITU ONLY, in situ or in a carousel — NEVER to depict a series of tables** · **Materials macro** (edge/finish/joinery/hardware) → spec contexts only, banned from editorial and product-identity slots. **Never author the choice — derive it:** `seriesImage(slug, context)` in `tablex-site/src/lib/series-imagery.ts`. Field mapping: `colorBlockImage`/`laneImage`=ColorBlock · `spexImage`/`configRender`=Trans Shadow · **`heroImage`/`inUseImage`=Real Shots**. GOTCHAS: ColorBlock is **portrait (~0.80)** and most slots are landscape → `object-cover` discards ~40%, so always apply the per-series `colorBlockPos` · **`NoGhostImage` is BELOW-FOLD ONLY** (its own docstring); above the fold its lazy reveal never fires and the image silently never loads — use `Image` + `priority` · `spexImage` is 16/16, `colorBlockImage` only 12/16 (`COLORBLOCK_GAPS`).

**Pattern #17 SCALE + GROUND (codified 8/18, DS pushed + site enforced `5640fc2`):** scale is a
function of ROLE, never taste — the strip **IS** the fold → **marquee** (`clamp(40px,5.6vw,96px)`,
full-bleed, loops, ends on the seam) · the strip sits **INSIDE** a fold, or under ~200px of vertical
room → **compact** (30px `--t-h3-size`, static, centered, no seam) · spec/qualifier line → metadata
13px body 500 · label line → eyebrow 12px/600/+0.18em. Metadata + eyebrow are typographic treatments,
NOT variants of the component. **Ground:** white is canonical; on Iron/Forge bands only the ink flips
— items white, `/` one step quieter than its items (stone-300 under full-white, ~40% white under
muted items), `*` Ember on EVERY ground; photography counts as dark; **never on a Moss/Saddle
structural block** (use an eyebrow label). At most one strip per fold. Memory
[[project-pattern17-policing-2026-08-18]].

**Slash-strip punctuation is a GRAMMAR (Pattern #17, codified 7/25 from Kayla's Figma):** `/` joins items **inside one list** (same kind of thing); `*` divides **one list from the next** (Ember). A looping strip ends on `*` — the seam between cycles is a list boundary. Corollaries: one homogeneous list → no internal `*`; all-dissimilar items → every separator is `*`; a static strip has no seam; **a separator never leads a strip**; never `•` `|` `·` `—`. If an item seems to need its own inner separator it is two items — split it. **Never author separators — derive them:** `slashTokens(groups)` in `tablex-site/src/lib/slash-strip.ts` is the single source (`StatStrip` takes `groups`, not the old index-based `accentBefore`); the DS mirror is `ui_kits/tablex-marketing/StatStrip.jsx` + card `preview/slash-strip-variants.html`. Four scales, sized by role: marquee `clamp(40px,5.6vw,96px)` · compact 30px · metadata 13px · eyebrow 12px/+0.18em. Homogeneous strips legitimately render with **no Ember at all**.

**Design / fidelity:** a claude.ai/design comp port is DONE only at **0 real deltas at BOTH 1920×1080 AND 1280×800** (memory `feedback-comp-assembly-fidelity.md`). **The Ops App Language is /ops-ONLY — portals do NOT adopt it (Danny 7/12); don't re-propose.** Sitewide motion/interaction uses the shared butter primitives (`src/components/motion/*`, `src/lib/use-prefers-reduced-motion.ts`) — extend them, never hand-roll folds/image-reveals/reduced-motion probes. Replicate the comp's layout MECHANISM, not its 1920-resolved values — use the fluid `.text-h1/.text-lede` utilities + `--spacing-container/section` steps. Build agents get comp SCREENSHOTS, not just JSX. `/products/browse` = e-comm utility surface (Forge-hero / checkbox-pill); `/products`, `/finishes`, `/spaces` stay editorial. ~~Nav dropdowns deliberately omitted~~ REVERSED (Danny 7/26): nav carries a **hub-first mega menu** — top-level items still NAVIGATE to hubs on click; hover opens a typographic full-width Canvas panel whose first link is the hub itself ("Products Hub →", Ember arrow = the panel's one Ember); header truly transparent over hero pages, Canvas ~97% + hairline on scroll. Source of truth `tablex-site/src/components/{SiteHeader,NavMegaPanel}.tsx` + `nav-links.ts`.

**Dual-Supabase (critical — never cross them):** TRACKER `ofweciopslhrepobqpco` = PM `project_tasks`, personal account, **default `supabase` MCP**. tablex-site Postgres `sfwegefbgudsgricduat` = TableX-Inc org, **`supabase-tablex` MCP**.

**Tracker write gotchas (`project_tasks`):** status lives in the **`column`** field (reserved word — quote it), not `status`. `deliverable_id` MUST be a real `DELIVERABLES` id (`web-1/2a/2b/2c/3/4/5`, `portal-2`…; Spex → `web-3`). `assignee` FK → `team_members` (Caleb=`UDXcXYLU`; else lowercase first-name). `priority` is NOT NULL (batch INSERT rolls back whole on a missing one). Sprints in the `sprints` table (`status='complete'` to close).

**Spex render path (verification trap):** offers ≡ `MODEL_AVAILABILITY` cross-product → most literal-shape combos are NATIVE (baked GLBs — a native render proves nothing about our procedural code). Procedural fires only in the cross-product holes. Confirm via network: `bases/*.glb` = procedural stand-in, `glb-models/…` = native.

**Seeded logins (tablex-site prod):** admin `danny@clearph.com / tablex-admin-2026!` (→ /ops via /portal) · staff `staff@example.com / tablex-staff-2026!` · dealer `dealer@example.com / tablex-dealer-2026!` · rep `rep@example.com`. Impersonate switcher role colors: a=Ember `#F26721` · s=Moss `#8A8962` · d=Saddle `#75400E` · r=Iron `#191919`. (`dealer@example.com` is an unroutable seed address — its Resend emails always bounce; test dealer email with a real address.)

**Xero:** OAuth app "TableX CRM Sync" (`2b22ea93-5ea9-44c8-98c0-9ca192ccf0de`, danny@clearph.com dev login). Post-Mar-2026 apps get **granular scopes only** (`accounting.invoices.read`, not the retired broad scope). Read-only — **never writes Xero.** Books MID-MIGRATION (Move My Ledger, ~7/17); all open invoices are Dec-2020 artifacts (not owed) — `ar_issued_after` cutoff hides them. Suppliers stay out of CRM. Since `596d746` (7/15) the sync captures IsCustomer/IsSupplier + picked mailing address (POBOX-preferred per Xero's mailing-slot convention) + phone (never fax) into nullable `xero_contacts` columns (migration `xero_contact_type_address_phone`; null = pre-capture unknown, false = Xero says no). Xero sets IsCustomer only once an ACCREC invoice exists — dealers with no invoice history read false. Review queue (`/ops/xero`) has open-AR + Customers filters, Type chips, bulk-ignore (`68eff5c`, `596d746`).

**Recurring tooling gotchas:** claude.ai/code model choice binds **PER-MESSAGE** — toggling the selector mid-run does nothing until a message is SENT under the new model (send a short steering note; proven Fable→Sonnet 7/13). Extension text-extraction (`get_page_text`/JS `innerText`) can hit a DLP block on session pages ("[BLOCKED: Cookie/query string data]") — fall back to a screenshot. cloud (claude.ai/code) sessions are **branch-constrained since 7/12** — they push `claude/<slug>` branches, never main; the orchestrator merges, runs the COMBINED build locally before pushing main, executes the reports' prescribed prod marker checks, and diffs report claims vs actual tracker rows (a run can deliver a complete report yet mark zero tracker items — butter run 7/13). Two concurrent runs on one repo work when briefs partition the file surface (named no-touch globs + rebase-before-push + stop-on-foreign-conflict). Local push to tablex-site `main` prints a "pull request" advisory but SUCCEEDS (ref updates). chrome-devtools screenshots only write inside a workspace root; `fullPage` saves to a temp path (Read it back). Lazy-loaded below-fold `next/image` shows the fallback bg in a first screenshot — verify via `evaluate_script` naturalWidth or re-shoot after scroll. `resize_page` (chrome-devtools) reflows; claude-in-chrome `resize_window` does NOT. Dashboard dev = **:3001** when tablex-site holds :3000 (check `lsof -iTCP:3000 -sTCP:LISTEN`). `vercel ls` column-mangles when piped — use `vercel inspect <url>` or match deploy `created` to `git log -1 --format=%cI`.

**History:** full per-session play-by-play lives in vault `Sessions/` + memory files (`~/.claude/projects/.../memory/`). This file holds current state + standing rulings only — don't re-accrete a dated chronology here.
