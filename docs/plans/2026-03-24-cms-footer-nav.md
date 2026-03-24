# CMS-Managed Footer & Navigation Implementation Plan

**Goal:** Move the hero nav links, footer Quick Links, social media icons, and copyright text into the Supabase CMS so they can be managed from the admin panel without code changes.

**Architecture:** Add two new Supabase tables (`si_nav_links`, `si_social_links`) and one new column (`copyright_text` on `si_footer_closing`). Wire new content library functions to the existing admin form pattern. The hero nav and footer Quick Links share a single `si_nav_links` source. Social icons render only when active social links exist in the CMS.

**Tech Stack:** Next.js 15 App Router, Supabase (Postgres + RLS), TypeScript, Lucide React, Tailwind CSS, existing `replaceList` / `upsertSingleton` server actions.

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/002_nav_social_links.sql`

**Step 1: Write the migration**

```sql
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
```

**Step 2: Apply the migration**

Run in your Supabase project SQL editor, or via CLI:
```bash
supabase db push
# or paste the SQL directly into Supabase Dashboard → SQL Editor
```

**Step 3: Verify**

In Supabase Table Editor confirm:
- `si_nav_links` exists with 5 seeded rows
- `si_social_links` exists (empty)
- `si_footer_closing` has a `copyright_text` column

**Step 4: Commit**

```bash
git add supabase/migrations/002_nav_social_links.sql
git commit -m "feat: add si_nav_links, si_social_links tables and copyright_text column"
```

---

## Task 2: TypeScript Types

**Files:**
- Modify: `lib/content/types.ts`

**Step 1: Add new types at the bottom of the file**

```typescript
export interface NavLink {
  id: string
  label: string
  href: string
  open_in_new_tab: boolean
  sort_order: number
  active: boolean
}

export interface SocialLink {
  id: string
  platform: string
  url: string
  sort_order: number
  active: boolean
}
```

**Step 2: Extend `FooterClosing`**

Find the existing `FooterClosing` interface and add `copyright_text`:

```typescript
export interface FooterClosing {
  id: string
  body_copy: string
  availability_text: string
  copyright_text: string   // ← add this line
}
```

**Step 3: Commit**

```bash
git add lib/content/types.ts
git commit -m "feat: add NavLink, SocialLink types; extend FooterClosing"
```

---

## Task 3: Content Library Functions

**Files:**
- Create: `lib/content/nav-links.ts`
- Create: `lib/content/social-links.ts`

**Step 1: Create `lib/content/nav-links.ts`**

```typescript
import { createSupabasePublicClient } from "@/lib/supabase-server"
import type { NavLink } from "./types"

export async function getNavLinks(): Promise<NavLink[]> {
  try {
    const supabase = createSupabasePublicClient()
    const { data, error } = await supabase
      .from("si_nav_links")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true })
    if (error) throw error
    return data ?? []
  } catch (err) {
    console.error("[getNavLinks]", err)
    return []
  }
}
```

**Step 2: Create `lib/content/social-links.ts`**

```typescript
import { createSupabasePublicClient } from "@/lib/supabase-server"
import type { SocialLink } from "./types"

export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const supabase = createSupabasePublicClient()
    const { data, error } = await supabase
      .from("si_social_links")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true })
    if (error) throw error
    return data ?? []
  } catch (err) {
    console.error("[getSocialLinks]", err)
    return []
  }
}
```

**Step 3: Commit**

```bash
git add lib/content/nav-links.ts lib/content/social-links.ts
git commit -m "feat: add getNavLinks and getSocialLinks content functions"
```

---

## Task 4: Admin — Navigation Form (new section 18)

**Files:**
- Create: `app/admin/[section]/_forms/NavigationForm.tsx`

**Step 1: Write the form**

```tsx
import { getNavLinks } from "@/lib/content/nav-links"
import { replaceList } from "@/lib/actions/content"

export default async function NavigationForm() {
  const links = await getNavLinks()

  async function save(formData: FormData) {
    "use server"
    const labels = formData.getAll("label") as string[]
    const hrefs = formData.getAll("href") as string[]
    const newTabs = formData.getAll("open_in_new_tab") as string[]
    const rows = labels
      .map((label, i) => ({
        label,
        href: hrefs[i] ?? "",
        open_in_new_tab: newTabs[i] === "true",
        sort_order: i,
        active: true,
      }))
      .filter((r) => r.label.trim() !== "")
    await replaceList("si_nav_links", rows)
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Navigation Links</h2>
      <p className="text-zinc-400 text-sm">
        These links appear in the hero nav bar and in the footer Quick Links section.
        Use <code className="text-zinc-300">#section-id</code> for page anchors, or a full URL for external links.
      </p>
      <form action={save} className="space-y-4">
        <div className="space-y-3" id="nav-link-rows">
          {links.map((link, i) => (
            <div key={link.id} className="flex gap-3 items-center">
              <input
                type="text"
                name="label"
                defaultValue={link.label}
                placeholder="Label"
                className="w-32 bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-white"
              />
              <input
                type="text"
                name="href"
                defaultValue={link.href}
                placeholder="#section or https://..."
                className="flex-1 bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-white"
              />
              <label className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest whitespace-nowrap">
                <input
                  type="checkbox"
                  name="open_in_new_tab"
                  value="true"
                  defaultChecked={link.open_in_new_tab}
                  className="accent-white"
                />
                New tab
              </label>
            </div>
          ))}
          {/* Empty row for adding a new link */}
          <div className="flex gap-3 items-center opacity-50">
            <input
              type="text"
              name="label"
              placeholder="New label"
              className="w-32 bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-white"
            />
            <input
              type="text"
              name="href"
              placeholder="#section or https://..."
              className="flex-1 bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-white"
            />
            <label className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest whitespace-nowrap">
              <input
                type="checkbox"
                name="open_in_new_tab"
                value="true"
                className="accent-white"
              />
              New tab
            </label>
          </div>
        </div>
        <p className="text-zinc-600 text-xs">To remove a link, clear its Label field and save.</p>
        <button
          type="submit"
          className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors"
        >
          Save
        </button>
      </form>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/admin/[section]/_forms/NavigationForm.tsx
git commit -m "feat: add NavigationForm admin component for nav links"
```

---

## Task 5: Admin — Register Navigation Section

**Files:**
- Modify: `components/admin/admin-sidebar.tsx`
- Modify: `app/admin/[section]/page.tsx`

**Step 1: Add to `admin-sidebar.tsx` SECTIONS array**

After the `footer` entry (num "16"), add:

```typescript
{ slug: "navigation", label: "Navigation Links", num: "18" },
```

**Step 2: Add to `page.tsx` REGISTRY and SECTION_LABELS**

Add import at top:
```typescript
import NavigationForm from "./_forms/NavigationForm"
```

Add to REGISTRY:
```typescript
"navigation": NavigationForm,
```

Add to SECTION_LABELS:
```typescript
"navigation": "Navigation Links",
```

**Step 3: Commit**

```bash
git add components/admin/admin-sidebar.tsx app/admin/[section]/page.tsx
git commit -m "feat: register Navigation section in admin sidebar and registry"
```

---

## Task 6: Admin — Extend Footer Form (copyright + social links)

**Files:**
- Modify: `app/admin/[section]/_forms/FooterForm.tsx`

**Step 1: Rewrite `FooterForm.tsx`**

Replace the entire file with:

```tsx
import { getFooterClosing } from "@/lib/content/footer"
import { getSocialLinks } from "@/lib/content/social-links"
import { upsertSingleton, replaceList } from "@/lib/actions/content"
import { RichTextField } from "@/components/admin/rich-text-field"

const PLATFORMS = [
  "instagram", "twitter", "facebook", "linkedin",
  "tiktok", "youtube", "threads",
]

export default async function FooterForm() {
  const footer = await getFooterClosing()
  const socialLinks = await getSocialLinks()

  async function saveFooter(formData: FormData) {
    "use server"
    await upsertSingleton("si_footer_closing", footer?.id, {
      body_copy: formData.get("body_copy"),
      availability_text: formData.get("availability_text"),
      copyright_text: formData.get("copyright_text"),
    })
  }

  async function saveSocial(formData: FormData) {
    "use server"
    const platforms = formData.getAll("platform") as string[]
    const urls = formData.getAll("url") as string[]
    const rows = platforms
      .map((platform, i) => ({
        platform,
        url: urls[i] ?? "",
        sort_order: i,
        active: true,
      }))
      .filter((r) => r.platform !== "" && r.url.trim() !== "")
    await replaceList("si_social_links", rows)
  }

  return (
    <div className="space-y-12">
      {/* ── Footer Closing Content ── */}
      <section className="space-y-6">
        <h2 className="text-3xl font-black uppercase tracking-tighter">Footer Closing</h2>
        <form action={saveFooter} className="space-y-6">
          <RichTextField name="body_copy" label="Body Copy" defaultValue={footer?.body_copy ?? ""} />
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
              Availability Text
            </label>
            <input
              type="text"
              name="availability_text"
              defaultValue={footer?.availability_text ?? ""}
              className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
              Copyright Text
            </label>
            <input
              type="text"
              name="copyright_text"
              defaultValue={footer?.copyright_text ?? ""}
              placeholder="© 2026 Soul Initiation. All rights reserved."
              className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
            />
          </div>
          <button
            type="submit"
            className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors"
          >
            Save Footer Content
          </button>
        </form>
      </section>

      {/* ── Social Links ── */}
      <section className="space-y-6 border-t border-zinc-800 pt-10">
        <h3 className="text-xl font-black uppercase tracking-tighter">Social Links</h3>
        <p className="text-zinc-400 text-sm">
          If no social links are saved, the social icons section will be hidden on the live site.
        </p>
        <form action={saveSocial} className="space-y-4">
          <div className="space-y-3">
            {socialLinks.map((link) => (
              <div key={link.id} className="flex gap-3 items-center">
                <select
                  name="platform"
                  defaultValue={link.platform}
                  className="w-36 bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-white"
                >
                  <option value="">— platform —</option>
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <input
                  type="url"
                  name="url"
                  defaultValue={link.url}
                  placeholder="https://..."
                  className="flex-1 bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-white"
                />
              </div>
            ))}
            {/* Empty row to add a new social link */}
            <div className="flex gap-3 items-center opacity-50">
              <select
                name="platform"
                defaultValue=""
                className="w-36 bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-white"
              >
                <option value="">— platform —</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                type="url"
                name="url"
                placeholder="https://..."
                className="flex-1 bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-white"
              />
            </div>
          </div>
          <p className="text-zinc-600 text-xs">
            To remove a social link, clear its URL and save. Empty platform rows are ignored.
          </p>
          <button
            type="submit"
            className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors"
          >
            Save Social Links
          </button>
        </form>
      </section>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/admin/[section]/_forms/FooterForm.tsx
git commit -m "feat: extend FooterForm with copyright text and social links management"
```

---

## Task 7: Footer Component — Accept CMS Props

**Files:**
- Modify: `components/footer.tsx`

**Step 1: Rewrite `footer.tsx`**

Replace the entire file:

```tsx
"use client"

import { motion } from "framer-motion"
import {
  Instagram, Twitter, Facebook, Linkedin,
  Youtube, Music, AtSign,
  MapPin, Mail, Phone,
} from "lucide-react"
import type { NavLink, SocialLink } from "@/lib/content/types"

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  instagram: Instagram,
  twitter:   Twitter,
  facebook:  Facebook,
  linkedin:  Linkedin,
  youtube:   Youtube,
  tiktok:    Music,
  threads:   AtSign,
}

interface FooterProps {
  navLinks?: NavLink[]
  socialLinks?: SocialLink[]
  copyrightText?: string
}

export default function Footer({ navLinks = [], socialLinks = [], copyrightText }: FooterProps) {
  const copyright = copyrightText || "© 2026 Soul Initiation. All rights reserved."

  return (
    <footer className="relative bg-white border-t border-gray-200">
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-grid-subtle opacity-20 pointer-events-none" />

      <div className="container mx-auto px-6 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <h3 className="text-3xl md:text-4xl font-black tracking-wider text-gray-900 mb-4">
              SOUL INITIATION
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed mb-6 max-w-md">
              Movement isn't an option, it's a lifestyle. Join our global community of runners who
              believe in pushing boundaries and celebrating every step of the journey.
            </p>

            {/* Social Links — only render when CMS has active links */}
            {socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map((link) => {
                  const Icon = PLATFORM_ICONS[link.platform] ?? AtSign
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow us on ${link.platform}`}
                      className="w-12 h-12 bg-gray-900 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors duration-300"
                    >
                      <Icon size={20} />
                    </a>
                  )
                })}
              </div>
            )}
          </motion.div>

          {/* Quick Links — from CMS nav links */}
          {navLinks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-xl font-bold text-gray-900 mb-6 tracking-wide">QUICK LINKS</h4>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      target={link.open_in_new_tab ? "_blank" : undefined}
                      rel={link.open_in_new_tab ? "noopener noreferrer" : undefined}
                      className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-medium"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-xl font-bold text-gray-900 mb-6 tracking-wide">GET IN TOUCH</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin size={18} className="text-gray-600" />
                <span className="text-gray-600 font-medium">Kingston, Jamaica</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-gray-600" />
                <a
                  href="mailto:hello@wadadarun.club"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-medium"
                >
                  hello@wadadarun.club
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-gray-600" />
                <a
                  href="tel:+1876555WADA"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-medium"
                >
                  +1 (876) 555-WADA
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="border-t border-gray-200 pt-12 mb-12"
        >
          <div className="max-w-2xl mx-auto text-center">
            <h4 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 tracking-wide">
              STAY IN THE LOOP
            </h4>
            <p className="text-lg text-gray-600 mb-8">
              Get the latest updates on runs, events, and community news delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-md focus:border-gray-900 focus:outline-none text-gray-900 font-medium"
              />
              <button className="px-8 py-3 bg-gray-900 hover:bg-gray-700 text-white font-bold rounded-md transition-colors duration-300 tracking-wide">
                SUBSCRIBE
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
        >
          <p className="text-gray-600 font-medium">{copyright}</p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-medium">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-medium">
              Terms of Service
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
```

**Step 2: Commit**

```bash
git add components/footer.tsx
git commit -m "feat: footer accepts navLinks, socialLinks, copyrightText from CMS; social icons hidden when empty"
```

---

## Task 8: Hero Component — Accept CMS Nav Links

**Files:**
- Modify: `components/soul-initiation-hero.tsx`

**Step 1: Update the component signature and nav logic**

Find the `navItems` constant (line 43) and the component's props interface. Make these two changes:

**Change 1** — update props type (line 29):
```typescript
// Before:
export function SoulInitiationHero({ slides: cmsSlides }: { slides?: HeroSlide[] }) {

// After:
import type { HeroSlide, NavLink } from "@/lib/content/types"

export function SoulInitiationHero({
  slides: cmsSlides,
  navLinks: cmsNavLinks,
}: {
  slides?: HeroSlide[]
  navLinks?: NavLink[]
}) {
```

**Change 2** — replace hardcoded `navItems` (lines 43–49):
```typescript
// Before:
const navItems = [
  { name: "Home", href: "#hero" },
  { name: "Threshold", href: "#threshold" },
  { name: "The Arc", href: "#arc" },
  { name: "Process", href: "#process" },
  { name: "Apply", href: "#apply" },
]

// After:
const FALLBACK_NAV = [
  { id: "home",      label: "Home",      href: "#hero",      open_in_new_tab: false },
  { id: "threshold", label: "Threshold", href: "#threshold", open_in_new_tab: false },
  { id: "arc",       label: "The Arc",   href: "#arc",       open_in_new_tab: false },
  { id: "process",   label: "Process",   href: "#process",   open_in_new_tab: false },
  { id: "apply",     label: "Apply",     href: "#apply",     open_in_new_tab: false },
]
const navItems = cmsNavLinks && cmsNavLinks.length > 0 ? cmsNavLinks : FALLBACK_NAV
```

**Change 3** — update the nav rendering (lines 94–103 and 116–124) to use `item.label` / `item.id` and handle external links:

Desktop nav buttons:
```tsx
{navItems.map((item) => (
  <button
    key={item.id}
    onClick={() => {
      if (item.open_in_new_tab) {
        window.open(item.href, "_blank", "noopener,noreferrer")
      } else {
        scrollToSection(item.href)
      }
    }}
    className="text-white/70 hover:text-white transition-colors duration-300 font-medium tracking-wide uppercase text-sm pb-1 group relative"
  >
    {item.label}
    <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
  </button>
))}
```

Mobile nav buttons:
```tsx
{navItems.map((item) => (
  <button
    key={item.id}
    onClick={() => {
      if (item.open_in_new_tab) {
        window.open(item.href, "_blank", "noopener,noreferrer")
        setIsMenuOpen(false)
      } else {
        scrollToSection(item.href)
      }
    }}
    className="text-white text-3xl font-black tracking-widest hover:text-gray-400 transition-colors"
  >
    {item.label}
  </button>
))}
```

**Step 2: Commit**

```bash
git add components/soul-initiation-hero.tsx
git commit -m "feat: hero nav reads from CMS navLinks prop with hardcoded fallback"
```

---

## Task 9: Wire CMS Data in `app/page.tsx`

**Files:**
- Modify: `app/page.tsx`

**Step 1: Add imports**

At the top of the file, add alongside existing imports:
```typescript
import { getNavLinks } from "@/lib/content/nav-links"
import { getSocialLinks } from "@/lib/content/social-links"
import Footer from "@/components/footer"
```

**Step 2: Add to the `Promise.all` fetch block**

The current `Promise.all` (line 31) fetches 17 content sources. Add two more:
```typescript
const [
  heroSlides,
  intro,
  // ... existing 17 items ...
  footerClosing,
  navLinks,      // ← add
  socialLinks,   // ← add
] = await Promise.all([
  getHeroSlides(),
  // ... existing calls ...
  getFooterClosing(),
  getNavLinks(),      // ← add
  getSocialLinks(),   // ← add
])
```

**Step 3: Pass props to `SoulInitiationHero`**

Find the `<SoulInitiationHero>` usage and add `navLinks`:
```tsx
<SoulInitiationHero slides={heroSlides} navLinks={navLinks} />
```

**Step 4: Add `<Footer>` at the end of the page**

Find where the page JSX ends (before the final closing tag) and add the Footer component. If there's already an inline footer section in `page.tsx`, replace it with:
```tsx
<Footer
  navLinks={navLinks}
  socialLinks={socialLinks}
  copyrightText={footerClosing?.copyright_text}
/>
```

**Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "feat: wire navLinks and socialLinks CMS data to hero and footer"
```

---

## Task 10: Verify End-to-End

**Step 1: Run the dev server**

```bash
pnpm dev
```

**Step 2: Check the live site at `http://localhost:3000`**

- [ ] Hero nav shows the 5 seeded links (Home, Threshold, The Arc, Process, Apply)
- [ ] Footer Quick Links section shows the same 5 links
- [ ] Social icons section is **not visible** (no social links seeded yet)
- [ ] Copyright shows fallback text (no copyright_text set yet)

**Step 3: Open the admin at `http://localhost:3000/admin`**

- [ ] Sidebar shows section 18 "Navigation Links"
- [ ] Navigate to `/admin/navigation` — form shows the 5 seeded nav links
- [ ] Navigate to `/admin/footer` — form shows Body Copy, Availability Text, Copyright Text, and Social Links sections

**Step 4: Test social links**

- In `/admin/footer`, add an Instagram link (select `instagram`, enter a URL), save
- Reload `http://localhost:3000` — Instagram icon now appears in footer

**Step 5: Test conditional hide**

- In `/admin/footer`, clear the Instagram URL, save
- Reload — social icons section disappears entirely

**Step 6: Test nav link as external URL**

- In `/admin/navigation`, change one link's href to `https://example.com`, check "New tab", save
- Reload — clicking that nav item opens example.com in a new tab

**Step 7: Final commit**

```bash
git add .
git commit -m "feat: CMS-managed footer nav links, social icons, and copyright — complete"
```
