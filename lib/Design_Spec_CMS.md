# Design Spec: Soul Initiation Dynamic Landing Page CMS

* **Date:** 2026-03-23
* **Project:** Wadada — `/soul-initiation` page
* **Status:** Awaiting implementation plan

---

## Context

The Soul Initiation Program landing page (`/soul-initiation`) currently has all copy, images, and structured content hardcoded in `app/soul-initiation/page.tsx`. The client needs to be able to edit every section — copy, images, pricing, testimonials, CTAs — without touching code.

**The goal:** Convert the page to a fully dynamic CMS-driven experience backed by Supabase Postgres (content) and Supabase Storage (images), with a custom password-protected admin panel at `/admin`, deployed via GitHub → Vercel.

*Note:* One section from the source copy (`soul-initiation-program-copy.md`) is not yet rendered: the "This Is Not / This Is" program definition contrast block. It must be added as a new section between the Philosophical Bridge and the Arc.

---

## Decisions Made

| Decision | Choice | Reason |
| :--- | :--- | :--- |
| **CMS interface** | Custom `/admin` panel | Client wants UI-based editing, not raw Supabase dashboard. |
| **Admin auth** | Single password (env var) | One editor, no team accounts needed. |
| **Database** | Supabase Postgres, typed tables per section | Type safety, maintainable schema, good admin form UX. |
| **Images** | Supabase Storage (`soul-initiation` bucket) | Single provider for DB + files. |
| **Data fetching** | Next.js ISR (`revalidate: 60`) + `revalidatePath` | Always fresh, SEO-friendly, no loading states. |
| **Scope** | `/soul-initiation` page only | Main Wadada Run Club page stays static for now. |
| **Deployment** | GitHub (new repo) → Vercel | Existing Vercel setup, CI/CD via GitHub push. |

---

## Architecture

```text
GitHub Repo (new, created via GitHub MCP)
    └── Next.js 15 app (existing /Users/CR7/Downloads/wadada codebase)
         ├── app/soul-initiation/page.tsx   → async Server Component, ISR revalidate: 60
         ├── app/admin/                      → password-gated admin panel
         │    ├── layout.tsx                 → auth middleware check
         │    ├── page.tsx                   → section dashboard
         │    └── [section]/page.tsx         → per-section edit forms
         ├── app/api/subscribe/route.ts      → email capture endpoint
         └── lib/
              ├── supabase-server.ts         → createServerClient (server-only)
              ├── supabase-client.ts         → createBrowserClient (admin only)
              ├── content/                   → typed fetch functions per section
              │    ├── types.ts              → all TypeScript interfaces
              │    ├── hero.ts
              │    ├── recognition.ts
              │    ├── threshold.ts
              │    ├── philosophical-bridge.ts
              │    ├── program-definition.ts
              │    ├── arc.ts
              │    ├── requirements.ts
              │    ├── who-for.ts
              │    ├── changes.ts
              │    ├── guides.ts
              │    ├── testimonials.ts
              │    ├── investment.ts
              │    ├── next-steps.ts
              │    ├── final-cta.ts
              │    └── footer.ts
              └── actions/                   → Next.js Server Actions for admin writes
                   ├── hero.ts
                   ├── guides.ts
                   └── ... (one per section)

Supabase
    ├── Postgres DB  — 18 si_* CMS tables + 1 subscribers table = 19 total
    └── Storage      — "soul-initiation" bucket (images)
         ├── hero-slides/
         ├── arc-entries/
         └── guides/

Vercel
    └── Deploys from GitHub main branch
         └── Env vars: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ADMIN_PASSWORD

    ## Data Flow

### 1. Page Render
* Request hits `/soul-initiation`.
* Next.js checks ISR cache (60s TTL).
* If stale: calls fetch functions → Supabase Postgres → renders HTML.
* Cached response served.

### 2. Admin Save
* Admin submits form at `/admin/[section]`.
* Server Action validates, writes to Supabase.
* Server Action calls `revalidatePath('/soul-initiation')`.
* Next cache invalidated → next request fetches fresh content.

---

## Database Schema & Policies

* **Timestamp policy:** ALL tables (list and singleton) include `created_at timestamptz DEFAULT now()` and `updated_at timestamptz DEFAULT now()`. No exceptions.
* **RLS policy (all `si_*` tables):** `SELECT` is public (anon role). `INSERT` / `UPDATE` / `DELETE` require service role key. The page fetches via the anon key (public read). The admin panel uses the service role key for writes.
* **RLS policy (subscribers):** `INSERT` is public (anon role, so the footer form works). `SELECT` / `UPDATE` / `DELETE` require service role key (only admin can view/export).
* **Image storage path convention:** Files uploaded to Supabase Storage use the path pattern `<subfolder>/<record-uuid>.<ext>` (e.g., `hero-slides/abc-123.jpg`). The public URL is constructed as: `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/soul-initiation/<path>`.
* **List table requirements:** All list tables include `id uuid DEFAULT gen_random_uuid() PRIMARY KEY`, `sort_order int NOT NULL DEFAULT 0`, plus timestamps.

---

## Admin Auth Spec

* **Env var:** `ADMIN_PASSWORD` (set in Vercel and `.env.local`)
* **Cookie:** name = `admin_session`, value = `authenticated`, max-age = `604800` (7 days), HttpOnly, Secure, SameSite=Lax
* **Login flow:** Form at `/admin/login` POSTs password via Server Action → compares to `ADMIN_PASSWORD` → sets cookie → redirects to `/admin`
* **Logout:** Button in admin layout calls Server Action that clears the `admin_session` cookie
* **Middleware:** `middleware.ts` checks for `admin_session=authenticated` cookie on all `/admin/*` routes; redirects to `/admin/login` if missing.

---

## Tables Schema

**`si_hero_slides` (list)**
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `sort_order` | int | Display order |
| `image_url` | text | Supabase Storage URL |
| `title_line1` | text | e.g. "SOUL /" |
| `title_line2` | text | e.g. "INITIATION" |
| `subtitle` | text | Slide descriptor |
| `active` | boolean | DEFAULT true |
| `created_at` / `updated_at` | timestamptz | |

**`si_intro` (singleton — 1 row)**
| Column | Type |
| :--- | :--- |
| `id` | uuid |
| `eyebrow` | text |
| `heading` | text |
| `subtext` | text |
| `created_at` / `updated_at` | timestamptz |

**`si_recognition_items` (list)**
| Column | Type |
| :--- | :--- |
| `title` | text |
| `description` | text |

**`si_threshold_definition` (singleton)**
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `left_heading` | text | |
| `left_paragraph` | text | |
| `right_subheading` | text | Right side is heading-only by design; body content lives in `si_threshold_items` list |
| `created_at` / `updated_at` | timestamptz | |

**`si_threshold_items` (list — "what happens without structure")**
| Column | Type |
| :--- | :--- |
| `title` | text |
| `description` | text |

**`si_philosophical_bridge` (singleton)**
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `quote_text` | text | Full quote string |
| `quote_highlight` | text | The bolded/underlined span within the quote |
| `supporting_paragraph`| text | |
| `created_at` / `updated_at` | timestamptz | |

**`si_program_definition_items` (list — NEW SECTION)**
| Column | Type | Notes |
| :--- | :--- | :--- |
| `text` | text | The item text |
| `category` | text | 'is_not' or 'is' |

**`si_arc_entries` (list)**
| Column | Type | Notes |
| :--- | :--- | :--- |
| `image_url` | text | Supabase Storage URL |
| `title` | text | e.g. "1. Separation" |
| `description` | text | |
| `layout_direction` | text | 'left' or 'right' |

**`si_requirements` (singleton)**
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `left_heading` | text | e.g. "What This Requires" |
| `left_tagline` | text | e.g. "It asks to be met..." |
| `created_at` / `updated_at` | timestamptz | |

**`si_requirement_items` (list)**
| Column | Type |
| :--- | :--- |
| `label` | text |
| `value` | text |

**`si_who_for_items` (list)**
| Column | Type | Notes |
| :--- | :--- | :--- |
| `text` | text | The item text |
| `column` | text | 'fit' or 'not_fit' |

**`si_change_items` (list)**
| Column | Type |
| :--- | :--- |
| `title` | text |
| `description` | text |

**`si_guides` (list — supports multiple guide profiles)**
| Column | Type | Notes |
| :--- | :--- | :--- |
| `image_url` | text | Supabase Storage URL |
| `heading` | text | |
| `body_paragraph_1` | text | |
| `body_paragraph_2` | text | |
| `cta_label` | text | e.g. "Learn More" |
| `cta_url` | text | External or internal link |
| `active` | boolean | DEFAULT true |

**`si_testimonials` (list)**
| Column | Type |
| :--- | :--- |
| `quote` | text |
| `author_name` | text |
| `author_role` | text |
| `avatar_url` | text |

**`si_investment` (singleton)**
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `eyebrow` | text | e.g. "The Investment" |
| `price` | text | e.g. "$2,500" |
| `payment_note` | text | e.g. "Payment plans available upon request." |
| `blockquote_text` | text | The italic quote below the price |
| `cta_label` | text | e.g. "Submit Your Application" |
| `cta_url` | text | Where the Apply button links |
| `created_at` / `updated_at` | timestamptz | |

**`si_next_steps` (list)**
| Column | Type |
| :--- | :--- |
| `step_number` | text |
| `title` | text |
| `description` | text |

**`si_final_cta` (singleton)**
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `heading_main` | text | e.g. "If You Recognize Yourself in This..." |
| `heading_accent` | text | e.g. "at the Threshold." (dimmed span) |
| `created_at` / `updated_at` | timestamptz | |

**`si_footer_closing` (singleton)**
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `body_copy` | text | The closing paragraph |
| `availability_text` | text | e.g. "The April 2026 cohort is small by design..." |
| `created_at` / `updated_at` | timestamptz | |

**`subscribers` (email captures)**
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `email` | text | UNIQUE, NOT NULL |
| `subscribed_at` | timestamptz | DEFAULT now() |
| `source` | text | DEFAULT 'soul-initiation-footer'. CHECK constraint: ('soul-initiation-footer', 'admin') |

---

## Section Map: Current Page → Database

| # | Section Name | Table(s) | Status |
| :--- | :--- | :--- | :--- |
| 1 | Hero Slider + Nav | `si_hero_slides` | Refactor |
| 2 | Intro / The Threshold | `si_intro` | Refactor |
| 3 | Do You Recognize This? | `si_recognition_items` | Refactor |
| 4 | Threshold Definition | `si_threshold_definition` + `si_threshold_items` | Refactor |
| 5 | Philosophical Bridge | `si_philosophical_bridge` | Refactor |
| 6 | This Is Not / This Is | `si_program_definition_items` | **NEW** |
| 7 | Arc of Initiation | `si_arc_entries` | Refactor |
| 8 | Requirements | `si_requirements` + `si_requirement_items` | Refactor |
| 9 | Who This Is For | `si_who_for_items` | Refactor |
| 10 | What Tends to Change | `si_change_items` | Refactor |
| 11 | The Guides | `si_guides` | Refactor (list) |
| 12 | Testimonials | `si_testimonials` | Refactor |
| 13 | Investment / CTA | `si_investment` | Refactor (+cta_url) |
| 14 | Next Steps | `si_next_steps` | Refactor |
| 15 | Final CTA Headline | `si_final_cta` | Refactor |
| 16 | Footer Closing | `si_footer_closing` | Refactor |
| 17 | Email Capture | `subscribers` | **NEW** |     