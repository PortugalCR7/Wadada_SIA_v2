"use client"

import HeroSection from "../hero-section"
import { TextGradientScroll } from "@/components/ui/text-gradient-scroll"
import { Timeline } from "@/components/ui/timeline"
import "./globals.css"
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials"
import { motion } from "framer-motion"
import SmoothScrollHero from "@/components/ui/smooth-scroll-hero"
import Chatbot from "../components/chatbot"

export default function Page() {
  const missionStatement =
    "At Wadada Run Club, we believe movement isn't an option, it's a lifestyle. Born from the vibrant spirit of Jamaica, we unite runners from every corner of the globe who share our passion for pushing boundaries. Whether you're chasing sunrise through Kingston streets or conquering mountain trails, we're here to fuel your journey. Our community thrives on the rhythm of footsteps, the power of perseverance, and the joy of shared victories. Join us as we run not just for fitness, but for freedom, friendship, and the pure love of movement."

  const timelineEntries = [
    {
      id: 1,
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-RJ3iTXUn5SUexF6nHMZYhMoQLNCboK.png",
      alt: "Woman runner in artistic motion blur",
      title: "Every Step Counts",
      description:
        "From your first jog around the block to your hundredth marathon, every runner has a story. At Wadada, we celebrate beginners who are just lacing up their shoes for the first time. Your pace doesn't matter—your passion does. What are you waiting for?",
      layout: "left" as const,
    },
    {
      id: 2,
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-LN9OPh9hw0b9rwSPRSslHoejcfoKHe.png",
      alt: "Male runner with determination and focus",
      title: "Find Your Rhythm",
      description:
        "Whether you're chasing personal records or simply chasing the sunrise, our community embraces every type of runner. From speed demons to mindful joggers, from trail blazers to track stars—there's a place for you here. The only question is: what are you waiting for?",
      layout: "right" as const,
    },
    {
      id: 3,
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1FdGyjVpWQANGzsDWpoPIvF5SVI2za.png",
      alt: "Runner in dynamic motion showing strength and grace",
      title: "Join the Movement",
      description:
        "Running isn't just about the miles—it's about the moments. The early morning conversations, the shared struggles, the collective victories. At Wadada Run Club, you're not just joining a group, you're joining a family. So lace up, step out, and discover what you're truly capable of. Seriously, what are you waiting for?",
      layout: "left" as const,
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* 444 Master Accent - Fixed to viewport */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vw] font-serif font-black text-white/[0.02] pointer-events-none z-0 tracking-tighter mix-blend-difference select-none">
        444
      </div>

      <div className="relative z-10">
      {/* Hero Section */}
      <HeroSection />

      {/* Mission Statement Section with Grid Background */}
      <section id="mission" className="relative min-h-screen flex items-center justify-center py-32 bg-zinc-950 overflow-hidden">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-grid-subtle opacity-10 pointer-events-none" />

        {/* Liquid Glass Overlay */}
        <div className="absolute inset-0 backdrop-blur-[100px] pointer-events-none bg-black/40" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-sm md:text-base font-sans tracking-[0.5em] mb-8 text-zinc-400 uppercase">Our Mission</h2>
            <TextGradientScroll
              text={missionStatement}
              className="font-serif text-3xl md:text-5xl lg:text-6xl text-white font-light leading-snug md:leading-tight"
              type="word"
              textOpacity="soft"
            />
          </div>
        </div>
      </section>
      {/* Timeline Section */}
      <section id="community" className="relative py-32 bg-black border-t border-zinc-900">
        {/* Subtle Grid Pattern + 444 watermark */}
        <div className="absolute inset-0 bg-grid-subtle opacity-5 pointer-events-none" />
        <div className="absolute -left-32 top-1/4 text-[20vw] font-serif font-black text-white/[0.02] pointer-events-none mix-blend-overlay rotate-90 select-none">
          444
        </div>

        <div className="relative z-10">
          <div className="container mx-auto px-6 mb-24">
            <div className="text-left md:text-center max-w-4xl mx-auto">
              <h2 className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-8 text-white">
                ALL RUNNERS <span className="italic font-light text-zinc-400">WELCOME</span>
              </h2>
              <p className="text-lg md:text-xl text-zinc-400 font-light tracking-wide max-w-2xl mx-auto md:mx-auto">
                Every runner has a unique journey. Here are just a few stories from our inclusive community.
              </p>
            </div>
          </div>

          <Timeline entries={timelineEntries} />
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative py-32 bg-zinc-950 overflow-hidden">
        {/* Liquid Glass Overlay */}
        <div className="absolute inset-0 backdrop-blur-[50px] pointer-events-none bg-black/60 z-0" />
        <div className="absolute right-0 bottom-0 text-[15vw] font-serif font-black text-white/[0.03] pointer-events-none mix-blend-difference select-none leading-none">
          444
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="text-center mb-24 max-w-4xl mx-auto"
          >
            <h2 className="font-serif text-5xl md:text-7xl font-medium tracking-tight text-white mb-8">
              See what our{" "}
              <span className="italic font-light text-zinc-500">Runners</span>{" "}
              say.
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 tracking-wide font-light max-w-2xl mx-auto">
              Real stories from real runners who found their stride with Wadada Run Club.
            </p>
          </motion.div>

          <StaggerTestimonials />
        </div>
      </section>

      {/* Smooth Scroll Hero with CTA Overlay */}
      <section id="join" className="relative bg-black">
        <SmoothScrollHero
          scrollHeight={2500}
          desktopImage="/site_images/rider-portrait.jpg"
          mobileImage="/site_images/rider-portrait.jpg"
          initialClipPercentage={20}
          finalClipPercentage={80}
        />
      </section>
      </div>
      <Chatbot />
    </div>
  )
}
