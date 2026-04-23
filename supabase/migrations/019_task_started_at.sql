-- 019_task_started_at.sql — track when a task actually began work
-- startedAt is stamped on the first transition out of "backlog" and never
-- overwritten. Used to render real Gantt bars on the sprint timeline.

ALTER TABLE project_tasks
  ADD COLUMN started_at timestamptz;
