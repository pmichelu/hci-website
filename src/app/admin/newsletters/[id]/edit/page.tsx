"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"

export default function EditNewsletterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [listmonkListId, setListmonkListId] = useState("")
  const [listmonkUuid, setListmonkUuid] = useState("")
  const [displayOrder, setDisplayOrder] = useState("0")
  const [active, setActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/admin/newsletters/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setName(data.name || "")
        setSlug(data.slug || "")
        setDescription(data.description || "")
        setListmonkListId(String(data.listmonkListId ?? ""))
        setListmonkUuid(data.listmonkUuid || "")
        setDisplayOrder(String(data.displayOrder ?? 0))
        setActive(data.active ?? true)
        setLoading(false)
      })
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    const res = await fetch(`/api/admin/newsletters/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        description: description || null,
        listmonkListId: Number(listmonkListId),
        listmonkUuid,
        displayOrder: Number(displayOrder),
        active,
      }),
    })

    setSaving(false)

    if (res.ok) {
      router.push("/admin/newsletters")
    } else {
      const data = await res.json()
      setError(data.error || "Failed to update newsletter")
    }
  }

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Newsletter</h1>

      <form onSubmit={handleSubmit} className="max-w-3xl bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">The name shown to subscribers on the website. Defaults to the Listmonk list name but can be customized.</p>
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
          <p className="text-xs text-gray-400 mt-1">Used to embed this newsletter on specific pages</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
            placeholder="Brief description shown to subscribers"
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Listmonk Link (set during sync)</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-gray-500">List ID</span>
              <p className="text-sm text-gray-700">{listmonkListId}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">UUID</span>
              <p className="text-sm text-gray-700 truncate">{listmonkUuid}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <span className="text-sm font-medium text-gray-700">Active (visible publicly)</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[var(--color-accent)] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update Newsletter"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/newsletters")}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
