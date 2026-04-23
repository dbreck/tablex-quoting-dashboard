-- 016_sprints_burndown.sql — sprints (2-wk fixed), task assignment, burndown snapshots.
-- Phase B: add sprint layer orthogonal to Deliverable.phase. Tasks reference sprints
-- via nullable sprint_id; sprints don't reference tasks. Burndown captured nightly
-- via pg_cron.

CREATE TABLE sprints (
  id          text PRIMARY KEY,                  -- e.g. "sprint-001"
  name        text NOT NULL,                     -- e.g. "Sprint 1"
  goal        text,                              -- optional one-line objective
  start_date  date NOT NULL,
  end_date    date NOT NULL,
  status      text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','active','complete')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX sprints_start_date_idx ON sprints (start_date);
CREATE INDEX sprints_status_idx ON sprints (status);

ALTER TABLE project_tasks
  ADD COLUMN sprint_id text REFERENCES sprints(id) ON DELETE SET NULL;
CREATE INDEX project_tasks_sprint_idx ON project_tasks (sprint_id);

CREATE TABLE burndown_snapshots (
  id               bigserial PRIMARY KEY,
  sprint_id        text NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  snapshot_date    date NOT NULL,
  total_tasks      int NOT NULL DEFAULT 0,
  completed_tasks  int NOT NULL DEFAULT 0,
  total_hours      numeric NOT NULL DEFAULT 0,
  remaining_hours  numeric NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sprint_id, snapshot_date)
);
CREATE INDEX burndown_snapshots_sprint_idx ON burndown_snapshots (sprint_id, snapshot_date);

-- Reuse the conditional touch_updated_at trigger function from migration 015.
CREATE TRIGGER sprints_touch_updated_at BEFORE UPDATE ON sprints FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- pg_cron extension (idempotent). On Supabase this lives in the `extensions` schema.
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Daily burndown snapshot at 23:59 UTC for active sprints.
-- Hours columns are zero placeholders — populated when per-task estimated_hours lands (Phase B+).
SELECT cron.schedule(
  'tablex-burndown-snapshot',
  '59 23 * * *',
  $$
    INSERT INTO burndown_snapshots (sprint_id, snapshot_date, total_tasks, completed_tasks, total_hours, remaining_hours)
    SELECT
      s.id,
      CURRENT_DATE,
      COUNT(t.id),
      COUNT(t.id) FILTER (WHERE t."column" = 'done'),
      0,
      0
    FROM sprints s
    LEFT JOIN project_tasks t ON t.sprint_id = s.id
    WHERE s.status = 'active'
    GROUP BY s.id
    ON CONFLICT (sprint_id, snapshot_date) DO UPDATE SET
      total_tasks = EXCLUDED.total_tasks,
      completed_tasks = EXCLUDED.completed_tasks;
  $$
);
