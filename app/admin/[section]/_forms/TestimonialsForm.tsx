import { getTestimonials } from "@/lib/content/testimonials"
import { replaceList } from "@/lib/actions/content"
import { RichTextField } from "@/components/admin/rich-text-field"

export default async function TestimonialsForm() {
  const items = await getTestimonials()

  async function save(formData: FormData) {
    "use server"
    const quotes = formData.getAll("quote") as string[]
    const names = formData.getAll("author_name") as string[]
    const roles = formData.getAll("author_role") as string[]
    const avatars = formData.getAll("avatar_url") as string[]
    const rows = quotes.map((quote, i) => ({
      quote,
      author_name: names[i] ?? "",
      author_role: roles[i] ?? "",
      avatar_url: avatars[i] ?? "",
      sort_order: i,
    }))
    await replaceList("si_testimonials", rows)
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Testimonials</h2>
      <form action={save} className="space-y-8">
        {(items.length > 0 ? items : [{ quote: "", author_name: "", author_role: "", avatar_url: "" }]).map((item, i) => (
          <fieldset key={i} className="border border-zinc-800 p-6 space-y-4">
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
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Avatar URL</label>
              <input type="text" name="avatar_url" defaultValue={item.avatar_url} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
          </fieldset>
        ))}
        <p className="text-zinc-500 text-sm">Note: To add/remove testimonials, use the Supabase dashboard for now.</p>
        <button type="submit" className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors">Save</button>
      </form>
    </div>
  )
}
