# scripts/fin — TableX Financials warehouse loaders

Fills the `fin_*` tables (migration `supabase/migrations/029_financials.sql`, tracker
Supabase `ofweciopslhrepobqpco`) that back `/admin/financials`. Revenue source of truth
is the Xero org **TableX, LLC**: invoice detail Oct 2020 → Mar 2026, then P&L journal
totals only (`fin_pl_monthly`).

All Xero access is **read-only** (`.read` scopes, GET only).

## Run order

```sh
npx tsx scripts/fin/xero-connect.ts                  # once (and again whenever the grant dies)
npx tsx scripts/fin/xero-pull.ts --dry-run --pages 1 # smoke: one page, nothing written
npx tsx scripts/fin/xero-pull.ts --full              # first real load (ignores the watermark)
npx tsx scripts/fin/xero-pl.ts --dry-run             # check the P&L table + check values
npx tsx scripts/fin/xero-pl.ts                       # write fin_pl_monthly
npx tsx scripts/fin/reconcile.ts                     # exit 1 if counts/dollars drift
```

After changing `src/lib/fin/parse-line.ts` (bump `PARSER_VERSION` in `src/lib/fin/types.ts`):

```sh
npx tsx scripts/fin/reparse-lines.ts --dry-run       # confidence + part_kind histogram diff
npx tsx scripts/fin/reparse-lines.ts                 # write changed rows, refresh has_special
```

### Flags

| Script | Flags |
|---|---|
| `xero-connect.ts` | `--tenant <tenantId>` when the grant sees several orgs, `--no-open` to only print the URL |
| `xero-pull.ts` | `--dry-run`, `--pages N`, `--page-size 100\|1000` (default 100), `--full`, `--since YYYY-MM-DD` |
| `xero-pl.ts` | `--dry-run`, `--year YYYY` |
| `reparse-lines.ts` | `--dry-run` |

`xero-pull.ts` is incremental by default: it sends `If-Modified-Since` from
`fin_xero_tokens.last_modified_since`. The watermark only advances after a complete,
non-dry run with no `--pages` and no `--since`, and is set 5 minutes before the run
started (re-pulling the overlap is harmless, every write is an upsert). Each invoice's
lines are deleted and re-inserted on every pull.

## Env (`.env.local`)

| Name | Purpose |
|---|---|
| `FIN_XERO_CLIENT_ID` | Xero app "TableX Financials" client id |
| `FIN_XERO_CLIENT_SECRET` | its client secret |
| `NEXT_PUBLIC_SUPABASE_URL` | tracker project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | service role (all `fin_*` writes; `fin_xero_tokens` has no RLS policies) |

## Xero developer portal (Danny, once)

1. Sign in at https://developer.xero.com/app/manage with the login that can see the
   **TableX, LLC** org.
2. **New app** → name "TableX Financials", integration type **Web app**, company URL
   `https://clearph.com`, redirect URI **`http://localhost:5555/callback`** (exact).
3. Open the app → **Configuration** → copy the Client ID, **Generate a secret**, and paste
   both into `.env.local` as `FIN_XERO_CLIENT_ID` / `FIN_XERO_CLIENT_SECRET`.
4. Run `npx tsx scripts/fin/xero-connect.ts`, approve **TableX, LLC** in the browser.

Scopes requested: `offline_access accounting.invoices.read accounting.contacts.read
accounting.reports.read` (granular scopes; apps made after March 2026 cannot get the
retired broad `accounting.transactions.read`). This is a separate app from tablex-site's
"TableX CRM Sync" so the two never fight over one rotating refresh token.

## Token caveats

- Xero refresh tokens are **single-use** and rotate on every refresh. The scripts persist
  the new token to `fin_xero_tokens` before using the new access token, so even a
  `--dry-run` writes to that row when a refresh happens.
- A refresh token **dies after 60 days without use**. With a monthly cadence that is
  fine; skip two months and you get "refresh token is dead" → re-run `xero-connect.ts`.
- Never run two pulls at once (they would race on the rotation).

## Cadence

Manual, monthly, like the Monday sync: `xero-pull.ts` → `xero-pl.ts` → `reconcile.ts`.
No cron. Xero limits are 60 calls/min, 5,000/day, 5 concurrent; the scripts page
sequentially, honor `Retry-After` on 429, and abort when Xero asks for a wait longer
than two minutes (the daily cap).

## DDL

Schema changes to the tracker project go through `scripts/fin/tracker-sql.sh <file.sql>`
(Supabase Management API with the personal PAT), e.g.
`scripts/fin/tracker-sql.sh supabase/migrations/029_financials.sql`.
