"use client"

import React from "react"
import { motion } from "framer-motion"

export const TestimonialsColumn = (props: {
  className?: string
  testimonials: typeof testimonials
  duration?: number
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-background"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <div className="p-8 rounded-2xl border border-gray-200 shadow-lg max-w-sm w-full bg-white" key={i}>
                  <div className="text-lg leading-relaxed text-gray-800 font-medium">{text}</div>
                  <div className="flex items-center gap-3 mt-6">
                    <img
                      width={48}
                      height={48}
                      src={image || "/placeholder.svg"}
                      alt={name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <div className="font-bold tracking-tight leading-5 text-gray-900">{name}</div>
                      <div className="leading-5 text-gray-600 tracking-tight text-sm">{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  )
}

// Fallback testimonials — replaced by CMS data when available
const testimonials = [
  {
    text: "Something shifted in me that I still can't fully put into words. The structure held me through the hardest part of the crossing.",
    image: "/placeholder.svg?height=48&width=48",
    name: "S.C.",
    role: "Program Participant",
  },
  {
    text: "I came in with questions and left with a different relationship to myself. That's the only way I know how to describe it.",
    image: "/placeholder.svg?height=48&width=48",
    name: "M.J.",
    role: "Soul Initiation Alumni",
  },
  {
    text: "This container gave me permission to become what I'd been circling for years. The guides held space with rare precision.",
    image: "/placeholder.svg?height=48&width=48",
    name: "P.P.",
    role: "Program Participant",
  },
  {
    text: "I've done the therapy, read the books, attended the retreats. Nothing prepared me for what became possible inside this structure.",
    image: "/placeholder.svg?height=48&width=48",
    name: "D.R.",
    role: "Soul Initiation Alumni",
  },
  {
    text: "The arc is real. I didn't believe it at first — but there's a before and an after now. Six months changed the direction of my life.",
    image: "/placeholder.svg?height=48&width=48",
    name: "E.T.",
    role: "Program Participant",
  },
]

export { testimonials }
