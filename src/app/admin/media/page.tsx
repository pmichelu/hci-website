"use client"

import { useState, useEffect } from "react"
import { HiOutlineTrash } from "react-icons/hi2"

interface MediaItem {
  id: string
  filename: string
  url: string
  alt: string | null
  mimeType: string | null
  size: number | null
  createdAt: string
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchMedia()
  }, [])

  async function fetchMedia() {
    const res = await fetch("/api/admin/media")
    if (res.ok) {
      const data = await res.json()
      setItems(data)
    }
    setLoading(false)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    setUploading(false)

    if (res.ok) {
      fetchMedia()
    } else {
      alert("Upload failed")
    }

    e.target.value = ""
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this media item?")) return

    const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" })
    if (res.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id))
    } else {
      alert("Failed to delete")
    }
  }

  function formatSize(bytes: number | null) {
    if (!bytes) return "—"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  function isImage(mimeType: string | null) {
    return mimeType?.startsWith("image/")
  }

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
        <label className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition cursor-pointer">
          {uploading ? "Uploading..." : "Upload File"}
          <input
            type="file"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          No media uploaded yet. Use the button above to upload files.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group"
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                {isImage(item.mimeType) ? (
                  <img
                    src={item.url}
                    alt={item.alt || item.filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <p className="text-3xl mb-2">📄</p>
                    <p className="text-xs text-gray-500 truncate px-2">{item.mimeType}</p>
                  </div>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">{item.filename}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-400">{formatSize(item.size)}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.url)
                      alert("URL copied to clipboard")
                    }}
                    className="text-xs text-[var(--color-primary)] hover:underline"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
