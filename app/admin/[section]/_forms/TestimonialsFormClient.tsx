"use client"

import { useActionState } from "react"
import type { ActionState } from "@/lib/actions/types"
import type { Testimonial } from "@/lib/content/types"
import { ImageUploadField } from "@/components/admin/image-upload-field"
import { RichTextField } from "@/components/admin/rich-text-field"

interface TestimonialsFormClientProps {
  items: Testimonial[]
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
}

const initial: ActionState = { success: false, error: null }

const emptyItem: Testimonial = {
  id: "new",
  quote: "",
  author_name: "",
  author_role: "",
  avatar_url: "",
  sort_order: 0,
}

export function TestimonialsFormClient({ items, action }: TestimonialsFormClientProps) {
  const [state, formAction] = useActionState(action, initial)
  const list = items.length > 0 ? items : [emptyItem]

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Testimonials</h2>
      {state.success && (
        <div className="bg-green-950 border border-green-700 text-green-300 px-4 py-3 text-sm">Saved!</div>
      )}
      {state.error && (
        <div className="bg-red-950 border border-red-700 text-red-300 px-4 py-3 text-sm">{state.error}</div>
      )}
      <form action={formAction} className="space-y-8">
        {list.map((item, i) => (
          <fieldset key={item.id} className="border border-zinc-800 p-6 space-y-4">
            <legend className="text-xs uppercase tracking-widest text-zinc-500 px-2">Testimonial {i + 1}</legend>
            <RichTextField name="quote" label="Quote" defaultValue={item.quote} />
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Author Name</label>
              <input type="text" name="author_name" defaultValue={item.author_name} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Author Role</label>
              <input type="text" name="author_role" defaultValue={item.author_role} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
            <ImageUploadField name="avatar_url" subfolder="testimonials" currentUrl={item.avatar_url} label="Photo" />
          </fieldset>
        ))}
        <p className="text-zinc-500 text-sm">Note: To add/remove testimonials, use the Supabase dashboard for now.</p>
        <button type="submit" className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors">Save</button>
      </form>
    </div>
  )
}
