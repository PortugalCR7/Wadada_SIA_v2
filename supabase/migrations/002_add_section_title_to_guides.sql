-- supabase/migrations/002_add_section_title_to_guides.sql
ALTER TABLE si_guides ADD COLUMN IF NOT EXISTS section_title TEXT DEFAULT '';
