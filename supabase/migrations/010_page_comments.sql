-- 010: Page comments / annotation system
CREATE TABLE page_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path text NOT NULL,
  marker_x numeric NOT NULL,
  marker_y numeric NOT NULL,
  content text NOT NULL,
  author_name text NOT NULL DEFAULT 'Anonymous',
  author_email text,
  is_resolved boolean NOT NULL DEFAULT false,
  parent_id uuid REFERENCES page_comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_page_comments_path ON page_comments(page_path);
CREATE INDEX idx_page_comments_parent ON page_comments(parent_id) WHERE parent_id IS NOT NULL;

ALTER TABLE page_comments ENABLE ROW LEVEL SECURITY;

-- Allow all users to read comments (stakeholders may not have accounts)
CREATE POLICY "Anyone can read comments" ON page_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can create comments" ON page_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update comments" ON page_comments FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete comments" ON page_comments FOR DELETE USING (auth.role() = 'authenticated');

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_page_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER page_comments_updated_at
  BEFORE UPDATE ON page_comments
  FOR EACH ROW EXECUTE FUNCTION update_page_comments_updated_at();
