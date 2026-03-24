import { createSupabasePublicClient } from "@/lib/supabase-server"
import type { NavLink } from "./types"

export async function getNavLinks(): Promise<NavLink[]> {
  try {
    const supabase = createSupabasePublicClient()
    const { data, error } = await supabase
      .from("si_nav_links")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true })
    if (error) throw error
    return data ?? []
  } catch (err) {
    console.error("[getNavLinks]", err)
    return []
  }
}
