-- 001_schema.sql — Full DDL for TableX Dashboard
-- Run this in Supabase SQL Editor after creating the project

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For SKU text search

-- ============================================================
-- AUTH: Profiles table (mirrors auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'contributor' CHECK (role IN ('admin', 'contributor')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- REFERENCE DATA (seeded from JSON, read-only for contributors)
-- ============================================================

-- Product Catalog — 6,098 products
CREATE TABLE product_catalog (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sku TEXT NOT NULL,
  series TEXT,
  shape TEXT,
  shape_name TEXT,
  size TEXT,
  base_type TEXT,
  top_cost NUMERIC(10,2) DEFAULT 0,
  route_cost NUMERIC(10,2) DEFAULT 0,
  base_cost NUMERIC(10,2) DEFAULT 0,
  nest_fold_cost NUMERIC(10,2) DEFAULT 0,
  asb_gn_lc_cost1 NUMERIC(10,2) DEFAULT 0,
  asb_gn_lc_cost2 NUMERIC(10,2) DEFAULT 0,
  assembly_cost NUMERIC(10,2) DEFAULT 0,
  lf_cost NUMERIC(10,2) DEFAULT 0,
  edge_cost NUMERIC(10,2) DEFAULT 0,
  freight_in_cost NUMERIC(10,2) DEFAULT 0,
  packaging_cost NUMERIC(10,2) DEFAULT 0,
  total_cost NUMERIC(10,2) DEFAULT 0,
  freight_out_pct NUMERIC(6,4) DEFAULT 0,
  gpm NUMERIC(6,4) DEFAULT 0,
  commission NUMERIC(6,4) DEFAULT 0,
  standard_price NUMERIC(10,2) DEFAULT 0,
  net_profit NUMERIC(10,2) DEFAULT 0,
  list_price NUMERIC(10,2) DEFAULT 0,
  discount_factor NUMERIC(6,4) DEFAULT 0,
  net_price NUMERIC(10,2) DEFAULT 0,
  new_net_profit NUMERIC(10,2) DEFAULT 0,
  price_50_20 NUMERIC(10,2) DEFAULT 0,
  price_50_20_5 NUMERIC(10,2) DEFAULT 0,
  price_50_20_10 NUMERIC(10,2) DEFAULT 0,
  price_50_20_15 NUMERIC(10,2) DEFAULT 0,
  price_50_20_20 NUMERIC(10,2) DEFAULT 0,
  notes TEXT
);

CREATE INDEX idx_product_catalog_sku ON product_catalog(sku);
CREATE INDEX idx_product_catalog_series ON product_catalog(series);
CREATE INDEX idx_product_catalog_shape ON product_catalog(shape);
CREATE INDEX idx_product_catalog_sku_trgm ON product_catalog USING gin (sku gin_trgm_ops);

-- Profit Analysis — 589 products
CREATE TABLE profit_analysis (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tag TEXT,
  qty NUMERIC(10,2) DEFAULT 0,
  sku TEXT NOT NULL,
  series TEXT,
  top_cost NUMERIC(10,2) DEFAULT 0,
  route_cost NUMERIC(10,2) DEFAULT 0,
  base_cost NUMERIC(10,2) DEFAULT 0,
  nest_fold_cost NUMERIC(10,2) DEFAULT 0,
  asb_gn_lc_cost1 NUMERIC(10,2) DEFAULT 0,
  asb_gn_lc_cost2 NUMERIC(10,2) DEFAULT 0,
  assembly_cost NUMERIC(10,2) DEFAULT 0,
  lf_cost NUMERIC(10,2) DEFAULT 0,
  freight_in_cost NUMERIC(10,2) DEFAULT 0,
  packaging_cost NUMERIC(10,2) DEFAULT 0,
  total_cost NUMERIC(10,2) DEFAULT 0,
  freight_out_pct NUMERIC(6,4) DEFAULT 0,
  gpm NUMERIC(6,4) DEFAULT 0,
  commission NUMERIC(6,4) DEFAULT 0,
  standard_price NUMERIC(10,2) DEFAULT 0,
  net_profit NUMERIC(10,2) DEFAULT 0,
  list_price NUMERIC(10,2) DEFAULT 0,
  discount_factor NUMERIC(6,4) DEFAULT 0,
  net_price NUMERIC(10,2) DEFAULT 0,
  new_net_profit NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  price_50_20 NUMERIC(10,2) DEFAULT 0,
  price_50_20_5 NUMERIC(10,2) DEFAULT 0,
  price_50_20_10 NUMERIC(10,2) DEFAULT 0,
  price_50_20_15 NUMERIC(10,2) DEFAULT 0,
  price_50_20_20 NUMERIC(10,2) DEFAULT 0
);

CREATE INDEX idx_profit_analysis_sku ON profit_analysis(sku);

-- Quote Queue — 3,595 historical quote requests
CREATE TABLE quote_queue (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  row_num INTEGER,
  email_from TEXT,
  date_time TEXT,
  date_normalized TEXT,
  year INTEGER,
  quote_number TEXT,
  dealer_project TEXT,
  special BOOLEAN DEFAULT false,
  staff TEXT,
  status TEXT,
  status_normalized TEXT
);

CREATE INDEX idx_quote_queue_year ON quote_queue(year);
CREATE INDEX idx_quote_queue_staff ON quote_queue(staff);

-- Quote Queue Metrics — computed analytics (single JSONB row)
CREATE TABLE quote_queue_metrics (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Staff — 4 members
CREATE TABLE staff (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  initials TEXT NOT NULL
);

-- Dealers — 13 dealers (also seeded as organizations)
CREATE TABLE dealers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL
);

-- ============================================================
-- TRANSACTIONAL DATA (migrated from localStorage)
-- ============================================================

-- Organizations (CRM)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'dealer' CHECK (type IN ('dealer', 'end_customer')),
  default_tier TEXT NOT NULL DEFAULT '50_20' CHECK (default_tier IN ('50_20', '50_20_5', '50_20_10', '50_20_15', '50_20_20')),
  phone TEXT,
  email TEXT,
  address TEXT,
  website TEXT,
  notes TEXT,
  is_seeded BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contacts (CRM)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT,
  title TEXT,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contacts_org ON contacts(organization_id);

-- Activities (CRM audit trail)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  quote_id UUID,  -- FK added after quotes table
  type TEXT NOT NULL CHECK (type IN ('note', 'quote_created', 'quote_sent', 'call', 'email', 'meeting')),
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activities_org ON activities(organization_id);

-- Quote number sequence
CREATE SEQUENCE quote_number_seq START WITH 1000;

-- Quotes
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number TEXT UNIQUE NOT NULL,
  -- Denormalized customer snapshot
  customer_name TEXT,
  customer_company TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  -- Relationships
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  -- Quote details
  project_name TEXT,
  discount_tier TEXT NOT NULL DEFAULT '50_20' CHECK (discount_tier IN ('50_20', '50_20_5', '50_20_10', '50_20_15', '50_20_20')),
  subtotal NUMERIC(10,2) DEFAULT 0,
  additional_discount NUMERIC(10,2) DEFAULT 0,
  additional_discount_type TEXT DEFAULT 'percentage' CHECK (additional_discount_type IN ('percentage', 'fixed')),
  freight_zone INTEGER,
  freight_cost NUMERIC(10,2) DEFAULT 0,
  tax_rate NUMERIC(6,4) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  notes TEXT,
  valid_until DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Quote Line Items
CREATE TABLE quote_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  description TEXT,
  series TEXT,
  shape TEXT,
  size TEXT,
  list_price NUMERIC(10,2) DEFAULT 0,
  net_price NUMERIC(10,2) DEFAULT 0,
  quantity INTEGER DEFAULT 1,
  total_price NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_line_items_quote ON quote_line_items(quote_id);

-- Add FK from activities to quotes
ALTER TABLE activities ADD CONSTRAINT fk_activities_quote
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL;
