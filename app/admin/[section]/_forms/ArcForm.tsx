import { getArcEntries } from "@/lib/content/arc"
import { replaceList } from "@/lib/actions/content"

export default async function ArcForm() {
  const entries = await getArcEntries()

  async function save(formData: FormData) {
    "use server"
    const imageUrls = formData.getAll("image_url") as string[]
    const titles = formData.getAll("title") as string[]
    const descriptions = formData.getAll("description") as string[]
    const directions = formData.getAll("layout_direction") as string[]
    const rows = titles.map((title, i) => ({
      image_url: imageUrls[i] ?? "",
      title,
      description: descriptions[i] ?? "",
      layout_direction: directions[i] ?? "left",
      sort_order: i,
    }))
    await replaceList("si_arc_entries", rows)
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Arc of Initiation</h2>
      <form action={save} className="space-y-8">
        {(entries.length > 0 ? entries : [{ image_url: "", title: "", description: "", layout_direction: "left" as const }]).map((entry, i) => (
          <fieldset key={i} className="border border-zinc-800 p-6 space-y-4">
            <legend className="text-xs uppercase tracking-widest text-zinc-500 px-2">Entry {i + 1}</legend>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Image URL</label>
              <input type="text" name="image_url" defaultValue={entry.image_url} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
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
