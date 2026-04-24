-- 021_risks_decisions.sql — risks + decisions as first-class entities.
-- Two tables, not one unified RAID — fields diverge enough that a shared
-- schema gets messy. UI composes a unified view when it needs to.
-- RLS mirrors 017. Both tables added to the realtime publication.

-- ============================================================
-- risks
-- ============================================================
CREATE TABLE risks (
  id                text PRIMARY KEY,                  -- nanoid(10)
  deliverable_id    text,                              -- no FK; DELIVERABLES is static
  title             text NOT NULL,
  description       text,
  category          text NOT NULL DEFAULT 'integration'
    CHECK (category IN ('integration','content','design','tech','vendor','scope','resourcing')),
  probability       int  NOT NULL DEFAULT 2 CHECK (probability BETWEEN 1 AND 3),
  impact            int  NOT NULL DEFAULT 2 CHECK (impact BETWEEN 1 AND 3),
  -- severity is computed server-side via a generated column so no one can cheat it.
  severity          int  GENERATED ALWAYS AS (probability * impact) STORED,
  status            text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','mitigating','accepted','closed','realized')),
  trigger_date      date,
  mitigation_owner  text REFERENCES team_members(id) ON DELETE SET NULL,
  mitigation_plan   text,
  created_by        text REFERENCES team_members(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX risks_deliverable_idx ON risks (deliverable_id);
CREATE INDEX risks_status_idx      ON risks (status);
CREATE INDEX risks_severity_idx    ON risks (severity DESC);

-- ============================================================
-- decisions
-- ============================================================
CREATE TABLE decisions (
  id                    text PRIMARY KEY,                  -- nanoid(10)
  deliverable_id        text,                              -- no FK; DELIVERABLES is static
  task_id               text REFERENCES project_tasks(id) ON DELETE SET NULL,
  title                 text NOT NULL,
  context               text,
  options_considered    text,
  decision              text,
  consequences          text,
  -- Either an internal FK or a free-text external (Brian, vendors, etc.). At least one.
  decided_by_member_id  text REFERENCES team_members(id) ON DELETE SET NULL,
  decided_by_external   text,
  decided_on            date NOT NULL,
  reversibility         text NOT NULL DEFAULT 'two_way'
    CHECK (reversibility IN ('one_way_door','two_way_door')),
  status                text NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed','approved','implemented','reversed')),
  supersedes            text REFERENCES decisions(id) ON DELETE SET NULL,
  superseded_by         text REFERENCES decisions(id) ON DELETE SET NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX decisions_deliverable_idx ON decisions (deliverable_id);
CREATE INDEX decisions_task_idx        ON decisions (task_id);
CREATE INDEX decisions_status_idx      ON decisions (status);
CREATE INDEX decisions_decided_on_idx  ON decisions (decided_on DESC);

-- Reuse the conditional touch_updated_at trigger function from migration 015.
CREATE TRIGGER risks_touch_updated_at
  BEFORE UPDATE ON risks
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER decisions_touch_updated_at
  BEFORE UPDATE ON decisions
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============================================================
-- RLS — mirrors 017
-- ============================================================
ALTER TABLE risks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "risks: select for proposal users"
  ON risks FOR SELECT TO authenticated
  USING (public.can_access_proposal() = true);
CREATE POLICY "risks: insert for proposal users"
  ON risks FOR INSERT TO authenticated
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "risks: update for proposal users"
  ON risks FOR UPDATE TO authenticated
  USING (public.can_access_proposal() = true)
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "risks: admin delete only"
  ON risks FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

CREATE POLICY "decisions: select for proposal users"
  ON decisions FOR SELECT TO authenticated
  USING (public.can_access_proposal() = true);
CREATE POLICY "decisions: insert for proposal users"
  ON decisions FOR INSERT TO authenticated
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "decisions: update for proposal users"
  ON decisions FOR UPDATE TO authenticated
  USING (public.can_access_proposal() = true)
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "decisions: admin delete only"
  ON decisions FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE risks, decisions;
