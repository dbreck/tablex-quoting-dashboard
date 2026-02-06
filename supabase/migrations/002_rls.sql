-- 002_rls.sql — Row Level Security policies
-- Run after 001_schema.sql

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_queue_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper function to get current user's role
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE POLICY "Profiles: viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Profiles: users can update own row"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================
-- REFERENCE DATA (catalog, profit_analysis, quote_queue, etc.)
-- All authenticated can SELECT. Only admin can INSERT/UPDATE/DELETE.
-- ============================================================

-- Product Catalog
CREATE POLICY "product_catalog: select for authenticated"
  ON product_catalog FOR SELECT TO authenticated USING (true);
CREATE POLICY "product_catalog: admin insert"
  ON product_catalog FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() = 'admin');
CREATE POLICY "product_catalog: admin update"
  ON product_catalog FOR UPDATE TO authenticated
  USING (public.get_user_role() = 'admin');
CREATE POLICY "product_catalog: admin delete"
  ON product_catalog FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- Profit Analysis
CREATE POLICY "profit_analysis: select for authenticated"
  ON profit_analysis FOR SELECT TO authenticated USING (true);
CREATE POLICY "profit_analysis: admin insert"
  ON profit_analysis FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() = 'admin');
CREATE POLICY "profit_analysis: admin update"
  ON profit_analysis FOR UPDATE TO authenticated
  USING (public.get_user_role() = 'admin');
CREATE POLICY "profit_analysis: admin delete"
  ON profit_analysis FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- Quote Queue
CREATE POLICY "quote_queue: select for authenticated"
  ON quote_queue FOR SELECT TO authenticated USING (true);
CREATE POLICY "quote_queue: admin insert"
  ON quote_queue FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() = 'admin');
CREATE POLICY "quote_queue: admin update"
  ON quote_queue FOR UPDATE TO authenticated
  USING (public.get_user_role() = 'admin');
CREATE POLICY "quote_queue: admin delete"
  ON quote_queue FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- Quote Queue Metrics
CREATE POLICY "quote_queue_metrics: select for authenticated"
  ON quote_queue_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "quote_queue_metrics: admin insert"
  ON quote_queue_metrics FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() = 'admin');
CREATE POLICY "quote_queue_metrics: admin update"
  ON quote_queue_metrics FOR UPDATE TO authenticated
  USING (public.get_user_role() = 'admin');
CREATE POLICY "quote_queue_metrics: admin delete"
  ON quote_queue_metrics FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- Staff
CREATE POLICY "staff: select for authenticated"
  ON staff FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff: admin insert"
  ON staff FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() = 'admin');
CREATE POLICY "staff: admin update"
  ON staff FOR UPDATE TO authenticated
  USING (public.get_user_role() = 'admin');
CREATE POLICY "staff: admin delete"
  ON staff FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- Dealers
CREATE POLICY "dealers: select for authenticated"
  ON dealers FOR SELECT TO authenticated USING (true);
CREATE POLICY "dealers: admin insert"
  ON dealers FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() = 'admin');
CREATE POLICY "dealers: admin update"
  ON dealers FOR UPDATE TO authenticated
  USING (public.get_user_role() = 'admin');
CREATE POLICY "dealers: admin delete"
  ON dealers FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- TRANSACTIONAL DATA
-- All authenticated can SELECT/INSERT/UPDATE. Only admin can DELETE.
-- ============================================================

-- Organizations
CREATE POLICY "organizations: select for authenticated"
  ON organizations FOR SELECT TO authenticated USING (true);
CREATE POLICY "organizations: insert for authenticated"
  ON organizations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "organizations: update for authenticated"
  ON organizations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "organizations: admin delete only"
  ON organizations FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- Contacts
CREATE POLICY "contacts: select for authenticated"
  ON contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "contacts: insert for authenticated"
  ON contacts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "contacts: update for authenticated"
  ON contacts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "contacts: admin delete only"
  ON contacts FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- Activities
CREATE POLICY "activities: select for authenticated"
  ON activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "activities: insert for authenticated"
  ON activities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "activities: update for authenticated"
  ON activities FOR UPDATE TO authenticated USING (true);
CREATE POLICY "activities: admin delete only"
  ON activities FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- Quotes
CREATE POLICY "quotes: select for authenticated"
  ON quotes FOR SELECT TO authenticated USING (true);
CREATE POLICY "quotes: insert for authenticated"
  ON quotes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "quotes: update for authenticated"
  ON quotes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "quotes: admin delete only"
  ON quotes FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- Quote Line Items
CREATE POLICY "quote_line_items: select for authenticated"
  ON quote_line_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "quote_line_items: insert for authenticated"
  ON quote_line_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "quote_line_items: update for authenticated"
  ON quote_line_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "quote_line_items: admin delete only"
  ON quote_line_items FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');
