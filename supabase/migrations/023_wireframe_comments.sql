-- 023_wireframe_comments.sql — comments left inside the static wireframe iframes
-- Iframe is local-storage primary; this table is the server mirror so the
-- dashboard can surface comments without an Export step.
-- Synced via /api/wireframe-comments (debounced upsert from the iframe).

CREATE TABLE wireframe_comments (
  id           text PRIMARY KEY,
  page_path    text NOT NULL,
  set_key      text NOT NULL CHECK (set_key IN ('site','system')),
  page_id      text NOT NULL,
  marker_x     numeric NOT NULL,
  marker_y     numeric NOT NULL,
  body         text NOT NULL,
  author       text NOT NULL DEFAULT 'Anonymous',
  is_resolved  boolean NOT NULL DEFAULT false,
  created_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX wireframe_comments_path_idx    ON wireframe_comments (page_path);
CREATE INDEX wireframe_comments_set_idx     ON wireframe_comments (set_key, page_id);
CREATE INDEX wireframe_comments_created_idx ON wireframe_comments (created_at DESC);

CREATE TRIGGER wireframe_comments_touch_updated_at
  BEFORE UPDATE ON wireframe_comments
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

ALTER TABLE wireframe_comments ENABLE ROW LEVEL SECURITY;

-- Mirrors comments / risks / decisions: proposal users CRUD, admin-only delete.
-- The /api/wireframe-comments route uses the admin client after verifying the
-- caller, so RLS is the second line of defense, not the primary gate.
CREATE POLICY "wireframe_comments: select for proposal users"
  ON wireframe_comments FOR SELECT TO authenticated
  USING (public.can_access_proposal());

CREATE POLICY "wireframe_comments: insert for proposal users"
  ON wireframe_comments FOR INSERT TO authenticated
  WITH CHECK (public.can_access_proposal());

CREATE POLICY "wireframe_comments: update for proposal users"
  ON wireframe_comments FOR UPDATE TO authenticated
  USING (public.can_access_proposal())
  WITH CHECK (public.can_access_proposal());

CREATE POLICY "wireframe_comments: admin delete only"
  ON wireframe_comments FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');
