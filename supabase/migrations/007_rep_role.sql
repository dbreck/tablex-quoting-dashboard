-- 007_rep_role.sql — Add rep role + org assignment to profiles
-- Run after 006_rep_group_hierarchy.sql

-- ============================================================
-- 1. Extend profile role to include rep
-- ============================================================
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'contributor', 'rep'));

-- ============================================================
-- 2. Add organization_id to profiles (links rep to their rep group)
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- ============================================================
-- 3. Helper function to get current user's org
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 4. Update RLS policies for rep-scoped access
-- ============================================================

-- Organizations: reps see their own rep group + child dealers
DROP POLICY IF EXISTS "organizations: select for authenticated" ON organizations;
CREATE POLICY "organizations: select for authenticated"
  ON organizations FOR SELECT TO authenticated
  USING (
    public.get_user_role() IN ('admin', 'contributor')
    OR (
      public.get_user_role() = 'rep' AND (
        id = public.get_user_org_id()
        OR parent_organization_id = public.get_user_org_id()
      )
    )
  );

-- Contacts: reps see contacts for their visible orgs
DROP POLICY IF EXISTS "contacts: select for authenticated" ON contacts;
CREATE POLICY "contacts: select for authenticated"
  ON contacts FOR SELECT TO authenticated
  USING (
    public.get_user_role() IN ('admin', 'contributor')
    OR (
      public.get_user_role() = 'rep' AND (
        organization_id = public.get_user_org_id()
        OR organization_id IN (
          SELECT id FROM organizations WHERE parent_organization_id = public.get_user_org_id()
        )
      )
    )
  );

-- Activities: reps see activities for their visible orgs
DROP POLICY IF EXISTS "activities: select for authenticated" ON activities;
CREATE POLICY "activities: select for authenticated"
  ON activities FOR SELECT TO authenticated
  USING (
    public.get_user_role() IN ('admin', 'contributor')
    OR (
      public.get_user_role() = 'rep' AND (
        organization_id = public.get_user_org_id()
        OR organization_id IN (
          SELECT id FROM organizations WHERE parent_organization_id = public.get_user_org_id()
        )
      )
    )
  );

-- Quotes: reps see quotes linked to their visible orgs
DROP POLICY IF EXISTS "quotes: select for authenticated" ON quotes;
CREATE POLICY "quotes: select for authenticated"
  ON quotes FOR SELECT TO authenticated
  USING (
    public.get_user_role() IN ('admin', 'contributor')
    OR (
      public.get_user_role() = 'rep' AND (
        organization_id = public.get_user_org_id()
        OR organization_id IN (
          SELECT id FROM organizations WHERE parent_organization_id = public.get_user_org_id()
        )
      )
    )
  );

-- Quote line items: reps see line items for their visible quotes
DROP POLICY IF EXISTS "quote_line_items: select for authenticated" ON quote_line_items;
CREATE POLICY "quote_line_items: select for authenticated"
  ON quote_line_items FOR SELECT TO authenticated
  USING (
    public.get_user_role() IN ('admin', 'contributor')
    OR (
      public.get_user_role() = 'rep' AND (
        quote_id IN (
          SELECT id FROM quotes WHERE
            organization_id = public.get_user_org_id()
            OR organization_id IN (
              SELECT id FROM organizations WHERE parent_organization_id = public.get_user_org_id()
            )
        )
      )
    )
  );

-- ============================================================
-- 5. Update handle_new_user to accept rep role from metadata
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'contributor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 6. Update role change prevention to include rep
-- ============================================================
CREATE OR REPLACE FUNCTION prevent_self_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    IF auth.uid() = OLD.id THEN
      RAISE EXCEPTION 'Cannot change your own role';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
