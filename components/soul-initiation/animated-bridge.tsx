"use client"

import { motion } from "framer-motion"
import type { PhilosophicalBridge } from "@/lib/content/types"

export function AnimatedBridge({ bridge }: { bridge: PhilosophicalBridge }) {
  // Split quote at the highlight text to render the underlined span
  const parts = bridge.quote_text.split(bridge.quote_highlight)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
    >
      <h2 className="font-accent text-3xl md:text-5xl font-light leading-snug mb-12 italic text-zinc-300">
        &ldquo;{parts[0]}
        <span className="text-white font-black not-italic underline decoration-1 decoration-zinc-700 underline-offset-8">
          {bridge.quote_highlight}
        </span>
        {parts[1]}&rdquo;
      </h2>
      <p className="text-lg md:text-xl text-zinc-500 leading-relaxed max-w-2xl mx-auto">
        {bridge.supporting_paragraph}
      </p>
    </motion.div>
  )
}
