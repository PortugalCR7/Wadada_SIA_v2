import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { Guide } from "./types"

export async function getGuides(): Promise<Guide[]> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("si_guides")
      .select("*")
      .order("sort_order")
    if (error) throw error
    return data ?? []
  } catch (err) {
    console.error("[getGuides]", err)
    return []
  }
}
