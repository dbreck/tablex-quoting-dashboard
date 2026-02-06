-- Prevent users from changing their own role via RLS-authenticated requests.
-- The service-role key bypasses RLS entirely, so admin API routes can still update roles.

CREATE OR REPLACE FUNCTION prevent_self_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check if role is being changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- If the current user matches the row being updated, block it
    -- auth.uid() returns NULL for service-role requests (RLS bypassed)
    IF auth.uid() = OLD.id THEN
      RAISE EXCEPTION 'Cannot change your own role';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_self_role_change_trigger ON profiles;

CREATE TRIGGER prevent_self_role_change_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_self_role_change();
