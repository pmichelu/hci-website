"use client"

import { useState, useEffect } from "react"

interface Setting {
  id: string
  key: string
  value: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    const res = await fetch("/api/admin/settings")
    const data = await res.json()
    setSettings(data)
    setLoading(false)
  }

  async function handleSave(setting: Setting) {
    setSaving(true)
    setMessage("")

    const res = await fetch(`/api/admin/settings/${setting.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: setting.key, value: setting.value }),
    })

    setSaving(false)

    if (res.ok) {
      setMessage(`Saved "${setting.key}" successfully`)
      setTimeout(() => setMessage(""), 3000)
    } else {
      setMessage("Failed to save setting")
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newKey.trim()) return

    setSaving(true)
    setMessage("")

    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: newKey.trim(), value: newValue }),
    })

    setSaving(false)

    if (res.ok) {
      setNewKey("")
      setNewValue("")
      setMessage("Setting added successfully")
      fetchSettings()
      setTimeout(() => setMessage(""), 3000)
    } else {
      setMessage("Failed to add setting")
    }
  }

  function updateSettingValue(id: string, value: string) {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, value } : s)),
    )
  }

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Site Settings</h1>

      {message && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {message}
        </div>
      )}

      <div className="max-w-3xl space-y-4 mb-8">
        {settings.map((setting) => (
          <div
            key={setting.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {setting.key}
            </label>
            <textarea
              value={setting.value}
              onChange={(e) => updateSettingValue(setting.id, e.target.value)}
              rows={setting.value.length > 100 ? 4 : 2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none text-sm mb-3"
            />
            <button
              onClick={() => handleSave(setting)}
              disabled={saving}
              className="px-4 py-1.5 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              Save
            </button>
          </div>
        ))}

        {settings.length === 0 && (
          <p className="text-gray-400 text-sm">No settings configured yet.</p>
        )}
      </div>

      <div className="max-w-3xl">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Setting</h2>
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                placeholder="e.g. site_title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            Add Setting
          </button>
        </form>
      </div>
    </div>
  )
}
