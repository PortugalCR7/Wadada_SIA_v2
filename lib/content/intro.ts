import { createSupabasePublicClient } from "@/lib/supabase-server"
import type { Intro } from "./types"

export async function getIntro(): Promise<Intro | null> {
  try {
    const supabase = createSupabasePublicClient()
    const { data, error } = await supabase
      .from("si_intro")
      .select("*")
      .limit(1)
      .single()
    if (error) throw error
    return data
  } catch (err) {
    console.error("[getIntro]", err)
    return null
  }
}
