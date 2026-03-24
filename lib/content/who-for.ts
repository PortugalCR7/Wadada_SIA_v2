import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { WhoForItem } from "./types"

export async function getWhoForItems(): Promise<WhoForItem[]> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("si_who_for_items")
      .select("*")
      .order("sort_order")
    if (error) throw error
    return data ?? []
  } catch (err) {
    console.error("[getWhoForItems]", err)
    return []
  }
}
