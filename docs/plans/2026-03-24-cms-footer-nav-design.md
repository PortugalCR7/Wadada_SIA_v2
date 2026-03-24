# Design: CMS-Managed Footer & Navigation Links

**Date:** 2026-03-24
**Status:** Approved

---

## Problem

The hero navigation and footer are fully hardcoded:

- `soul-initiation-hero.tsx` has a hardcoded `navItems` array (Home, Threshold, The Arc, Process, Apply)
- `footer.tsx` has hardcoded social icons pointing to `href="#"`, stale Quick Links from the old Wadada brand, and a static copyright string
- No admin controls exist for any of these

---

## Goals

1. **Social links** — add/remove social media links in the admin; each has a platform (determines the icon) and a URL. If no active social links exist in the CMS, the social icons block is hidden entirely in the footer.
2. **Nav links** → footer links — the hero nav items are managed in the CMS as `si_nav_links`; the footer Quick Links section pulls from that same table. Each link can be an anchor (`#section`) or an external URL, with an `open_in_new_tab` toggle.
3. **Copyright text** — editable in the admin via a new `copyright_text` column on the existing `si_footer_closing` table.

---

## Approach: Shared nav → footer, footer-specific settings

One `si_nav_links` table is the single source of truth for both the hero nav and the footer Quick Links. Social links and copyright live in their own table/column respectively.

---

## Data Model

### New table: `si_nav_links`

Replaces the hardcoded `navItems` array.

| column | type | default | notes |
|---|---|---|---|
| id | uuid | gen_random_uuid() | PK |
| label | text | '' | Display name, e.g. "Threshold" |
| href | text | '' | `#threshold` or full URL |
| open_in_new_tab | boolean | false | true for external links |
| sort_order | int | 0 | display order |
| active | boolean | true | hide without deleting |
| created_at | timestamptz | now() | |
| updated_at | timestamptz | now() | auto-updated via trigger |

RLS: public SELECT, service_role ALL.

Seed data (current hardcoded items):
- Home → `#hero`
- Threshold → `#threshold`
- The Arc → `#arc`
- Process → `#process`
- Apply → `#apply`

### New table: `si_social_links`

Replaces hardcoded social buttons in `footer.tsx`.

| column | type | default | notes |
|---|---|---|---|
| id | uuid | gen_random_uuid() | PK |
| platform | text | '' | `instagram`, `twitter`, `facebook`, `linkedin`, `tiktok`, `youtube`, `threads` |
| url | text | '' | Full URL to profile |
| sort_order | int | 0 | |
| active | boolean | true | |
| created_at | timestamptz | now() | |
| updated_at | timestamptz | now() | auto-updated via trigger |

RLS: public SELECT, service_role ALL.

### Modified table: `si_footer_closing`

Add one column:

| new column | type | default |
|---|---|---|
| copyright_text | text | '' |

---

## Content Library

New files following the existing pattern in `lib/content/`:

- `lib/content/nav-links.ts` — `getNavLinks(): Promise<NavLink[]>`
- `lib/content/social-links.ts` — `getSocialLinks(): Promise<SocialLink[]>`
- Updated `lib/content/footer.ts` — `getFooterClosing()` includes `copyright_text`
- Updated `lib/content/types.ts` — add `NavLink`, `SocialLink` types; extend `FooterClosing`

---

## Admin Changes

### New section 18: "Navigation" (`slug: "navigation"`)

Added to `admin-sidebar.tsx` SECTIONS array and `app/admin/[section]/page.tsx` REGISTRY.

New form: `app/admin/[section]/_forms/NavigationForm.tsx`

Features:
- List of nav link rows (label, href, open_in_new_tab toggle, active toggle)
- Add new link button
- Delete link button per row
- Reorder via sort_order field

Uses existing `upsertSingleton`-style server actions, or a new `upsertNavLinks` action for multi-row management.

### Extended section: "Footer Closing" (`slug: "footer"`)

`FooterForm.tsx` gains two new sections:

1. **Copyright Text** — plain text input bound to `si_footer_closing.copyright_text`
2. **Social Links** — list of rows (platform dropdown + URL input + active toggle + delete button) with an "Add social link" button

---

## Frontend Changes

### `components/soul-initiation-hero.tsx`

- Accept `navLinks: NavLink[]` as a prop (alongside existing `slides`)
- Replace hardcoded `navItems` array with prop, falling back to the current hardcoded array if empty
- `scrollToSection` logic unchanged for `#anchor` hrefs; for external links, use `window.open(href, '_blank')`

### `components/footer.tsx`

- Accept `navLinks: NavLink[]`, `socialLinks: SocialLink[]`, `copyrightText: string` as props
- Quick Links section renders from `navLinks`
- Social links block: renders only when `socialLinks.length > 0`; each platform maps to the correct Lucide icon
- Copyright line renders `copyrightText` (fallback: current static string)

### `app/page.tsx`

- Add `getNavLinks()` and `getSocialLinks()` to the `Promise.all` fetch block
- Pass data down to `SoulInitiationHero` and `Footer` (Footer is currently inline — wire the props or import the `Footer` component)

### Icon mapping

Platform → Lucide icon (all available in lucide-react):

| platform | icon |
|---|---|
| instagram | `Instagram` |
| twitter | `Twitter` |
| facebook | `Facebook` |
| linkedin | `Linkedin` |
| tiktok | `Music` (no TikTok icon in Lucide; use Music as fallback) |
| youtube | `Youtube` |
| threads | `AtSign` (no Threads icon in Lucide; use AtSign as fallback) |

---

## Conditional Rendering Rule

```tsx
{socialLinks.length > 0 && (
  <div className="flex space-x-4">
    {socialLinks.map(link => (
      <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" ...>
        <PlatformIcon />
      </a>
    ))}
  </div>
)}
```

No social links in CMS → zero social icons rendered.

---

## Migration Strategy

1. Write and run new Supabase migration SQL (`002_nav_social_links.sql`)
2. Seed `si_nav_links` with the current 5 hardcoded nav items so the site looks identical on deploy
3. Deploy frontend changes — fallback values ensure no visual regression if migration is slow

---

## Out of Scope

- Drag-and-drop reordering in admin (use numeric sort_order fields instead)
- Image/logo uploads for social links
- Footer newsletter section changes
