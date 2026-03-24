import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { Testimonial } from "./types"

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("si_testimonials")
      .select("*")
      .order("sort_order")
    if (error) throw error
    return data ?? []
  } catch (err) {
    console.error("[getTestimonials]", err)
    return []
  }
}
