import { getNextSteps } from "@/lib/content/next-steps"
import { replaceList } from "@/lib/actions/content"

export default async function NextStepsForm() {
  const steps = await getNextSteps()

  async function save(formData: FormData) {
    "use server"
    const stepNumbers = formData.getAll("step_number") as string[]
    const titles = formData.getAll("title") as string[]
    const descriptions = formData.getAll("description") as string[]
    const rows = titles.map((title, i) => ({
      step_number: stepNumbers[i] ?? "",
      title,
      description: descriptions[i] ?? "",
      sort_order: i,
    }))
    await replaceList("si_next_steps", rows)
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Next Steps</h2>
      <form action={save} className="space-y-8">
        {(steps.length > 0 ? steps : [{ step_number: "", title: "", description: "" }]).map((step, i) => (
          <fieldset key={i} className="border border-zinc-800 p-6 space-y-4">
            <legend className="text-xs uppercase tracking-widest text-zinc-500 px-2">Step {i + 1}</legend>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Step Number</label>
              <input type="text" name="step_number" defaultValue={step.step_number} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Title</label>
              <input type="text" name="title" defaultValue={step.title} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Description</label>
              <textarea name="description" defaultValue={step.description} rows={3} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
          </fieldset>
        ))}
        <p className="text-zinc-500 text-sm">Note: To add/remove steps, use the Supabase dashboard for now.</p>
        <button type="submit" className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors">Save</button>
      </form>
    </div>
  )
}
