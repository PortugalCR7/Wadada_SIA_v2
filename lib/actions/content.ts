"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"

// ─── Singleton upsert (tables with one row) ─────────────────────────────────

export async function upsertSingleton(
  table: string,
  id: string | undefined,
  fields: Record<string, unknown>
) {
  const supabase = createSupabaseAdminClient()
  let error
  if (id) {
    ;({ error } = await supabase.from(table).update(fields).eq("id", id))
  } else {
    ;({ error } = await supabase.from(table).insert(fields))
  }
  if (error) throw new Error(`upsertSingleton(${table}): ${error.message}`)
  revalidatePath("/")
}

// ─── Replace list (delete all, re-insert ordered) ────────────────────────────

export async function replaceList(
  table: string,
  rows: Record<string, unknown>[]
) {
  const supabase = createSupabaseAdminClient()
  const { error: delError } = await supabase.from(table).delete().neq("id", "")
  if (delError) throw new Error(`replaceList delete(${table}): ${delError.message}`)
  if (rows.length > 0) {
    const { error: insError } = await supabase.from(table).insert(rows)
    if (insError) throw new Error(`replaceList insert(${table}): ${insError.message}`)
  }
  revalidatePath("/")
}

// ─── Upload image to Supabase Storage ────────────────────────────────────────

export async function uploadImage(
  subfolder: string,
  file: File
): Promise<string> {
  const supabase = createSupabaseAdminClient()
  const ext = file.name.split(".").pop() ?? "jpg"
  const path = `${subfolder}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage
    .from("soul-initiation")
    .upload(path, file, { upsert: false })
  if (error) throw new Error(`uploadImage: ${error.message}`)
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/soul-initiation/${path}`
}
