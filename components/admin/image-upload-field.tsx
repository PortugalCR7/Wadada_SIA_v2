"use client"

import { useState, useRef } from "react"
import { uploadImage } from "@/lib/actions/content"

interface ImageUploadFieldProps {
  name: string
  subfolder: string
  currentUrl?: string
  label?: string
}

export function ImageUploadField({ name, subfolder, currentUrl, label = "Image" }: ImageUploadFieldProps) {
  const [url, setUrl] = useState(currentUrl ?? "")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Maximum size is 5 MB.")
      return
    }

    setUploading(true)
    setError(null)
    try {
      const newUrl = await uploadImage(subfolder, file)
      setUrl(newUrl)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">{label}</label>
      <div className="relative w-full max-w-xs aspect-video border border-dashed border-zinc-600 bg-zinc-900 overflow-hidden">
        {url ? (
          <img src={url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-500">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            <span className="text-xs uppercase tracking-widest">Upload Image</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-white uppercase tracking-widest">Uploading…</span>
          </div>
        )}
        {!uploading && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={
              url
                ? "absolute bottom-2 right-2 bg-black/70 text-white text-xs px-3 py-1.5 border border-zinc-600 hover:bg-black/90 transition-colors"
                : "absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            }
          >
            {url ? "Replace" : "Upload"}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-red-400 text-xs">{error}</p>}
      <input type="hidden" name={name} value={url} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
