import { getHeroSlides } from "@/lib/content/hero"
import { replaceList } from "@/lib/actions/content"
import type { ActionState } from "@/lib/actions/types"
import { HeroFormClient } from "./HeroFormClient"

export default async function HeroForm() {
  const slides = await getHeroSlides()

  async function save(prev: ActionState, formData: FormData): Promise<ActionState> {
    "use server"
    try {
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
      return { success: true, error: null }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  return <HeroFormClient slides={slides} action={save} />
}
