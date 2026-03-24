import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { ProgramDefinitionItem } from "./types"

export async function getProgramDefinitionItems(): Promise<ProgramDefinitionItem[]> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("si_program_definition_items")
      .select("*")
      .order("sort_order")
    if (error) throw error
    return data ?? []
  } catch (err) {
    console.error("[getProgramDefinitionItems]", err)
    return []
  }
}
