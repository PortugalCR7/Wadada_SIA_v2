# Soul Initiation CMS Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the hardcoded `/soul-initiation` page to a fully CMS-driven experience backed by Supabase Postgres + Storage, with a password-protected `/admin` panel for editing all content.

**Architecture:** The soul-initiation page becomes an async Next.js Server Component (ISR, `revalidate: 60`). All content lives in 19 Supabase Postgres tables. Server Actions write to Supabase (service role) and call `revalidatePath`. The admin panel is guarded by a middleware cookie check. Animated sections are extracted into lightweight client wrapper components so the page root stays a Server Component.

**Tech Stack:** Next.js 15, `@supabase/supabase-js`, `@supabase/ssr`, TypeScript, react-hook-form + zod (already installed), Tailwind CSS, framer-motion (existing)

---

## File Map

### New files
| Path | Responsibility |
|---|---|
| `middleware.ts` | Redirect `/admin/*` to `/admin/login` if cookie missing |
| `lib/supabase-server.ts` | `createServerClient` (server-only, anon key) |
| `lib/supabase-admin.ts` | `createAdminClient` (service role, server-only) |
| `lib/content/types.ts` | All TypeScript interfaces for CMS content |
| `lib/content/hero.ts` | Fetch `si_hero_slides` |
| `lib/content/intro.ts` | Fetch `si_intro` |
| `lib/content/recognition.ts` | Fetch `si_recognition_items` |
| `lib/content/threshold.ts` | Fetch `si_threshold_definition` + `si_threshold_items` |
| `lib/content/philosophical-bridge.ts` | Fetch `si_philosophical_bridge` |
| `lib/content/program-definition.ts` | Fetch `si_program_definition_items` |
| `lib/content/arc.ts` | Fetch `si_arc_entries` |
| `lib/content/requirements.ts` | Fetch `si_requirements` + `si_requirement_items` |
| `lib/content/who-for.ts` | Fetch `si_who_for_items` |
| `lib/content/changes.ts` | Fetch `si_change_items` |
| `lib/content/guides.ts` | Fetch `si_guides` |
| `lib/content/testimonials.ts` | Fetch `si_testimonials` |
| `lib/content/investment.ts` | Fetch `si_investment` |
| `lib/content/next-steps.ts` | Fetch `si_next_steps` |
| `lib/content/final-cta.ts` | Fetch `si_final_cta` |
| `lib/content/footer.ts` | Fetch `si_footer_closing` |
| `lib/actions/auth.ts` | Login / logout Server Actions |
| `lib/actions/content.ts` | Generic upsert + list-write helpers (all section saves) |
| `app/admin/login/page.tsx` | Password login form |
| `app/admin/layout.tsx` | Auth cookie check + logout button wrapper |
| `app/admin/page.tsx` | Section dashboard with links to all 17 edit pages |
| `app/admin/[section]/page.tsx` | Dynamic section editor (registry-driven form per section) |
| `app/api/subscribe/route.ts` | POST email capture → `subscribers` table |
| `components/soul-initiation/animated-bridge.tsx` | Client wrapper for framer-motion philosophical bridge section |
| `components/soul-initiation/animated-investment.tsx` | Client wrapper for framer-motion investment/CTA section |
| `components/soul-initiation/program-definition-section.tsx` | New "This Is Not / This Is" section (pure display, no animation) |
| `supabase/migrations/001_soul_initiation_cms.sql` | Full schema for all 19 tables + RLS + triggers |
| `lib/tiptap/serif-accent-mark.ts` | Custom Tiptap Mark — renders `<span class="font-accent italic">` |
| `components/admin/rich-text-field.tsx` | Reusable Tiptap editor with Serif Accent toolbar button |

### Modified files
| Path | Change |
|---|---|
| `app/soul-initiation/page.tsx` | Remove `"use client"`, convert to `async` Server Component, replace all hardcoded data with fetch calls, add program-definition section |
| `package.json` | Add `@supabase/supabase-js` and `@supabase/ssr` |

---

## Chunk 1: Foundation — Packages, Schema, Clients, Types, Middleware

### Task 1: Install Supabase packages

- [ ] **Step 1: Install packages**

```bash
cd /Users/CR7/Downloads/wadada
npm install @supabase/supabase-js @supabase/ssr
```

Expected: packages added to `node_modules/`, no peer-dep errors.

- [ ] **Step 2: Create `.env.local` template**

Create `/Users/CR7/Downloads/wadada/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
ADMIN_PASSWORD=YOUR_CHOSEN_PASSWORD
```

Fill in real values from the Supabase dashboard (Settings → API). Never commit this file.

- [ ] **Step 3: Verify TypeScript still compiles**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

---

### Task 2: SQL Migration

- [ ] **Step 1: Create migration file**

Create `supabase/migrations/001_soul_initiation_cms.sql`:

```sql
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
```

- [ ] **Step 2: Run migration in Supabase**

Open Supabase dashboard → SQL Editor → paste and run the contents of `supabase/migrations/001_soul_initiation_cms.sql`.

Expected: "Success. 19 statements" (or similar). All tables appear in Table Editor.

- [ ] **Step 3: Create storage bucket**

In Supabase dashboard → Storage → New bucket → name: `soul-initiation` → check "Public bucket" → Save.
Then create folders: `hero-slides/`, `arc-entries/`, `guides/`.

---

### Task 3: Supabase client files

- [ ] **Step 1: Create `lib/supabase-server.ts`**

```typescript
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createSupabaseServerClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Read-only context in Server Components — safe to ignore
          }
        },
      },
    }
  )
}
```

- [ ] **Step 2: Create `lib/supabase-admin.ts`**

```typescript
import { createClient } from "@supabase/supabase-js"

// Service role — never expose to browser
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

---

### Task 4: TypeScript interfaces (`lib/content/types.ts`)

- [ ] **Step 1: Create `lib/content/types.ts`**

```typescript
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

---

### Task 5: Middleware

- [ ] **Step 1: Create `middleware.ts` at project root**

```typescript
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only guard /admin routes (not /admin/login itself)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = request.cookies.get("admin_session")
    if (session?.value !== "authenticated") {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit Chunk 1**

```bash
git add supabase/ lib/supabase-server.ts lib/supabase-admin.ts lib/content/types.ts middleware.ts .env.local package.json package-lock.json
git commit -m "feat: add supabase clients, CMS types, middleware, DB migration"
```

---

## Chunk 2: Content Fetch Layer

All fetch functions follow the same pattern: import the server client, query Supabase, return typed data. Errors fall back to empty arrays / null so the page never crashes.

### Task 6: Hero fetch (`lib/content/hero.ts`)

- [ ] **Step 1: Create file**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { HeroSlide } from "./types"

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("si_hero_slides")
    .select("*")
    .eq("active", true)
    .order("sort_order")
  if (error) {
    console.error("getHeroSlides:", error.message)
    return []
  }
  return data ?? []
}
```

---

### Task 7: Remaining fetch functions

Create each file below following the exact same pattern as Task 6. The only differences are the table name, the type, and whether it's a singleton (use `.single()` instead of an array return).

**`lib/content/intro.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { Intro } from "./types"

export async function getIntro(): Promise<Intro | null> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("si_intro")
    .select("*")
    .limit(1)
    .single()
  if (error) { console.error("getIntro:", error.message); return null }
  return data
}
```

**`lib/content/recognition.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { RecognitionItem } from "./types"

export async function getRecognitionItems(): Promise<RecognitionItem[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("si_recognition_items")
    .select("*")
    .order("sort_order")
  if (error) { console.error("getRecognitionItems:", error.message); return [] }
  return data ?? []
}
```

**`lib/content/threshold.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { ThresholdDefinition, ThresholdItem } from "./types"

export async function getThresholdDefinition(): Promise<ThresholdDefinition | null> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("si_threshold_definition")
    .select("*")
    .limit(1)
    .single()
  if (error) { console.error("getThresholdDefinition:", error.message); return null }
  return data
}

export async function getThresholdItems(): Promise<ThresholdItem[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("si_threshold_items")
    .select("*")
    .order("sort_order")
  if (error) { console.error("getThresholdItems:", error.message); return [] }
  return data ?? []
}
```

**`lib/content/philosophical-bridge.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { PhilosophicalBridge } from "./types"

export async function getPhilosophicalBridge(): Promise<PhilosophicalBridge | null> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("si_philosophical_bridge")
    .select("*")
    .limit(1)
    .single()
  if (error) { console.error("getPhilosophicalBridge:", error.message); return null }
  return data
}
```

**`lib/content/program-definition.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { ProgramDefinitionItem } from "./types"

export async function getProgramDefinitionItems(): Promise<ProgramDefinitionItem[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("si_program_definition_items")
    .select("*")
    .order("sort_order")
  if (error) { console.error("getProgramDefinitionItems:", error.message); return [] }
  return data ?? []
}
```

**`lib/content/arc.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { ArcEntry } from "./types"

export async function getArcEntries(): Promise<ArcEntry[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("si_arc_entries")
    .select("*")
    .order("sort_order")
  if (error) { console.error("getArcEntries:", error.message); return [] }
  return data ?? []
}
```

**`lib/content/requirements.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { Requirements, RequirementItem } from "./types"

export async function getRequirements(): Promise<Requirements | null> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("si_requirements")
    .select("*")
    .limit(1)
    .single()
  if (error) { console.error("getRequirements:", error.message); return null }
  return data
}

export async function getRequirementItems(): Promise<RequirementItem[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("si_requirement_items")
    .select("*")
    .order("sort_order")
  if (error) { console.error("getRequirementItems:", error.message); return [] }
  return data ?? []
}
```

**`lib/content/who-for.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { WhoForItem } from "./types"

export async function getWhoForItems(): Promise<WhoForItem[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("si_who_for_items")
    .select("*")
    .order("sort_order")
  if (error) { console.error("getWhoForItems:", error.message); return [] }
  return data ?? []
}
```

**`lib/content/changes.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { ChangeItem } from "./types"

export async function getChangeItems(): Promise<ChangeItem[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("si_change_items")
    .select("*")
    .order("sort_order")
  if (error) { console.error("getChangeItems:", error.message); return [] }
  return data ?? []
}
```

**`lib/content/guides.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { Guide } from "./types"

export async function getGuides(): Promise<Guide[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("si_guides")
    .select("*")
    .eq("active", true)
    .order("sort_order")
  if (error) { console.error("getGuides:", error.message); return [] }
  return data ?? []
}
```

**`lib/content/testimonials.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { Testimonial } from "./types"

export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("si_testimonials")
    .select("*")
    .order("sort_order")
  if (error) { console.error("getTestimonials:", error.message); return [] }
  return data ?? []
}
```

**`lib/content/investment.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { Investment } from "./types"

export async function getInvestment(): Promise<Investment | null> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("si_investment")
    .select("*")
    .limit(1)
    .single()
  if (error) { console.error("getInvestment:", error.message); return null }
  return data
}
```

**`lib/content/next-steps.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { NextStep } from "./types"

export async function getNextSteps(): Promise<NextStep[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("si_next_steps")
    .select("*")
    .order("sort_order")
  if (error) { console.error("getNextSteps:", error.message); return [] }
  return data ?? []
}
```

**`lib/content/final-cta.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { FinalCta } from "./types"

export async function getFinalCta(): Promise<FinalCta | null> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("si_final_cta")
    .select("*")
    .limit(1)
    .single()
  if (error) { console.error("getFinalCta:", error.message); return null }
  return data
}
```

**`lib/content/footer.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { FooterClosing } from "./types"

export async function getFooterClosing(): Promise<FooterClosing | null> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("si_footer_closing")
    .select("*")
    .limit(1)
    .single()
  if (error) { console.error("getFooterClosing:", error.message); return null }
  return data
}
```

- [ ] **Step (after all files created): Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step: Commit Chunk 2**

```bash
git add lib/content/
git commit -m "feat: add all CMS content fetch functions"
```

---

## Chunk 3: Server Actions

### Task 8: Auth actions (`lib/actions/auth.ts`)

- [ ] **Step 1: Create file**

```typescript
"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const password = formData.get("password") as string
  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: "Invalid password" }
  }
  const cookieStore = cookies()
  cookieStore.set("admin_session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
  redirect("/admin")
}

export async function logoutAction() {
  const cookieStore = cookies()
  cookieStore.delete("admin_session")
  redirect("/admin/login")
}
```

---

### Task 9: Content write actions (`lib/actions/content.ts`)

This single file handles all admin saves. It uses the admin client (service role) for writes, then revalidates the page.

- [ ] **Step 1: Create `lib/actions/content.ts`**

```typescript
"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"

// ─── Singleton upsert (tables with one row) ─────────────────────────────────

export async function upsertSingleton(
  table: string,
  id: string | undefined,
  fields: Record<string, unknown>
) {
  const supabase = createSupabaseAdminClient()
  let error
  if (id) {
    ;({ error } = await supabase.from(table).update(fields).eq("id", id))
  } else {
    ;({ error } = await supabase.from(table).insert(fields))
  }
  if (error) throw new Error(`upsertSingleton(${table}): ${error.message}`)
  revalidatePath("/soul-initiation")
}

// ─── Replace list (delete all, re-insert ordered) ────────────────────────────

export async function replaceList(
  table: string,
  rows: Record<string, unknown>[]
) {
  const supabase = createSupabaseAdminClient()
  const { error: delError } = await supabase.from(table).delete().neq("id", "")
  if (delError) throw new Error(`replaceList delete(${table}): ${delError.message}`)
  if (rows.length > 0) {
    const { error: insError } = await supabase.from(table).insert(rows)
    if (insError) throw new Error(`replaceList insert(${table}): ${insError.message}`)
  }
  revalidatePath("/soul-initiation")
}

// ─── Upload image to Supabase Storage ────────────────────────────────────────

export async function uploadImage(
  subfolder: string,
  file: File
): Promise<string> {
  const supabase = createSupabaseAdminClient()
  const ext = file.name.split(".").pop() ?? "jpg"
  const path = `${subfolder}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage
    .from("soul-initiation")
    .upload(path, file, { upsert: false })
  if (error) throw new Error(`uploadImage: ${error.message}`)
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/soul-initiation/${path}`
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit Chunk 3**

```bash
git add lib/actions/
git commit -m "feat: add auth + content server actions"
```

---

## Chunk 4: Admin Panel

### Task 10: Login page (`app/admin/login/page.tsx`)

- [ ] **Step 1: Create `app/admin/login/page.tsx`**

```typescript
import { loginAction } from "@/lib/actions/auth"

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-800 p-12 w-full max-w-sm space-y-8">
        <h1 className="text-white text-3xl font-black tracking-tighter uppercase">Admin</h1>
        {searchParams.error && (
          <p className="text-red-400 text-sm">{searchParams.error}</p>
        )}
        <form action={loginAction} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full bg-black border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-white text-black font-black uppercase tracking-widest py-3 hover:bg-zinc-200 transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}
```

---

### Task 11: Admin layout (`app/admin/layout.tsx`)

- [ ] **Step 1: Create `app/admin/layout.tsx`**

```typescript
import { logoutAction } from "@/lib/actions/auth"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-8 py-4 flex items-center justify-between">
        <a href="/admin" className="text-sm font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">
          Soul Initiation — Admin
        </a>
        <div className="flex items-center gap-6">
          <a
            href="/soul-initiation"
            target="_blank"
            className="text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
          >
            View Page ↗
          </a>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs uppercase tracking-widest text-zinc-500 hover:text-red-400 transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </header>
      <main className="p-8">{children}</main>
    </div>
  )
}
```

---

### Task 12: Admin dashboard (`app/admin/page.tsx`)

- [ ] **Step 1: Create `app/admin/page.tsx`**

```typescript
const SECTIONS = [
  { slug: "hero",                 label: "Hero Slides" },
  { slug: "intro",                label: "Intro / The Threshold" },
  { slug: "recognition",          label: "Do You Recognize This?" },
  { slug: "threshold",            label: "Threshold Definition" },
  { slug: "philosophical-bridge", label: "Philosophical Bridge" },
  { slug: "program-definition",   label: "This Is Not / This Is" },
  { slug: "arc",                  label: "Arc of Initiation" },
  { slug: "requirements",         label: "Requirements" },
  { slug: "who-for",              label: "Who This Is For" },
  { slug: "changes",              label: "What Tends to Change" },
  { slug: "guides",               label: "The Guides" },
  { slug: "testimonials",         label: "Testimonials" },
  { slug: "investment",           label: "Investment / CTA" },
  { slug: "next-steps",           label: "Next Steps" },
  { slug: "final-cta",            label: "Final CTA Headline" },
  { slug: "footer",               label: "Footer Closing" },
  { slug: "subscribers",          label: "Subscribers (view only)" },
]

export default function AdminDashboard() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-12">Sections</h1>
      <div className="grid gap-px bg-zinc-800">
        {SECTIONS.map(({ slug, label }) => (
          <a
            key={slug}
            href={`/admin/${slug}`}
            className="bg-zinc-900 hover:bg-zinc-800 px-6 py-5 flex items-center justify-between group transition-colors"
          >
            <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">
              {label}
            </span>
            <span className="text-zinc-600 group-hover:text-white transition-colors text-lg">→</span>
          </a>
        ))}
      </div>
    </div>
  )
}
```

---

### Task 13: Dynamic section editor (`app/admin/[section]/page.tsx`)

This is the most complex admin file. It's a registry: the `[section]` slug maps to a specific form component.

- [ ] **Step 1: Create `app/admin/[section]/page.tsx`**

```typescript
import { notFound } from "next/navigation"
import HeroForm from "./_forms/HeroForm"
import IntroForm from "./_forms/IntroForm"
import RecognitionForm from "./_forms/RecognitionForm"
import ThresholdForm from "./_forms/ThresholdForm"
import PhilosophicalBridgeForm from "./_forms/PhilosophicalBridgeForm"
import ProgramDefinitionForm from "./_forms/ProgramDefinitionForm"
import ArcForm from "./_forms/ArcForm"
import RequirementsForm from "./_forms/RequirementsForm"
import WhoForForm from "./_forms/WhoForForm"
import ChangesForm from "./_forms/ChangesForm"
import GuidesForm from "./_forms/GuidesForm"
import TestimonialsForm from "./_forms/TestimonialsForm"
import InvestmentForm from "./_forms/InvestmentForm"
import NextStepsForm from "./_forms/NextStepsForm"
import FinalCtaForm from "./_forms/FinalCtaForm"
import FooterForm from "./_forms/FooterForm"
import SubscribersView from "./_forms/SubscribersView"

const REGISTRY: Record<string, React.ComponentType> = {
  "hero":                 HeroForm,
  "intro":                IntroForm,
  "recognition":          RecognitionForm,
  "threshold":            ThresholdForm,
  "philosophical-bridge": PhilosophicalBridgeForm,
  "program-definition":   ProgramDefinitionForm,
  "arc":                  ArcForm,
  "requirements":         RequirementsForm,
  "who-for":              WhoForForm,
  "changes":              ChangesForm,
  "guides":               GuidesForm,
  "testimonials":         TestimonialsForm,
  "investment":           InvestmentForm,
  "next-steps":           NextStepsForm,
  "final-cta":            FinalCtaForm,
  "footer":               FooterForm,
  "subscribers":          SubscribersView,
}

export default function SectionPage({
  params,
}: {
  params: { section: string }
}) {
  const Form = REGISTRY[params.section]
  if (!Form) notFound()
  return (
    <div className="max-w-2xl">
      <a href="/admin" className="text-xs text-zinc-500 hover:text-white uppercase tracking-widest mb-8 block transition-colors">
        ← Back
      </a>
      <Form />
    </div>
  )
}
```

---

### Task 14: Admin form components

Each form lives in `app/admin/[section]/_forms/`. All follow the same pattern: fetch current data on the server, render a pre-filled form, submit via Server Action calling `upsertSingleton` or `replaceList`.

Below is the **full implementation for three forms** (singleton, list, and image-upload patterns). The remaining 14 forms follow the same patterns — the implementation steps list them with their specific fields.

- [ ] **Step 1: Create `app/admin/[section]/_forms/IntroForm.tsx`** (singleton pattern, no images)

```typescript
import { getIntro } from "@/lib/content/intro"
import { upsertSingleton } from "@/lib/actions/content"

export default async function IntroForm() {
  const intro = await getIntro()

  async function save(formData: FormData) {
    "use server"
    await upsertSingleton("si_intro", intro?.id, {
      eyebrow: formData.get("eyebrow"),
      heading: formData.get("heading"),
      subtext: formData.get("subtext"),
    })
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Intro / The Threshold</h2>
      <form action={save} className="space-y-6">
        <Field name="eyebrow" label="Eyebrow" defaultValue={intro?.eyebrow ?? ""} />
        <Field name="heading" label="Heading" defaultValue={intro?.heading ?? ""} textarea />
        <Field name="subtext" label="Subtext" defaultValue={intro?.subtext ?? ""} textarea />
        <SaveButton />
      </form>
    </div>
  )
}

function Field({
  name, label, defaultValue, textarea,
}: {
  name: string; label: string; defaultValue: string; textarea?: boolean
}) {
  const cls = "w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">{label}</label>
      {textarea ? (
        <textarea name={name} defaultValue={defaultValue} rows={4} className={cls} />
      ) : (
        <input type="text" name={name} defaultValue={defaultValue} className={cls} />
      )}
    </div>
  )
}

function SaveButton() {
  return (
    <button
      type="submit"
      className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors"
    >
      Save
    </button>
  )
}
```

- [ ] **Step 2: Create `app/admin/[section]/_forms/RecognitionForm.tsx`** (list pattern, no images)

```typescript
import { getRecognitionItems } from "@/lib/content/recognition"
import { replaceList } from "@/lib/actions/content"

export default async function RecognitionForm() {
  const items = await getRecognitionItems()

  async function save(formData: FormData) {
    "use server"
    const titles = formData.getAll("title") as string[]
    const descriptions = formData.getAll("description") as string[]
    const rows = titles.map((title, i) => ({
      title,
      description: descriptions[i] ?? "",
      sort_order: i,
    }))
    await replaceList("si_recognition_items", rows)
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Do You Recognize This?</h2>
      <form action={save} className="space-y-8">
        {(items.length > 0 ? items : [{ title: "", description: "" }]).map((item, i) => (
          <fieldset key={i} className="border border-zinc-800 p-6 space-y-4">
            <legend className="text-xs uppercase tracking-widest text-zinc-500 px-2">Item {i + 1}</legend>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Title</label>
              <input type="text" name="title" defaultValue={item.title} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Description</label>
              <textarea name="description" defaultValue={item.description} rows={3} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
          </fieldset>
        ))}
        <p className="text-zinc-500 text-sm">Note: The form currently saves existing items. To add/remove items, use the Supabase dashboard for now.</p>
        <button type="submit" className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors">Save</button>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/admin/[section]/_forms/InvestmentForm.tsx`** (singleton with URL field)

```typescript
import { getInvestment } from "@/lib/content/investment"
import { upsertSingleton } from "@/lib/actions/content"

export default async function InvestmentForm() {
  const inv = await getInvestment()

  async function save(formData: FormData) {
    "use server"
    await upsertSingleton("si_investment", inv?.id, {
      eyebrow:         formData.get("eyebrow"),
      price:           formData.get("price"),
      payment_note:    formData.get("payment_note"),
      blockquote_text: formData.get("blockquote_text"),
      cta_label:       formData.get("cta_label"),
      cta_url:         formData.get("cta_url"),
    })
  }

  const Field = ({ name, label, defaultValue, textarea }: { name: string; label: string; defaultValue: string; textarea?: boolean }) => {
    const cls = "w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
    return (
      <div>
        <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">{label}</label>
        {textarea ? <textarea name={name} defaultValue={defaultValue} rows={4} className={cls} /> : <input type="text" name={name} defaultValue={defaultValue} className={cls} />}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Investment / CTA</h2>
      <form action={save} className="space-y-6">
        <Field name="eyebrow" label="Eyebrow" defaultValue={inv?.eyebrow ?? ""} />
        <Field name="price" label="Price (e.g. $2,500)" defaultValue={inv?.price ?? ""} />
        <Field name="payment_note" label="Payment Note" defaultValue={inv?.payment_note ?? ""} />
        <Field name="blockquote_text" label="Blockquote" defaultValue={inv?.blockquote_text ?? ""} textarea />
        <Field name="cta_label" label="CTA Button Label" defaultValue={inv?.cta_label ?? ""} />
        <Field name="cta_url" label="CTA URL" defaultValue={inv?.cta_url ?? ""} />
        <button type="submit" className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors">Save</button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Create all remaining form files** following the same patterns above

Create each file in `app/admin/[section]/_forms/`:

| File | Type | Fields |
|---|---|---|
| `HeroForm.tsx` | list | `sort_order`, `image_url` (text input for now), `title_line1`, `title_line2`, `subtitle`, `active` |
| `ThresholdForm.tsx` | singleton + list | Singleton: `left_heading`, `left_paragraph`, `right_subheading` + list of threshold items (title, description) |
| `PhilosophicalBridgeForm.tsx` | singleton | `quote_text`, `quote_highlight`, `supporting_paragraph` |
| `ProgramDefinitionForm.tsx` | list | `text`, `category` (select: `is_not`/`is`), `sort_order` |
| `ArcForm.tsx` | list | `image_url` (text), `title`, `description`, `layout_direction` (select), `sort_order` |
| `RequirementsForm.tsx` | singleton + list | Singleton: `left_heading`, `left_tagline` + list of requirement items (label, value) |
| `WhoForForm.tsx` | list | `text`, `column` (select: `fit`/`not_fit`), `sort_order` |
| `ChangesForm.tsx` | list | `title`, `description`, `sort_order` |
| `GuidesForm.tsx` | list | `image_url` (text), `heading`, `body_paragraph_1`, `body_paragraph_2`, `cta_label`, `cta_url`, `active`, `sort_order` |
| `TestimonialsForm.tsx` | list | `quote`, `author_name`, `author_role`, `avatar_url`, `sort_order` |
| `NextStepsForm.tsx` | list | `step_number`, `title`, `description`, `sort_order` |
| `FinalCtaForm.tsx` | singleton | `heading_main`, `heading_accent` |
| `FooterForm.tsx` | singleton | `body_copy`, `availability_text` |
| `SubscribersView.tsx` | read-only | Fetches via admin client, displays table of `email`, `subscribed_at`, `source` |

For `SubscribersView.tsx` (read-only, uses admin client to bypass RLS):

```typescript
import { createSupabaseAdminClient } from "@/lib/supabase-admin"

export default async function SubscribersView() {
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from("subscribers")
    .select("email, subscribed_at, source")
    .order("subscribed_at", { ascending: false })

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Subscribers ({data?.length ?? 0})</h2>
      <div className="border border-zinc-800 divide-y divide-zinc-800">
        {(data ?? []).map((s) => (
          <div key={s.email} className="px-6 py-4 flex justify-between text-sm">
            <span className="text-white">{s.email}</span>
            <span className="text-zinc-500">{new Date(s.subscribed_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors (fix any import or type errors before moving on).

- [ ] **Step 6: Smoke-test admin panel**

```bash
npm run dev
```

Navigate to `http://localhost:3000/admin` — should redirect to `/admin/login`.
Log in with the `ADMIN_PASSWORD` from `.env.local` — should reach dashboard.
Click any section — should show its form without a crash.

- [ ] **Step 7: Commit Chunk 4**

```bash
git add app/admin/
git commit -m "feat: add admin panel (login, layout, dashboard, section forms)"
```

---

### Task 14b: Serif Accent rich-text mark (admin panel)

**Where it fits:** End of Chunk 4 — admin panel authoring layer. Must be done before Task 15 (page conversion) because several page fields switch from plain text to HTML rendering once this is in place.

**What it does:** Adds a Tiptap-based rich-text editor to long prose fields in the admin forms. The editor exposes one custom mark — "Serif Accent" — which wraps selected text in `<span class="font-accent italic">`. The resulting HTML is stored in the Supabase text column and rendered on the public page via `dangerouslySetInnerHTML`.

**Fields that use `RichTextField`** (becomes HTML in DB):

| Form | Field(s) |
|---|---|
| IntroForm | `subtext` |
| ThresholdForm | `left_paragraph` |
| PhilosophicalBridgeForm | `quote_text`, `supporting_paragraph` |
| RecognitionForm | `description` (per item) |
| ChangesForm | `description` (per item) |
| GuidesForm | `body_paragraph_1`, `body_paragraph_2` |
| TestimonialsForm | `quote` (per item) |
| FooterForm | `body_copy` |

**Fields that stay plain text** (short labels, headings used by `TextGradientScroll`, URLs, prices, eyebrows, step numbers — never HTML):
`intro.heading`, all `eyebrow`, `cta_url`, `price`, `step_number`, `label`, `title` in list items, `final_cta.*`, `requirements.*`

---

- [ ] **Step 1: Install Tiptap packages**

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
```

Expected: packages install, no peer-dep errors with React 19. (Tiptap 2.x supports React 19 via `@tiptap/pm`.)

- [ ] **Step 2: Create `lib/tiptap/serif-accent-mark.ts`**

```typescript
import { Mark, mergeAttributes } from "@tiptap/core"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    serifAccent: {
      toggleSerifAccent: () => ReturnType
    }
  }
}

export const SerifAccent = Mark.create({
  name: "serifAccent",

  parseHTML() {
    return [{ tag: "span.font-accent" }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, { class: "font-accent italic" }),
      0,
    ]
  },

  addCommands() {
    return {
      toggleSerifAccent:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
    }
  },

  addKeyboardShortcuts() {
    return {
      // Ctrl/Cmd + Shift + A = toggle Serif Accent
      "Mod-Shift-a": () => this.editor.commands.toggleSerifAccent(),
    }
  },
})
```

- [ ] **Step 3: Create `components/admin/rich-text-field.tsx`**

```typescript
"use client"

import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { SerifAccent } from "@/lib/tiptap/serif-accent-mark"
import { useState } from "react"

// ─── Toolbar ─────────────────────────────────────────────────────────────────

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-3 py-1.5 text-sm transition-colors ${
        active
          ? "bg-white text-black"
          : "text-zinc-400 hover:text-white hover:bg-zinc-700"
      }`}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null
  return (
    <div className="flex items-center gap-px border-b border-zinc-700 px-2 py-1 bg-zinc-800">
      <ToolbarButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </ToolbarButton>
      {/* Serif Accent — italic Aa in Cormorant Garamond */}
      <ToolbarButton
        active={editor.isActive("serifAccent")}
        onClick={() => editor.chain().focus().toggleSerifAccent().run()}
        title="Serif Accent — font-accent italic (Ctrl+Shift+A). Use for key phrases, pull quotes, poetic fragments only."
      >
        <span className="font-accent italic text-base leading-none">Aa</span>
      </ToolbarButton>
    </div>
  )
}

// ─── RichTextField ────────────────────────────────────────────────────────────

export function RichTextField({
  name,
  label,
  defaultValue = "",
}: {
  name: string
  label: string
  defaultValue?: string
}) {
  const [html, setHtml] = useState(defaultValue)

  const editor = useEditor({
    extensions: [StarterKit, SerifAccent],
    content: defaultValue,
    onUpdate({ editor }) {
      setHtml(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          "px-4 py-3 min-h-[100px] text-white focus:outline-none prose prose-invert prose-sm max-w-none [&_.font-accent]:font-accent [&_.font-accent]:italic",
      },
    },
  })

  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
        {label}
      </label>
      {/* Hidden textarea submits HTML through Server Action formData */}
      <textarea
        name={name}
        value={html}
        onChange={() => {}}
        className="sr-only"
        aria-hidden="true"
      />
      <div className="border border-zinc-700 focus-within:border-white transition-colors">
        <Toolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
      <p className="mt-1 text-[10px] text-zinc-600 uppercase tracking-widest">
        Serif Accent (Ctrl+Shift+A) — key phrases &amp; pull quotes only, not full paragraphs
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Update `IntroForm.tsx` — replace `subtext` textarea with `RichTextField`**

In `app/admin/[section]/_forms/IntroForm.tsx`, import and use `RichTextField` for the `subtext` field:

```typescript
import { RichTextField } from "@/components/admin/rich-text-field"

// Inside the form, replace:
// <Field name="subtext" label="Subtext" defaultValue={intro?.subtext ?? ""} textarea />
// with:
<RichTextField name="subtext" label="Subtext" defaultValue={intro?.subtext ?? ""} />
```

`heading` and `eyebrow` stay as plain `<input>` / `<textarea>` — `heading` feeds `TextGradientScroll` which expects a plain string.

- [ ] **Step 5: Update `PhilosophicalBridgeForm.tsx` — use `RichTextField` for both prose fields**

```typescript
import { RichTextField } from "@/components/admin/rich-text-field"

// Replace both textarea Fields:
<RichTextField name="quote_text" label="Quote Text" defaultValue={bridge?.quote_text ?? ""} />
<RichTextField name="supporting_paragraph" label="Supporting Paragraph" defaultValue={bridge?.supporting_paragraph ?? ""} />
// quote_highlight stays as a plain <Field> — it's a short substring used for span matching
```

- [ ] **Step 6: Update `GuidesForm.tsx`, `FooterForm.tsx`, `TestimonialsForm.tsx` the same way**

In each file, import `RichTextField` and replace the `<textarea>` for each prose field listed in the table above. Short fields (`cta_label`, `cta_url`, `heading`, etc.) remain plain inputs.

- [ ] **Step 7: Note page-side HTML rendering for Chunk 5**

The following fields in `app/soul-initiation/page.tsx` must render via `dangerouslySetInnerHTML` instead of `{field}`:

```typescript
// intro.subtext — was:
<p ...>{intro?.subtext ?? ""}</p>
// becomes:
<p ... dangerouslySetInnerHTML={{ __html: intro?.subtext ?? "" }} />

// philosophical bridge — AnimatedBridge already renders the quote;
// update AnimatedBridge to use dangerouslySetInnerHTML for supporting_paragraph

// guide.body_paragraph_1 / body_paragraph_2
<p ... dangerouslySetInnerHTML={{ __html: guide.body_paragraph_1 }} />

// footerClosing.body_copy
<h3 ... dangerouslySetInnerHTML={{ __html: footerClosing?.body_copy ?? "" }} />
```

Testimonial `quote` is rendered inside `StaggerTestimonials` (existing component) — check whether that component renders its `testimonial` prop as plain text or HTML; if plain text, either update it to use `dangerouslySetInnerHTML` or keep `quote` as plain text for now.

This step is a **reminder for Task 16** (page conversion) — do not skip it.

- [ ] **Step 8: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 9: Smoke test the rich-text editor**

```bash
npm run dev
```

- Log in to `/admin`, open "Philosophical Bridge"
- Select a word in the Quote Text field, click the `Aa` toolbar button
- The selected text should render in Cormorant Garamond italic in the editor
- Click Save — in Supabase Table Editor, verify the `quote_text` column now contains HTML with `<span class="font-accent italic">...</span>`
- Visit `/soul-initiation` — confirm the quote renders with the accent typeface applied

- [ ] **Step 10: Commit**

```bash
git add lib/tiptap/ components/admin/ app/admin/
git commit -m "feat: add Serif Accent rich-text mark to admin forms (Tiptap)"
```

---

## Chunk 5: Page Conversion + New Section + Email Capture

### Task 15: Extract animated client wrappers

The existing page uses `"use client"` so framer-motion works. Converting to a Server Component requires pulling animated sections into thin client wrappers.

- [ ] **Step 1: Create `components/soul-initiation/animated-bridge.tsx`**

```typescript
"use client"

import { motion } from "framer-motion"
import type { PhilosophicalBridge } from "@/lib/content/types"

export function AnimatedBridge({ bridge }: { bridge: PhilosophicalBridge }) {
  // Split quote at the highlight text to render the underlined span
  const parts = bridge.quote_text.split(bridge.quote_highlight)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
    >
      <h2 className="font-accent text-3xl md:text-5xl font-light leading-snug mb-12 italic text-zinc-300">
        &ldquo;{parts[0]}
        <span className="text-white font-black not-italic underline decoration-1 decoration-zinc-700 underline-offset-8">
          {bridge.quote_highlight}
        </span>
        {parts[1]}&rdquo;
      </h2>
      <p className="text-lg md:text-xl text-zinc-500 leading-relaxed max-w-2xl mx-auto">
        {bridge.supporting_paragraph}
      </p>
    </motion.div>
  )
}
```

- [ ] **Step 2: Create `components/soul-initiation/animated-investment.tsx`**

```typescript
"use client"

import { motion } from "framer-motion"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import type { Investment, NextStep, FinalCta } from "@/lib/content/types"

export function AnimatedInvestment({
  investment,
  nextSteps,
  finalCta,
}: {
  investment: Investment
  nextSteps: NextStep[]
  finalCta: FinalCta | null
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      <h2 className="text-sm tracking-[0.5em] font-black text-white/40 uppercase mb-12">
        {investment.eyebrow}
      </h2>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 md:p-20 mb-24 relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-white/[0.02] font-black text-9xl group-hover:scale-110 transition-transform duration-1000">444</div>
        <span className="text-xs uppercase tracking-[0.4em] text-white/40 font-bold block mb-6">Founding Cohort Rate</span>
        <div className="text-7xl md:text-9xl font-black mb-8 tracking-tighter tabular-nums">{investment.price}</div>
        <div className="space-y-6 max-w-xl mx-auto mb-12">
          <p className="text-zinc-400 font-medium">{investment.payment_note}</p>
          <div className="h-px bg-white/10 w-24 mx-auto" />
          <blockquote className="font-accent text-2xl md:text-3xl font-light italic text-zinc-300 leading-relaxed">
            &ldquo;{investment.blockquote_text}&rdquo;
          </blockquote>
        </div>
        <a href={investment.cta_url}>
          <LiquidButton size="xxl" className="w-full relative z-10 h-24 text-2xl">
            {investment.cta_label}
          </LiquidButton>
        </a>
      </div>

      {/* Next Steps */}
      <div className="text-left mb-32 grid md:grid-cols-2 gap-16 items-start">
        <div className="sticky top-32">
          <h3 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter leading-none">
            What The <br />Next Step <br />Looks Like
          </h3>
          <div className="w-20 h-2 bg-white/10 mt-8" />
        </div>
        <div className="space-y-12">
          {nextSteps.map((item) => (
            <div key={item.id} className="flex gap-8 group cursor-default">
              <span className="text-2xl font-black text-white/20 group-hover:text-white transition-all duration-300 mt-1 shrink-0 group-hover:scale-110 inline-block">
                {item.step_number}
              </span>
              <div className="border-l border-white/0 group-hover:border-white/30 pl-0 group-hover:pl-6 transition-all duration-300">
                <h4 className="text-2xl font-black uppercase mb-3 tracking-tight">{item.title}</h4>
                <p className="font-accent italic text-zinc-500 group-hover:text-zinc-300 transition-colors leading-relaxed text-lg font-light">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA Headline */}
      {finalCta && (
        <div className="py-24 bg-white text-black -mx-6 px-6 md:-mx-20 md:px-20">
          <h2 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] uppercase text-black">
            {finalCta.heading_main} <br />
            <span className="text-black/20">{finalCta.heading_accent}</span>
          </h2>
        </div>
      )}
    </motion.div>
  )
}
```

Note: Fix `item.desc` → `item.description` if the type uses `description`.

- [ ] **Step 3: Create `components/soul-initiation/program-definition-section.tsx`**

(No animation — pure server-renderable display component)

```typescript
import type { ProgramDefinitionItem } from "@/lib/content/types"

export function ProgramDefinitionSection({
  items,
}: {
  items: ProgramDefinitionItem[]
}) {
  const isNotItems = items.filter((i) => i.category === "is_not")
  const isItems = items.filter((i) => i.category === "is")

  return (
    <section className="py-32 bg-white border-t border-zinc-100">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-px bg-zinc-200 border border-zinc-200">
          <div className="bg-white p-12 md:p-20">
            <h3 className="text-2xl font-black mb-12 uppercase tracking-wide text-zinc-400">
              This Is Not
            </h3>
            <ul className="space-y-8">
              {isNotItems.map((item) => (
                <li
                  key={item.id}
                  className="text-xl font-medium text-zinc-400 leading-snug pl-6 border-l-2 border-zinc-100"
                >
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-12 md:p-20">
            <h3 className="text-2xl font-black mb-12 uppercase tracking-wide text-black">
              This Is
            </h3>
            <ul className="space-y-8">
              {isItems.map((item) => (
                <li
                  key={item.id}
                  className="text-xl font-medium text-zinc-700 leading-snug pl-6 border-l-2 border-black"
                >
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
```

---

### Task 16: Convert `app/soul-initiation/page.tsx` to Server Component

- [ ] **Step 1: Replace the full contents of `app/soul-initiation/page.tsx`**

```typescript
import { SoulInitiationHero } from "@/components/soul-initiation-hero"
import { TextGradientScroll } from "@/components/ui/text-gradient-scroll"
import { Timeline } from "@/components/ui/timeline"
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials"
import Chatbot from "@/components/chatbot"
import { AnimatedBridge } from "@/components/soul-initiation/animated-bridge"
import { AnimatedInvestment } from "@/components/soul-initiation/animated-investment"
import { ProgramDefinitionSection } from "@/components/soul-initiation/program-definition-section"

import { getHeroSlides } from "@/lib/content/hero"
import { getIntro } from "@/lib/content/intro"
import { getRecognitionItems } from "@/lib/content/recognition"
import { getThresholdDefinition, getThresholdItems } from "@/lib/content/threshold"
import { getPhilosophicalBridge } from "@/lib/content/philosophical-bridge"
import { getProgramDefinitionItems } from "@/lib/content/program-definition"
import { getArcEntries } from "@/lib/content/arc"
import { getRequirements, getRequirementItems } from "@/lib/content/requirements"
import { getWhoForItems } from "@/lib/content/who-for"
import { getChangeItems } from "@/lib/content/changes"
import { getGuides } from "@/lib/content/guides"
import { getTestimonials } from "@/lib/content/testimonials"
import { getInvestment } from "@/lib/content/investment"
import { getNextSteps } from "@/lib/content/next-steps"
import { getFinalCta } from "@/lib/content/final-cta"
import { getFooterClosing } from "@/lib/content/footer"

export const revalidate = 60

export default async function SoulInitiationPage() {
  const [
    heroSlides,
    intro,
    recognitionItems,
    thresholdDef,
    thresholdItems,
    bridge,
    programDefItems,
    arcEntries,
    requirements,
    requirementItems,
    whoForItems,
    changeItems,
    guides,
    testimonials,
    investment,
    nextSteps,
    finalCta,
    footerClosing,
  ] = await Promise.all([
    getHeroSlides(),
    getIntro(),
    getRecognitionItems(),
    getThresholdDefinition(),
    getThresholdItems(),
    getPhilosophicalBridge(),
    getProgramDefinitionItems(),
    getArcEntries(),
    getRequirements(),
    getRequirementItems(),
    getWhoForItems(),
    getChangeItems(),
    getGuides(),
    getTestimonials(),
    getInvestment(),
    getNextSteps(),
    getFinalCta(),
    getFooterClosing(),
  ])

  // Map DB shape to component prop shape for Timeline
  const arcTimelineEntries = arcEntries.map((e) => ({
    id: e.sort_order,
    image: e.image_url,
    alt: e.title,
    title: e.title,
    description: e.description,
    layout: e.layout_direction as "left" | "right",
  }))

  // Map DB shape to StaggerTestimonials prop shape
  const testimonialsForComponent = testimonials.map((t, i) => ({
    tempId: i,
    testimonial: t.quote,
    by: t.author_role ? `${t.author_name} — ${t.author_role}` : t.author_name,
    imgSrc: t.avatar_url,
  }))

  const fitItems = whoForItems.filter((w) => w.column === "fit")
  const notFitItems = whoForItems.filter((w) => w.column === "not_fit")

  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white">
      {/* 444 Watermark */}
      <div className="fixed top-1/2 left-4 -translate-y-1/2 -rotate-90 text-black/[0.03] font-black text-9xl pointer-events-none z-0">
        444
      </div>

      <SoulInitiationHero slides={heroSlides} />

      {/* Intro Section */}
      <section id="threshold" className="relative py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-sm tracking-[0.4em] font-black text-black/20 uppercase mb-8">
              {intro?.eyebrow ?? "The Threshold"}
            </h2>
            <TextGradientScroll
              text={intro?.heading ?? ""}
              className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-black"
              type="word"
              textOpacity="soft"
            />
            <p className="font-accent italic text-2xl md:text-3xl text-zinc-500 mt-8 leading-relaxed max-w-3xl mx-auto font-light">
              {intro?.subtext ?? ""}
            </p>
          </div>
        </div>
      </section>

      {/* Recognition Section */}
      <section className="py-24 bg-black text-white relative">
        <div className="absolute top-0 right-0 p-10 text-white/[0.05] font-black text-8xl pointer-events-none">444</div>
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-6xl font-black mb-16 tracking-tighter">DO YOU RECOGNIZE THIS?</h2>
            <div className="space-y-12">
              {recognitionItems.map((item) => (
                <div key={item.id} className="group border-l border-white/20 pl-8 hover:border-white hover:pl-10 transition-all duration-300 cursor-default">
                  <h3 className="text-2xl font-black mb-2 uppercase tracking-wide group-hover:translate-x-1 transition-transform duration-300">{item.title}</h3>
                  <p className="font-accent italic text-gray-500 group-hover:text-zinc-200 transition-colors text-xl font-light leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Threshold Definition Section */}
      <section className="py-24 bg-white border-t border-zinc-100">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-24 items-start">
            <div className="sticky top-32">
              <h2
                className="text-4xl md:text-6xl font-black mb-8 leading-[0.9] tracking-tighter uppercase text-black"
                dangerouslySetInnerHTML={{ __html: thresholdDef?.left_heading ?? "" }}
              />
              <p className="text-xl text-zinc-600 leading-relaxed max-w-lg">
                {thresholdDef?.left_paragraph ?? ""}
              </p>
              <div className="mt-12 text-black/5 font-black text-9xl">444</div>
            </div>
            <div className="space-y-16">
              <div>
                <h3 className="text-sm font-black tracking-[0.3em] uppercase mb-6 text-black/40">
                  {thresholdDef?.right_subheading ?? ""}
                </h3>
                <div className="space-y-8">
                  {thresholdItems.map((item) => (
                    <div key={item.id} className="border-b border-zinc-100 pb-8 last:border-0 hover:translate-x-2 transition-all duration-300 group cursor-default">
                      <h4 className="text-2xl font-black mb-2 uppercase group-hover:bg-black group-hover:text-white px-2 -mx-2 inline-block transition-all duration-200">{item.title}</h4>
                      <p className="text-zinc-500 group-hover:text-zinc-800 transition-colors">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophical Bridge */}
      <section className="py-40 bg-zinc-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            {bridge && <AnimatedBridge bridge={bridge} />}
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 text-white/[0.02] font-black text-[20vw] select-none pointer-events-none">444</div>
      </section>

      {/* NEW: Program Definition — This Is Not / This Is */}
      <ProgramDefinitionSection items={programDefItems} />

      {/* Arc of Initiation */}
      <section id="arc" className="py-32 bg-white">
        <div className="container mx-auto px-6 text-center mb-24">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-black uppercase">The Arc of Initiation</h2>
          <p className="text-xl text-gray-500 mt-6 max-w-2xl mx-auto uppercase tracking-widest">A time-tested structure for modern life</p>
        </div>
        <Timeline entries={arcTimelineEntries} />
      </section>

      {/* Requirements */}
      <section className="py-32 bg-zinc-100 relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-square overflow-hidden bg-black flex items-center justify-center">
              <div className="text-white/10 font-black text-[30vw] absolute select-none pointer-events-none">444</div>
              <div className="relative z-10 text-center p-12">
                <h3 className="text-white text-5xl font-black mb-6 tracking-tighter uppercase leading-none">
                  {requirements?.left_heading ?? ""}
                </h3>
                <p className="font-accent italic text-zinc-400 text-xl leading-relaxed">
                  {requirements?.left_tagline ?? ""}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {requirementItems.map((item) => (
                <div key={item.id} className="bg-black text-white p-8 group hover:bg-white hover:text-black transition-all duration-300 border border-black">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 group-hover:text-gray-600 transition-colors">{item.label}</span>
                  <p className="text-2xl font-black mt-2 tracking-tight group-hover:translate-x-2 transition-transform">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 text-center mb-20">
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase mb-6">Who This Is For</h2>
          <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-zinc-400">And, critically, who it is not for.</h3>
        </div>
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-px bg-zinc-200 border border-zinc-200">
          <div className="bg-white p-12 md:p-20">
            <h3 className="text-2xl font-black mb-12 uppercase tracking-wide flex items-center gap-4 text-black">
              <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">✓</span>
              It&apos;s likely a fit if you:
            </h3>
            <ul className="space-y-8">
              {fitItems.map((item) => (
                <li key={item.id} className="group text-xl font-medium text-zinc-700 leading-snug border-l-2 border-zinc-100 pl-6 hover:border-black hover:pl-8 hover:text-black transition-all duration-300 cursor-default">{item.text}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-12 md:p-20">
            <h3 className="text-2xl font-black mb-12 uppercase tracking-wide flex items-center gap-4 text-zinc-400">
              <span className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-400 flex items-center justify-center text-sm font-black">X</span>
              Likely not a fit if you:
            </h3>
            <ul className="space-y-8">
              {notFitItems.map((item) => (
                <li key={item.id} className="text-xl font-medium text-zinc-400 leading-snug pl-6 border-l-2 border-zinc-100">{item.text}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What Tends to Change */}
      <section className="py-32 bg-zinc-50 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <h2 className="text-4xl md:text-6xl font-black mb-16 tracking-tighter uppercase leading-none text-black">What Tends <br />To Change</h2>
            <div className="grid sm:grid-cols-2 gap-12">
              {changeItems.map((item) => (
                <div key={item.id} className="space-y-4 group cursor-default border-b border-zinc-200 pb-8 hover:border-black transition-all duration-300">
                  <h4 className="text-2xl font-black uppercase tracking-tight text-black group-hover:underline underline-offset-4 decoration-2">{item.title}</h4>
                  <p className="text-zinc-500 leading-relaxed group-hover:text-zinc-700 transition-colors">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 right-10 text-black/5 font-black text-9xl pointer-events-none">444</div>
      </section>

      {/* The Guides */}
      {guides.map((guide) => (
        <section key={guide.id} className="py-32 bg-white border-t border-zinc-100">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-24 items-center">
              <div className="relative">
                <div className="aspect-[4/5] bg-zinc-200">
                  <img src={guide.image_url} alt={guide.heading} className="w-full h-full object-cover filter grayscale" />
                </div>
                <div className="absolute -bottom-8 -right-8 bg-black text-white p-10 flex flex-col items-center justify-center">
                  <span className="text-6xl font-black">444</span>
                  <span className="text-[10px] uppercase font-bold tracking-[0.5em] mt-2 opacity-50">Presence</span>
                </div>
              </div>
              <div className="space-y-8">
                <h2 className="text-5xl font-black tracking-tighter uppercase leading-tight text-black"
                    dangerouslySetInnerHTML={{ __html: guide.heading }} />
                <p className="text-xl text-zinc-600 leading-relaxed font-medium">{guide.body_paragraph_1}</p>
                <p className="text-lg text-zinc-500 leading-relaxed italic">{guide.body_paragraph_2}</p>
                {guide.cta_label && (
                  <a href={guide.cta_url} className="inline-block text-sm uppercase tracking-widest font-black border-b border-black pb-1 hover:text-zinc-500 transition-colors">
                    {guide.cta_label} →
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Testimonials */}
      <section className="py-32 bg-white relative">
        <div className="container mx-auto px-6 text-center mb-16">
          <h2 className="font-accent italic text-3xl md:text-5xl text-black mb-4 font-light tracking-wide">Voice of the Crossing</h2>
        </div>
        <StaggerTestimonials testimonials={testimonialsForComponent} />
      </section>

      {/* Investment, Next Steps, Final CTA */}
      <section id="apply" className="py-40 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <span className="text-[40vw] font-black">444</span>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {investment && (
              <AnimatedInvestment
                investment={investment}
                nextSteps={nextSteps}
                finalCta={finalCta}
              />
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 bg-black text-white relative">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-end">
              <div className="space-y-8">
                <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-snug uppercase">
                  {footerClosing?.body_copy ?? ""}
                </h3>
                <p className="font-accent italic text-2xl text-zinc-400 leading-relaxed border-l-4 border-white pl-8 py-2 font-light">
                  You need a structure capable of holding the actual crossing.
                </p>
              </div>
              <div className="space-y-6">
                <p className="text-zinc-400 uppercase tracking-widest font-black text-xs">Availability</p>
                <p className="text-lg leading-relaxed">{footerClosing?.availability_text ?? ""}</p>
                <div className="flex items-center gap-4 text-white/20 font-black text-4xl">444</div>
              </div>
            </div>

            {/* Email Capture Form */}
            <form
              action="/api/subscribe"
              method="POST"
              className="mt-24 border-t border-white/10 pt-16 flex flex-col sm:flex-row gap-4 max-w-lg"
            >
              <input
                type="email"
                name="email"
                required
                placeholder="Your email"
                className="flex-1 bg-black border border-zinc-700 text-white px-6 py-4 focus:outline-none focus:border-white placeholder:text-zinc-600"
              />
              <button
                type="submit"
                className="bg-white text-black font-black uppercase tracking-widest px-8 py-4 hover:bg-zinc-200 transition-colors whitespace-nowrap"
              >
                Stay Connected
              </button>
            </form>
          </div>
        </div>
      </footer>

      <Chatbot />
    </div>
  )
}
```

**Note:** The `thresholdDef.left_heading` contains `<br />` HTML for line breaks (matching the original hardcoded JSX). Use `dangerouslySetInnerHTML` there. The guide heading also may contain formatted HTML. If the admin saves plain text, replace with plain text rendering.

- [ ] **Step 2: Fix any TypeScript errors from the conversion**

```bash
npx tsc --noEmit
```

Fix any errors — common ones:
- `SoulInitiationHero` prop shape (currently no `slides` prop — see Task 17)
- `AnimatedInvestment` `item.desc` should be `item.description`

---

### Task 17: Update `SoulInitiationHero` to accept CMS slides

The existing component is hardcoded. Check if it already accepts a `slides` prop; if not, update its signature.

- [ ] **Step 1: Read `components/soul-initiation-hero.tsx`** and check its props interface.

- [ ] **Step 2: If no `slides` prop exists**, add it:

```typescript
// At the top of the component
import type { HeroSlide } from "@/lib/content/types"

// Update the function signature to accept optional slides
export function SoulInitiationHero({ slides }: { slides?: HeroSlide[] }) {
  // If slides is empty (e.g. DB not yet seeded), fall back to hardcoded defaults
  // ... rest of existing component
}
```

If the component internally renders its own hardcoded data array, wrap that array in a fallback:

```typescript
const displaySlides = slides && slides.length > 0 ? slides : HARDCODED_FALLBACK_SLIDES
```

This ensures the page renders correctly even before the DB is seeded.

---

### Task 18: Email capture API route (`app/api/subscribe/route.ts`)

- [ ] **Step 1: Create `app/api/subscribe/route.ts`**

```typescript
import { NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = (formData.get("email") as string | null)?.trim().toLowerCase()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.redirect(new URL("/soul-initiation?subscribed=error", request.url))
  }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from("subscribers")
    .upsert({ email, source: "soul-initiation-footer" }, { onConflict: "email" })

  if (error) {
    console.error("subscribe:", error.message)
    return NextResponse.redirect(new URL("/soul-initiation?subscribed=error", request.url))
  }

  return NextResponse.redirect(new URL("/soul-initiation?subscribed=true", request.url))
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

---

### Task 19: Seed the database with existing hardcoded content

Before testing the live page, seed each table with the data from the original `page.tsx` so the page renders correctly.

- [ ] **Step 1: Create `supabase/seed.sql`** with INSERT statements for all hardcoded content

```sql
-- si_intro
INSERT INTO si_intro (eyebrow, heading, subtext) VALUES (
  'The Threshold',
  'You''ve Done the Work. But Something in You Knows You Haven''t Crossed Yet.',
  'A six-month initiation for people at a real threshold in their life — not seeking more insight, but a way to move through.'
);

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
INSERT INTO si_who_for_items (sort_order, text, column) VALUES
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

-- si_guides (using existing image as placeholder)
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
```

- [ ] **Step 2: Run seed SQL in Supabase SQL Editor**

Open Supabase dashboard → SQL Editor → paste and run `supabase/seed.sql`.

Expected: "Success." — all rows inserted.

---

### Task 20: End-to-end smoke test

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Visit `/soul-initiation`**

Verify:
- Page loads without errors in browser console
- All sections display correct content (matching the original hardcoded page)
- The new "This Is Not / This Is" section appears between Philosophical Bridge and Arc (it will be empty until seeded)
- No TypeScript/runtime errors

- [ ] **Step 3: Seed program-definition items** (new section — no hardcoded fallback)

In Supabase SQL Editor:

```sql
INSERT INTO si_program_definition_items (sort_order, text, category) VALUES
(0, 'Therapy or coaching',              'is_not'),
(1, 'A course or curriculum',           'is_not'),
(2, 'A spiritual bypass',               'is_not'),
(3, 'A quick transformation',           'is_not'),
(0, 'A structured passage',             'is'),
(1, 'A container for real crossing',    'is'),
(2, 'Accompaniment through threshold',  'is'),
(3, 'A time-tested initiatory process', 'is');
```

Verify the new section now renders on the page.

- [ ] **Step 4: Test admin panel**

- Visit `/admin` → redirected to `/admin/login` ✓
- Log in → reach dashboard ✓
- Click "Intro / The Threshold" → see pre-filled form ✓
- Change `subtext` → Save → visit `/soul-initiation` (force refresh after 60s or add `?ts=1`) → confirm change ✓

- [ ] **Step 5: Production build check**

```bash
npm run build
```

Expected: Build succeeds with no errors. (Warnings about `dangerouslySetInnerHTML` are acceptable.)

- [ ] **Step 6: Commit Chunk 5**

```bash
git add app/soul-initiation/ app/api/ components/soul-initiation/ supabase/seed.sql
git commit -m "feat: convert soul-initiation to CMS-driven server component, add program-definition section, email capture"
```

---

## Deployment Checklist

After all chunks pass, before pushing to production:

- [ ] Add all env vars to Vercel project settings:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ADMIN_PASSWORD`

- [ ] Push to GitHub main branch → Vercel auto-deploys

- [ ] Verify production deploy: visit `yourdomain.com/soul-initiation` and `yourdomain.com/admin`

- [ ] In Supabase Storage settings, confirm `soul-initiation` bucket is public

---

## Known Constraints & Notes

1. **No test framework installed.** Verification is via `npx tsc --noEmit` + manual browser smoke tests. Adding vitest + @testing-library is out of scope but worthwhile post-launch.

2. **`dangerouslySetInnerHTML` in threshold heading and guides heading.** The seed SQL includes inline HTML for styling. Post-launch, the admin forms for these fields should use plain text and the JSX should handle the split/styling — or advise the client to use a specific delimiter convention.

3. **Image uploads.** The admin forms use text inputs for `image_url` in this plan. A full file-upload UI (reading `File` from `<input type="file">` and calling `uploadImage()` from `lib/actions/content.ts`) can be added in a follow-up iteration.

4. **`revalidate: 60` means changes take up to 60 seconds.** The Server Action calls `revalidatePath('/soul-initiation')` which purges the cache immediately after each admin save — so in practice the page updates on the next request after saving.

5. **`SoulInitiationHero` component** currently takes no props. Task 17 adds optional `slides` prop with a fallback so the hero is never blank.
