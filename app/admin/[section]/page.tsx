import { notFound } from "next/navigation"
import HeroForm from "./_forms/HeroForm"
import IntroForm from "./_forms/IntroForm"
import RecognitionForm from "./_forms/RecognitionForm"
import ThresholdForm from "./_forms/ThresholdForm"
import PhilosophicalBridgeForm from "./_forms/PhilosophicalBridgeForm"
import ProgramDefinitionForm from "./_forms/ProgramDefinitionForm"
import ArcForm from "./_forms/ArcForm"
import RequirementsForm from "./_forms/RequirementsForm"
import WhoForForm from "./_forms/WhoForForm"
import ChangesForm from "./_forms/ChangesForm"
import GuidesForm from "./_forms/GuidesForm"
import TestimonialsForm from "./_forms/TestimonialsForm"
import InvestmentForm from "./_forms/InvestmentForm"
import NextStepsForm from "./_forms/NextStepsForm"
import FinalCtaForm from "./_forms/FinalCtaForm"
import FooterForm from "./_forms/FooterForm"
import SubscribersView from "./_forms/SubscribersView"

// Async Server Components return Promise<JSX.Element> which isn't assignable to ComponentType
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REGISTRY: Record<string, (...args: any[]) => any> = {
  "hero":                 HeroForm,
  "intro":                IntroForm,
  "recognition":          RecognitionForm,
  "threshold":            ThresholdForm,
  "philosophical-bridge": PhilosophicalBridgeForm,
  "program-definition":   ProgramDefinitionForm,
  "arc":                  ArcForm,
  "requirements":         RequirementsForm,
  "who-for":              WhoForForm,
  "changes":              ChangesForm,
  "guides":               GuidesForm,
  "testimonials":         TestimonialsForm,
  "investment":           InvestmentForm,
  "next-steps":           NextStepsForm,
  "final-cta":            FinalCtaForm,
  "footer":               FooterForm,
  "subscribers":          SubscribersView,
}

const SECTION_LABELS: Record<string, string> = {
  "hero":                 "Hero Slides",
  "intro":                "Intro",
  "recognition":          "Do You Recognize This?",
  "threshold":            "Threshold Definition",
  "philosophical-bridge": "Philosophical Bridge",
  "program-definition":   "This Is Not / This Is",
  "arc":                  "Arc of Initiation",
  "requirements":         "Requirements",
  "who-for":              "Who This Is For",
  "changes":              "What Tends to Change",
  "guides":               "The Guides",
  "testimonials":         "Testimonials",
  "investment":           "Investment",
  "next-steps":           "Next Steps",
  "final-cta":            "Final CTA",
  "footer":               "Footer Closing",
  "subscribers":          "Subscribers",
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  const Form = REGISTRY[section]
  if (!Form) notFound()

  return (
    <div className="p-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-10 text-[10px] tracking-[0.3em] uppercase">
        <a href="/admin" className="text-zinc-700 hover:text-zinc-400 transition-colors">
          Admin
        </a>
        <span className="text-zinc-800">/</span>
        <span className="text-zinc-500">{SECTION_LABELS[section] ?? section}</span>
      </div>

      {/* Form content */}
      <div className="max-w-2xl">
        <Form />
      </div>
    </div>
  )
}
