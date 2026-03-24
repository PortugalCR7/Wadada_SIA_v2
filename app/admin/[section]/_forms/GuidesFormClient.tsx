"use client"

import { useActionState, useState } from "react"
import type { ActionState } from "@/lib/actions/types"
import type { Guide } from "@/lib/content/types"
import { ImageUploadField } from "@/components/admin/image-upload-field"
import { RichTextField } from "@/components/admin/rich-text-field"

interface GuidesFormClientProps {
  guides: Guide[]
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
}

const initial: ActionState = { success: false, error: null }

const emptyGuide = (): Guide => ({
  id: `new-${Date.now()}`,
  image_url: "",
  heading: "",
  body_paragraph_1: "",
  body_paragraph_2: "",
  cta_label: "",
  cta_url: "",
  section_title: "",
  sort_order: 0,
  active: true,
})

export function GuidesFormClient({ guides, action }: GuidesFormClientProps) {
  const [state, formAction, isPending] = useActionState(action, initial)
  const [list, setList] = useState<Guide[]>(guides.length > 0 ? guides : [emptyGuide()])

  function addGuide() {
    setList((prev) => [...prev, emptyGuide()])
  }

  function removeGuide(index: number) {
    setList((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">The Guides</h2>
      {state.success && (
        <div className="bg-green-950 border border-green-700 text-green-300 px-4 py-3 text-sm">Saved!</div>
      )}
      {state.error && (
        <div className="bg-red-950 border border-red-700 text-red-300 px-4 py-3 text-sm">{state.error}</div>
      )}
      <form action={formAction} className="space-y-8">
        {list.map((guide, i) => {
          const isNarrative = i === 0
          return (
            <fieldset key={guide.id} className="border border-zinc-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <legend className="text-xs uppercase tracking-widest text-zinc-500 px-2">
                  {isNarrative ? "You Are Accompanied Section" : `Guide ${i} — Profile Card`}
                </legend>
                {!isNarrative && (
                  <button
                    type="button"
                    onClick={() => removeGuide(i)}
                    className="text-xs uppercase tracking-widest text-red-500 hover:text-red-300 transition-colors px-2"
                  >
                    × Remove
                  </button>
                )}
              </div>

              <ImageUploadField
                name="image_url"
                subfolder="guides"
                currentUrl={guide.image_url}
                label={isNarrative ? "Section Image" : "Guide Photo"}
              />

              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                  {isNarrative ? "Section Heading" : "Guide Name"}
                </label>
                <input
                  type="text"
                  name="heading"
                  defaultValue={guide.heading}
                  className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                />
              </div>

              {isNarrative ? (
                <>
                  <RichTextField
                    name="body_paragraph_1"
                    label="Paragraph 1"
                    defaultValue={guide.body_paragraph_1}
                  />
                  <RichTextField
                    name="body_paragraph_2"
                    label="Paragraph 2"
                    defaultValue={guide.body_paragraph_2}
                  />
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                      Quote (replaces 444 box)
                    </label>
                    <input
                      type="text"
                      name="cta_label"
                      defaultValue={guide.cta_label}
                      placeholder="e.g. Presence"
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                      Carousel Section Title
                    </label>
                    <input
                      type="text"
                      name="section_title"
                      defaultValue={guide.section_title}
                      placeholder="e.g. Soul Initiation Guides"
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                    />
                  </div>
                  {/* hidden cta_url to keep field counts aligned */}
                  <input type="hidden" name="cta_url" value={guide.cta_url ?? ""} />
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                      Guide Title / Designation
                    </label>
                    <input
                      type="text"
                      name="body_paragraph_1"
                      defaultValue={guide.body_paragraph_1}
                      placeholder="e.g. Lead Guide & Founder"
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Bio</label>
                    <textarea
                      name="body_paragraph_2"
                      defaultValue={guide.body_paragraph_2}
                      rows={4}
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white resize-y"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                      Button Label
                    </label>
                    <input
                      type="text"
                      name="cta_label"
                      defaultValue={guide.cta_label}
                      placeholder="e.g. Find Out More"
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                      Button URL
                    </label>
                    <input
                      type="text"
                      name="cta_url"
                      defaultValue={guide.cta_url}
                      placeholder="https://..."
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                    />
                  </div>
                  {/* hidden section_title to keep field counts aligned */}
                  <input type="hidden" name="section_title" value="" />
                </>
              )}
            </fieldset>
          )
        })}

        <button
          type="button"
          onClick={addGuide}
          disabled={isPending}
          className="w-full bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700 transition-colors py-4 text-xs uppercase tracking-widest font-black disabled:opacity-50"
        >
          + Add Guide Card
        </button>

        <p className="text-zinc-500 text-sm">
          Note: The first entry is always the "You Are Accompanied" section. Entries 2+ become carousel cards.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  )
}
