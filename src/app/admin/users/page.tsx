"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export default function UsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("EDITOR")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const isAdmin = (session?.user as any)?.role === "ADMIN"

  useEffect(() => {
    if (isAdmin) fetchUsers()
  }, [isAdmin])

  async function fetchUsers() {
    const res = await fetch("/api/admin/users")
    if (res.ok) {
      const data = await res.json()
      setUsers(data)
    }
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    })

    setSaving(false)

    if (res.ok) {
      setName("")
      setEmail("")
      setPassword("")
      setRole("EDITOR")
      setShowForm(false)
      fetchUsers()
    } else {
      const data = await res.json()
      setError(data.error || "Failed to create user")
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    })

    if (res.ok) fetchUsers()
  }

  async function handleDelete(userId: string) {
    if (userId === session?.user?.id) {
      alert("You cannot delete your own account")
      return
    }
    if (!window.confirm("Are you sure you want to delete this user?")) return

    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" })
    if (res.ok) fetchUsers()
    else alert("Failed to delete user")
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500">Only administrators can manage users.</p>
        </div>
      </div>
    )
  }

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          {showForm ? "Cancel" : "Add User"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="max-w-3xl bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 mb-6"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
              >
                <option value="EDITOR">Editor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[var(--color-accent)] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create User"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  >
                    <option value="EDITOR">Editor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
