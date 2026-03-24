import { getFooterClosing } from "@/lib/content/footer"
import { upsertSingleton } from "@/lib/actions/content"
import { RichTextField } from "@/components/admin/rich-text-field"

export default async function FooterForm() {
  const footer = await getFooterClosing()

  async function save(formData: FormData) {
    "use server"
    await upsertSingleton("si_footer_closing", footer?.id, {
      body_copy: formData.get("body_copy"),
      availability_text: formData.get("availability_text"),
    })
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Footer Closing</h2>
      <form action={save} className="space-y-6">
        <RichTextField name="body_copy" label="Body Copy" defaultValue={footer?.body_copy ?? ""} />
        <div>
          <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Availability Text</label>
          <input type="text" name="availability_text" defaultValue={footer?.availability_text ?? ""} className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white" />
        </div>
        <button type="submit" className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors">Save</button>
      </form>
    </div>
  )
}
