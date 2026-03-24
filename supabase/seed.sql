-- ============================================================
-- Soul Initiation CMS — Seed Data
-- Run this in your Supabase SQL Editor to populate all tables
-- with the original hardcoded page content.
-- ============================================================

-- si_intro
INSERT INTO si_intro (eyebrow, heading, subtext) VALUES (
  'The Threshold',
  'You''ve Done the Work. But Something in You Knows You Haven''t Crossed Yet.',
  'A six-month initiation for people at a real threshold in their life — not seeking more insight, but a way to move through.'
);

-- si_hero_slides
INSERT INTO si_hero_slides (sort_order, image_url, title_line1, title_line2, subtitle, active) VALUES
(0, '/soul_initiation/mountain.png', 'SOUL', 'INITIATION', 'A six-month container for real transition', true),
(1, '/soul_initiation/desert.png', 'THE', 'THRESHOLD', 'A six-month container for real transition', true),
(2, '/soul_initiation/forest.png', 'THE', 'DESCENT', 'A six-month container for real transition', true);

-- si_recognition_items
INSERT INTO si_recognition_items (sort_order, title, description) VALUES
(0, 'You''ve outgrown something', 'A way of working, relating, or living that once fit — and no longer does.'),
(1, 'Something larger is asking to move through you', 'A sense of pull or pressure that isn''t anxiety — it''s calling.'),
(2, 'You''re between identities', 'Clarity in some areas, but a lack of orientation in others — without language for where you are.'),
(3, 'You''re not looking to be convinced', 'You already feel this. You''re trying to understand what to do with it.');

-- si_threshold_definition
INSERT INTO si_threshold_definition (left_heading, left_paragraph, right_subheading) VALUES (
  'This Is Not Confusion. <br /><span class="font-accent italic normal-case font-light text-black/40 tracking-normal">It''s a Threshold.</span>',
  'A genuine life threshold is not a problem to be solved. It is a passage to be moved through — a moment when one chapter has ended and another has not yet fully begun.',
  'What happens without structure'
);

-- si_threshold_items
INSERT INTO si_threshold_items (sort_order, title, description) VALUES
(0, 'Prolonged uncertainty', 'The waiting stretches without a sense of forward movement.'),
(1, 'Looping reflection', 'The same questions cycling without resolution or relief.'),
(2, 'Quiet stagnation', 'Not because something is wrong — but because something real is happening without being named.');

-- si_philosophical_bridge
INSERT INTO si_philosophical_bridge (quote_text, quote_highlight, supporting_paragraph) VALUES (
  'Most people are not lost. They are living from a structure that is no longer true.',
  'no longer true',
  'Initiation is what allows that structure to loosen — and something more aligned to take its place. The insight was never the missing piece. The missing piece was a structure capable of honoring what is actually happening.'
);

-- si_program_definition_items
INSERT INTO si_program_definition_items (sort_order, text, category) VALUES
(0, 'Therapy or coaching',              'is_not'),
(1, 'A course or curriculum',           'is_not'),
(2, 'A spiritual bypass',               'is_not'),
(3, 'A quick transformation',           'is_not'),
(0, 'A structured passage',             'is'),
(1, 'A container for real crossing',    'is'),
(2, 'Accompaniment through threshold',  'is'),
(3, 'A time-tested initiatory process', 'is');

-- si_arc_entries
INSERT INTO si_arc_entries (sort_order, image_url, title, description, layout_direction) VALUES
(0, '/soul_initiation/mountain.png', '1. Separation', 'Stepping back from the structures, identities, and roles that have shaped your life — creating the necessary space for something new to emerge.', 'left'),
(1, '/soul_initiation/desert.png',  '2. Descent',    'Developing a living relationship with a deeper layer of intelligence — what this work calls Soul. Learning to listen to what has been speaking beneath the noise.', 'right'),
(2, '/soul_initiation/forest.png',  '3. Threshold',  'A one-day solo ceremony in nature — the SoulQuest — marking the actual crossing. A moment held by the earth, the silence, and the work that came before.', 'left'),
(3, '/soul_initiation/ocean.png',   '4. Return',     'Re-entering your life with a different orientation — and learning, with support, how to actually live from it in the day-to-day.', 'right');

-- si_requirements
INSERT INTO si_requirements (left_heading, left_tagline) VALUES (
  'What This Requires',
  'It asks to be met. It is not designed to be fit into the margins.'
);

-- si_requirement_items
INSERT INTO si_requirement_items (sort_order, label, value) VALUES
(0, 'Duration', '6 Months — April through September 2026'),
(1, 'Time Commitment', '4–6 Hours Per Week'),
(2, 'Group Sessions', '12 Live Sessions via Zoom'),
(3, '1:1 Mentoring', '12 Private Sessions'),
(4, 'The SoulQuest', 'One Day Solo — Nature ceremony');

-- si_who_for_items
INSERT INTO si_who_for_items (sort_order, text, "column") VALUES
(0, 'Sense something in your life shifting at a deeper level', 'fit'),
(1, 'Have already done significant inner or outer work', 'fit'),
(2, 'Are not looking for quick answers, but for real orientation', 'fit'),
(3, 'Feel ready to engage something meaningful, even if uncertain', 'fit'),
(0, 'Are primarily seeking clarity without willingness to change', 'not_fit'),
(1, 'Want a defined outcome or guaranteed transformation', 'not_fit'),
(2, 'Are not in a place to make real space for this level of engagement', 'not_fit');

-- si_change_items
INSERT INTO si_change_items (sort_order, title, description) VALUES
(0, 'Clearer direction', 'A growing sense of what you are oriented toward — even when the path is unfolding.'),
(1, 'Decisions that hold', 'Choices that feel less tentative, less revisited — rooted in something stable.'),
(2, 'Relationship with depth', 'An ongoing, felt connection with a deeper layer of intelligence — as an actual access point.'),
(3, 'A new center', 'What was previously ambiguous becomes more legible as you relate to life differently.');

-- si_guides
INSERT INTO si_guides (sort_order, image_url, heading, body_paragraph_1, body_paragraph_2, cta_label, cta_url, active) VALUES (
  0,
  '/soul_initiation/mountain.png',
  'You Are Accompanied, <br /><span class="font-accent italic normal-case font-light text-zinc-400 underline decoration-1 decoration-zinc-200 underline-offset-8 tracking-normal">Not Led</span>',
  'Each guide in this program has crossed similar terrain themselves. This is not mentorship offered from a distance — it is presence offered from experience.',
  'Their role is not to provide answers or to accelerate your crossing. It is to help you stay in relationship with what is genuinely unfolding — especially at the points where it would be easier to turn away.',
  '',
  '',
  true
);

-- si_testimonials
INSERT INTO si_testimonials (sort_order, quote, author_name, author_role, avatar_url) VALUES
(0, 'I didn''t need more insight. I needed a way to move.', 'Art Project Founder', '', 'https://api.dicebear.com/7.x/initials/svg?seed=AP&backgroundColor=000000&textColor=ffffff'),
(1, 'Something in my life finally shifted — from the root, not the surface.', 'Creative Director', '', 'https://api.dicebear.com/7.x/initials/svg?seed=CD&backgroundColor=000000&textColor=ffffff'),
(2, 'It gave me a way to stay with what I was already sensing, instead of bypassing it.', 'Systems Designer', '', 'https://api.dicebear.com/7.x/initials/svg?seed=SD&backgroundColor=000000&textColor=ffffff'),
(3, 'The structure held me when I didn''t know how to hold myself through the transition.', 'Tech Lead', '', 'https://api.dicebear.com/7.x/initials/svg?seed=TL&backgroundColor=000000&textColor=ffffff'),
(4, 'A profound reorganization of my life around what actually matters.', 'Entrepreneur', '', 'https://api.dicebear.com/7.x/initials/svg?seed=EN&backgroundColor=000000&textColor=ffffff');

-- si_investment
INSERT INTO si_investment (eyebrow, price, payment_note, blockquote_text, cta_label, cta_url) VALUES (
  'The Investment',
  '$2,500',
  'Payment plans available upon request.',
  'This is a serious commitment — both financially and personally. The founding cohort rate reflects the real value of the work and the intimacy of the container.',
  'Submit Your Application',
  '#apply'
);

-- si_next_steps
INSERT INTO si_next_steps (sort_order, step_number, title, description) VALUES
(0, '01', 'Submit your application', 'A short form to help us understand where you are and what is calling you forward.'),
(1, '02', 'Receive the full program guide', 'Complete details on structure, schedule, practices, and the SoulQuest ceremony.'),
(2, '03', 'Optional conversation', 'If you''d like to explore whether this is the right fit before deciding.'),
(3, '04', 'Invitation to join', 'If the program aligns, you''ll receive an invitation to confirm your place in the cohort.');

-- si_final_cta
INSERT INTO si_final_cta (heading_main, heading_accent) VALUES (
  'If You Recognize Yourself in This, You May Already Be',
  'at the Threshold.'
);

-- si_footer_closing
INSERT INTO si_footer_closing (body_copy, availability_text) VALUES (
  'This work is designed precisely for the moment you are in — when something real is happening and you need more than another framework to understand it.',
  'The April 2026 cohort is small by design. If this speaks to something in you, the application is the first step.'
);

-- subscribers table (for email capture)
CREATE TABLE IF NOT EXISTS subscribers (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email        text NOT NULL UNIQUE,
  source       text NOT NULL DEFAULT '',
  created_at   timestamptz DEFAULT now()
);
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service write subscribers" ON subscribers FOR ALL USING (auth.role() = 'service_role');
