"use client"

import { useState, useEffect } from "react"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { Menu, ChevronLeft, ChevronRight, X } from "lucide-react"
import type { HeroSlide } from "@/lib/content/types"

const HARDCODED_FALLBACK_SLIDES = [
  {
    image: "/soul_initiation/mountain.png",
    alt: "Mountain Peak - Soul Initiation",
    title: "SOUL",
    subtitle: "INITIATION",
  },
  {
    image: "/soul_initiation/desert.png",
    alt: "Desert Threshold - Soul Initiation",
    title: "THE",
    subtitle: "THRESHOLD",
  },
  {
    image: "/soul_initiation/forest.png",
    alt: "Mist Forest - Soul Initiation",
    title: "THE",
    subtitle: "DESCENT",
  },
]

export function SoulInitiationHero({ slides: cmsSlides }: { slides?: HeroSlide[] }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const slides = cmsSlides && cmsSlides.length > 0
    ? cmsSlides.map((s) => ({
        image: s.image_url,
        alt: `${s.title_line1} ${s.title_line2}`,
        title: s.title_line1,
        subtitle: s.title_line2,
      }))
    : HARDCODED_FALLBACK_SLIDES

  const navItems = [
    { name: "Home", href: "#hero" },
    { name: "Threshold", href: "#threshold" },
    { name: "The Arc", href: "#arc" },
    { name: "Process", href: "#process" },
    { name: "Apply", href: "#apply" },
  ]

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [isPaused, slides.length])

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false)
  }

  return (
    <div
      id="hero"
      className="relative h-screen w-full overflow-hidden bg-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url('${slides[currentSlide].image}')`,
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Floating 444 Watermark */}
      <div className="absolute top-10 right-10 text-white/10 font-black text-6xl select-none pointer-events-none z-0">
        444
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between p-6 md:p-8">
        <div className="text-white font-bold text-xl tracking-widest">SOUL INITIATION</div>
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => scrollToSection(item.href)}
              className="text-white/70 hover:text-white transition-colors duration-300 font-medium tracking-wide uppercase text-sm pb-1 group relative"
            >
              {item.name}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
            </button>
          ))}
        </div>
        <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-300">
          <button className="absolute top-8 right-8 text-white" onClick={() => setIsMenuOpen(false)}>
            <X size={32} />
          </button>
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => scrollToSection(item.href)}
              className="text-white text-3xl font-black tracking-widest hover:text-gray-400 transition-colors"
            >
              {item.name}
            </button>
          ))}
        </div>
      )}

      {/* Hero Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-6">
        <div className="text-center text-white max-w-5xl">
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-4 leading-[0.8]">
            {slides[currentSlide].title}
            <br />
            <span className="text-white/80">{slides[currentSlide].subtitle}</span>
          </h1>
          <p className="text-lg md:text-xl font-light tracking-[0.2em] mb-12 text-gray-300 mt-8 uppercase">
            A six-month container for real transition
          </p>
          <LiquidButton size="xxl" onClick={() => scrollToSection("#apply")}>
            Begin the Crossing
          </LiquidButton>
        </div>
      </div>

      {/* Slider Controls */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-8">
        <button onClick={prevSlide} className="text-white/40 hover:text-white transition-colors">
          <ChevronLeft size={32} strokeWidth={1} />
        </button>
        <div className="flex space-x-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-12 h-0.5 transition-all duration-500 ${
                currentSlide === i ? "bg-white" : "bg-white/20"
              }`}
            />
          ))}
        </div>
        <button onClick={nextSlide} className="text-white/40 hover:text-white transition-colors">
          <ChevronRight size={32} strokeWidth={1} />
        </button>
      </div>

      {/* Bottom Watermark 444 */}
      <div className="absolute bottom-12 right-12 text-white/5 font-black text-8xl select-none pointer-events-none">
        444
      </div>
    </div>
  )
}
