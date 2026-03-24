import { createSupabasePublicClient } from "@/lib/supabase-server"
import type { NextStep } from "./types"

export async function getNextSteps(): Promise<NextStep[]> {
  try {
    const supabase = createSupabasePublicClient()
    const { data, error } = await supabase
      .from("si_next_steps")
      .select("*")
      .order("sort_order")
    if (error) throw error
    return data ?? []
  } catch (err) {
    console.error("[getNextSteps]", err)
    return []
  }
}
