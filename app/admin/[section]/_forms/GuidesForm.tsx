import { getGuides } from "@/lib/content/guides"
import { replaceList } from "@/lib/actions/content"
import { RichTextField } from "@/components/admin/rich-text-field"

export default async function GuidesForm() {
  const guides = await getGuides()

  async function save(formData: FormData) {
    "use server"
    const imageUrls = formData.getAll("image_url") as string[]
    const headings = formData.getAll("heading") as string[]
    const body1s = formData.getAll("body_paragraph_1") as string[]
    const body2s = formData.getAll("body_paragraph_2") as string[]
    const ctaLabels = formData.getAll("cta_label") as string[]
    const ctaUrls = formData.getAll("cta_url") as string[]
    const rows = headings.map((heading, i) => ({
      image_url: imageUrls[i] ?? "",
      heading,
      body_paragraph_1: body1s[i] ?? "",
      body_paragraph_2: body2s[i] ?? "",
      cta_label: ctaLabels[i] ?? "",
      cta_url: ctaUrls[i] ?? "",
      sort_order: i,
      active: true,
    }))
    await replaceList("si_guides", rows)
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">The Guides</h2>
      <form action={save} className="space-y-8">
        {(guides.length > 0 ? guides : [{ image_url: "", heading: "", body_paragraph_1: "", body_paragraph_2: "", cta_label: "", cta_url: "" }]).map((guide, i) => (
          <fieldset key={i} className="border border-zinc-800 p-6 space-y-4">
            <legend className="text-xs uppercase tracking-widest text-zinc-500 px-2">Guide {i + 1}</legend>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Image URL</label>
              <input type="text" name="image_url" defaultValue={guide.image_url} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Heading</label>
              <input type="text" name="heading" defaultValue={guide.heading} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
            <RichTextField name="body_paragraph_1" label="Body Paragraph 1" defaultValue={guide.body_paragraph_1} />
            <RichTextField name="body_paragraph_2" label="Body Paragraph 2" defaultValue={guide.body_paragraph_2} />
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">CTA Label</label>
              <input type="text" name="cta_label" defaultValue={guide.cta_label} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">CTA URL</label>
              <input type="text" name="cta_url" defaultValue={guide.cta_url} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
            </div>
          </fieldset>
        ))}
        <p className="text-zinc-500 text-sm">Note: To add/remove guides, use the Supabase dashboard for now.</p>
        <button type="submit" className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors">Save</button>
      </form>
    </div>
  )
}
