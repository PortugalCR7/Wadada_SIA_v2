import type { ProgramDefinitionItem } from "@/lib/content/types"

export function ProgramDefinitionSection({
  items,
}: {
  items: ProgramDefinitionItem[]
}) {
  const isNotItems = items.filter((i) => i.category === "is_not")
  const isItems = items.filter((i) => i.category === "is")

  return (
    <section className="py-32 bg-white border-t border-zinc-100">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-px bg-zinc-200 border border-zinc-200">
          <div className="bg-white p-12 md:p-20">
            <h3 className="text-2xl font-black mb-12 uppercase tracking-wide text-zinc-400">
              This Is Not
            </h3>
            <ul className="space-y-8">
              {isNotItems.map((item) => (
                <li
                  key={item.id}
                  className="text-xl font-medium text-zinc-400 leading-snug pl-6 border-l-2 border-zinc-100"
                >
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-12 md:p-20">
            <h3 className="text-2xl font-black mb-12 uppercase tracking-wide text-black">
              This Is
            </h3>
            <ul className="space-y-8">
              {isItems.map((item) => (
                <li
                  key={item.id}
                  className="text-xl font-medium text-zinc-700 leading-snug pl-6 border-l-2 border-black"
                >
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
