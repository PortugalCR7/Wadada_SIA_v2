"use client"

import { useState } from "react"
import { replaceList } from "@/lib/actions/content"
import type { SocialLink } from "@/lib/content/types"

const PLATFORMS = [
  { value: "facebook",  label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok",    label: "TikTok" },
  { value: "linkedin",  label: "LinkedIn" },
  { value: "substack",  label: "Substack" },
  { value: "x",         label: "X (Twitter)" },
  { value: "threads",   label: "Threads" },
  { value: "youtube",   label: "YouTube" },
]

interface Row {
  platform: string
  url: string
}

export default function SocialLinksEditor({ initialLinks }: { initialLinks: SocialLink[] }) {
  const [rows, setRows] = useState<Row[]>(
    initialLinks.map((l) => ({ platform: l.platform, url: l.url }))
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function addRow() {
    setRows((prev) => [...prev, { platform: "", url: "" }])
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateRow(i: number, field: "platform" | "url", value: string) {
    setRows((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row))
    )
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    const validRows = rows
      .filter((r) => r.platform !== "" && r.url.trim() !== "")
      .map((r, i) => ({ platform: r.platform, url: r.url, sort_order: i, active: true }))
    await replaceList("si_social_links", validRows)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-3 items-center">
            <select
              value={row.platform}
              onChange={(e) => updateRow(i, "platform", e.target.value)}
              className="w-40 bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-white"
            >
              <option value="">— platform —</option>
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <input
              type="url"
              value={row.url}
              onChange={(e) => updateRow(i, "url", e.target.value)}
              placeholder="https://..."
              className="flex-1 bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-white"
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              aria-label="Remove"
              className="text-zinc-500 hover:text-white text-lg leading-none px-2 transition-colors"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="text-zinc-400 hover:text-white text-sm border border-zinc-700 hover:border-zinc-400 px-4 py-2 transition-colors"
      >
        + Add Social Link
      </button>

      <p className="text-zinc-600 text-xs">
        To remove a link, click × then save. Only rows with both a platform and URL will be saved.
      </p>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Social Links"}
        </button>
        {saved && (
          <span className="text-green-400 text-sm font-medium">Saved!</span>
        )}
      </div>
    </div>
  )
}
