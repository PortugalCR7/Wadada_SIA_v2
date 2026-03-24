import { getThresholdDefinition, getThresholdItems } from "@/lib/content/threshold"
import { upsertSingleton, replaceList } from "@/lib/actions/content"

export default async function ThresholdForm() {
  const def = await getThresholdDefinition()
  const items = await getThresholdItems()

  async function save(formData: FormData) {
    "use server"
    await upsertSingleton("si_threshold_definition", def?.id, {
      left_heading: formData.get("left_heading"),
      left_paragraph: formData.get("left_paragraph"),
      right_subheading: formData.get("right_subheading"),
    })
    const titles = formData.getAll("title") as string[]
    const descriptions = formData.getAll("description") as string[]
    const rows = titles.map((title, i) => ({
      title,
      description: descriptions[i] ?? "",
      sort_order: i,
    }))
    await replaceList("si_threshold_items", rows)
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Threshold Definition</h2>
      <form action={save} className="space-y-8">
        <fieldset className="border border-zinc-800 p-6 space-y-4">
          <legend className="text-xs uppercase tracking-widest text-zinc-500 px-2">Definition</legend>
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Left Heading</label>
            <input type="text" name="left_heading" defaultValue={def?.left_heading ?? ""} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Left Paragraph</label>
            <textarea name="left_paragraph" defaultValue={def?.left_paragraph ?? ""} rows={4} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Right Subheading</label>
            <input type="text" name="right_subheading" defaultValue={def?.right_subheading ?? ""} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
          </div>
        </fieldset>

        {(items.length > 0 ? items : [{ title: "", description: "" }]).map((item, i) => (
          <fieldset key={i} className="border border-zinc-800 p-6 space-y-4">
            <legend className="text-xs uppercase tracking-widest text-zinc-500 px-2">Item {i + 1}</legend>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Title</label>
              <input type="text" name="title" defaultValue={item.title} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Description</label>
              <textarea name="description" defaultValue={item.description} rows={3} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
          </fieldset>
        ))}
        <p className="text-zinc-500 text-sm">Note: To add/remove items, use the Supabase dashboard for now.</p>
        <button type="submit" className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors">Save</button>
      </form>
    </div>
  )
}
