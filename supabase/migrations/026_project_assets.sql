-- 026_project_assets.sql — third-party-delivered asset registry.
-- One row = one asset group (e.g. "Laminate Chips"); items inlined as jsonb,
-- mirroring the project_tasks.subtasks pattern. Drive / Dropbox URLs only;
-- Cloudinary stays out of the PM layer.
-- RLS + realtime mirror 021 / 024.

CREATE TABLE project_assets (
  id               text PRIMARY KEY,                  -- nanoid(10)
  name             text NOT NULL,                     -- group name, e.g. "Laminate Chips"
  category         text,                              -- free text: "samples", "3d", "photography"
  description      text,
  status           text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested','in_progress','partial','complete','blocked')),
  items            jsonb NOT NULL DEFAULT '[]'::jsonb,
  vendor           text,                              -- free text for now; FK to profiles later if formalized
  source_url       text,                              -- group-level Drive / Dropbox folder
  spreadsheet_url  text,                              -- source-of-truth spreadsheet (Google Sheets, etc.)
  notes            text,
  tags             text[] NOT NULL DEFAULT '{}',
  deliverable_id   text,                              -- no FK; DELIVERABLES is static
  sort_order       integer NOT NULL DEFAULT 0,
  delivered_at     timestamptz,                       -- set when status flips to 'complete'
  approved_at      timestamptz,                       -- schema-reserved; unused in initial build
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX project_assets_status_idx       ON project_assets (status);
CREATE INDEX project_assets_vendor_idx       ON project_assets (vendor);
CREATE INDEX project_assets_deliverable_idx  ON project_assets (deliverable_id);
CREATE INDEX project_assets_updated_idx      ON project_assets (updated_at DESC);

-- Reuse the conditional touch_updated_at trigger function from migration 015.
CREATE TRIGGER project_assets_touch_updated_at
  BEFORE UPDATE ON project_assets
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============================================================
-- RLS — mirrors 021 / 024
-- ============================================================
ALTER TABLE project_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_assets: select for proposal users"
  ON project_assets FOR SELECT TO authenticated
  USING (public.can_access_proposal() = true);
CREATE POLICY "project_assets: insert for proposal users"
  ON project_assets FOR INSERT TO authenticated
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "project_assets: update for proposal users"
  ON project_assets FOR UPDATE TO authenticated
  USING (public.can_access_proposal() = true)
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "project_assets: admin delete only"
  ON project_assets FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE project_assets;
