-- 020_content_map.sql — content_nodes + content_edges for the collaborative
-- website content map. Hierarchy lives on content_nodes.parent_id; content_edges
-- holds user-drawn cross-links only. RLS mirrors migration 017.

CREATE TABLE content_nodes (
  id          text PRIMARY KEY,
  parent_id   text REFERENCES content_nodes(id) ON DELETE SET NULL,
  title       text NOT NULL,
  body        text,
  kind        text NOT NULL DEFAULT 'page'
    CHECK (kind IN ('root','section','page','utility','note')),
  color       text,
  is_new      boolean NOT NULL DEFAULT false,
  auth_gate   text
    CHECK (auth_gate IN ('dealer','rep','admin')),
  position_x  double precision,
  position_y  double precision,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX content_nodes_parent_idx ON content_nodes (parent_id);

CREATE TABLE content_edges (
  id          text PRIMARY KEY,
  source_id   text NOT NULL REFERENCES content_nodes(id) ON DELETE CASCADE,
  target_id   text NOT NULL REFERENCES content_nodes(id) ON DELETE CASCADE,
  kind        text NOT NULL DEFAULT 'link'
    CHECK (kind IN ('parent','link')),
  label       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX content_edges_source_idx ON content_edges (source_id);
CREATE INDEX content_edges_target_idx ON content_edges (target_id);

-- Reuse the conditional touch_updated_at trigger function from migration 015.
CREATE TRIGGER content_nodes_touch_updated_at
  BEFORE UPDATE ON content_nodes
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER content_edges_touch_updated_at
  BEFORE UPDATE ON content_edges
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============================================================
-- RLS — mirror 017_sprints_rls.sql
-- ============================================================
ALTER TABLE content_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_nodes: select for proposal users"
  ON content_nodes FOR SELECT TO authenticated
  USING (public.can_access_proposal() = true);
CREATE POLICY "content_nodes: insert for proposal users"
  ON content_nodes FOR INSERT TO authenticated
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "content_nodes: update for proposal users"
  ON content_nodes FOR UPDATE TO authenticated
  USING (public.can_access_proposal() = true)
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "content_nodes: admin delete only"
  ON content_nodes FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

CREATE POLICY "content_edges: select for proposal users"
  ON content_edges FOR SELECT TO authenticated
  USING (public.can_access_proposal() = true);
CREATE POLICY "content_edges: insert for proposal users"
  ON content_edges FOR INSERT TO authenticated
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "content_edges: update for proposal users"
  ON content_edges FOR UPDATE TO authenticated
  USING (public.can_access_proposal() = true)
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "content_edges: admin delete only"
  ON content_edges FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- Realtime publication
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE content_nodes, content_edges;
