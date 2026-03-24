import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { FooterClosing } from "./types"

export async function getFooterClosing(): Promise<FooterClosing | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("si_footer_closing")
      .select("*")
      .limit(1)
      .single()
    if (error) throw error
    return data
  } catch (err) {
    console.error("[getFooterClosing]", err)
    return null
  }
}
