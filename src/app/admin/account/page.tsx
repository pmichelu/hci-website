"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"

export default function AccountPage() {
  const { data: session } = useSession()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters")
      return
    }

    setSaving(true)

    const res = await fetch("/api/admin/account/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    setSaving(false)

    if (res.ok) {
      setSuccess("Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } else {
      const data = await res.json()
      setError(data.error || "Failed to update password")
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Account</h1>

      <div className="max-w-lg bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6 pb-6 border-b border-gray-100">
          <dl className="space-y-2">
            <div className="flex gap-2">
              <dt className="text-sm font-medium text-gray-500 w-16">Name</dt>
              <dd className="text-sm text-gray-900">{session?.user?.name || "—"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-sm font-medium text-gray-500 w-16">Email</dt>
              <dd className="text-sm text-gray-900">{session?.user?.email || "—"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-sm font-medium text-gray-500 w-16">Role</dt>
              <dd className="text-sm text-gray-900">
                {(session?.user as any)?.role || "—"}
              </dd>
            </div>
          </dl>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[var(--color-accent)] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  )
}
