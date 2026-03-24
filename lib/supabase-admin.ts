import { createClient } from "@supabase/supabase-js"

// Service role — never expose to browser
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
