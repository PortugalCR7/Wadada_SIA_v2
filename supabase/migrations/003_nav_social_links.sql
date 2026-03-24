-- -------------------------------------------------------
-- si_nav_links
-- -------------------------------------------------------
CREATE TABLE si_nav_links (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  label          text NOT NULL DEFAULT '',
  href           text NOT NULL DEFAULT '',
  open_in_new_tab boolean NOT NULL DEFAULT false,
  sort_order     int  NOT NULL DEFAULT 0,
  active         boolean NOT NULL DEFAULT true,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);
CREATE TRIGGER trg_nav_links_updated_at
  BEFORE UPDATE ON si_nav_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE si_nav_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON si_nav_links FOR SELECT USING (true);
CREATE POLICY "service write" ON si_nav_links FOR ALL USING (auth.role() = 'service_role');

-- Seed with current hardcoded nav items
INSERT INTO si_nav_links (label, href, sort_order) VALUES
  ('Home',      '#hero',      0),
  ('Threshold', '#threshold', 1),
  ('The Arc',   '#arc',       2),
  ('Process',   '#process',   3),
  ('Apply',     '#apply',     4);

-- -------------------------------------------------------
-- si_social_links
-- -------------------------------------------------------
CREATE TABLE si_social_links (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  platform   text NOT NULL DEFAULT '',
  url        text NOT NULL DEFAULT '',
  sort_order int  NOT NULL DEFAULT 0,
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TRIGGER trg_social_links_updated_at
  BEFORE UPDATE ON si_social_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE si_social_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON si_social_links FOR SELECT USING (true);
CREATE POLICY "service write" ON si_social_links FOR ALL USING (auth.role() = 'service_role');

-- -------------------------------------------------------
-- si_footer_closing — add copyright_text column
-- -------------------------------------------------------
ALTER TABLE si_footer_closing
  ADD COLUMN IF NOT EXISTS copyright_text text NOT NULL DEFAULT '';
