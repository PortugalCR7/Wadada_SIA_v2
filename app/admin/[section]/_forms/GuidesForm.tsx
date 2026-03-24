import { getGuides } from "@/lib/content/guides"
import { replaceList } from "@/lib/actions/content"
import type { ActionState } from "@/lib/actions/types"
import { GuidesFormClient } from "./GuidesFormClient"

export default async function GuidesForm() {
  const guides = await getGuides()

  async function save(prev: ActionState, formData: FormData): Promise<ActionState> {
    "use server"
    try {
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
      return { success: true, error: null }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  return <GuidesFormClient guides={guides} action={save} />
}
