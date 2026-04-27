-- 022_task_blocker.sql — flag a task as blocked with a free-text reason.
-- blocker_reason holds the explanation; blocked_at is stamped when first
-- raised and cleared when resolved. Independent of the kanban column so a
-- task can be "in-progress but blocked".

ALTER TABLE project_tasks
  ADD COLUMN blocker_reason text,
  ADD COLUMN blocked_at timestamptz;
