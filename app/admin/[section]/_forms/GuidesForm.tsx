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
    const sectionTitles = formData.getAll("section_title") as string[]
    const rows = headings.map((heading, i) => ({
      image_url: imageUrls[i] ?? "",
      heading,
      body_paragraph_1: body1s[i] ?? "",
      body_paragraph_2: body2s[i] ?? "",
      cta_label: ctaLabels[i] ?? "",
      cta_url: ctaUrls[i] ?? "",
      section_title: sectionTitles[i] ?? "",
      sort_order: i,
      active: true,
    }))
    await replaceList("si_guides", rows)
  }

  const defaultGuides = guides.length > 0
    ? guides
    : [{ image_url: "", heading: "", body_paragraph_1: "", body_paragraph_2: "", cta_label: "", cta_url: "", section_title: "" }]

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">The Guides</h2>
      <form action={save} className="space-y-8">
        {defaultGuides.map((guide, i) => {
          const isNarrative = i === 0
          return (
            <fieldset key={i} className="border border-zinc-800 p-6 space-y-4">
              <legend className="text-xs uppercase tracking-widest text-zinc-500 px-2">
                {isNarrative ? "You Are Accompanied Section" : `Guide ${i} — Profile Card`}
              </legend>

              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                  {isNarrative ? "Section Image" : "Guide Photo URL"}
                </label>
                <input
                  type="text"
                  name="image_url"
                  defaultValue={guide.image_url}
                  className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                  {isNarrative ? "Section Heading" : "Guide Name"}
                </label>
                <input
                  type="text"
                  name="heading"
                  defaultValue={guide.heading}
                  className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                />
              </div>

              {isNarrative ? (
                <>
                  <RichTextField
                    name="body_paragraph_1"
                    label="Paragraph 1"
                    defaultValue={guide.body_paragraph_1}
                  />
                  <RichTextField
                    name="body_paragraph_2"
                    label="Paragraph 2"
                    defaultValue={guide.body_paragraph_2}
                  />
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                      Quote (replaces 444 box)
                    </label>
                    <input
                      type="text"
                      name="cta_label"
                      defaultValue={guide.cta_label}
                      placeholder="e.g. Presence"
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                      Carousel Section Title
                    </label>
                    <input
                      type="text"
                      name="section_title"
                      defaultValue={"section_title" in guide ? (guide as { section_title: string }).section_title : ""}
                      placeholder="e.g. Soul Initiation Guides"
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                    />
                  </div>
                  {/* hidden cta_url placeholder to keep field counts aligned */}
                  <input type="hidden" name="cta_url" value={guide.cta_url ?? ""} />
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                      Guide Title / Designation
                    </label>
                    <input
                      type="text"
                      name="body_paragraph_1"
                      defaultValue={guide.body_paragraph_1}
                      placeholder="e.g. Lead Guide & Founder"
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Bio</label>
                    <textarea
                      name="body_paragraph_2"
                      defaultValue={guide.body_paragraph_2}
                      rows={4}
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white resize-y"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                      Button Label
                    </label>
                    <input
                      type="text"
                      name="cta_label"
                      defaultValue={guide.cta_label}
                      placeholder="e.g. Find Out More"
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                      Button URL
                    </label>
                    <input
                      type="text"
                      name="cta_url"
                      defaultValue={guide.cta_url}
                      placeholder="https://..."
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                    />
                  </div>
                  {/* hidden section_title placeholder to keep field counts aligned */}
                  <input type="hidden" name="section_title" value="" />
                </>
              )}
            </fieldset>
          )
        })}

        <p className="text-zinc-500 text-sm">
          Note: First entry is always the "You Are Accompanied" section. Entries 2+ become carousel cards.
          To add/remove guides use the Supabase dashboard.
        </p>
        <button
          type="submit"
          className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors"
        >
          Save
        </button>
      </form>
    </div>
  )
}
