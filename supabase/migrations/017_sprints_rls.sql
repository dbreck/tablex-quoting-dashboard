-- 017_sprints_rls.sql — RLS for sprints + burndown_snapshots, mirrors 014 pattern.
-- read/write require can_access_proposal; delete requires admin role.

ALTER TABLE sprints             ENABLE ROW LEVEL SECURITY;
ALTER TABLE burndown_snapshots  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- sprints
-- ============================================================
CREATE POLICY "sprints: select for proposal users"
  ON sprints FOR SELECT TO authenticated
  USING (public.can_access_proposal() = true);
CREATE POLICY "sprints: insert for proposal users"
  ON sprints FOR INSERT TO authenticated
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "sprints: update for proposal users"
  ON sprints FOR UPDATE TO authenticated
  USING (public.can_access_proposal() = true)
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "sprints: admin delete only"
  ON sprints FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- burndown_snapshots
-- ============================================================
CREATE POLICY "burndown_snapshots: select for proposal users"
  ON burndown_snapshots FOR SELECT TO authenticated
  USING (public.can_access_proposal() = true);
CREATE POLICY "burndown_snapshots: insert for proposal users"
  ON burndown_snapshots FOR INSERT TO authenticated
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "burndown_snapshots: update for proposal users"
  ON burndown_snapshots FOR UPDATE TO authenticated
  USING (public.can_access_proposal() = true)
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "burndown_snapshots: admin delete only"
  ON burndown_snapshots FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- Realtime publication — both new tables live so the UI can react.
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE sprints, burndown_snapshots;
