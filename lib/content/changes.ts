import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { ChangeItem } from "./types"

export async function getChangeItems(): Promise<ChangeItem[]> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("si_change_items")
      .select("*")
      .order("sort_order")
    if (error) throw error
    return data ?? []
  } catch (err) {
    console.error("[getChangeItems]", err)
    return []
  }
}
