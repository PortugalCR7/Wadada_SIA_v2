const SECTIONS = [
  { slug: "hero",                 label: "Hero Slides",            num: "01", desc: "Slideshow images, titles, subtitles" },
  { slug: "intro",                label: "Intro",                  num: "02", desc: "Eyebrow, heading, opening paragraph" },
  { slug: "recognition",          label: "Do You Recognize This?", num: "03", desc: "Recognition items list" },
  { slug: "threshold",            label: "Threshold Definition",   num: "04", desc: "Left panel + threshold items" },
  { slug: "philosophical-bridge", label: "Philosophical Bridge",   num: "05", desc: "Pull quote + supporting paragraph" },
  { slug: "program-definition",   label: "This Is Not / This Is", num: "06", desc: "Contrast statement pairs" },
  { slug: "arc",                  label: "Arc of Initiation",      num: "07", desc: "Timeline entries with images" },
  { slug: "requirements",         label: "Requirements",           num: "08", desc: "Heading, tagline, requirement items" },
  { slug: "who-for",              label: "Who This Is For",        num: "09", desc: "Fit / not-fit columns" },
  { slug: "changes",              label: "What Tends to Change",   num: "10", desc: "Change items list" },
  { slug: "guides",               label: "The Guides",             num: "11", desc: "Guide profiles with images + CTAs" },
  { slug: "testimonials",         label: "Testimonials",           num: "12", desc: "Quotes, names, avatars" },
  { slug: "investment",           label: "Investment",             num: "13", desc: "Price, payment note, CTA" },
  { slug: "next-steps",           label: "Next Steps",             num: "14", desc: "Numbered steps list" },
  { slug: "final-cta",            label: "Final CTA",              num: "15", desc: "Closing headline" },
  { slug: "footer",               label: "Footer Closing",         num: "16", desc: "Closing copy + availability text" },
  { slug: "subscribers",          label: "Subscribers",            num: "17", desc: "Email capture list — view only" },
]

export default function AdminDashboard() {
  return (
    <div className="p-10 max-w-5xl">
      {/* Header */}
      <div className="mb-14">
        <p className="text-[10px] tracking-[0.45em] uppercase text-zinc-600 mb-3">
          Soul Initiation
        </p>
        <h1
          className="font-serif italic text-white"
          style={{ fontSize: "3.5rem", lineHeight: 1.05 }}
        >
          Content Editor
        </h1>
        <div className="mt-5 h-px w-16 bg-zinc-800" />
      </div>

      {/* Section grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-800/50">
        {SECTIONS.map(({ slug, label, num, desc }) => (
          <a
            key={slug}
            href={`/admin/${slug}`}
            className="group bg-zinc-950 hover:bg-zinc-900 p-6 flex flex-col gap-4 transition-colors"
          >
            <div className="flex items-start justify-between">
              <span className="font-accent italic text-zinc-700 group-hover:text-zinc-500 transition-colors text-2xl leading-none">
                {num}
              </span>
              <span className="text-zinc-800 group-hover:text-zinc-500 transition-colors text-base leading-none">
                →
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors leading-snug">
                {label}
              </p>
              <p className="mt-1 text-[11px] text-zinc-700 group-hover:text-zinc-500 transition-colors leading-snug">
                {desc}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
