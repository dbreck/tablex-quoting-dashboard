-- 005_quote_requests.sql — Quote request pipeline from configurator
-- Run after 004_restrict_role_updates.sql

-- ============================================================
-- Sequence for request numbers
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS quote_request_number_seq START WITH 100;

-- ============================================================
-- Quote requests table
-- ============================================================
CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE NOT NULL DEFAULT '',

  -- Contact info (from modal)
  contact_first_name TEXT NOT NULL,
  contact_last_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  contact_company TEXT,

  -- Configuration snapshot
  series_code TEXT NOT NULL,
  series_name TEXT NOT NULL,
  shape_code TEXT NOT NULL,
  size TEXT NOT NULL,
  base_code TEXT NOT NULL,
  base_finish TEXT,
  top_material TEXT,
  top_finish TEXT,
  edge_type TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'quoted', 'closed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Auto-generate request number: RQ-NNN
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_request_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.request_number IS NULL OR NEW.request_number = '' THEN
    NEW.request_number := 'RQ-' || nextval('quote_request_number_seq')::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_request_number
  BEFORE INSERT ON quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.generate_request_number();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all requests
CREATE POLICY "Authenticated users can view quote requests"
  ON quote_requests FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert requests
CREATE POLICY "Authenticated users can insert quote requests"
  ON quote_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins can update requests
CREATE POLICY "Admins can update quote requests"
  ON quote_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete requests
CREATE POLICY "Admins can delete quote requests"
  ON quote_requests FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
