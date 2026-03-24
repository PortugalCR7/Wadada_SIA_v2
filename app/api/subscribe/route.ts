import { NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = (formData.get("email") as string | null)?.trim().toLowerCase()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.redirect(new URL("/soul-initiation?subscribed=error", request.url))
  }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from("subscribers")
    .upsert({ email, source: "soul-initiation-footer" }, { onConflict: "email" })

  if (error) {
    console.error("subscribe:", error.message)
    return NextResponse.redirect(new URL("/soul-initiation?subscribed=error", request.url))
  }

  return NextResponse.redirect(new URL("/soul-initiation?subscribed=true", request.url))
}
