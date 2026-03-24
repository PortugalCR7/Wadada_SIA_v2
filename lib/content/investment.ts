import { createSupabasePublicClient } from "@/lib/supabase-server"
import type { Investment } from "./types"

export async function getInvestment(): Promise<Investment | null> {
  try {
    const supabase = createSupabasePublicClient()
    const { data, error } = await supabase
      .from("si_investment")
      .select("*")
      .limit(1)
      .single()
    if (error) throw error
    return data
  } catch (err) {
    console.error("[getInvestment]", err)
    return null
  }
}
