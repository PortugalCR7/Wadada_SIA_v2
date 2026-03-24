import { getWhoForItems } from "@/lib/content/who-for"
import { replaceList } from "@/lib/actions/content"

export default async function WhoForForm() {
  const items = await getWhoForItems()

  async function save(formData: FormData) {
    "use server"
    const texts = formData.getAll("text") as string[]
    const columns = formData.getAll("column") as string[]
    const rows = texts.map((text, i) => ({
      text,
      column: columns[i] ?? "fit",
      sort_order: i,
    }))
    await replaceList("si_who_for_items", rows)
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Who This Is For</h2>
      <form action={save} className="space-y-8">
        {(items.length > 0 ? items : [{ text: "", column: "fit" as const }]).map((item, i) => (
          <fieldset key={i} className="border border-zinc-800 p-6 space-y-4">
            <legend className="text-xs uppercase tracking-widest text-zinc-500 px-2">Item {i + 1}</legend>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Text</label>
              <input type="text" name="text" defaultValue={item.text} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Column</label>
              <select name="column" defaultValue={item.column} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white">
                <option value="fit">Good Fit</option>
                <option value="not_fit">Not a Fit</option>
              </select>
            </div>
          </fieldset>
        ))}
        <p className="text-zinc-500 text-sm">Note: To add/remove items, use the Supabase dashboard for now.</p>
        <button type="submit" className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors">Save</button>
      </form>
    </div>
  )
}
