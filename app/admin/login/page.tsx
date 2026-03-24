import { loginAction } from "@/lib/actions/auth"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-800 p-12 w-full max-w-sm space-y-8">
        <h1 className="text-white text-3xl font-black tracking-tighter uppercase">Admin</h1>
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
        <form action={loginAction} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full bg-black border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-white text-black font-black uppercase tracking-widest py-3 hover:bg-zinc-200 transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}
