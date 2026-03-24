import { getRequirements, getRequirementItems } from "@/lib/content/requirements"
import { upsertSingleton, replaceList } from "@/lib/actions/content"

export default async function RequirementsForm() {
  const req = await getRequirements()
  const items = await getRequirementItems()

  async function save(formData: FormData) {
    "use server"
    await upsertSingleton("si_requirements", req?.id, {
      left_heading: formData.get("left_heading"),
      left_tagline: formData.get("left_tagline"),
    })
    const labels = formData.getAll("label") as string[]
    const values = formData.getAll("value") as string[]
    const rows = labels.map((label, i) => ({
      label,
      value: values[i] ?? "",
      sort_order: i,
    }))
    await replaceList("si_requirement_items", rows)
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Requirements</h2>
      <form action={save} className="space-y-8">
        <fieldset className="border border-zinc-800 p-6 space-y-4">
          <legend className="text-xs uppercase tracking-widest text-zinc-500 px-2">Header</legend>
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Left Heading</label>
            <input type="text" name="left_heading" defaultValue={req?.left_heading ?? ""} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Left Tagline</label>
            <input type="text" name="left_tagline" defaultValue={req?.left_tagline ?? ""} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
          </div>
        </fieldset>

        {(items.length > 0 ? items : [{ label: "", value: "" }]).map((item, i) => (
          <fieldset key={i} className="border border-zinc-800 p-6 space-y-4">
            <legend className="text-xs uppercase tracking-widest text-zinc-500 px-2">Item {i + 1}</legend>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Label</label>
              <input type="text" name="label" defaultValue={item.label} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Value</label>
              <input type="text" name="value" defaultValue={item.value} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
          </fieldset>
        ))}
        <p className="text-zinc-500 text-sm">Note: To add/remove items, use the Supabase dashboard for now.</p>
        <button type="submit" className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors">Save</button>
      </form>
    </div>
  )
}
