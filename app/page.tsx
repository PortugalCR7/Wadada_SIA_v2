import { SoulInitiationHero } from "@/components/soul-initiation-hero"
import { TextGradientScroll } from "@/components/ui/text-gradient-scroll"
import { Timeline } from "@/components/ui/timeline"
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials"
import Chatbot from "@/components/chatbot"
import { AnimatedBridge } from "@/components/soul-initiation/animated-bridge"
import { AnimatedInvestment } from "@/components/soul-initiation/animated-investment"
import { ProgramDefinitionSection } from "@/components/soul-initiation/program-definition-section"
import { AnimatedGuides } from "@/components/ui/animated-guides"

import { getHeroSlides } from "@/lib/content/hero"
import { getIntro } from "@/lib/content/intro"
import { getRecognitionItems } from "@/lib/content/recognition"
import { getThresholdDefinition, getThresholdItems } from "@/lib/content/threshold"
import { getPhilosophicalBridge } from "@/lib/content/philosophical-bridge"
import { getProgramDefinitionItems } from "@/lib/content/program-definition"
import { getArcEntries } from "@/lib/content/arc"
import { getRequirements, getRequirementItems } from "@/lib/content/requirements"
import { getWhoForItems } from "@/lib/content/who-for"
import { getChangeItems } from "@/lib/content/changes"
import { getGuides } from "@/lib/content/guides"
import { getTestimonials } from "@/lib/content/testimonials"
import { getInvestment } from "@/lib/content/investment"
import { getNextSteps } from "@/lib/content/next-steps"
import { getFinalCta } from "@/lib/content/final-cta"
import { getFooterClosing } from "@/lib/content/footer"

export const revalidate = 60

export default async function HomePage() {
  const [
    heroSlides,
    intro,
    recognitionItems,
    thresholdDef,
    thresholdItems,
    bridge,
    programDefItems,
    arcEntries,
    requirements,
    requirementItems,
    whoForItems,
    changeItems,
    guides,
    testimonials,
    investment,
    nextSteps,
    finalCta,
    footerClosing,
  ] = await Promise.all([
    getHeroSlides(),
    getIntro(),
    getRecognitionItems(),
    getThresholdDefinition(),
    getThresholdItems(),
    getPhilosophicalBridge(),
    getProgramDefinitionItems(),
    getArcEntries(),
    getRequirements(),
    getRequirementItems(),
    getWhoForItems(),
    getChangeItems(),
    getGuides(),
    getTestimonials(),
    getInvestment(),
    getNextSteps(),
    getFinalCta(),
    getFooterClosing(),
  ])

  const arcTimelineEntries = arcEntries.map((e) => ({
    id: e.sort_order,
    image: e.image_url,
    alt: e.title,
    title: e.title,
    description: e.description,
    layout: e.layout_direction as "left" | "right",
  }))

  const testimonialsForComponent = testimonials.map((t) => ({
    quote: t.quote,
    name: t.author_name,
    designation: t.author_role,
    src: t.avatar_url,
  }))

  const fitItems = whoForItems.filter((w) => w.column === "fit")
  const notFitItems = whoForItems.filter((w) => w.column === "not_fit")

  const narrativeGuide = guides[0] ?? null
  const guideProfiles = guides.slice(1).map((g) => ({
    image_url: g.image_url,
    name: g.heading,
    title: g.body_paragraph_1,
    bio: g.body_paragraph_2,
    cta_label: g.cta_label,
    cta_url: g.cta_url,
  }))
  const carouselSectionTitle = narrativeGuide?.section_title ?? "Soul Initiation Guides"

  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white">
      {/* 444 Watermark */}
      <div className="fixed top-1/2 left-4 -translate-y-1/2 -rotate-90 text-black/[0.03] font-black text-9xl pointer-events-none z-0">
        444
      </div>

      <SoulInitiationHero slides={heroSlides} />

      {/* Intro Section */}
      <section id="threshold" className="relative py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-sm tracking-[0.4em] font-black text-black/20 uppercase mb-8">
              {intro?.eyebrow ?? "The Threshold"}
            </h2>
            <TextGradientScroll
              text={intro?.heading ?? ""}
              className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-black justify-center"
              type="word"
              textOpacity="soft"
            />
            <div
              className="font-accent italic text-2xl md:text-3xl text-zinc-500 mt-8 leading-relaxed max-w-3xl mx-auto font-light"
              dangerouslySetInnerHTML={{ __html: intro?.subtext ?? "" }}
            />
          </div>
        </div>
      </section>

      {/* Recognition Section */}
      <section className="py-24 bg-black text-white relative">
        <div className="absolute top-0 right-0 p-10 text-white/[0.05] font-black text-8xl pointer-events-none">444</div>
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-6xl font-black mb-16 tracking-tighter">DO YOU RECOGNIZE THIS?</h2>
            <div className="space-y-12">
              {recognitionItems.map((item) => (
                <div key={item.id} className="group border-l border-white/20 pl-8 hover:border-white hover:pl-10 transition-all duration-300 cursor-default">
                  <h3 className="text-2xl font-black mb-2 uppercase tracking-wide group-hover:translate-x-1 transition-transform duration-300">{item.title}</h3>
                  <p className="font-accent italic text-gray-500 group-hover:text-zinc-200 transition-colors text-xl font-light leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Threshold Definition Section */}
      <section className="py-24 bg-white border-t border-zinc-100">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-24 items-start">
            <div className="sticky top-32">
              <h2
                className="text-4xl md:text-6xl font-black mb-8 leading-[0.9] tracking-tighter uppercase text-black"
                dangerouslySetInnerHTML={{ __html: thresholdDef?.left_heading ?? "" }}
              />
              <p className="text-xl text-zinc-600 leading-relaxed max-w-lg">
                {thresholdDef?.left_paragraph ?? ""}
              </p>
              <div className="mt-12 text-black/5 font-black text-9xl">444</div>
            </div>
            <div className="space-y-16">
              <div>
                <h3 className="text-sm font-black tracking-[0.3em] uppercase mb-6 text-black/40">
                  {thresholdDef?.right_subheading ?? ""}
                </h3>
                <div className="space-y-8">
                  {thresholdItems.map((item) => (
                    <div key={item.id} className="border-b border-zinc-100 pb-8 last:border-0 hover:translate-x-2 transition-all duration-300 group cursor-default">
                      <h4 className="text-2xl font-black mb-2 uppercase group-hover:bg-black group-hover:text-white px-2 -mx-2 inline-block transition-all duration-200">{item.title}</h4>
                      <p className="text-zinc-500 group-hover:text-zinc-800 transition-colors">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophical Bridge */}
      <section className="py-40 bg-zinc-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            {bridge && <AnimatedBridge bridge={bridge} />}
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 text-white/[0.02] font-black text-[20vw] select-none pointer-events-none">444</div>
      </section>

      {/* Program Definition — This Is Not / This Is */}
      <ProgramDefinitionSection items={programDefItems} />

      {/* Arc of Initiation */}
      <section id="arc" className="py-32 bg-white">
        <div className="container mx-auto px-6 text-center mb-24">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-black uppercase">The Arc of Initiation</h2>
          <p className="text-xl text-gray-500 mt-6 max-w-2xl mx-auto uppercase tracking-widest">A time-tested structure for modern life</p>
        </div>
        <Timeline entries={arcTimelineEntries} />
      </section>

      {/* Requirements */}
      <section className="py-32 bg-zinc-100 relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-square overflow-hidden bg-black flex items-center justify-center">
              <div className="text-white/10 font-black text-[30vw] absolute select-none pointer-events-none">444</div>
              <div className="relative z-10 text-center p-12">
                <h3 className="text-white text-5xl font-black mb-6 tracking-tighter uppercase leading-none">
                  {requirements?.left_heading ?? ""}
                </h3>
                <p className="font-accent italic text-zinc-400 text-xl leading-relaxed">
                  {requirements?.left_tagline ?? ""}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {requirementItems.map((item) => (
                <div key={item.id} className="bg-black text-white p-8 group hover:bg-white hover:text-black transition-all duration-300 border border-black">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 group-hover:text-gray-600 transition-colors">{item.label}</span>
                  <p className="text-2xl font-black mt-2 tracking-tight group-hover:translate-x-2 transition-transform">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 text-center mb-20">
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase mb-6">Who This Is For</h2>
          <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-zinc-400">And, critically, who it is not for.</h3>
        </div>
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-px bg-zinc-200 border border-zinc-200">
          <div className="bg-white p-12 md:p-20">
            <h3 className="text-2xl font-black mb-12 uppercase tracking-wide flex items-center gap-4 text-black">
              <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">✓</span>
              It&apos;s likely a fit if you:
            </h3>
            <ul className="space-y-8">
              {fitItems.map((item) => (
                <li key={item.id} className="group text-xl font-medium text-zinc-700 leading-snug border-l-2 border-zinc-100 pl-6 hover:border-black hover:pl-8 hover:text-black transition-all duration-300 cursor-default">{item.text}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-12 md:p-20">
            <h3 className="text-2xl font-black mb-12 uppercase tracking-wide flex items-center gap-4 text-zinc-400">
              <span className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-400 flex items-center justify-center text-sm font-black">X</span>
              Likely not a fit if you:
            </h3>
            <ul className="space-y-8">
              {notFitItems.map((item) => (
                <li key={item.id} className="text-xl font-medium text-zinc-400 leading-snug pl-6 border-l-2 border-zinc-100">{item.text}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What Tends to Change */}
      <section className="py-32 bg-zinc-50 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <h2 className="text-4xl md:text-6xl font-black mb-16 tracking-tighter uppercase leading-none text-black">What Tends <br />To Change</h2>
            <div className="grid sm:grid-cols-2 gap-12">
              {changeItems.map((item) => (
                <div key={item.id} className="space-y-4 group cursor-default border-b border-zinc-200 pb-8 hover:border-black transition-all duration-300">
                  <h4 className="text-2xl font-black uppercase tracking-tight text-black group-hover:underline underline-offset-4 decoration-2">{item.title}</h4>
                  <p className="text-zinc-500 leading-relaxed group-hover:text-zinc-700 transition-colors">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 right-10 text-black/5 font-black text-9xl pointer-events-none">444</div>
      </section>

      {/* The Guides */}
      {narrativeGuide && (
        <section className="py-32 bg-white border-t border-zinc-100">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-24 items-center">
              <div className="relative">
                <div className="aspect-[4/5] bg-zinc-200">
                  <img
                    src={narrativeGuide.image_url}
                    alt={narrativeGuide.heading}
                    className="w-full h-full object-cover filter grayscale"
                  />
                </div>
                {narrativeGuide.cta_label && (
                  <div className="absolute -bottom-8 -right-8 bg-black text-white p-8 flex flex-col items-center justify-center max-w-[180px] text-center">
                    <span className="text-sm font-medium leading-snug italic font-accent">
                      {narrativeGuide.cta_label}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-8">
                <h2
                  className="text-5xl font-black tracking-tighter uppercase leading-tight text-black"
                  dangerouslySetInnerHTML={{ __html: narrativeGuide.heading }}
                />
                <div
                  className="text-xl text-zinc-600 leading-relaxed font-medium"
                  dangerouslySetInnerHTML={{ __html: narrativeGuide.body_paragraph_1 }}
                />
                <div
                  className="text-lg text-zinc-500 leading-relaxed italic"
                  dangerouslySetInnerHTML={{ __html: narrativeGuide.body_paragraph_2 }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Guide Profiles Carousel */}
      {guideProfiles.length > 0 && (
        <AnimatedGuides
          guides={guideProfiles}
          sectionTitle={carouselSectionTitle}
          autoplay
        />
      )}

      {/* Testimonials */}
      <section className="py-32 bg-white relative">
        <div className="container mx-auto px-6 text-center mb-16">
          <h2 className="font-accent italic text-3xl md:text-5xl text-black mb-4 font-light tracking-wide">Voice of the Crossing</h2>
        </div>
        <AnimatedTestimonials testimonials={testimonialsForComponent} autoplay />
      </section>

      {/* Investment, Next Steps, Final CTA */}
      <section id="apply" className="py-40 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <span className="text-[40vw] font-black">444</span>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {investment && (
              <AnimatedInvestment
                investment={investment}
                nextSteps={nextSteps}
                finalCta={finalCta}
              />
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 bg-black text-white relative">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-end">
              <div className="space-y-8">
                <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-snug uppercase">
                  {footerClosing?.body_copy ?? ""}
                </h3>
                <p className="font-accent italic text-2xl text-zinc-400 leading-relaxed border-l-4 border-white pl-8 py-2 font-light">
                  You need a structure capable of holding the actual crossing.
                </p>
              </div>
              <div className="space-y-6">
                <p className="text-zinc-400 uppercase tracking-widest font-black text-xs">Availability</p>
                <p className="text-lg leading-relaxed">{footerClosing?.availability_text ?? ""}</p>
                <div className="flex items-center gap-4 text-white/20 font-black text-4xl">444</div>
              </div>
            </div>

            {/* Email Capture Form */}
            <form
              action="/api/subscribe"
              method="POST"
              className="mt-24 border-t border-white/10 pt-16 flex flex-col sm:flex-row gap-4 max-w-lg"
            >
              <input
                type="email"
                name="email"
                required
                placeholder="Your email"
                className="flex-1 bg-black border border-zinc-700 text-white px-6 py-4 focus:outline-none focus:border-white placeholder:text-zinc-600"
              />
              <button
                type="submit"
                className="bg-white text-black font-black uppercase tracking-widest px-8 py-4 hover:bg-zinc-200 transition-colors whitespace-nowrap"
              >
                Stay Connected
              </button>
            </form>
          </div>
        </div>
      </footer>

      <Chatbot />
    </div>
  )
}
