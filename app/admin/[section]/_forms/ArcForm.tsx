import { getArcEntries } from "@/lib/content/arc"
import { replaceList } from "@/lib/actions/content"
import type { ActionState } from "@/lib/actions/types"
import { ArcFormClient } from "./ArcFormClient"

export default async function ArcForm() {
  const entries = await getArcEntries()

  async function save(prev: ActionState, formData: FormData): Promise<ActionState> {
    "use server"
    try {
      const imageUrls = formData.getAll("image_url") as string[]
      const titles = formData.getAll("title") as string[]
      const descriptions = formData.getAll("description") as string[]
      const directions = formData.getAll("layout_direction") as string[]
      const rows = titles.map((title, i) => ({
        image_url: imageUrls[i] ?? "",
        title,
        description: descriptions[i] ?? "",
        layout_direction: directions[i] ?? "left",
        sort_order: i,
      }))
      await replaceList("si_arc_entries", rows)
      return { success: true, error: null }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  return <ArcFormClient entries={entries} action={save} />
}
