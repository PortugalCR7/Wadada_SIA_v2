-- ============================================================
-- Soul Initiation CMS — Full Schema
-- ============================================================

-- Helper: auto-update updated_at on every write
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------
-- si_hero_slides
-- -------------------------------------------------------
CREATE TABLE si_hero_slides (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sort_order   int  NOT NULL DEFAULT 0,
  image_url    text NOT NULL DEFAULT '',
  title_line1  text NOT NULL DEFAULT '',
  title_line2  text NOT NULL DEFAULT '',
  subtitle     text NOT NULL DEFAULT '',
  active       boolean NOT NULL DEFAULT true,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);
CREATE TRIGGER trg_hero_slides_updated_at
  BEFORE UPDATE ON si_hero_slides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE si_hero_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON si_hero_slides FOR SELECT USING (true);
CREATE POLICY "service write" ON si_hero_slides FOR ALL USING (auth.role() = 'service_role');

-- -------------------------------------------------------
-- si_intro (singleton)
-- -------------------------------------------------------
CREATE TABLE si_intro (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  eyebrow    text NOT NULL DEFAULT '',
  heading    text NOT NULL DEFAULT '',
  subtext    text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TRIGGER trg_intro_updated_at
  BEFORE UPDATE ON si_intro
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE si_intro ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON si_intro FOR SELECT USING (true);
CREATE POLICY "service write" ON si_intro FOR ALL USING (auth.role() = 'service_role');

-- -------------------------------------------------------
-- si_recognition_items
-- -------------------------------------------------------
CREATE TABLE si_recognition_items (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sort_order int  NOT NULL DEFAULT 0,
  title      text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TRIGGER trg_recognition_items_updated_at
  BEFORE UPDATE ON si_recognition_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE si_recognition_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON si_recognition_items FOR SELECT USING (true);
CREATE POLICY "service write" ON si_recognition_items FOR ALL USING (auth.role() = 'service_role');

-- -------------------------------------------------------
-- si_threshold_definition (singleton)
-- -------------------------------------------------------
CREATE TABLE si_threshold_definition (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  left_heading     text NOT NULL DEFAULT '',
  left_paragraph   text NOT NULL DEFAULT '',
  right_subheading text NOT NULL DEFAULT '',
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
CREATE TRIGGER trg_threshold_definition_updated_at
  BEFORE UPDATE ON si_threshold_definition
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE si_threshold_definition ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON si_threshold_definition FOR SELECT USING (true);
CREATE POLICY "service write" ON si_threshold_definition FOR ALL USING (auth.role() = 'service_role');

-- -------------------------------------------------------
-- si_threshold_items
-- -------------------------------------------------------
CREATE TABLE si_threshold_items (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sort_order int  NOT NULL DEFAULT 0,
  title      text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TRIGGER trg_threshold_items_updated_at
  BEFORE UPDATE ON si_threshold_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE si_threshold_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON si_threshold_items FOR SELECT USING (true);
CREATE POLICY "service write" ON si_threshold_items FOR ALL USING (auth.role() = 'service_role');

-- -------------------------------------------------------
-- si_philosophical_bridge (singleton)
-- -------------------------------------------------------
CREATE TABLE si_philosophical_bridge (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_text            text NOT NULL DEFAULT '',
  quote_highlight       text NOT NULL DEFAULT '',
  supporting_paragraph  text NOT NULL DEFAULT '',
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);
CREATE TRIGGER trg_philosophical_bridge_updated_at
  BEFORE UPDATE ON si_philosophical_bridge
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE si_philosophical_bridge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON si_philosophical_bridge FOR SELECT USING (true);
CREATE POLICY "service write" ON si_philosophical_bridge FOR ALL USING (auth.role() = 'service_role');

-- -------------------------------------------------------
-- si_program_definition_items  (NEW SECTION)
-- -------------------------------------------------------
CREATE TABLE si_program_definition_items (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sort_order int  NOT NULL DEFAULT 0,
  text       text NOT NULL DEFAULT '',
  category   text NOT NULL CHECK (category IN ('is_not', 'is')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TRIGGER trg_program_definition_items_updated_at
  BEFORE UPDATE ON si_program_definition_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE si_program_definition_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON si_program_definition_items FOR SELECT USING (true);
CREATE POLICY "service write" ON si_program_definition_items FOR ALL USING (auth.role() = 'service_role');

-- -------------------------------------------------------
-- si_arc_entries
-- -------------------------------------------------------
CREATE TABLE si_arc_entries (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sort_order       int  NOT NULL DEFAULT 0,
  image_url        text NOT NULL DEFAULT '',
  title            text NOT NULL DEFAULT '',
  description      text NOT NULL DEFAULT '',
  layout_direction text NOT NULL DEFAULT 'left' CHECK (layout_direction IN ('left', 'right')),
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
CREATE TRIGGER trg_arc_entries_updated_at
  BEFORE UPDATE ON si_arc_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE si_arc_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON si_arc_entries FOR SELECT USING (true);
CREATE POLICY "service write" ON si_arc_entries FOR ALL USING (auth.role() = 'service_role');

-- -------------------------------------------------------
-- si_requirements (singleton)
-- -------------------------------------------------------
CREATE TABLE si_requirements (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  left_heading  text NOT NULL DEFAULT '',
  left_tagline  text NOT NULL DEFAULT '',
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);
CREATE TRIGGER trg_requirements_updated_at
  BEFORE UPDATE ON si_requirements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE si_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON si_requirements FOR SELECT USING (true);
CREATE POLICY "service write" ON si_requirements FOR ALL USING (auth.role() = 'service_role');

-- -------------------------------------------------------
-- si_requirement_items
-- -------------------------------------------------------
CREATE TABLE si_requirement_items (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sort_order int  NOT NULL DEFAULT 0,
  label      text NOT NULL DEFAULT '',
  value      text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TRIGGER trg_requirement_items_updated_at
  BEFORE UPDATE ON si_requirement_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE si_requirement_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON si_requirement_items FOR SELECT USING (true);
CREATE POLICY "service write" ON si_requirement_items FOR ALL USING (auth.role() = 'service_role');

-- -------------------------------------------------------
-- si_who_for_items
-- -------------------------------------------------------
CREATE TABLE si_who_for_items (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sort_order int  NOT NULL DEFAULT 0,
  text       text NOT NULL DEFAULT '',
  column     text NOT NULL CHECK (column IN ('fit', 'not_fit')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TRIGGER trg_who_for_items_updated_at
  BEFORE UPDATE ON si_who_for_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE si_who_for_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON si_who_for_items FOR SELECT USING (true);
CREATE POLICY "service write" ON si_who_for_items FOR ALL USING (auth.role() = 'service_role');

-- -------------------------------------------------------
-- si_change_items
-- -------------------------------------------------------
CREATE TABLE si_change_items (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sort_order int  NOT NULL DEFAULT 0,
  title      text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TRIGGER trg_change_items_updated_at
  BEFORE UPDATE ON si_change_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE si_change_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON si_change_items FOR SELECT USING (true);
CREATE POLICY "service write" ON si_change_items FOR ALL USING (auth.role() = 'service_role');

-- -------------------------------------------------------
-- si_guides
-- -------------------------------------------------------
CREATE TABLE si_guides (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sort_order      int  NOT NULL DEFAULT 0,
  image_url       text NOT NULL DEFAULT '',
  heading         text NOT NULL DEFAULT '',
  body_paragraph_1 text NOT NULL DEFAULT '',
  body_paragraph_2 text NOT NULL DEFAULT '',
  cta_label       text NOT NULL DEFAULT '',
  cta_url         text NOT NULL DEFAULT '',
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
CREATE TRIGGER trg_guides_updated_at
  BEFORE UPDATE ON si_guides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE si_guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON si_guides FOR SELECT USING (true);
CREATE POLICY "service write" ON si_guides FOR ALL USING (auth.role() = 'service_role');

-- -------------------------------------------------------
-- si_testimonials
-- -------------------------------------------------------
CREATE TABLE si_testimonials (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sort_order  int  NOT NULL DEFAULT 0,
  quote       text NOT NULL DEFAULT '',
  author_name text NOT NULL DEFAULT '',
  author_role text NOT NULL DEFAULT '',
  avatar_url  text NOT NULL DEFAULT '',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
CREATE TRIGGER trg_testimonials_updated_at
  BEFORE UPDATE ON si_testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE si_testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON si_testimonials FOR SELECT USING (true);
CREATE POLICY "service write" ON si_testimonials FOR ALL USING (auth.role() = 'service_role');

-- -------------------------------------------------------
-- si_investment (singleton)
-- -------------------------------------------------------
CREATE TABLE si_investment (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  eyebrow         text NOT NULL DEFAULT '',
  price           text NOT NULL DEFAULT '',
  payment_note    text NOT NULL DEFAULT '',
  blockquote_text text NOT NULL DEFAULT '',
  cta_label       text NOT NULL DEFAULT '',
  cta_url         text NOT NULL DEFAULT '',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
CREATE TRIGGER trg_investment_updated_at
  BEFORE UPDATE ON si_investment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE si_investment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON si_investment FOR SELECT USING (true);
CREATE POLICY "service write" ON si_investment FOR ALL USING (auth.role() = 'service_role');

-- -------------------------------------------------------
-- si_next_steps
-- -------------------------------------------------------
CREATE TABLE si_next_steps (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sort_order  int  NOT NULL DEFAULT 0,
  step_number text NOT NULL DEFAULT '',
  title       text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
CREATE TRIGGER trg_next_steps_updated_at
  BEFORE UPDATE ON si_next_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE si_next_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON si_next_steps FOR SELECT USING (true);
CREATE POLICY "service write" ON si_next_steps FOR ALL USING (auth.role() = 'service_role');

-- -------------------------------------------------------
-- si_final_cta (singleton)
-- -------------------------------------------------------
CREATE TABLE si_final_cta (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  heading_main   text NOT NULL DEFAULT '',
  heading_accent text NOT NULL DEFAULT '',
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);
CREATE TRIGGER trg_final_cta_updated_at
  BEFORE UPDATE ON si_final_cta
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE si_final_cta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON si_final_cta FOR SELECT USING (true);
CREATE POLICY "service write" ON si_final_cta FOR ALL USING (auth.role() = 'service_role');

-- -------------------------------------------------------
-- si_footer_closing (singleton)
-- -------------------------------------------------------
CREATE TABLE si_footer_closing (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  body_copy         text NOT NULL DEFAULT '',
  availability_text text NOT NULL DEFAULT '',
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);
CREATE TRIGGER trg_footer_closing_updated_at
  BEFORE UPDATE ON si_footer_closing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE si_footer_closing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON si_footer_closing FOR SELECT USING (true);
CREATE POLICY "service write" ON si_footer_closing FOR ALL USING (auth.role() = 'service_role');

-- -------------------------------------------------------
-- subscribers
-- -------------------------------------------------------
CREATE TABLE subscribers (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email         text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  source        text NOT NULL DEFAULT 'soul-initiation-footer'
                CHECK (source IN ('soul-initiation-footer', 'admin'))
);
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert" ON subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "service all"   ON subscribers FOR ALL USING (auth.role() = 'service_role');

-- -------------------------------------------------------
-- Storage bucket (run in Supabase Storage dashboard or via CLI)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('soul-initiation', 'soul-initiation', true);
-- CREATE POLICY "public read" ON storage.objects FOR SELECT USING (bucket_id = 'soul-initiation');
-- CREATE POLICY "service upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'soul-initiation' AND auth.role() = 'service_role');
-- -------------------------------------------------------
