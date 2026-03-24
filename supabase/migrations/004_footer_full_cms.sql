-- -------------------------------------------------------
-- si_footer_closing — add all CMS-editable footer fields
-- -------------------------------------------------------
ALTER TABLE si_footer_closing
  ADD COLUMN IF NOT EXISTS brand_heading          text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS brand_description      text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_location       text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_email          text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_phone          text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS newsletter_heading     text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS newsletter_description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS newsletter_button_text text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS privacy_policy_label   text NOT NULL DEFAULT 'Privacy Policy',
  ADD COLUMN IF NOT EXISTS privacy_policy_url     text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS terms_label            text NOT NULL DEFAULT 'Terms of Service',
  ADD COLUMN IF NOT EXISTS terms_url              text NOT NULL DEFAULT '';
