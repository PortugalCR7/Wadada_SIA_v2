import { getPhilosophicalBridge } from "@/lib/content/philosophical-bridge"
import { upsertSingleton } from "@/lib/actions/content"

export default async function PhilosophicalBridgeForm() {
  const bridge = await getPhilosophicalBridge()

  async function save(formData: FormData) {
    "use server"
    await upsertSingleton("si_philosophical_bridge", bridge?.id, {
      quote_text: formData.get("quote_text"),
      quote_highlight: formData.get("quote_highlight"),
      supporting_paragraph: formData.get("supporting_paragraph"),
    })
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Philosophical Bridge</h2>
      <form action={save} className="space-y-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Quote Text</label>
          <textarea name="quote_text" defaultValue={bridge?.quote_text ?? ""} rows={4} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Quote Highlight</label>
          <input type="text" name="quote_highlight" defaultValue={bridge?.quote_highlight ?? ""} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Supporting Paragraph</label>
          <textarea name="supporting_paragraph" defaultValue={bridge?.supporting_paragraph ?? ""} rows={4} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
        </div>
        <button type="submit" className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors">Save</button>
      </form>
    </div>
  )
}
