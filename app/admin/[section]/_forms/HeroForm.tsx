import { getHeroSlides } from "@/lib/content/hero"
import { replaceList } from "@/lib/actions/content"

export default async function HeroForm() {
  const slides = await getHeroSlides()

  async function save(formData: FormData) {
    "use server"
    const imageUrls = formData.getAll("image_url") as string[]
    const titleLine1s = formData.getAll("title_line1") as string[]
    const titleLine2s = formData.getAll("title_line2") as string[]
    const subtitles = formData.getAll("subtitle") as string[]
    const rows = imageUrls.map((url, i) => ({
      image_url: url,
      title_line1: titleLine1s[i] ?? "",
      title_line2: titleLine2s[i] ?? "",
      subtitle: subtitles[i] ?? "",
      sort_order: i,
      active: true,
    }))
    await replaceList("si_hero_slides", rows)
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Hero Slides</h2>
      <form action={save} className="space-y-8">
        {(slides.length > 0 ? slides : [{ image_url: "", title_line1: "", title_line2: "", subtitle: "" }]).map((slide, i) => (
          <fieldset key={i} className="border border-zinc-800 p-6 space-y-4">
            <legend className="text-xs uppercase tracking-widest text-zinc-500 px-2">Slide {i + 1}</legend>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Image URL</label>
              <input type="text" name="image_url" defaultValue={slide.image_url} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Title Line 1</label>
              <input type="text" name="title_line1" defaultValue={slide.title_line1} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Title Line 2</label>
              <input type="text" name="title_line2" defaultValue={slide.title_line2} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Subtitle</label>
              <input type="text" name="subtitle" defaultValue={slide.subtitle} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
          </fieldset>
        ))}
        <p className="text-zinc-500 text-sm">Note: The form currently saves existing items. To add/remove slides, use the Supabase dashboard for now.</p>
        <button type="submit" className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors">Save</button>
      </form>
    </div>
  )
}
