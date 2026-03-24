import { createSupabaseAdminClient } from "@/lib/supabase-admin"

export default async function SubscribersView() {
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from("subscribers")
    .select("email, subscribed_at, source")
    .order("subscribed_at", { ascending: false })

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Subscribers ({data?.length ?? 0})</h2>
      <div className="border border-zinc-800 divide-y divide-zinc-800">
        {(data ?? []).map((s) => (
          <div key={s.email} className="px-6 py-4 flex justify-between text-sm">
            <span className="text-white">{s.email}</span>
            <span className="text-zinc-500">{new Date(s.subscribed_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
