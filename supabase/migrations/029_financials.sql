-- 029_financials.sql — TableX Financials warehouse (admin-only, /admin/financials)
--
-- Revenue source of truth = Xero org "TableX, LLC" (invoice detail Oct 2020 → Mar 2026;
-- Apr 2026 → present exists in Xero only as P&L journal totals, see fin_pl_monthly).
-- Site activity (quotes, signups, web requests) is snapshotted from the tablex-site
-- Supabase project via PostgREST. All money is integer cents. Reads via views.
--
-- RLS: SELECT for admins only (get_user_role() from 002_rls.sql). Writes = service role
-- (scripts/fin/*). fin_xero_tokens has RLS on with NO policies (service role only).

-- ============================================================
-- Sync bookkeeping
-- ============================================================
CREATE TABLE IF NOT EXISTS fin_sources (
  source          text PRIMARY KEY,          -- 'xero' | 'xero_pl' | 'site' | 'gf'
  last_synced_at  timestamptz,
  coverage_from   date,
  coverage_to     date,
  row_count       integer,
  notes           text
);

CREATE TABLE IF NOT EXISTS fin_xero_tokens (
  id                       boolean PRIMARY KEY DEFAULT true CHECK (id),
  tenant_id                text NOT NULL,
  tenant_name              text,
  access_token             text NOT NULL,
  refresh_token            text NOT NULL,
  access_token_expires_at  timestamptz NOT NULL,
  last_modified_since      timestamptz,       -- If-Modified-Since watermark for invoices
  connected_at             timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Xero invoices
-- ============================================================
CREATE TABLE IF NOT EXISTS fin_customers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  xero_contact_id   text UNIQUE,
  name              text NOT NULL,
  normalized_name   text NOT NULL,            -- lower, punctuation stripped, inc/llc/co dropped
  site_org_id       uuid,                     -- tablex-site organizations.id (matched by xero_contact_id)
  site_org_type     text,                     -- dealer | rep_group | direct
  rep_group         text,
  state             text,
  first_invoice_on  date,
  last_invoice_on   date,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS fin_customers_normalized_name_idx ON fin_customers (normalized_name);

CREATE TABLE IF NOT EXISTS fin_invoices (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source             text NOT NULL DEFAULT 'xero' CHECK (source IN ('xero')),
  xero_invoice_id    text UNIQUE,
  number             text NOT NULL,
  reference          text,                    -- dealer PO
  customer_id        uuid REFERENCES fin_customers(id),
  status             text NOT NULL,           -- AUTHORISED | PAID | VOIDED | DELETED | DRAFT
  issued_on          date NOT NULL,
  due_on             date,
  paid_on            date,
  subtotal_cents     bigint NOT NULL DEFAULT 0,
  tax_cents          bigint NOT NULL DEFAULT 0,
  total_cents        bigint NOT NULL DEFAULT 0,
  amount_paid_cents  bigint,
  amount_due_cents   bigint,
  currency           text NOT NULL DEFAULT 'USD',
  line_count         integer NOT NULL DEFAULT 0,
  has_special        boolean NOT NULL DEFAULT false,
  xero_updated_at    timestamptz,
  raw                jsonb,
  imported_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS fin_invoices_issued_on_idx    ON fin_invoices (issued_on);
CREATE INDEX IF NOT EXISTS fin_invoices_customer_idx     ON fin_invoices (customer_id, issued_on);
CREATE INDEX IF NOT EXISTS fin_invoices_status_idx       ON fin_invoices (status);
CREATE INDEX IF NOT EXISTS fin_invoices_reference_idx    ON fin_invoices (reference);
CREATE INDEX IF NOT EXISTS fin_invoices_number_idx       ON fin_invoices (number);

CREATE TABLE IF NOT EXISTS fin_invoice_lines (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id        uuid NOT NULL REFERENCES fin_invoices(id) ON DELETE CASCADE,
  xero_line_id      text,
  position          integer NOT NULL DEFAULT 0,
  description       text,
  item_code         text,
  account_code      text,
  qty               numeric(12,3),
  unit_cents        bigint,
  amount_cents      bigint NOT NULL DEFAULT 0,
  -- parsed by src/lib/fin/parse-line.ts
  code              text,
  series_code       text,
  shape             text,
  width_in          numeric(7,2),
  depth_in          numeric(7,2),
  base_code         text,
  post_config       integer,
  is_special        boolean NOT NULL DEFAULT false,
  special_height    numeric(6,2),
  is_replacement    boolean NOT NULL DEFAULT false,
  part_kind         text NOT NULL DEFAULT 'other'
                    CHECK (part_kind IN ('table','base','top','accessory','freight','discount','other')),
  parse_confidence  text NOT NULL DEFAULT 'none'
                    CHECK (parse_confidence IN ('high','medium','low','none')),
  parser_version    integer NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS fin_invoice_lines_invoice_idx  ON fin_invoice_lines (invoice_id);
CREATE INDEX IF NOT EXISTS fin_invoice_lines_series_idx   ON fin_invoice_lines (series_code);
CREATE INDEX IF NOT EXISTS fin_invoice_lines_kind_idx     ON fin_invoice_lines (part_kind);
CREATE INDEX IF NOT EXISTS fin_invoice_lines_special_idx  ON fin_invoice_lines (is_special) WHERE is_special;

-- Monthly P&L from Xero Reports API (covers the post-March-2026 journal-only span too)
CREATE TABLE IF NOT EXISTS fin_pl_monthly (
  month                   date PRIMARY KEY,   -- first of month
  income_cents            bigint NOT NULL DEFAULT 0,   -- SALES-TablEx
  freight_income_cents    bigint NOT NULL DEFAULT 0,
  other_income_cents      bigint NOT NULL DEFAULT 0,
  cogs_cents              bigint NOT NULL DEFAULT 0,   -- all cost-of-sales accounts
  commissions_cents       bigint NOT NULL DEFAULT 0,
  spiff_cents             bigint NOT NULL DEFAULT 0,
  freight_expense_cents   bigint NOT NULL DEFAULT 0,
  advertising_cents       bigint NOT NULL DEFAULT 0,
  total_expenses_cents    bigint NOT NULL DEFAULT 0,
  raw                     jsonb,
  imported_at             timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- tablex-site snapshot (PostgREST read-only copy)
-- ============================================================
CREATE TABLE IF NOT EXISTS fin_site_quotes (
  id                   uuid PRIMARY KEY,      -- site quotes.id
  quote_number         text UNIQUE,
  kind                 text,                  -- portal | self
  status               text,                  -- draft | submitted | quoted | revising | accepted | archived
  priced_source        text,                  -- auto | desk | self
  pricing_tier         text,
  org_id               uuid,
  org_name             text,
  org_type             text,
  rep_org_id           uuid,
  created_at           timestamptz,
  submitted_at         timestamptz,
  quoted_at            timestamptz,
  accepted_at          timestamptz,
  subtotal_list_cents  bigint,
  subtotal_net_cents   bigint,
  po_number            text,
  ship_to_state        text,
  line_count           integer,
  has_custom_line      boolean NOT NULL DEFAULT false,
  snapshot_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS fin_site_quotes_status_idx  ON fin_site_quotes (status, accepted_at);
CREATE INDEX IF NOT EXISTS fin_site_quotes_created_idx ON fin_site_quotes (created_at);

CREATE TABLE IF NOT EXISTS fin_site_signups (
  profile_id   uuid PRIMARY KEY,
  role         text,
  org_id       uuid,
  org_type     text,
  created_at   timestamptz NOT NULL,
  snapshot_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS fin_site_signups_created_idx ON fin_site_signups (created_at);

CREATE TABLE IF NOT EXISTS fin_web_requests (
  id                  text PRIMARY KEY,       -- 'gf:<entryId>' | 'qr:<uuid>'
  source              text NOT NULL CHECK (source IN ('gf','qr')),
  requested_at        timestamptz NOT NULL,
  company             text,
  normalized_company  text,
  series              text,
  finish              text,
  qty                 integer,
  top_needed          boolean,
  base_needed         boolean,
  org_id              uuid,
  customer_id         uuid REFERENCES fin_customers(id),
  snapshot_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS fin_web_requests_requested_idx ON fin_web_requests (requested_at);

-- ============================================================
-- RLS — admin read only; writes via service role
-- ============================================================
ALTER TABLE fin_sources        ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_xero_tokens    ENABLE ROW LEVEL SECURITY;   -- no policies: service role only
ALTER TABLE fin_customers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_invoices       ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_invoice_lines  ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_pl_monthly     ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_site_quotes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_site_signups   ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_web_requests   ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['fin_sources','fin_customers','fin_invoices','fin_invoice_lines',
                           'fin_pl_monthly','fin_site_quotes','fin_site_signups','fin_web_requests']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || ': admin select', t);
    EXECUTE format('CREATE POLICY %I ON %I FOR SELECT TO authenticated USING (public.get_user_role() = ''admin'')',
                   t || ': admin select', t);
  END LOOP;
END $$;

-- ============================================================
-- Views (security_invoker so the table RLS applies)
-- ============================================================
CREATE OR REPLACE VIEW fin_v_monthly WITH (security_invoker = true) AS
SELECT date_trunc('month', issued_on)::date         AS month,
       count(*)                                     AS invoices,
       sum(subtotal_cents)                          AS subtotal_cents,
       sum(total_cents)                             AS total_cents,
       count(DISTINCT customer_id)                  AS customers,
       count(*) FILTER (WHERE has_special)          AS special_invoices,
       count(*) FILTER (WHERE total_cents = 0)      AS zero_invoices
FROM fin_invoices
WHERE status IN ('AUTHORISED','PAID')
GROUP BY 1;

-- Revenue by month with the P&L filling months that have no invoice detail
CREATE OR REPLACE VIEW fin_v_revenue_monthly WITH (security_invoker = true) AS
SELECT coalesce(m.month, p.month)                        AS month,
       coalesce(m.total_cents, 0)                        AS invoiced_cents,
       coalesce(m.invoices, 0)                           AS invoices,
       coalesce(m.customers, 0)                          AS customers,
       p.income_cents                                    AS pl_income_cents,
       p.freight_income_cents                            AS pl_freight_income_cents,
       p.cogs_cents                                      AS pl_cogs_cents,
       p.commissions_cents                               AS pl_commissions_cents,
       p.spiff_cents                                     AS pl_spiff_cents,
       p.freight_expense_cents                           AS pl_freight_expense_cents,
       p.advertising_cents                               AS pl_advertising_cents,
       (coalesce(m.invoices, 0) = 0 AND coalesce(p.income_cents, 0) <> 0) AS detail_pending,
       CASE WHEN coalesce(m.invoices, 0) > 0 THEN m.total_cents ELSE coalesce(p.income_cents, 0) END AS revenue_cents
FROM fin_v_monthly m
FULL OUTER JOIN fin_pl_monthly p ON p.month = m.month;

CREATE OR REPLACE VIEW fin_v_customer_year WITH (security_invoker = true) AS
SELECT i.customer_id,
       c.name                                   AS customer_name,
       c.site_org_id,
       c.site_org_type,
       extract(year FROM i.issued_on)::int      AS year,
       count(*)                                 AS invoices,
       sum(i.total_cents)                       AS total_cents,
       min(i.issued_on)                         AS first_invoice_on,
       max(i.issued_on)                         AS last_invoice_on
FROM fin_invoices i
JOIN fin_customers c ON c.id = i.customer_id
WHERE i.status IN ('AUTHORISED','PAID')
GROUP BY 1,2,3,4,5;

CREATE OR REPLACE VIEW fin_v_series_month WITH (security_invoker = true) AS
SELECT date_trunc('month', i.issued_on)::date  AS month,
       l.series_code,
       l.part_kind,
       l.is_special,
       l.is_replacement,
       sum(l.amount_cents)                     AS amount_cents,
       sum(l.qty)                              AS qty,
       count(*)                                AS lines
FROM fin_invoice_lines l
JOIN fin_invoices i ON i.id = l.invoice_id
WHERE i.status IN ('AUTHORISED','PAID')
GROUP BY 1,2,3,4,5;

CREATE OR REPLACE VIEW fin_v_size_mix WITH (security_invoker = true) AS
SELECT l.shape, l.width_in, l.depth_in,
       extract(year FROM i.issued_on)::int AS year,
       sum(l.qty) AS qty, sum(l.amount_cents) AS amount_cents, count(*) AS lines
FROM fin_invoice_lines l
JOIN fin_invoices i ON i.id = l.invoice_id
WHERE i.status IN ('AUTHORISED','PAID') AND l.shape IS NOT NULL AND l.width_in IS NOT NULL
GROUP BY 1,2,3,4;

CREATE OR REPLACE VIEW fin_v_parse_health WITH (security_invoker = true) AS
SELECT parse_confidence, part_kind, count(*) AS lines, sum(amount_cents) AS amount_cents
FROM fin_invoice_lines GROUP BY 1,2;

CREATE OR REPLACE VIEW fin_v_site_quotes_monthly WITH (security_invoker = true) AS
SELECT date_trunc('month', created_at)::date AS month, kind, priced_source,
       count(*)                                           AS created,
       count(*) FILTER (WHERE submitted_at IS NOT NULL)   AS submitted,
       count(*) FILTER (WHERE quoted_at IS NOT NULL)      AS quoted,
       count(*) FILTER (WHERE status = 'accepted')        AS accepted,
       sum(subtotal_net_cents) FILTER (WHERE status = 'accepted') AS accepted_net_cents,
       count(DISTINCT org_id)                             AS orgs
FROM fin_site_quotes GROUP BY 1,2,3;

CREATE OR REPLACE VIEW fin_v_web_requests_monthly WITH (security_invoker = true) AS
SELECT date_trunc('month', requested_at)::date AS month, source,
       count(*) AS requests, count(DISTINCT normalized_company) AS companies,
       count(*) FILTER (WHERE base_needed IS false) AS top_only,
       count(*) FILTER (WHERE top_needed IS false)  AS base_only
FROM fin_web_requests GROUP BY 1,2;
