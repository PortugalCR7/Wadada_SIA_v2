# Animated Guides Carousel Implementation Plan

**Goal:** Replace the static "444 box" in the You Are Accompanied section with a dynamic quote, and add an Aceternity-style animated carousel below it showcasing individual guide profiles — all editable from the CMS.

**Architecture:** Add a `section_title` column to `si_guides` to hold the carousel heading. The first entry (sort_order 0) drives the narrative section (You Are Accompanied); entries sort_order 1+ feed the new `AnimatedGuides` carousel component. Field repurposing: `cta_label` → quote on sort_order 0, `heading/body_paragraph_1/body_paragraph_2/cta_label/cta_url` → name/title/bio/button on sort_order 1+.

**Tech Stack:** Next.js 15 (App Router), Supabase, Framer Motion, Tailwind CSS, TypeScript

---

### Task 1: Database migration — add `section_title` to `si_guides`

**Files:**
- Create: `supabase/migrations/002_add_section_title_to_guides.sql`

**Step 1: Create migration file**

```sql
-- supabase/migrations/002_add_section_title_to_guides.sql
ALTER TABLE si_guides ADD COLUMN IF NOT EXISTS section_title TEXT DEFAULT '';
```

**Step 2: Apply via Supabase dashboard or CLI**

If using Supabase CLI:
```bash
supabase db push
```

If applying manually, run the SQL above in the Supabase SQL editor.

**Step 3: Verify**
Open Supabase dashboard → Table Editor → `si_guides`. Confirm `section_title` column exists.

**Step 4: Commit**
```bash
git add supabase/migrations/002_add_section_title_to_guides.sql
git commit -m "feat: add section_title column to si_guides for carousel heading"
```

---

### Task 2: Update TypeScript type

**Files:**
- Modify: `lib/content/types.ts:89-99`

**Step 1: Add `section_title` to Guide interface**

In `lib/content/types.ts`, replace:
```typescript
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
```

With:
```typescript
export interface Guide {
  id: string
  sort_order: number
  image_url: string
  heading: string
  body_paragraph_1: string
  body_paragraph_2: string
  cta_label: string
  cta_url: string
  section_title: string
  active: boolean
}
```

**Step 2: Verify TypeScript compiles**
```bash
cd /Users/CR7/Downloads/wadada && npx tsc --noEmit
```
Expected: no errors

**Step 3: Commit**
```bash
git add lib/content/types.ts
git commit -m "feat: add section_title to Guide type"
```

---

### Task 3: Create AnimatedGuides component

**Files:**
- Create: `components/ui/animated-guides.tsx`

**Step 1: Create the component**

```tsx
"use client"

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useEffect, useState, useCallback } from "react"

type GuideCard = {
  image_url: string
  name: string        // heading from DB
  title: string       // body_paragraph_1 from DB
  bio: string         // body_paragraph_2 from DB
  cta_label: string
  cta_url: string
}

export function AnimatedGuides({
  guides,
  sectionTitle,
  autoplay = true,
}: {
  guides: GuideCard[]
  sectionTitle: string
  autoplay?: boolean
}) {
  const [active, setActive] = useState(0)

  const handleNext = useCallback(() => {
    setActive((prev) => (prev + 1) % guides.length)
  }, [guides.length])

  const handlePrev = useCallback(() => {
    setActive((prev) => (prev - 1 + guides.length) % guides.length)
  }, [guides.length])

  useEffect(() => {
    if (!autoplay || guides.length <= 1) return
    const interval = setInterval(handleNext, 5000)
    return () => clearInterval(interval)
  }, [autoplay, guides.length, handleNext])

  const randomRotateY = () => Math.floor(Math.random() * 21) - 10

  if (guides.length === 0) return null

  return (
    <section className="py-32 bg-white border-t border-zinc-100">
      <div className="container mx-auto px-6">
        {/* Section heading */}
        {sectionTitle && (
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black">
              {sectionTitle}
            </h2>
            <div className="w-12 h-[2px] bg-black mx-auto mt-6" />
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Stacked image cards */}
            <div className="relative h-96 w-full">
              <AnimatePresence>
                {guides.map((guide, index) => (
                  <motion.div
                    key={`${guide.name}-${index}`}
                    initial={{ opacity: 0, scale: 0.9, rotate: randomRotateY() }}
                    animate={{
                      opacity: index === active ? 1 : 0.6,
                      scale: index === active ? 1 : 0.95,
                      rotate: index === active ? 0 : randomRotateY(),
                      zIndex: index === active ? 10 : guides.length - index,
                      y: index === active ? [0, -12, 0] : 0,
                    }}
                    exit={{ opacity: 0, scale: 0.9, rotate: randomRotateY() }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="absolute inset-0 origin-bottom cursor-pointer"
                    onClick={() => setActive(index)}
                  >
                    <div className="relative h-full w-full bg-zinc-200">
                      {guide.image_url ? (
                        <Image
                          src={guide.image_url}
                          alt={guide.name}
                          fill
                          draggable={false}
                          className="object-cover object-center filter grayscale"
                        />
                      ) : (
                        <div className="h-full w-full bg-zinc-300 flex items-center justify-center">
                          <span className="text-zinc-500 text-sm uppercase tracking-widest">No image</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Guide info */}
            <div className="flex flex-col justify-between py-4 min-h-80">
              <motion.div
                key={active}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-black">
                    {guides[active].name}
                  </h3>
                  {guides[active].title && (
                    <p className="text-sm uppercase tracking-widest text-zinc-400 mt-1 font-medium">
                      {guides[active].title}
                    </p>
                  )}
                </div>

                <motion.p className="text-base text-zinc-500 leading-relaxed">
                  {guides[active].bio.split(" ").map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{ filter: "blur(8px)", opacity: 0, y: 4 }}
                      animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut", delay: 0.015 * i }}
                      className="inline-block"
                    >
                      {word}&nbsp;
                    </motion.span>
                  ))}
                </motion.p>

                {guides[active].cta_label && guides[active].cta_url && (
                  <a
                    href={guides[active].cta_url}
                    className="inline-block text-sm uppercase tracking-widest font-black border-b border-black pb-1 hover:text-zinc-500 transition-colors mt-2"
                  >
                    {guides[active].cta_label} →
                  </a>
                )}
              </motion.div>

              {/* Navigation */}
              {guides.length > 1 && (
                <div className="flex items-center gap-4 pt-10">
                  <button
                    onClick={handlePrev}
                    className="h-9 w-9 rounded-full border border-zinc-200 flex items-center justify-center hover:border-black transition-colors group"
                    aria-label="Previous guide"
                  >
                    <IconArrowLeft className="h-4 w-4 text-black group-hover:rotate-12 transition-transform duration-300" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="h-9 w-9 rounded-full border border-zinc-200 flex items-center justify-center hover:border-black transition-colors group"
                    aria-label="Next guide"
                  >
                    <IconArrowRight className="h-4 w-4 text-black group-hover:-rotate-12 transition-transform duration-300" />
                  </button>
                  <span className="text-xs text-zinc-400 uppercase tracking-widest font-medium ml-2">
                    {active + 1} / {guides.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

**Step 2: Verify framer-motion is installed**
```bash
cd /Users/CR7/Downloads/wadada && grep "framer-motion" package.json
```
Expected: `"framer-motion": "..."` present. If missing: `npm install framer-motion`

**Step 3: Verify @tabler/icons-react is installed**
```bash
grep "@tabler/icons-react" package.json
```
Expected: present. If missing: `npm install @tabler/icons-react`

**Step 4: Commit**
```bash
git add components/ui/animated-guides.tsx
git commit -m "feat: add AnimatedGuides carousel component"
```

---

### Task 4: Update page.tsx — split guides, replace 444 box, add carousel

**Files:**
- Modify: `app/page.tsx`

**Step 1: Add AnimatedGuides import** at the top of `app/page.tsx` (after existing imports):

```tsx
import { AnimatedGuides } from "@/components/ui/animated-guides"
```

**Step 2: Split guides array** — add this block after the existing `notFitItems` line (around line 87):

```tsx
  const narrativeGuide = guides[0] ?? null
  const guideProfiles = guides.slice(1).map((g) => ({
    image_url: g.image_url,
    name: g.heading,
    title: g.body_paragraph_1,
    bio: g.body_paragraph_2,
    cta_label: g.cta_label,
    cta_url: g.cta_url,
  }))
  const carouselSectionTitle = narrativeGuide?.section_title ?? "Soul Initiation Guides"
```

**Step 3: Update the guides section in the JSX** — find the `{/* The Guides */}` comment block (lines 270–300) and replace the entire `{guides.map(...)}` block with:

```tsx
      {/* The Guides */}
      {narrativeGuide && (
        <section className="py-32 bg-white border-t border-zinc-100">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-24 items-center">
              <div className="relative">
                <div className="aspect-[4/5] bg-zinc-200">
                  <img
                    src={narrativeGuide.image_url}
                    alt={narrativeGuide.heading}
                    className="w-full h-full object-cover filter grayscale"
                  />
                </div>
                {narrativeGuide.cta_label && (
                  <div className="absolute -bottom-8 -right-8 bg-black text-white p-8 flex flex-col items-center justify-center max-w-[180px] text-center">
                    <span className="text-sm font-medium leading-snug italic font-accent">
                      {narrativeGuide.cta_label}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-8">
                <h2
                  className="text-5xl font-black tracking-tighter uppercase leading-tight text-black"
                  dangerouslySetInnerHTML={{ __html: narrativeGuide.heading }}
                />
                <div
                  className="text-xl text-zinc-600 leading-relaxed font-medium"
                  dangerouslySetInnerHTML={{ __html: narrativeGuide.body_paragraph_1 }}
                />
                <div
                  className="text-lg text-zinc-500 leading-relaxed italic"
                  dangerouslySetInnerHTML={{ __html: narrativeGuide.body_paragraph_2 }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Guide Profiles Carousel */}
      {guideProfiles.length > 0 && (
        <AnimatedGuides
          guides={guideProfiles}
          sectionTitle={carouselSectionTitle}
          autoplay
        />
      )}
```

**Step 4: Verify dev server renders correctly**
```bash
cd /Users/CR7/Downloads/wadada && npm run dev
```
Open `http://localhost:3000` and scroll to the guides section. Verify:
- "You Are Accompanied" section still renders with image and text
- 444 box is gone; if `cta_label` has content for sort_order 0, a styled quote box appears
- If sort_order 1+ guide entries exist in the DB, the carousel renders below

**Step 5: TypeScript check**
```bash
npx tsc --noEmit
```

**Step 6: Commit**
```bash
git add app/page.tsx
git commit -m "feat: add animated guides carousel to home page, replace 444 box with dynamic quote"
```

---

### Task 5: Update GuidesForm — context-aware labels and section_title field

**Files:**
- Modify: `app/admin/[section]/_forms/GuidesForm.tsx`

**Step 1: Replace the entire file content:**

```tsx
import { getGuides } from "@/lib/content/guides"
import { replaceList } from "@/lib/actions/content"
import { RichTextField } from "@/components/admin/rich-text-field"

export default async function GuidesForm() {
  const guides = await getGuides()

  async function save(formData: FormData) {
    "use server"
    const imageUrls = formData.getAll("image_url") as string[]
    const headings = formData.getAll("heading") as string[]
    const body1s = formData.getAll("body_paragraph_1") as string[]
    const body2s = formData.getAll("body_paragraph_2") as string[]
    const ctaLabels = formData.getAll("cta_label") as string[]
    const ctaUrls = formData.getAll("cta_url") as string[]
    const sectionTitles = formData.getAll("section_title") as string[]
    const rows = headings.map((heading, i) => ({
      image_url: imageUrls[i] ?? "",
      heading,
      body_paragraph_1: body1s[i] ?? "",
      body_paragraph_2: body2s[i] ?? "",
      cta_label: ctaLabels[i] ?? "",
      cta_url: ctaUrls[i] ?? "",
      section_title: sectionTitles[i] ?? "",
      sort_order: i,
      active: true,
    }))
    await replaceList("si_guides", rows)
  }

  const defaultGuides = guides.length > 0
    ? guides
    : [{ image_url: "", heading: "", body_paragraph_1: "", body_paragraph_2: "", cta_label: "", cta_url: "", section_title: "" }]

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">The Guides</h2>
      <form action={save} className="space-y-8">
        {defaultGuides.map((guide, i) => {
          const isNarrative = i === 0
          return (
            <fieldset key={i} className="border border-zinc-800 p-6 space-y-4">
              <legend className="text-xs uppercase tracking-widest text-zinc-500 px-2">
                {isNarrative ? "You Are Accompanied Section" : `Guide ${i} — Profile Card`}
              </legend>

              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                  {isNarrative ? "Section Image" : "Guide Photo URL"}
                </label>
                <input
                  type="text"
                  name="image_url"
                  defaultValue={guide.image_url}
                  className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                  {isNarrative ? "Section Heading" : "Guide Name"}
                </label>
                <input
                  type="text"
                  name="heading"
                  defaultValue={guide.heading}
                  className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                />
              </div>

              {isNarrative ? (
                <>
                  <RichTextField
                    name="body_paragraph_1"
                    label="Paragraph 1"
                    defaultValue={guide.body_paragraph_1}
                  />
                  <RichTextField
                    name="body_paragraph_2"
                    label="Paragraph 2"
                    defaultValue={guide.body_paragraph_2}
                  />
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                      Quote (replaces 444 box)
                    </label>
                    <input
                      type="text"
                      name="cta_label"
                      defaultValue={guide.cta_label}
                      placeholder="e.g. Presence"
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                      Carousel Section Title
                    </label>
                    <input
                      type="text"
                      name="section_title"
                      defaultValue={"section_title" in guide ? (guide as { section_title: string }).section_title : ""}
                      placeholder="e.g. Soul Initiation Guides"
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                    />
                  </div>
                  {/* hidden cta_url placeholder to keep field counts aligned */}
                  <input type="hidden" name="cta_url" value={guide.cta_url ?? ""} />
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                      Guide Title / Designation
                    </label>
                    <input
                      type="text"
                      name="body_paragraph_1"
                      defaultValue={guide.body_paragraph_1}
                      placeholder="e.g. Lead Guide & Founder"
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Bio</label>
                    <textarea
                      name="body_paragraph_2"
                      defaultValue={guide.body_paragraph_2}
                      rows={4}
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white resize-y"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                      Button Label
                    </label>
                    <input
                      type="text"
                      name="cta_label"
                      defaultValue={guide.cta_label}
                      placeholder="e.g. Find Out More"
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                      Button URL
                    </label>
                    <input
                      type="text"
                      name="cta_url"
                      defaultValue={guide.cta_url}
                      placeholder="https://..."
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                    />
                  </div>
                  {/* hidden section_title placeholder to keep field counts aligned */}
                  <input type="hidden" name="section_title" value="" />
                </>
              )}
            </fieldset>
          )
        })}

        <p className="text-zinc-500 text-sm">
          Note: First entry is always the "You Are Accompanied" section. Entries 2+ become carousel cards.
          To add/remove guides use the Supabase dashboard.
        </p>
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

**Step 2: Verify admin renders**

Navigate to `http://localhost:3000/admin` → Guides section. Confirm:
- First fieldset is labelled "You Are Accompanied Section" with appropriate field names
- Subsequent fieldsets (if they exist) are labelled "Guide 1 — Profile Card", etc.
- "Carousel Section Title" field appears in the first block

**Step 3: Test a save**
Edit the "Carousel Section Title" field to "Soul Initiation Guides", click Save, reload the homepage. Confirm the carousel title updates.

**Step 4: Commit**
```bash
git add app/admin/[section]/_forms/GuidesForm.tsx
git commit -m "feat: update GuidesForm with context-aware labels and section_title field"
```

---

### Task 6: Final verification

**Step 1: Full build check**
```bash
cd /Users/CR7/Downloads/wadada && npm run build
```
Expected: Build completes with no TypeScript errors and no missing module errors.

**Step 2: Manual QA checklist**
- [ ] "You Are Accompanied" image is visible and grayscale
- [ ] "You Are Accompanied" heading renders HTML correctly
- [ ] Quote box appears bottom-right of image (if `cta_label` has content for sort_order 0)
- [ ] Carousel section title renders above carousel (if sort_order 0 `section_title` is set)
- [ ] Carousel cards cycle automatically every 5 seconds
- [ ] Prev/Next arrows work
- [ ] Clicking a stacked image brings that card to front
- [ ] Bio text animates word-by-word on card change
- [ ] "Find Out More" button links to correct URL
- [ ] Admin: all fields save and reflect on homepage after save
- [ ] Admin: first guide block has narrative labels; subsequent blocks have profile labels

**Step 3: Commit**
```bash
git add .
git commit -m "chore: final guides carousel QA pass"
```
