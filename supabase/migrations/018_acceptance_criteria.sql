-- 018_acceptance_criteria.sql — add acceptance_criteria jsonb column to project_tasks
-- Mirrors the inline subtasks pattern: [{ id, label, completed }].

ALTER TABLE project_tasks
  ADD COLUMN acceptance_criteria jsonb NOT NULL DEFAULT '[]'::jsonb;
