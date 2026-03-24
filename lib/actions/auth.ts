"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const password = formData.get("password") as string
  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: "Invalid password" }
  }
  const cookieStore = await cookies()
  cookieStore.set("admin_session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
  redirect("/admin")
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  redirect("/admin/login")
}
