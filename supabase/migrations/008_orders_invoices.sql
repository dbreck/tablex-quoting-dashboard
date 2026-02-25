-- 008_orders_invoices.sql — Orders and invoices tables
-- Run after 007_rep_role.sql

-- ============================================================
-- Sequences for auto-numbering
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1000;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START WITH 1000;

-- ============================================================
-- Orders table
-- ============================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  quote_id UUID NOT NULL REFERENCES quotes(id),
  organization_id UUID REFERENCES organizations(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'completed', 'cancelled'
  )),
  po_number TEXT,
  ship_to_address TEXT,
  ship_to_city TEXT,
  ship_to_state TEXT,
  ship_to_zip TEXT,
  requested_ship_date DATE,
  actual_ship_date DATE,
  notes TEXT,
  -- Sage integration fields (future)
  sage_sales_order_id TEXT,
  sage_synced_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_quote ON orders(quote_id);
CREATE INDEX idx_orders_org ON orders(organization_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ============================================================
-- Invoices table
-- ============================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  order_id UUID NOT NULL REFERENCES orders(id),
  organization_id UUID REFERENCES organizations(id),
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  freight NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'sent', 'paid', 'overdue', 'void'
  )),
  due_date DATE,
  paid_date DATE,
  paid_amount NUMERIC(10,2),
  payment_method TEXT,
  notes TEXT,
  -- Sage integration fields (future)
  sage_invoice_id TEXT,
  sage_synced_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_invoices_order ON invoices(order_id);
CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- ============================================================
-- Auto-generate order number: ORD-NNNN
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'ORD-' || lpad(nextval('order_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- ============================================================
-- Auto-generate invoice number: INV-NNNN
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := 'INV-' || lpad(nextval('invoice_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();

-- ============================================================
-- Auto-update updated_at
-- ============================================================
CREATE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_invoices
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Orders: reps see orders for their orgs, admin/contributor see all
CREATE POLICY "orders: select for authenticated"
  ON orders FOR SELECT TO authenticated
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

CREATE POLICY "orders: insert for authenticated"
  ON orders FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "orders: update for admin/contributor"
  ON orders FOR UPDATE TO authenticated
  USING (public.get_user_role() IN ('admin', 'contributor'));

CREATE POLICY "orders: admin delete only"
  ON orders FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- Invoices: reps see invoices for their orgs, admin/contributor see all
CREATE POLICY "invoices: select for authenticated"
  ON invoices FOR SELECT TO authenticated
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

CREATE POLICY "invoices: insert for admin/contributor"
  ON invoices FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() IN ('admin', 'contributor'));

CREATE POLICY "invoices: update for admin/contributor"
  ON invoices FOR UPDATE TO authenticated
  USING (public.get_user_role() IN ('admin', 'contributor'));

CREATE POLICY "invoices: admin delete only"
  ON invoices FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');
