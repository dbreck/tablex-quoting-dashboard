-- 025_site_map_approvals.sql — multi-reviewer Site Map approvals.
-- Replaces the localStorage-only single-user approval store. Page IDs are the
-- ones from src/data/site-map.ts — text PK, no FK (the IA is static code).
-- RLS mirrors 017 (proposal users read/write, admin delete).

CREATE TABLE site_map_approvals (
  page_id     text PRIMARY KEY,
  decision    text NOT NULL DEFAULT 'pending'
              CHECK (decision IN ('approved','rejected','pending')),
  note        text NOT NULL DEFAULT '',
  decided_at  timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX site_map_approvals_decision_idx ON site_map_approvals (decision);

-- Reuse the conditional touch_updated_at trigger function from migration 015.
CREATE TRIGGER site_map_approvals_touch_updated_at
  BEFORE UPDATE ON site_map_approvals
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============================================================
-- RLS — mirrors 017
-- ============================================================
ALTER TABLE site_map_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_map_approvals: select for proposal users"
  ON site_map_approvals FOR SELECT TO authenticated
  USING (public.can_access_proposal() = true);
CREATE POLICY "site_map_approvals: insert for proposal users"
  ON site_map_approvals FOR INSERT TO authenticated
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "site_map_approvals: update for proposal users"
  ON site_map_approvals FOR UPDATE TO authenticated
  USING (public.can_access_proposal() = true)
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "site_map_approvals: admin delete only"
  ON site_map_approvals FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE site_map_approvals;
