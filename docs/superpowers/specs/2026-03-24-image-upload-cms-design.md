# CMS Image Upload + Save Error Fix — Design Spec
**Date:** 2026-03-24
**Status:** Approved (v2 — post spec review)

---

## Problem Statement

1. **Image fields in the CMS admin are plain text URL inputs.** There is no way to upload images locally — editors must manually paste Supabase Storage URLs. This is error-prone and blocks non-technical users.

2. **Saving CMS sections throws a server-side exception in production.** The root cause is that migration `003_nav_social_links.sql` was written but never applied to the production Supabase instance, so `si_nav_links`, `si_social_links`, and the `copyright_text` column on `si_footer_closing` do not exist in the live database. Additionally, unhandled throws in server actions crash the entire page rather than showing a user-friendly error.

---

## Goals

- Replace all image URL text inputs in the CMS with a local file upload UI.
- Fix the production save error by running the pending migration and adding inline error feedback to the 4 affected forms.
- Make zero breaking changes to server action persistence logic (URL strings are still what get saved to the DB).

---

## Out of Scope

- Image library / asset manager
- Drag-and-drop upload
- Image cropping or resizing
- Bulk image operations
- URL fallback input (file upload is the only option going forward)
- Error handling migration for text-only forms (IntroForm, RecognitionForm, etc.) — separate task

---

## Architecture

### Track 1 — Database Migration Fix (Manual)

Apply `supabase/migrations/003_nav_social_links.sql` to the production Supabase instance via the SQL Editor in the Supabase dashboard. This is a one-time manual step — no code change required.

The migration:
- Creates `si_nav_links` table
- Creates `si_social_links` table
- Adds `copyright_text` column to `si_footer_closing`

---

### Track 2 — Shared ImageUploadField Component

**File:** `components/admin/image-upload-field.tsx`
**Directive:** `"use client"`

A self-contained React client component managing a single image field's upload lifecycle.

**Props:**
```ts
interface ImageUploadFieldProps {
  name: string        // hidden input name (e.g. "image_url", "avatar_url")
  subfolder: string   // Supabase Storage subfolder (e.g. "hero", "guides")
  currentUrl?: string // pre-populated URL from existing DB record
  label?: string      // optional field label, defaults to "Image"
}
```

**Internal state:**
- `url` — the current resolved image URL (starts as `currentUrl`, updated after successful upload)
- `uploading` — boolean, true while upload is in-flight
- `error` — string | null, set on upload failure

**Upload flow:**
1. User clicks the upload area / "Replace" button → hidden `<input type="file">` triggers
2. `onChange` fires with selected `File`
3. `uploading = true`, `error = null`
4. `try { url = await uploadImage(subfolder, file) } catch (e) { error = e.message }`
   - The `try/catch` is required — `uploadImage` throws on storage errors and the catch must prevent unhandled rejections from crashing the React tree
5. On success: `url = returnedUrl`, `uploading = false`
6. On failure: `error = message`, `uploading = false`, previous `url` preserved

**File input constraints:**
- `accept="image/jpeg,image/png,image/webp,image/gif"`
- Client-side guard: reject files larger than 5 MB with an inline error (no upload attempt)

**Hidden input:** Always renders `<input type="hidden" name={name} value={url ?? ""} />` so the parent form's `formData.getAll(name)` works unchanged.

**Visual states:**

| State | Appearance |
|---|---|
| Empty (no url) | Dashed border box, centered upload icon + "Upload Image" label |
| Image present | Image fills box (object-cover), "Replace" button bottom-right corner |
| Uploading | Image/box dims, centered spinner + "Uploading…" text, Replace disabled |
| Error | Previous image restored, red error text below box |

---

### Track 3 — Form Updates (Server Shell + Client Wrapper Pattern)

The four image forms use this architecture to add `useActionState` while keeping server-side data fetching and server actions:

```
HeroForm.tsx (Server Component — default export)
  └─ fetches data (getHeroSlides)
  └─ defines save() inline with "use server"
  └─ renders <HeroFormClient slides={slides} action={save} />

HeroFormClient.tsx ("use client" — named export in same file or separate)
  └─ useActionState(action, { success: false, error: null })
  └─ form JSX with ImageUploadField instances
  └─ shows green/red banner based on state
```

**Why this works:** Next.js 15 allows server actions to be passed as props to client components. The inline `"use server"` function is still defined in the Server Component scope (so it can close over fetched data like `footer?.id` if needed). The client component receives it as an opaque function reference. `useActionState` wraps it cleanly.

**The 4 forms and their image fields:**

| Form | Image field | Subfolder | Action type |
|---|---|---|---|
| `HeroForm.tsx` | `image_url` per slide | `"hero"` | `replaceList` |
| `ArcForm.tsx` | `image_url` per entry | `"arc"` | `replaceList` |
| `GuidesForm.tsx` | `image_url` per guide | `"guides"` | `replaceList` |
| `TestimonialsForm.tsx` | `avatar_url` per testimonial | `"testimonials"` | `replaceList` |

All four use `replaceList` (no closed-over singleton ID), so the server/client split is straightforward.

**ActionState type** (must be defined in a new `lib/actions/types.ts` — a plain file with no `"use server"` directive, so it can be imported by both server actions and `"use client"` form wrappers without triggering a Next.js boundary error):
```ts
export type ActionState = { success: boolean; error: string | null }
```

**Save action signature change:**
```ts
// Before
async function save(formData: FormData) { "use server"; ... }

// After
async function save(prev: ActionState, formData: FormData): Promise<ActionState> {
  "use server"
  try {
    // ... existing replaceList logic unchanged
    return { success: true, error: null }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}
```

**React key stability:** Each repeated `fieldset` in list forms must use a stable key. For existing records: `key={item.id}`. For the new/empty row: `key="new"`. This prevents `ImageUploadField` state (including the uploaded URL) from being discarded when the list re-renders after a save. All four content-fetching functions (`getHeroSlides`, `getArcEntries`, `getGuides`, `getTestimonials`) return Supabase rows with an `id: string` UUID field — confirm the TypeScript return types include `id` before using it as a key.

**RichTextField note (GuidesForm, TestimonialsForm):** TipTap initializes `content` from `defaultValue` only at mount. After a successful save, the form shows a success banner but does not reset — the editor content in DOM is preserved as-is. This is the correct behavior (editor reflects what was just saved). No change to `RichTextField` is needed.

---

### Track 4 — NavigationForm Checkbox Fix (Pre-existing bug, fix while in the file)

`NavigationForm` has a checkbox alignment bug: unchecked checkboxes are absent from `FormData`, so `formData.getAll("open_in_new_tab")` returns fewer values than `formData.getAll("label")`, breaking index alignment.

**Fix:** Pair each checkbox with a hidden input of the same name and value `"false"`. The checkbox (when checked) overrides it via its `value="true"`. This ensures one `open_in_new_tab` value per row regardless of checked state. Fix NavigationForm while adding its error handling.

---

## Data Flow

```
[User selects file]
  → ImageUploadField: try { url = await uploadImage(subfolder, file) }
  → Supabase Storage upload (bucket: "soul-initiation", path: subfolder/uuid.ext)
  → Returns public URL string
  → url state updated → hidden <input> value updated
  → Preview image swapped

[User clicks Save]
  → form action fires → server action receives FormData
  → formData.getAll("image_url") reads hidden input URL strings (unchanged)
  → replaceList writes to Supabase DB
  → revalidatePath("/")
  → returns ActionState { success: true, error: null }
  → Client component renders green "Saved!" banner
```

---

## Files Changed

**New:**
- `components/admin/image-upload-field.tsx`

**Modified (image upload + error handling):**
- `app/admin/[section]/_forms/HeroForm.tsx` + `HeroFormClient` (inline or split)
- `app/admin/[section]/_forms/ArcForm.tsx` + `ArcFormClient`
- `app/admin/[section]/_forms/GuidesForm.tsx` + `GuidesFormClient`
- `app/admin/[section]/_forms/TestimonialsForm.tsx` + `TestimonialsFormClient`

**Modified (checkbox fix + error handling):**
- `app/admin/[section]/_forms/NavigationForm.tsx`

**New (ActionState type):**
- `lib/actions/types.ts` (plain file, no directive — importable by both server and client code)

**Manual (not code):**
- Run `supabase/migrations/003_nav_social_links.sql` in Supabase dashboard SQL Editor

---

## Acceptance Criteria

- [ ] Admin can upload an image from local disk on all 4 image fields
- [ ] Existing image shown as preview when editing an existing record
- [ ] Uploading state is visible (spinner, disabled Replace button)
- [ ] Files > 5 MB are rejected client-side with an error message
- [ ] Only image types accepted (jpg, png, webp, gif)
- [ ] Upload errors shown inline without crashing the page
- [ ] Save errors shown inline without crashing the page
- [ ] Save success confirmed with green "Saved!" banner
- [ ] `si_nav_links` and `si_social_links` saves work in production after migration
- [ ] `NavigationForm` open_in_new_tab correctly saves for all rows
- [ ] No change to how URL strings are stored in Supabase DB
- [ ] Stable React keys prevent image state loss on list re-render
