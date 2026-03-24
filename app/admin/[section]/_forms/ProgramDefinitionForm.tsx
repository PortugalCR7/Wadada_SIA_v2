import { getProgramDefinitionItems } from "@/lib/content/program-definition"
import { replaceList } from "@/lib/actions/content"

export default async function ProgramDefinitionForm() {
  const items = await getProgramDefinitionItems()

  async function save(formData: FormData) {
    "use server"
    const texts = formData.getAll("text") as string[]
    const categories = formData.getAll("category") as string[]
    const rows = texts.map((text, i) => ({
      text,
      category: categories[i] ?? "is_not",
      sort_order: i,
    }))
    await replaceList("si_program_definition_items", rows)
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">This Is Not / This Is</h2>
      <form action={save} className="space-y-8">
        {(items.length > 0 ? items : [{ text: "", category: "is_not" as const }]).map((item, i) => (
          <fieldset key={i} className="border border-zinc-800 p-6 space-y-4">
            <legend className="text-xs uppercase tracking-widest text-zinc-500 px-2">Item {i + 1}</legend>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Text</label>
              <input type="text" name="text" defaultValue={item.text} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Category</label>
              <select name="category" defaultValue={item.category} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white">
                <option value="is_not">This Is Not</option>
                <option value="is">This Is</option>
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
