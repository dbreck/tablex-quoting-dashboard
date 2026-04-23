-- 014_project_tracker_rls.sql — RLS for project tracker tables
-- Pattern: read/write require can_access_proposal; delete requires admin role.
-- Mirrors the existing get_user_role() helper from 002_rls.sql.

-- ============================================================
-- Helper: current user's can_access_proposal flag
-- ============================================================
CREATE OR REPLACE FUNCTION public.can_access_proposal()
RETURNS boolean AS $$
  SELECT can_access_proposal FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- Enable RLS
-- ============================================================
ALTER TABLE team_members          ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverable_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_links            ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log              ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracker_meta          ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- team_members
-- ============================================================
CREATE POLICY "team_members: select for proposal users"
  ON team_members FOR SELECT TO authenticated
  USING (public.can_access_proposal() = true);
CREATE POLICY "team_members: insert for proposal users"
  ON team_members FOR INSERT TO authenticated
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "team_members: update for proposal users"
  ON team_members FOR UPDATE TO authenticated
  USING (public.can_access_proposal() = true)
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "team_members: admin delete only"
  ON team_members FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- project_tasks
-- ============================================================
CREATE POLICY "project_tasks: select for proposal users"
  ON project_tasks FOR SELECT TO authenticated
  USING (public.can_access_proposal() = true);
CREATE POLICY "project_tasks: insert for proposal users"
  ON project_tasks FOR INSERT TO authenticated
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "project_tasks: update for proposal users"
  ON project_tasks FOR UPDATE TO authenticated
  USING (public.can_access_proposal() = true)
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "project_tasks: admin delete only"
  ON project_tasks FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- deliverable_overrides
-- ============================================================
CREATE POLICY "deliverable_overrides: select for proposal users"
  ON deliverable_overrides FOR SELECT TO authenticated
  USING (public.can_access_proposal() = true);
CREATE POLICY "deliverable_overrides: insert for proposal users"
  ON deliverable_overrides FOR INSERT TO authenticated
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "deliverable_overrides: update for proposal users"
  ON deliverable_overrides FOR UPDATE TO authenticated
  USING (public.can_access_proposal() = true)
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "deliverable_overrides: admin delete only"
  ON deliverable_overrides FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- sync_links
-- ============================================================
CREATE POLICY "sync_links: select for proposal users"
  ON sync_links FOR SELECT TO authenticated
  USING (public.can_access_proposal() = true);
CREATE POLICY "sync_links: insert for proposal users"
  ON sync_links FOR INSERT TO authenticated
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "sync_links: update for proposal users"
  ON sync_links FOR UPDATE TO authenticated
  USING (public.can_access_proposal() = true)
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "sync_links: admin delete only"
  ON sync_links FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- sync_log (append-only audit; no Realtime publication)
-- ============================================================
CREATE POLICY "sync_log: select for proposal users"
  ON sync_log FOR SELECT TO authenticated
  USING (public.can_access_proposal() = true);
CREATE POLICY "sync_log: insert for proposal users"
  ON sync_log FOR INSERT TO authenticated
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "sync_log: update for proposal users"
  ON sync_log FOR UPDATE TO authenticated
  USING (public.can_access_proposal() = true)
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "sync_log: admin delete only"
  ON sync_log FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- tracker_meta
-- ============================================================
CREATE POLICY "tracker_meta: select for proposal users"
  ON tracker_meta FOR SELECT TO authenticated
  USING (public.can_access_proposal() = true);
CREATE POLICY "tracker_meta: insert for proposal users"
  ON tracker_meta FOR INSERT TO authenticated
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "tracker_meta: update for proposal users"
  ON tracker_meta FOR UPDATE TO authenticated
  USING (public.can_access_proposal() = true)
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "tracker_meta: admin delete only"
  ON tracker_meta FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- Realtime publication — five live tables. sync_log excluded (audit only).
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE
  project_tasks,
  deliverable_overrides,
  team_members,
  sync_links,
  tracker_meta;
