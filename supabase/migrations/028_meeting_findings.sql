-- 028_meeting_findings.sql — check-off state + notes for meeting findings pages.
-- The findings THEMSELVES are static content in code (src/data/*-findings.ts,
-- first consumer: the 9/02 sales-rep demo at /project/rep-demo). Only the
-- team's working state lives here: whether an item is done, and a running
-- thread of notes under it. Keys are namespaced "<meeting>:<item>" so one
-- table pair serves every future meeting. RLS + realtime mirror 024 / 027.

CREATE TABLE meeting_finding_checks (
  finding_key  text PRIMARY KEY,                   -- e.g. 'rep-demo-2026-09-02:R-1'
  is_done      boolean NOT NULL DEFAULT false,
  done_by      text,                               -- display name at check time
  done_at      timestamptz,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER meeting_finding_checks_touch_updated_at
  BEFORE UPDATE ON meeting_finding_checks
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE meeting_finding_notes (
  id                 text PRIMARY KEY,             -- nanoid(10)
  finding_key        text NOT NULL,
  author_profile_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name        text NOT NULL,
  body               text NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX meeting_finding_notes_key_idx ON meeting_finding_notes (finding_key, created_at);

-- ============================================================
-- RLS — proposal users read/write, admin-only delete (mirrors 024 / 027)
-- ============================================================
ALTER TABLE meeting_finding_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_finding_notes  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meeting_finding_checks: select for proposal users"
  ON meeting_finding_checks FOR SELECT TO authenticated
  USING (public.can_access_proposal() = true);
CREATE POLICY "meeting_finding_checks: insert for proposal users"
  ON meeting_finding_checks FOR INSERT TO authenticated
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "meeting_finding_checks: update for proposal users"
  ON meeting_finding_checks FOR UPDATE TO authenticated
  USING (public.can_access_proposal() = true)
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "meeting_finding_checks: admin delete only"
  ON meeting_finding_checks FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

CREATE POLICY "meeting_finding_notes: select for proposal users"
  ON meeting_finding_notes FOR SELECT TO authenticated
  USING (public.can_access_proposal() = true);
CREATE POLICY "meeting_finding_notes: insert for proposal users"
  ON meeting_finding_notes FOR INSERT TO authenticated
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "meeting_finding_notes: admin delete only"
  ON meeting_finding_notes FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE meeting_finding_checks;
ALTER PUBLICATION supabase_realtime ADD TABLE meeting_finding_notes;
