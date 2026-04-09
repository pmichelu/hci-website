"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import MediaPicker from "@/components/admin/MediaPicker"

export default function EditPersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [name, setName] = useState("")
  const [title, setTitle] = useState("")
  const [bio, setBio] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [category, setCategory] = useState("core")
  const [sortOrder, setSortOrder] = useState("0")
  const [twitter, setTwitter] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [facebook, setFacebook] = useState("")
  const [website, setWebsite] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/admin/people/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setName(data.name || "")
        setTitle(data.title || "")
        setBio(data.bio || "")
        setPhotoUrl(data.photoUrl || "")
        setCategory(data.category || "core")
        setSortOrder(String(data.sortOrder ?? 0))
        const links = data.socialLinks ? (typeof data.socialLinks === "string" ? JSON.parse(data.socialLinks) : data.socialLinks) : {}
        setTwitter(links.twitter || "")
        setLinkedin(links.linkedin || "")
        setFacebook(links.facebook || "")
        setWebsite(links.website || "")
        setLoading(false)
      })
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    const socialLinks: Record<string, string> = {}
    if (twitter) socialLinks.twitter = twitter
    if (linkedin) socialLinks.linkedin = linkedin
    if (facebook) socialLinks.facebook = facebook
    if (website) socialLinks.website = website

    const res = await fetch(`/api/admin/people/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        title: title || null,
        bio: bio || null,
        photoUrl: photoUrl || null,
        category,
        sortOrder: Number(sortOrder),
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : null,
      }),
    })

    setSaving(false)

    if (res.ok) {
      router.push("/admin/people")
    } else {
      const data = await res.json()
      setError(data.error || "Failed to update person")
    }
  }

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Person</h1>

      <form onSubmit={handleSubmit} className="max-w-3xl bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
          />
        </div>

        <MediaPicker label="Photo" value={photoUrl} onChange={setPhotoUrl} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
            >
              <option value="core">Core Team</option>
              <option value="board">Board of Directors</option>
              <option value="alumni">Alumni</option>
              <option value="faculty">External Faculty</option>
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

        <fieldset className="border border-gray-200 rounded-lg p-4">
          <legend className="text-sm font-medium text-gray-700 px-2">Social Links</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Twitter</label>
              <input
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">LinkedIn</label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Facebook</label>
              <input
                type="url"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
              />
            </div>
          </div>
        </fieldset>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[var(--color-accent)] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update Person"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/people")}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
