"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import MediaPicker from "@/components/admin/MediaPicker"

export default function NewPublicationPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [link, setLink] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [category, setCategory] = useState("book")
  const [sortOrder, setSortOrder] = useState("0")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    const res = await fetch("/api/admin/publications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || undefined,
        link: link || undefined,
        imageUrl: imageUrl || undefined,
        category,
        sortOrder: Number(sortOrder),
      }),
    })

    setSaving(false)

    if (res.ok) {
      router.push("/admin/publications")
    } else {
      const data = await res.json()
      setError(data.error || "Failed to create publication")
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Publication</h1>

      <form onSubmit={handleSubmit} className="max-w-3xl bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
            placeholder="https://..."
          />
        </div>

        <MediaPicker label="Cover Image" value={imageUrl} onChange={setImageUrl} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
            >
              <option value="book">Book</option>
              <option value="journal">Journal</option>
              <option value="article">Article</option>
              <option value="conference">Conference Paper</option>
              <option value="report">Report</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[var(--color-accent)] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add Publication"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/publications")}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
