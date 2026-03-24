import { logoutAction } from "@/lib/actions/auth"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-8 py-4 flex items-center justify-between">
        <a href="/admin" className="text-sm font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">
          Soul Initiation — Admin
        </a>
        <div className="flex items-center gap-6">
          <a
            href="/soul-initiation"
            target="_blank"
            className="text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
          >
            View Page ↗
          </a>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs uppercase tracking-widest text-zinc-500 hover:text-red-400 transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </header>
      <main className="p-8">{children}</main>
    </div>
  )
}
