-- 013_project_tracker_tables.sql — project tracker schema (tasks, overrides, team, sync)
-- Phase A: migrate Zustand persist blob into Supabase. DELIVERABLES stays static in code,
-- so deliverable_id columns here are plain text without FK references.

-- team_members: seed + custom members, addressable by business id (nanoid or 'danny' etc.)
CREATE TABLE team_members (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  role          text NOT NULL,
  initials      text NOT NULL,
  color         text NOT NULL,
  company       text,
  title         text,
  email         text,
  phone         text,
  notes         text,
  profile_id    uuid REFERENCES profiles(id) ON DELETE SET NULL, -- reserved for later; nullable today
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- project_tasks: inline subtasks (jsonb) + labels (text[])
CREATE TABLE project_tasks (
  id             text PRIMARY KEY,  -- "${deliverableId}-r${idx}" or nanoid(10)
  deliverable_id text NOT NULL,     -- no FK; DELIVERABLES lives in code
  title          text NOT NULL,
  description    text,
  "column"       text NOT NULL CHECK ("column" IN ('backlog','in-progress','in-review','done')),
  priority       text NOT NULL CHECK (priority IN ('low','medium','high','critical')),
  assignee       text REFERENCES team_members(id) ON DELETE SET NULL,
  labels         text[] NOT NULL DEFAULT '{}',
  subtasks       jsonb  NOT NULL DEFAULT '[]'::jsonb,
  due_date       date,
  sort_order     int    NOT NULL DEFAULT 0,
  completed_at   timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX project_tasks_deliverable_idx ON project_tasks (deliverable_id);
CREATE INDEX project_tasks_assignee_idx    ON project_tasks (assignee);
CREATE INDEX project_tasks_column_idx      ON project_tasks ("column");

-- deliverable_overrides: scope-layer mutable fields
CREATE TABLE deliverable_overrides (
  deliverable_id  text PRIMARY KEY,  -- no FK; DELIVERABLES is static
  baseline_days   numeric,
  rationale       text,
  days_override   numeric,
  manual_status   text CHECK (manual_status IN ('planned','in-progress','complete')),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- sync_links: one row per tableXId (task or deliverable) linked to Monday
CREATE TABLE sync_links (
  table_x_id              text PRIMARY KEY,
  monday_item_id          text,
  last_synced_at          timestamptz,
  last_monday_updated_at  timestamptz
);

-- sync_log: append-only history, capped at 500 rows via trigger
CREATE TABLE sync_log (
  id           bigserial PRIMARY KEY,
  at           timestamptz NOT NULL DEFAULT now(),
  direction    text NOT NULL CHECK (direction IN ('pulled','pushed','linked','skipped','error')),
  kind         text NOT NULL CHECK (kind IN ('task','deliverable')),
  table_x_id   text NOT NULL,
  detail       text
);
CREATE INDEX sync_log_at_idx ON sync_log (at DESC);

-- tracker_meta: key-value for single scalars (baselinedAt, etc.)
CREATE TABLE tracker_meta (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- updated_at triggers for the four tables that have it
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_tasks_touch_updated_at        BEFORE UPDATE ON project_tasks         FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER deliverable_overrides_touch_updated   BEFORE UPDATE ON deliverable_overrides FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER team_members_touch_updated_at         BEFORE UPDATE ON team_members          FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER tracker_meta_touch_updated_at         BEFORE UPDATE ON tracker_meta          FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- sync_log retention trigger — keep newest 500 rows
CREATE OR REPLACE FUNCTION trim_sync_log() RETURNS trigger AS $$
BEGIN
  DELETE FROM sync_log WHERE id IN (
    SELECT id FROM sync_log ORDER BY id DESC OFFSET 500
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER sync_log_trim_after_insert AFTER INSERT ON sync_log FOR EACH STATEMENT EXECUTE FUNCTION trim_sync_log();
