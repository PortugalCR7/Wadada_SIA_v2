"use client"

import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { SerifAccent } from "@/lib/tiptap/serif-accent-mark"
import { useState } from "react"

// ─── Toolbar ─────────────────────────────────────────────────────────────────

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-3 py-1.5 text-sm transition-colors ${
        active
          ? "bg-white text-black"
          : "text-zinc-400 hover:text-white hover:bg-zinc-700"
      }`}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null
  return (
    <div className="flex items-center gap-px border-b border-zinc-700 px-2 py-1 bg-zinc-800">
      <ToolbarButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </ToolbarButton>
      {/* Serif Accent — italic Aa in Cormorant Garamond */}
      <ToolbarButton
        active={editor.isActive("serifAccent")}
        onClick={() => editor.chain().focus().toggleSerifAccent().run()}
        title="Serif Accent — font-accent italic (Ctrl+Shift+A). Use for key phrases, pull quotes, poetic fragments only."
      >
        <span className="font-accent italic text-base leading-none">Aa</span>
      </ToolbarButton>
    </div>
  )
}

// ─── RichTextField ────────────────────────────────────────────────────────────

export function RichTextField({
  name,
  label,
  defaultValue = "",
}: {
  name: string
  label: string
  defaultValue?: string
}) {
  const [html, setHtml] = useState(defaultValue)

  const editor = useEditor({
    extensions: [StarterKit, SerifAccent],
    content: defaultValue,
    onUpdate({ editor }) {
      setHtml(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          "px-4 py-3 min-h-[100px] text-white focus:outline-none prose prose-invert prose-sm max-w-none [&_.font-accent]:font-accent [&_.font-accent]:italic",
      },
    },
  })

  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
        {label}
      </label>
      {/* Hidden textarea submits HTML through Server Action formData */}
      <textarea
        name={name}
        value={html}
        onChange={() => {}}
        className="sr-only"
        aria-hidden="true"
      />
      <div className="border border-zinc-700 focus-within:border-white transition-colors">
        <Toolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
      <p className="mt-1 text-[10px] text-zinc-600 uppercase tracking-widest">
        Serif Accent (Ctrl+Shift+A) — key phrases &amp; pull quotes only, not full paragraphs
      </p>
    </div>
  )
}
