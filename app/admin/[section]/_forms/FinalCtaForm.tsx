import { getFinalCta } from "@/lib/content/final-cta"
import { upsertSingleton } from "@/lib/actions/content"

export default async function FinalCtaForm() {
  const cta = await getFinalCta()

  async function save(formData: FormData) {
    "use server"
    await upsertSingleton("si_final_cta", cta?.id, {
      heading_main: formData.get("heading_main"),
      heading_accent: formData.get("heading_accent"),
    })
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Final CTA Headline</h2>
      <form action={save} className="space-y-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Heading Main</label>
          <input type="text" name="heading_main" defaultValue={cta?.heading_main ?? ""} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Heading Accent</label>
          <input type="text" name="heading_accent" defaultValue={cta?.heading_accent ?? ""} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
        </div>
        <button type="submit" className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors">Save</button>
      </form>
    </div>
  )
}
