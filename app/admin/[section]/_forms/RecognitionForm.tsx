import { getRecognitionItems } from "@/lib/content/recognition"
import { replaceList } from "@/lib/actions/content"

export default async function RecognitionForm() {
  const items = await getRecognitionItems()

  async function save(formData: FormData) {
    "use server"
    const titles = formData.getAll("title") as string[]
    const descriptions = formData.getAll("description") as string[]
    const rows = titles.map((title, i) => ({
      title,
      description: descriptions[i] ?? "",
      sort_order: i,
    }))
    await replaceList("si_recognition_items", rows)
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Do You Recognize This?</h2>
      <form action={save} className="space-y-8">
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
        <p className="text-zinc-500 text-sm">Note: The form currently saves existing items. To add/remove items, use the Supabase dashboard for now.</p>
        <button type="submit" className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors">Save</button>
      </form>
    </div>
  )
}
