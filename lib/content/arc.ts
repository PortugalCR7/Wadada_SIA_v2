import { createSupabasePublicClient } from "@/lib/supabase-server"
import type { ArcEntry } from "./types"

export async function getArcEntries(): Promise<ArcEntry[]> {
  try {
    const supabase = createSupabasePublicClient()
    const { data, error } = await supabase
      .from("si_arc_entries")
      .select("*")
      .order("sort_order")
    if (error) throw error
    return data ?? []
  } catch (err) {
    console.error("[getArcEntries]", err)
    return []
  }
}
