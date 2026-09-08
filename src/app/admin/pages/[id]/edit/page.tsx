"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import RichTextEditor from "@/components/admin/RichTextEditor"
import { validatePageSlug } from "@/lib/reserved-slugs"
import { normalizePageStatus, PAGE_STATUSES, type PageStatus } from "@/lib/page-status"

const statusDescriptions: Record<PageStatus, string> = {
  disabled: "Not published — no public URL, visible only here",
  hidden: "Live at its URL but not listed in the site navigation",
  published: "Live and listed in the site navigation",
}

const statusFieldLabels: Record<PageStatus, string> = {
  disabled: "Disabled",
  hidden: "Hidden",
  published: "Published",
}

export default function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [status, setStatus] = useState<PageStatus>("disabled")
  const [redirectTo, setRedirectTo] = useState("")
  const [navParent, setNavParent] = useState("top")
  const [sortOrder, setSortOrder] = useState("0")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/admin/pages/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setTitle(data.title || "")
        setSlug(data.slug || "")
        setContent(data.content || "")
        setStatus(normalizePageStatus(data.status))
        setRedirectTo(data.redirectTo || "")
        setNavParent(data.navParent || "top")
        setSortOrder(String(data.sortOrder ?? 0))
        setLoading(false)
      })
  }, [id])

  const slugError = slug ? validatePageSlug(slug) : null
  const redirectError = redirectTo
    ? redirectTo.startsWith("/") || /^https?:\/\//.test(redirectTo)
      ? null
      : 'Must be a site-relative path starting with "/" or an absolute http(s):// URL'
    : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validatePageSlug(slug)
    if (validationError) {
      setError(validationError)
      return
    }
    if (redirectError) {
      setError(redirectError)
      return
    }
    setSaving(true)
    setError("")

    const res = await fetch(`/api/admin/pages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug,
        content: content || null,
        status,
        redirectTo: redirectTo || null,
        navParent: status === "published" ? navParent : null,
        sortOrder: Number(sortOrder),
      }),
    })

    setSaving(false)

    if (res.ok) {
      router.push("/admin/pages")
    } else {
      const data = await res.json()
      setError(data.error || "Failed to update page")
    }
  }

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Page</h1>

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
            <p className="text-xs text-gray-400 mt-1">
              The page is reachable at humancomputation.org/{slug || "..."}. Nested legacy URLs are
              supported: separate up to 3 segments with &quot;/&quot;, e.g. old-section/old-page.
            </p>
          )}
        </div>

        <div className={redirectTo ? "opacity-60" : ""}>
          <RichTextEditor label="Page Content" value={content} onChange={setContent} />
          {redirectTo && (
            <p className="text-xs text-gray-400 mt-1">
              A redirect target is set, so this content will not be shown to visitors.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Redirect to</label>
          <input
            type="text"
            value={redirectTo}
            onChange={(e) => setRedirectTo(e.target.value)}
            placeholder="/projects/civium or https://example.org/path"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
          />
          {redirectError ? (
            <p className="text-xs text-red-600 mt-1">{redirectError}</p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">
              When set, the page permanently redirects (308) to this target instead of showing its content —
              useful for restoring old URLs whose content now lives elsewhere.
            </p>
          )}
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">Status</legend>
          <div className="space-y-2">
            {PAGE_STATUSES.map((option) => (
              <label key={option} className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={option}
                  checked={status === option}
                  onChange={() => setStatus(option)}
                  className="mt-0.5 h-4 w-4 border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                />
                <span>
                  <span className="text-sm font-medium text-gray-700">{statusFieldLabels[option]}</span>
                  <span className="block text-xs text-gray-400">{statusDescriptions[option]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${status === "published" ? "text-gray-700" : "text-gray-400"}`}>Navigation Placement</label>
            <select
              value={navParent}
              onChange={(e) => setNavParent(e.target.value)}
              disabled={status !== "published"}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <option value="top">Top level</option>
              <option value="about">Under About</option>
              <option value="projects">Under Projects</option>
              <option value="publications">Under Publications</option>
            </select>
            {status !== "published" && (
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
            disabled={saving || !!slugError || !!redirectError}
            className="px-6 py-2 bg-[var(--color-accent)] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update Page"}
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
