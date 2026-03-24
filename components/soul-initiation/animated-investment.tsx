"use client"

import { motion } from "framer-motion"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import type { Investment, NextStep, FinalCta } from "@/lib/content/types"

export function AnimatedInvestment({
  investment,
  nextSteps,
  finalCta,
}: {
  investment: Investment
  nextSteps: NextStep[]
  finalCta: FinalCta | null
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      <h2 className="text-sm tracking-[0.5em] font-black text-white/40 uppercase mb-12">
        {investment.eyebrow}
      </h2>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 md:p-20 mb-24 relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-white/[0.02] font-black text-9xl group-hover:scale-110 transition-transform duration-1000">444</div>
        <span className="text-xs uppercase tracking-[0.4em] text-white/40 font-bold block mb-6">Founding Cohort Rate</span>
        <div className="text-7xl md:text-9xl font-black mb-8 tracking-tighter tabular-nums">{investment.price}</div>
        <div className="space-y-6 max-w-xl mx-auto mb-12">
          <p className="text-zinc-400 font-medium">{investment.payment_note}</p>
          <div className="h-px bg-white/10 w-24 mx-auto" />
          <blockquote className="font-accent text-2xl md:text-3xl font-light italic text-zinc-300 leading-relaxed">
            &ldquo;{investment.blockquote_text}&rdquo;
          </blockquote>
        </div>
        <a href={investment.cta_url} target="_blank" rel="noopener noreferrer">
          <LiquidButton size="xxl" className="w-full relative z-10 h-24 text-2xl">
            {investment.cta_label}
          </LiquidButton>
        </a>
      </div>

      {/* Next Steps */}
      <div className="text-left mb-32 grid md:grid-cols-2 gap-16 items-start">
        <div className="sticky top-32">
          <h3 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter leading-none">
            What The <br />Next Step <br />Looks Like
          </h3>
          <div className="w-20 h-2 bg-white/10 mt-8" />
        </div>
        <div className="space-y-12">
          {nextSteps.map((item) => (
            <div key={item.id} className="flex gap-8 group cursor-default">
              <span className="text-2xl font-black text-white/20 group-hover:text-white transition-all duration-300 mt-1 shrink-0 group-hover:scale-110 inline-block">
                {item.step_number}
              </span>
              <div className="border-l border-white/0 group-hover:border-white/30 pl-0 group-hover:pl-6 transition-all duration-300">
                <h4 className="text-2xl font-black uppercase mb-3 tracking-tight">{item.title}</h4>
                <p className="font-accent italic text-zinc-500 group-hover:text-zinc-300 transition-colors leading-relaxed text-lg font-light">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA Headline */}
      {finalCta && (
        <div className="py-24 bg-white text-black -mx-6 px-6 md:-mx-20 md:px-20">
          <h2 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] uppercase text-black">
            {finalCta.heading_main} <br />
            <span className="text-black/20">{finalCta.heading_accent}</span>
          </h2>
        </div>
      )}
    </motion.div>
  )
}
