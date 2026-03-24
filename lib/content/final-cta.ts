import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { FinalCta } from "./types"

export async function getFinalCta(): Promise<FinalCta | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("si_final_cta")
      .select("*")
      .limit(1)
      .single()
    if (error) throw error
    return data
  } catch (err) {
    console.error("[getFinalCta]", err)
    return null
  }
}
