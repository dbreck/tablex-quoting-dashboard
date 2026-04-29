-- 024_sign_offs.sql — formal client sign-off on deliverables.
-- Three tables:
--   sign_offs            parent record (title, body, links, status)
--   sign_off_revisions   append-only formal-decision history
--   sign_off_notes       append-only side discussion (works post-approval)
-- RLS mirrors 021. All three added to the realtime publication.

-- ============================================================
-- sign_offs (parent)
-- ============================================================
CREATE TABLE sign_offs (
  id                       text PRIMARY KEY,                  -- nanoid(10) prefixed 'so-'
  deliverable_id           text,                              -- no FK; DELIVERABLES is static
  title                    text NOT NULL,
  description              text,
  links                    jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{label, url}, ...]
  status                   text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','sent','changes_requested','approved')),
  revision_number          int  NOT NULL DEFAULT 1 CHECK (revision_number >= 1),
  approved_at              timestamptz,
  approved_by_profile_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by_name         text,
  created_by_member_id     text REFERENCES team_members(id) ON DELETE SET NULL,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sign_offs_deliverable_idx ON sign_offs (deliverable_id);
CREATE INDEX sign_offs_status_idx      ON sign_offs (status);
CREATE INDEX sign_offs_updated_idx     ON sign_offs (updated_at DESC);

-- ============================================================
-- sign_off_revisions (formal decision audit log)
-- ============================================================
CREATE TABLE sign_off_revisions (
  id                     text PRIMARY KEY,
  sign_off_id            text NOT NULL REFERENCES sign_offs(id) ON DELETE CASCADE,
  revision_number        int  NOT NULL,
  decision               text NOT NULL CHECK (decision IN ('approved','changes_requested')),
  decided_by_profile_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  decided_by_name        text NOT NULL,
  decided_notes          text,
  decided_at             timestamptz NOT NULL DEFAULT now(),
  description_snapshot   text,
  links_snapshot         jsonb
);

CREATE INDEX sign_off_revisions_signoff_idx ON sign_off_revisions (sign_off_id, decided_at DESC);

-- ============================================================
-- sign_off_notes (append-only commentary, allowed post-approval)
-- ============================================================
CREATE TABLE sign_off_notes (
  id                  text PRIMARY KEY,
  sign_off_id         text NOT NULL REFERENCES sign_offs(id) ON DELETE CASCADE,
  author_profile_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name         text NOT NULL,
  body                text NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sign_off_notes_signoff_idx ON sign_off_notes (sign_off_id, created_at);

-- ============================================================
-- Triggers
-- ============================================================
CREATE TRIGGER sign_offs_touch_updated_at
  BEFORE UPDATE ON sign_offs
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Lock body fields once approved. Belt-and-suspenders with the UI lock —
-- catches direct REST writes too.
CREATE OR REPLACE FUNCTION sign_offs_lock_body_when_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'approved' AND (
       NEW.title       IS DISTINCT FROM OLD.title       OR
       NEW.description IS DISTINCT FROM OLD.description OR
       NEW.links       IS DISTINCT FROM OLD.links
     ) THEN
    RAISE EXCEPTION 'sign_off % is approved; title/description/links cannot change. Create a new sign-off if revisions are needed.', NEW.id
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sign_offs_lock_body_after_approval
  BEFORE UPDATE ON sign_offs
  FOR EACH ROW EXECUTE FUNCTION sign_offs_lock_body_when_approved();

-- ============================================================
-- RLS — mirrors 021
-- ============================================================
ALTER TABLE sign_offs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sign_off_revisions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sign_off_notes      ENABLE ROW LEVEL SECURITY;

-- sign_offs
CREATE POLICY "sign_offs: select for proposal users"
  ON sign_offs FOR SELECT TO authenticated
  USING (public.can_access_proposal() = true);
CREATE POLICY "sign_offs: insert for proposal users"
  ON sign_offs FOR INSERT TO authenticated
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "sign_offs: update for proposal users"
  ON sign_offs FOR UPDATE TO authenticated
  USING (public.can_access_proposal() = true)
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "sign_offs: admin delete only"
  ON sign_offs FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- sign_off_revisions (insert-anytime, no UPDATE / no DELETE except admin)
CREATE POLICY "sign_off_revisions: select for proposal users"
  ON sign_off_revisions FOR SELECT TO authenticated
  USING (public.can_access_proposal() = true);
CREATE POLICY "sign_off_revisions: insert for proposal users"
  ON sign_off_revisions FOR INSERT TO authenticated
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "sign_off_revisions: admin delete only"
  ON sign_off_revisions FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- sign_off_notes (insert-anytime, no UPDATE / no DELETE except admin)
CREATE POLICY "sign_off_notes: select for proposal users"
  ON sign_off_notes FOR SELECT TO authenticated
  USING (public.can_access_proposal() = true);
CREATE POLICY "sign_off_notes: insert for proposal users"
  ON sign_off_notes FOR INSERT TO authenticated
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "sign_off_notes: admin delete only"
  ON sign_off_notes FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE sign_offs, sign_off_revisions, sign_off_notes;
