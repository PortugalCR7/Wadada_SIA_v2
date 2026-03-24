import { getIntro } from "@/lib/content/intro"
import { upsertSingleton } from "@/lib/actions/content"

export default async function IntroForm() {
  const intro = await getIntro()

  async function save(formData: FormData) {
    "use server"
    await upsertSingleton("si_intro", intro?.id, {
      eyebrow: formData.get("eyebrow"),
      heading: formData.get("heading"),
      subtext: formData.get("subtext"),
    })
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Intro / The Threshold</h2>
      <form action={save} className="space-y-6">
        <Field name="eyebrow" label="Eyebrow" defaultValue={intro?.eyebrow ?? ""} />
        <Field name="heading" label="Heading" defaultValue={intro?.heading ?? ""} textarea />
        <Field name="subtext" label="Subtext" defaultValue={intro?.subtext ?? ""} textarea />
        <SaveButton />
      </form>
    </div>
  )
}

function Field({
  name, label, defaultValue, textarea,
}: {
  name: string; label: string; defaultValue: string; textarea?: boolean
}) {
  const cls = "w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">{label}</label>
      {textarea ? (
        <textarea name={name} defaultValue={defaultValue} rows={4} className={cls} />
      ) : (
        <input type="text" name={name} defaultValue={defaultValue} className={cls} />
      )}
    </div>
  )
}

function SaveButton() {
  return (
    <button
      type="submit"
      className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors"
    >
      Save
    </button>
  )
}
