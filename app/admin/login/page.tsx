import { loginAction } from "@/lib/actions/auth"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* 444 watermark */}
      <div
        className="pointer-events-none fixed bottom-0 right-0 select-none font-black text-zinc-900"
        style={{ fontSize: "32vw", lineHeight: 0.85, transform: "translateY(10%)" }}
      >
        444
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm px-8 py-16">
        {/* Brand mark */}
        <div className="mb-12 text-center">
          <p className="text-[10px] tracking-[0.5em] text-zinc-600 uppercase mb-4">
            Soul Initiation
          </p>
          <h1 className="font-serif italic text-white" style={{ fontSize: "4rem", lineHeight: 1 }}>
            Admin
          </h1>
          <div className="mt-6 mx-auto h-px w-12 bg-zinc-800" />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 border border-red-900/50 bg-red-950/30 px-4 py-3">
            <p className="text-red-400 text-xs tracking-wide">{error}</p>
          </div>
        )}

        {/* Form */}
        <form action={loginAction} className="space-y-8">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.35em] text-zinc-600 mb-3">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="w-full bg-transparent border-b border-zinc-800 text-white py-3 text-sm tracking-wide focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-700"
              placeholder="············"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black font-black text-[11px] uppercase tracking-[0.4em] py-4 hover:bg-zinc-100 transition-colors"
          >
            Enter
          </button>
        </form>

        {/* Footer note */}
        <p className="mt-10 text-center text-[10px] tracking-[0.3em] text-zinc-800 uppercase">
          Soul Initiation
        </p>
      </div>
    </div>
  )
}
