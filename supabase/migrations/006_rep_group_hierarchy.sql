-- 006_rep_group_hierarchy.sql — Add rep_group org type + parent hierarchy
-- Run after 005_quote_requests.sql

-- ============================================================
-- 1. Extend organization type to include rep_group
-- ============================================================
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_type_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_type_check
  CHECK (type IN ('dealer', 'end_customer', 'rep_group'));

-- ============================================================
-- 2. Add parent_organization_id for hierarchy (rep_group → dealer)
-- ============================================================
ALTER TABLE organizations
  ADD COLUMN parent_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- ============================================================
-- 3. Rep groups cannot have a parent (top-level only)
-- ============================================================
CREATE OR REPLACE FUNCTION check_org_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
  -- Rep groups must be top-level (no parent)
  IF NEW.type = 'rep_group' AND NEW.parent_organization_id IS NOT NULL THEN
    RAISE EXCEPTION 'Rep groups cannot have a parent organization';
  END IF;
  -- Only dealers can have a parent
  IF NEW.parent_organization_id IS NOT NULL AND NEW.type != 'dealer' THEN
    RAISE EXCEPTION 'Only dealers can be assigned to a rep group';
  END IF;
  -- Parent must be a rep_group
  IF NEW.parent_organization_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM organizations WHERE id = NEW.parent_organization_id AND type = 'rep_group'
    ) THEN
      RAISE EXCEPTION 'Parent organization must be a rep group';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_org_hierarchy
  BEFORE INSERT OR UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION check_org_hierarchy();

-- ============================================================
-- 4. Index for fast hierarchy queries
-- ============================================================
CREATE INDEX idx_organizations_parent ON organizations(parent_organization_id);
