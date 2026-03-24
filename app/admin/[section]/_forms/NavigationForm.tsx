import { getNavLinks } from "@/lib/content/nav-links"
import { replaceList } from "@/lib/actions/content"
import type { ActionState } from "@/lib/actions/types"
import { NavigationFormClient } from "./NavigationFormClient"

export default async function NavigationForm() {
  const links = await getNavLinks()

  async function save(prev: ActionState, formData: FormData): Promise<ActionState> {
    "use server"
    try {
      const labels = formData.getAll("label") as string[]
      const hrefs = formData.getAll("href") as string[]
      // Each row submits a hidden "false" then, if checked, a checkbox "true".
      // Unchecked row → 1 value ["false"]. Checked row → 2 values ["false", "true"].
      // Process sequentially to reconstruct one boolean per row.
      const rawTabs = formData.getAll("open_in_new_tab") as string[]
      let tabIdx = 0
      const newTabs = labels.map(() => {
        if (rawTabs[tabIdx] === "false" && rawTabs[tabIdx + 1] === "true") {
          tabIdx += 2
          return true
        }
        tabIdx += 1
        return false
      })
      const rows = labels
        .map((label, i) => ({
          label,
          href: hrefs[i] ?? "",
          open_in_new_tab: newTabs[i] ?? false,
          sort_order: i,
          active: true,
        }))
        .filter((r) => r.label.trim() !== "")
      await replaceList("si_nav_links", rows)
      return { success: true, error: null }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  return <NavigationFormClient links={links} action={save} />
}
