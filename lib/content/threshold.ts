import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { ThresholdDefinition, ThresholdItem } from "./types"

export async function getThresholdDefinition(): Promise<ThresholdDefinition | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("si_threshold_definition")
      .select("*")
      .limit(1)
      .single()
    if (error) throw error
    return data
  } catch (err) {
    console.error("[getThresholdDefinition]", err)
    return null
  }
}

export async function getThresholdItems(): Promise<ThresholdItem[]> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("si_threshold_items")
      .select("*")
      .order("sort_order")
    if (error) throw error
    return data ?? []
  } catch (err) {
    console.error("[getThresholdItems]", err)
    return []
  }
}
