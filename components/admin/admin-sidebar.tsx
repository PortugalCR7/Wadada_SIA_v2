"use client"

import { usePathname } from "next/navigation"
import { logoutAction } from "@/lib/actions/auth"

const SECTIONS = [
  { slug: "hero",                 label: "Hero Slides",              num: "01" },
  { slug: "intro",                label: "Intro / The Threshold",    num: "02" },
  { slug: "recognition",          label: "Do You Recognize This?",   num: "03" },
  { slug: "threshold",            label: "Threshold Definition",     num: "04" },
  { slug: "philosophical-bridge", label: "Philosophical Bridge",     num: "05" },
  { slug: "program-definition",   label: "This Is Not / This Is",   num: "06" },
  { slug: "arc",                  label: "Arc of Initiation",        num: "07" },
  { slug: "requirements",         label: "Requirements",             num: "08" },
  { slug: "who-for",              label: "Who This Is For",          num: "09" },
  { slug: "changes",              label: "What Tends to Change",     num: "10" },
  { slug: "guides",               label: "The Guides",               num: "11" },
  { slug: "testimonials",         label: "Testimonials",             num: "12" },
  { slug: "investment",           label: "Investment / CTA",         num: "13" },
  { slug: "next-steps",           label: "Next Steps",               num: "14" },
  { slug: "final-cta",            label: "Final CTA Headline",       num: "15" },
  { slug: "footer",               label: "Footer Closing",           num: "16" },
  { slug: "subscribers",          label: "Subscribers",              num: "17" },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 sticky top-0 h-screen flex flex-col bg-zinc-950 border-r border-zinc-800/60 overflow-y-auto">
      {/* Brand */}
      <div className="px-6 pt-8 pb-6 border-b border-zinc-800/60">
        <a href="/admin" className="block group">
          <p className="font-accent italic text-zinc-500 text-2xl leading-none group-hover:text-zinc-300 transition-colors">
            444
          </p>
          <p className="mt-2 text-[9px] tracking-[0.45em] text-zinc-600 uppercase">
            Soul Initiation
          </p>
          <p className="text-[9px] tracking-[0.3em] text-zinc-700 uppercase">
            Admin Panel
          </p>
        </a>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4">
        {SECTIONS.map(({ slug, label, num }) => {
          const href = `/admin/${slug}`
          const active = pathname === href
          return (
            <a
              key={slug}
              href={href}
              className={`
                flex items-center gap-3 px-5 py-2.5 text-sm transition-all
                ${active
                  ? "text-white bg-zinc-900 border-l-2 border-white pl-[18px]"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50 border-l-2 border-transparent pl-[18px]"
                }
              `}
            >
              <span
                className={`font-accent italic text-xs w-5 shrink-0 ${
                  active ? "text-zinc-400" : "text-zinc-700"
                }`}
              >
                {num}
              </span>
              <span className="truncate text-[11px] tracking-wide leading-tight">{label}</span>
            </a>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-zinc-800/60 px-5 py-5 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-zinc-600 hover:text-zinc-300 transition-colors py-2"
        >
          <span>View Live Page</span>
          <span className="text-zinc-700">↗</span>
        </a>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-zinc-700 hover:text-red-400 transition-colors py-2 w-full text-left"
          >
            Log Out
          </button>
        </form>
      </div>
    </aside>
  )
}
