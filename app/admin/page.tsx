const SECTIONS = [
  { slug: "hero",                 label: "Hero Slides" },
  { slug: "intro",                label: "Intro / The Threshold" },
  { slug: "recognition",          label: "Do You Recognize This?" },
  { slug: "threshold",            label: "Threshold Definition" },
  { slug: "philosophical-bridge", label: "Philosophical Bridge" },
  { slug: "program-definition",   label: "This Is Not / This Is" },
  { slug: "arc",                  label: "Arc of Initiation" },
  { slug: "requirements",         label: "Requirements" },
  { slug: "who-for",              label: "Who This Is For" },
  { slug: "changes",              label: "What Tends to Change" },
  { slug: "guides",               label: "The Guides" },
  { slug: "testimonials",         label: "Testimonials" },
  { slug: "investment",           label: "Investment / CTA" },
  { slug: "next-steps",           label: "Next Steps" },
  { slug: "final-cta",            label: "Final CTA Headline" },
  { slug: "footer",               label: "Footer Closing" },
  { slug: "subscribers",          label: "Subscribers (view only)" },
]

export default function AdminDashboard() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-12">Sections</h1>
      <div className="grid gap-px bg-zinc-800">
        {SECTIONS.map(({ slug, label }) => (
          <a
            key={slug}
            href={`/admin/${slug}`}
            className="bg-zinc-900 hover:bg-zinc-800 px-6 py-5 flex items-center justify-between group transition-colors"
          >
            <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">
              {label}
            </span>
            <span className="text-zinc-600 group-hover:text-white transition-colors text-lg">→</span>
          </a>
        ))}
      </div>
    </div>
  )
}
