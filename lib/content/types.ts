export interface HeroSlide {
  id: string
  sort_order: number
  image_url: string
  title_line1: string
  title_line2: string
  subtitle: string
  active: boolean
}

export interface Intro {
  id: string
  eyebrow: string
  heading: string
  subtext: string
}

export interface RecognitionItem {
  id: string
  sort_order: number
  title: string
  description: string
}

export interface ThresholdDefinition {
  id: string
  left_heading: string
  left_paragraph: string
  right_subheading: string
}

export interface ThresholdItem {
  id: string
  sort_order: number
  title: string
  description: string
}

export interface PhilosophicalBridge {
  id: string
  quote_text: string
  quote_highlight: string
  supporting_paragraph: string
}

export interface ProgramDefinitionItem {
  id: string
  sort_order: number
  text: string
  category: "is_not" | "is"
}

export interface ArcEntry {
  id: string
  sort_order: number
  image_url: string
  title: string
  description: string
  layout_direction: "left" | "right"
}

export interface Requirements {
  id: string
  left_heading: string
  left_tagline: string
}

export interface RequirementItem {
  id: string
  sort_order: number
  label: string
  value: string
}

export interface WhoForItem {
  id: string
  sort_order: number
  text: string
  column: "fit" | "not_fit"
}

export interface ChangeItem {
  id: string
  sort_order: number
  title: string
  description: string
}

export interface Guide {
  id: string
  sort_order: number
  image_url: string
  heading: string
  body_paragraph_1: string
  body_paragraph_2: string
  cta_label: string
  cta_url: string
  active: boolean
}

export interface Testimonial {
  id: string
  sort_order: number
  quote: string
  author_name: string
  author_role: string
  avatar_url: string
}

export interface Investment {
  id: string
  eyebrow: string
  price: string
  payment_note: string
  blockquote_text: string
  cta_label: string
  cta_url: string
}

export interface NextStep {
  id: string
  sort_order: number
  step_number: string
  title: string
  description: string
}

export interface FinalCta {
  id: string
  heading_main: string
  heading_accent: string
}

export interface FooterClosing {
  id: string
  body_copy: string
  availability_text: string
}
