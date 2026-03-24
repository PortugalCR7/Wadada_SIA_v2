"use client"

import { useActionState } from "react"
import type { ActionState } from "@/lib/actions/types"
import type { HeroSlide } from "@/lib/content/types"
import { ImageUploadField } from "@/components/admin/image-upload-field"

interface HeroFormClientProps {
  slides: HeroSlide[]
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
}

const initial: ActionState = { success: false, error: null }

const emptySlide: HeroSlide = {
  id: "new",
  image_url: "",
  title_line1: "",
  title_line2: "",
  subtitle: "",
  sort_order: 0,
  active: true,
}

export function HeroFormClient({ slides, action }: HeroFormClientProps) {
  const [state, formAction] = useActionState(action, initial)
  const list = slides.length > 0 ? slides : [emptySlide]

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Hero Slides</h2>
      {state.success && (
        <div className="bg-green-950 border border-green-700 text-green-300 px-4 py-3 text-sm">Saved!</div>
      )}
      {state.error && (
        <div className="bg-red-950 border border-red-700 text-red-300 px-4 py-3 text-sm">{state.error}</div>
      )}
      <form action={formAction} className="space-y-8">
        {list.map((slide, i) => (
          <fieldset key={slide.id} className="border border-zinc-800 p-6 space-y-4">
            <legend className="text-xs uppercase tracking-widest text-zinc-500 px-2">Slide {i + 1}</legend>
            <ImageUploadField name="image_url" subfolder="hero" currentUrl={slide.image_url} label="Image" />
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Title Line 1</label>
              <input type="text" name="title_line1" defaultValue={slide.title_line1} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Title Line 2</label>
              <input type="text" name="title_line2" defaultValue={slide.title_line2} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Subtitle</label>
              <input type="text" name="subtitle" defaultValue={slide.subtitle} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
          </fieldset>
        ))}
        <p className="text-zinc-500 text-sm">Note: The form currently saves existing items. To add/remove slides, use the Supabase dashboard for now.</p>
        <button type="submit" className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors">Save</button>
      </form>
    </div>
  )
}
