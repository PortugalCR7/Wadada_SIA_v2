import { getInvestment } from "@/lib/content/investment"
import { upsertSingleton } from "@/lib/actions/content"

export default async function InvestmentForm() {
  const inv = await getInvestment()

  async function save(formData: FormData) {
    "use server"
    await upsertSingleton("si_investment", inv?.id, {
      eyebrow:         formData.get("eyebrow"),
      price:           formData.get("price"),
      payment_note:    formData.get("payment_note"),
      blockquote_text: formData.get("blockquote_text"),
      cta_label:       formData.get("cta_label"),
      cta_url:         formData.get("cta_url"),
    })
  }

  const Field = ({ name, label, defaultValue, textarea }: { name: string; label: string; defaultValue: string; textarea?: boolean }) => {
    const cls = "w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
    return (
      <div>
        <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">{label}</label>
        {textarea ? <textarea name={name} defaultValue={defaultValue} rows={4} className={cls} /> : <input type="text" name={name} defaultValue={defaultValue} className={cls} />}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Investment / CTA</h2>
      <form action={save} className="space-y-6">
        <Field name="eyebrow" label="Eyebrow" defaultValue={inv?.eyebrow ?? ""} />
        <Field name="price" label="Price (e.g. $2,500)" defaultValue={inv?.price ?? ""} />
        <Field name="payment_note" label="Payment Note" defaultValue={inv?.payment_note ?? ""} />
        <Field name="blockquote_text" label="Blockquote" defaultValue={inv?.blockquote_text ?? ""} textarea />
        <Field name="cta_label" label="CTA Button Label" defaultValue={inv?.cta_label ?? ""} />
        <Field name="cta_url" label="CTA URL" defaultValue={inv?.cta_url ?? ""} />
        <button type="submit" className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors">Save</button>
      </form>
    </div>
  )
}
