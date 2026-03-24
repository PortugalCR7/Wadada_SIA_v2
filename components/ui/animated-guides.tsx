"use client"

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useEffect, useState, useCallback } from "react"

type GuideCard = {
  image_url: string
  name: string        // heading from DB
  title: string       // body_paragraph_1 from DB
  bio: string         // body_paragraph_2 from DB
  cta_label: string
  cta_url: string
}

export function AnimatedGuides({
  guides,
  sectionTitle,
  autoplay = true,
}: {
  guides: GuideCard[]
  sectionTitle: string
  autoplay?: boolean
}) {
  const [active, setActive] = useState(0)

  const handleNext = useCallback(() => {
    setActive((prev) => (prev + 1) % guides.length)
  }, [guides.length])

  const handlePrev = useCallback(() => {
    setActive((prev) => (prev - 1 + guides.length) % guides.length)
  }, [guides.length])

  useEffect(() => {
    if (!autoplay || guides.length <= 1) return
    const interval = setInterval(handleNext, 5000)
    return () => clearInterval(interval)
  }, [autoplay, guides.length, handleNext])

  const randomRotateY = () => Math.floor(Math.random() * 21) - 10

  if (guides.length === 0) return null

  return (
    <section className="py-32 bg-white border-t border-zinc-100">
      <div className="container mx-auto px-6">
        {/* Section heading */}
        {sectionTitle && (
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black">
              {sectionTitle}
            </h2>
            <div className="w-12 h-[2px] bg-black mx-auto mt-6" />
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Stacked image cards */}
            <div className="relative h-96 w-full">
              <AnimatePresence>
                {guides.map((guide, index) => (
                  <motion.div
                    key={`${guide.name}-${index}`}
                    initial={{ opacity: 0, scale: 0.9, rotate: randomRotateY() }}
                    animate={{
                      opacity: index === active ? 1 : 0.6,
                      scale: index === active ? 1 : 0.95,
                      rotate: index === active ? 0 : randomRotateY(),
                      zIndex: index === active ? 10 : guides.length - index,
                      y: index === active ? [0, -12, 0] : 0,
                    }}
                    exit={{ opacity: 0, scale: 0.9, rotate: randomRotateY() }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="absolute inset-0 origin-bottom cursor-pointer"
                    onClick={() => setActive(index)}
                  >
                    <div className="relative h-full w-full bg-zinc-200">
                      {guide.image_url ? (
                        <Image
                          src={guide.image_url}
                          alt={guide.name}
                          fill
                          draggable={false}
                          className="object-cover object-center filter grayscale"
                        />
                      ) : (
                        <div className="h-full w-full bg-zinc-300 flex items-center justify-center">
                          <span className="text-zinc-500 text-sm uppercase tracking-widest">No image</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Guide info */}
            <div className="flex flex-col justify-between py-4 min-h-80">
              <motion.div
                key={active}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-black">
                    {guides[active].name}
                  </h3>
                  {guides[active].title && (
                    <p className="text-sm uppercase tracking-widest text-zinc-400 mt-1 font-medium">
                      {guides[active].title}
                    </p>
                  )}
                </div>

                <motion.p className="text-base text-zinc-500 leading-relaxed">
                  {guides[active].bio.split(" ").map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{ filter: "blur(8px)", opacity: 0, y: 4 }}
                      animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut", delay: 0.015 * i }}
                      className="inline-block"
                    >
                      {word}&nbsp;
                    </motion.span>
                  ))}
                </motion.p>

                {guides[active].cta_label && guides[active].cta_url && (
                  <a
                    href={guides[active].cta_url}
                    className="inline-block text-sm uppercase tracking-widest font-black border-b border-black pb-1 hover:text-zinc-500 transition-colors mt-2"
                  >
                    {guides[active].cta_label} →
                  </a>
                )}
              </motion.div>

              {/* Navigation */}
              {guides.length > 1 && (
                <div className="flex items-center gap-4 pt-10">
                  <button
                    onClick={handlePrev}
                    className="h-9 w-9 rounded-full border border-zinc-200 flex items-center justify-center hover:border-black transition-colors group"
                    aria-label="Previous guide"
                  >
                    <IconArrowLeft className="h-4 w-4 text-black group-hover:rotate-12 transition-transform duration-300" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="h-9 w-9 rounded-full border border-zinc-200 flex items-center justify-center hover:border-black transition-colors group"
                    aria-label="Next guide"
                  >
                    <IconArrowRight className="h-4 w-4 text-black group-hover:-rotate-12 transition-transform duration-300" />
                  </button>
                  <span className="text-xs text-zinc-400 uppercase tracking-widest font-medium ml-2">
                    {active + 1} / {guides.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
