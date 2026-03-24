import { createSupabasePublicClient } from "@/lib/supabase-server"
import type { SocialLink } from "./types"

export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const supabase = createSupabasePublicClient()
    const { data, error } = await supabase
      .from("si_social_links")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true })
    if (error) throw error
    return data ?? []
  } catch (err) {
    console.error("[getSocialLinks]", err)
    return []
  }
}
