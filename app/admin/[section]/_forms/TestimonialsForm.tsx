import { getTestimonials } from "@/lib/content/testimonials"
import { replaceList } from "@/lib/actions/content"
import type { ActionState } from "@/lib/actions/types"
import { TestimonialsFormClient } from "./TestimonialsFormClient"

export default async function TestimonialsForm() {
  const items = await getTestimonials()

  async function save(prev: ActionState, formData: FormData): Promise<ActionState> {
    "use server"
    try {
      const sectionTitle = formData.get("section_title") as string ?? ""
      const quotes = formData.getAll("quote") as string[]
      const names = formData.getAll("author_name") as string[]
      const roles = formData.getAll("author_role") as string[]
      const avatars = formData.getAll("avatar_url") as string[]
      const rows = quotes.map((quote, i) => ({
        quote,
        author_name: names[i] ?? "",
        author_role: roles[i] ?? "",
        avatar_url: avatars[i] ?? "",
        section_title: sectionTitle,
        sort_order: i,
      }))
      await replaceList("si_testimonials", rows)
      return { success: true, error: null }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  return <TestimonialsFormClient items={items} action={save} />
}
