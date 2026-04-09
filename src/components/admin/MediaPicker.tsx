"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"

interface MediaItem {
  id: string
  filename: string
  url: string
  mimeType?: string
  size?: number
}

interface MediaPickerProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export default function MediaPicker({ value, onChange, label = "Image" }: MediaPickerProps) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState("")

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/media")
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) fetchMedia()
  }, [open, fetchMedia])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (res.ok) {
        const item: MediaItem = await res.json()
        setItems((prev) => [item, ...prev])
        onChange(item.url)
        setOpen(false)
      }
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const filtered = search
    ? items.filter((m) => m.filename.toLowerCase().includes(search.toLowerCase()) || m.url.toLowerCase().includes(search.toLowerCase()))
    : items

  const isImage = (item: MediaItem) =>
    item.mimeType?.startsWith("image/") ||
    /\.(png|jpe?g|gif|svg|webp)$/i.test(item.url)

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
          placeholder="/images/..."
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition whitespace-nowrap"
        >
          Browse Media
        </button>
      </div>

      {value && isImage({ id: "", filename: "", url: value }) && (
        <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
          <Image src={value} alt="Preview" fill className="object-cover" />
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Select Media</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
              />
              <label className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition cursor-pointer">
                {uploading ? "Uploading..." : "Upload New"}
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="text-center text-gray-400 py-12">Loading media...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  {search ? "No matching files found." : "No media files yet. Upload one above."}
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                  {filtered.map((item) => {
                    const selected = value === item.url
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onChange(item.url)
                          setOpen(false)
                        }}
                        className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                          selected
                            ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/30"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {isImage(item) ? (
                          <Image src={item.url} alt={item.filename} fill className="object-cover" sizes="120px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 text-xs p-2 text-center break-all">
                            {item.filename}
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition">
                          <p className="text-white text-[10px] truncate">{item.filename}</p>
                        </div>
                        {selected && (
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
