# Animated Testimonials Implementation Plan

**Goal:** Replace the existing `StaggerTestimonials` component with Aceternity's `AnimatedTestimonials` component, wired to the existing Supabase CMS with autoplay + manual nav support.

**Architecture:** Create the new Aceternity component, update `page.tsx` to remap the CMS data shape, update the admin form label for clarity, and delete the old unused components. No Supabase schema changes needed — `avatar_url`, `author_name`, `author_role`, and `quote` already map directly.

**Tech Stack:** Next.js 15, Framer Motion, @tabler/icons-react, Tailwind CSS, Supabase

---

### Task 1: Install missing dependency

**Files:**
- Modify: `package.json` (via npm install)

**Step 1: Install @tabler/icons-react**

```bash
cd /Users/CR7/Downloads/wadada && npm install @tabler/icons-react
```

Expected: package added to `node_modules` and `package.json` dependencies.

---

### Task 2: Create the AnimatedTestimonials component

**Files:**
- Create: `components/ui/animated-testimonials.tsx`

**Step 1: Write the component**

```tsx
"use client"

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

type Testimonial = {
  quote: string
  name: string
  designation: string
  src: string
}

export const AnimatedTestimonials = ({
  testimonials,
  autoplay = false,
  className,
}: {
  testimonials: Testimonial[]
  autoplay?: boolean
  className?: string
}) => {
  const [active, setActive] = useState(0)

  const handleNext = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length)
  }, [testimonials.length])

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const isActive = (index: number) => index === active

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000)
      return () => clearInterval(interval)
    }
  }, [autoplay, handleNext])

  const randomRotateY = () => Math.floor(Math.random() * 21) - 10

  return (
    <div className={cn("max-w-sm md:max-w-4xl mx-auto px-4 md:px-8 lg:px-12 py-20", className)}>
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-20">
        <div>
          <div className="relative h-80 w-full">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src}
                  initial={{ opacity: 0, scale: 0.9, z: -100, rotate: randomRotateY() }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : randomRotateY(),
                    zIndex: isActive(index) ? 999 : testimonials.length + 2 - index,
                    y: isActive(index) ? [0, -80, 0] : 0,
                  }}
                  exit={{ opacity: 0, scale: 0.9, z: 100, rotate: randomRotateY() }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute inset-0 origin-bottom"
                >
                  <Image
                    src={testimonial.src}
                    alt={testimonial.name}
                    width={500}
                    height={500}
                    draggable={false}
                    className="h-full w-full rounded-3xl object-cover object-center"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex justify-between flex-col py-4">
          <motion.div
            key={active}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <h3 className="text-2xl font-bold text-foreground">
              {testimonials[active].name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {testimonials[active].designation}
            </p>
            <motion.p className="text-lg text-muted-foreground mt-8">
              {testimonials[active].quote.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
                  animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut", delay: 0.02 * index }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
          </motion.div>

          <div className="flex gap-4 pt-12 md:pt-0">
            <button
              onClick={handlePrev}
              className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center group/button"
            >
              <IconArrowLeft className="h-5 w-5 text-foreground group-hover/button:rotate-12 transition-transform duration-300" />
            </button>
            <button
              onClick={handleNext}
              className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center group/button"
            >
              <IconArrowRight className="h-5 w-5 text-foreground group-hover/button:-rotate-12 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### Task 3: Update page.tsx — remap data + swap component

**Files:**
- Modify: `app/page.tsx` (lines 79-84 and line 307)

**Step 1: Update the data mapping (lines 79-84)**

Replace:
```tsx
const testimonialsForComponent = testimonials.map((t, i) => ({
  tempId: i,
  testimonial: t.quote,
  by: t.author_role ? `${t.author_name} — ${t.author_role}` : t.author_name,
  imgSrc: t.avatar_url,
}))
```

With:
```tsx
const testimonialsForComponent = testimonials.map((t) => ({
  quote: t.quote,
  name: t.author_name,
  designation: t.author_role,
  src: t.avatar_url,
}))
```

**Step 2: Swap import and component render (~line 307)**

Update the import at the top of `page.tsx`:
- Remove: `import { StaggerTestimonials } from "@/components/ui/stagger-testimonials"`
- Add: `import { AnimatedTestimonials } from "@/components/ui/animated-testimonials"`

Update the render:
- Remove: `<StaggerTestimonials testimonials={testimonialsForComponent} />`
- Add: `<AnimatedTestimonials testimonials={testimonialsForComponent} autoplay />`

---

### Task 4: Update Admin form label

**Files:**
- Modify: `app/admin/[section]/_forms/TestimonialsForm.tsx` (line 41)

**Step 1: Rename label from "Avatar URL" to "Photo URL"**

Replace:
```tsx
<label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Avatar URL</label>
```

With:
```tsx
<label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Photo URL</label>
```

---

### Task 5: Delete old unused components

**Files:**
- Delete: `components/ui/stagger-testimonials.tsx`
- Delete: `components/testimonials-section.tsx` (unused — page.tsx renders testimonials inline)

```bash
rm /Users/CR7/Downloads/wadada/components/ui/stagger-testimonials.tsx
rm /Users/CR7/Downloads/wadada/components/testimonials-section.tsx
```

Verify nothing else imports them:
```bash
grep -r "stagger-testimonials\|testimonials-section" /Users/CR7/Downloads/wadada/app /Users/CR7/Downloads/wadada/components
```

Expected: no output (nothing else imports them).

---

### Task 6: Verify build

```bash
cd /Users/CR7/Downloads/wadada && npm run build
```

Expected: successful build with no TypeScript errors.
