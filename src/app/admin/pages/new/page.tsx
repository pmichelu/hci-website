"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import RichTextEditor from "@/components/admin/RichTextEditor"
import { validatePageSlug } from "@/lib/reserved-slugs"

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export default function NewPagePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [hidden, setHidden] = useState(true)
  const [navParent, setNavParent] = useState("top")
  const [sortOrder, setSortOrder] = useState("0")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const slugError = slug ? validatePageSlug(slug) : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const finalSlug = slug || slugify(title)
    const validationError = validatePageSlug(finalSlug)
    if (validationError) {
      setError(validationError)
      return
    }
    setSaving(true)
    setError("")

    const res = await fetch("/api/admin/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug: finalSlug,
        content: content || undefined,
        hidden,
        navParent: hidden ? null : navParent,
        sortOrder: Number(sortOrder),
      }),
    })

    setSaving(false)

    if (res.ok) {
      router.push("/admin/pages")
    } else {
      const data = await res.json()
      setError(data.error || "Failed to create page")
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Page</h1>

      <form onSubmit={handleSubmit} className="max-w-3xl bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (!slug || slug === slugify(title)) setSlug(slugify(e.target.value))
            }}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
          />
          {slugError ? (
            <p className="text-xs text-red-600 mt-1">{slugError}</p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">The page will be reachable at humancomputation.org/{slug || "..."}</p>
          )}
        </div>

        <RichTextEditor label="Page Content" value={content} onChange={setContent} />

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!hidden}
              onChange={(e) => setHidden(!e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
            />
            <span className="text-sm font-medium text-gray-700">Show in site navigation</span>
          </label>
          <p className="text-xs text-gray-400 mt-1">
            Hidden pages are not listed in the site navigation but remain accessible at their URL.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${hidden ? "text-gray-400" : "text-gray-700"}`}>Navigation Placement</label>
            <select
              value={navParent}
              onChange={(e) => setNavParent(e.target.value)}
              disabled={hidden}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <option value="top">Top level</option>
              <option value="about">Under About</option>
              <option value="projects">Under Projects</option>
              <option value="publications">Under Publications</option>
            </select>
            {hidden && (
              <p className="text-xs text-gray-400 mt-1">Only applies when the page is visible in navigation.</p>
            )}
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
            disabled={saving || !!slugError}
            className="px-6 py-2 bg-[var(--color-accent)] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Page"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/pages")}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
