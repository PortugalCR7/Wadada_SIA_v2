import { createSupabasePublicClient } from "@/lib/supabase-server"
import type { RecognitionItem } from "./types"

export async function getRecognitionItems(): Promise<RecognitionItem[]> {
  try {
    const supabase = createSupabasePublicClient()
    const { data, error } = await supabase
      .from("si_recognition_items")
      .select("*")
      .order("sort_order")
    if (error) throw error
    return data ?? []
  } catch (err) {
    console.error("[getRecognitionItems]", err)
    return []
  }
}
