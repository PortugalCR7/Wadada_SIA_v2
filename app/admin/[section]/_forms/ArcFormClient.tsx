"use client"

import { useActionState } from "react"
import type { ActionState } from "@/lib/actions/types"
import type { ArcEntry } from "@/lib/content/types"
import { ImageUploadField } from "@/components/admin/image-upload-field"

interface ArcFormClientProps {
  entries: ArcEntry[]
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
}

const initial: ActionState = { success: false, error: null }

const emptyEntry: ArcEntry = {
  id: "new",
  image_url: "",
  title: "",
  description: "",
  layout_direction: "left",
  sort_order: 0,
}

export function ArcFormClient({ entries, action }: ArcFormClientProps) {
  const [state, formAction] = useActionState(action, initial)
  const list = entries.length > 0 ? entries : [emptyEntry]

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Arc of Initiation</h2>
      {state.success && (
        <div className="bg-green-950 border border-green-700 text-green-300 px-4 py-3 text-sm">Saved!</div>
      )}
      {state.error && (
        <div className="bg-red-950 border border-red-700 text-red-300 px-4 py-3 text-sm">{state.error}</div>
      )}
      <form action={formAction} className="space-y-8">
        {list.map((entry, i) => (
          <fieldset key={entry.id} className="border border-zinc-800 p-6 space-y-4">
            <legend className="text-xs uppercase tracking-widest text-zinc-500 px-2">Entry {i + 1}</legend>
            <ImageUploadField name="image_url" subfolder="arc" currentUrl={entry.image_url} label="Image" />
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Title</label>
              <input type="text" name="title" defaultValue={entry.title} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Description</label>
              <textarea name="description" defaultValue={entry.description} rows={3} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Layout Direction</label>
              <select name="layout_direction" defaultValue={entry.layout_direction} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white">
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </fieldset>
        ))}
        <p className="text-zinc-500 text-sm">Note: To add/remove entries, use the Supabase dashboard for now.</p>
        <button type="submit" className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors">Save</button>
      </form>
    </div>
  )
}
