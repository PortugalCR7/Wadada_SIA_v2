import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { PhilosophicalBridge } from "./types"

export async function getPhilosophicalBridge(): Promise<PhilosophicalBridge | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("si_philosophical_bridge")
      .select("*")
      .limit(1)
      .single()
    if (error) throw error
    return data
  } catch (err) {
    console.error("[getPhilosophicalBridge]", err)
    return null
  }
}
