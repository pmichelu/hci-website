"use client"

import { useState } from "react"

export default function ManageSubscriptionsForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [devManageUrl, setDevManageUrl] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setMessage("")
    setDevManageUrl("")

    try {
      const res = await fetch("/api/newsletters/send-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      setStatus("success")
      setMessage(data.message || "Check your email for the management link.")
      if (data.manageUrl) setDevManageUrl(data.manageUrl)
    } catch {
      setStatus("error")
      setMessage("Something went wrong. Please try again.")
    }
  }

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <svg className="w-10 h-10 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="text-green-800 font-medium">{message}</p>
        {devManageUrl && (
          <a href={devManageUrl} className="text-sm text-green-600 underline mt-2 block">
            (Dev: click to manage)
          </a>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        required
        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap"
      >
        {status === "loading" ? "Sending..." : "Send Link"}
      </button>
    </form>
  )
}
