import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { HeroSlide } from "./types"

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("si_hero_slides")
      .select("*")
      .order("sort_order")
    if (error) throw error
    return data ?? []
  } catch (err) {
    console.error("[getHeroSlides]", err)
    return []
  }
}
