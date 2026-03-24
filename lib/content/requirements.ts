import { createSupabasePublicClient } from "@/lib/supabase-server"
import type { Requirements, RequirementItem } from "./types"

export async function getRequirements(): Promise<Requirements | null> {
  try {
    const supabase = createSupabasePublicClient()
    const { data, error } = await supabase
      .from("si_requirements")
      .select("*")
      .limit(1)
      .single()
    if (error) throw error
    return data
  } catch (err) {
    console.error("[getRequirements]", err)
    return null
  }
}

export async function getRequirementItems(): Promise<RequirementItem[]> {
  try {
    const supabase = createSupabasePublicClient()
    const { data, error } = await supabase
      .from("si_requirement_items")
      .select("*")
      .order("sort_order")
    if (error) throw error
    return data ?? []
  } catch (err) {
    console.error("[getRequirementItems]", err)
    return []
  }
}
