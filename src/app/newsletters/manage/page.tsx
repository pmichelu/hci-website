"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"

interface SubscriptionList {
  slug: string
  name: string
  description: string | null
  subscribed: boolean
}

function ManageContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [email, setEmail] = useState("")
  const [lists, setLists] = useState<SubscriptionList[]>([])
  const [original, setOriginal] = useState<Record<string, boolean>>({})
  const [status, setStatus] = useState<"loading" | "ready" | "saving" | "saved" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Missing or invalid management link.")
      return
    }

    fetch(`/api/newsletters/subscriptions?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json()
        if (res.ok) {
          setEmail(data.email)
          setLists(data.lists)
          const orig: Record<string, boolean> = {}
          data.lists.forEach((l: SubscriptionList) => { orig[l.slug] = l.subscribed })
          setOriginal(orig)
          setStatus("ready")
        } else {
          setStatus("error")
          setMessage(data.error || "Failed to load subscriptions.")
        }
      })
      .catch(() => {
        setStatus("error")
        setMessage("Failed to load subscriptions. The link may have expired.")
      })
  }, [token])

  function toggleList(slug: string) {
    setLists((prev) =>
      prev.map((l) => (l.slug === slug ? { ...l, subscribed: !l.subscribed } : l)),
    )
  }

  async function handleSave() {
    setStatus("saving")

    const subscribe: string[] = []
    const unsubscribe: string[] = []

    lists.forEach((l) => {
      if (l.subscribed && !original[l.slug]) subscribe.push(l.slug)
      if (!l.subscribed && original[l.slug]) unsubscribe.push(l.slug)
    })

    if (subscribe.length === 0 && unsubscribe.length === 0) {
      setStatus("saved")
      setMessage("No changes to save.")
      return
    }

    try {
      const res = await fetch("/api/newsletters/subscriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, subscribe, unsubscribe }),
      })

      const data = await res.json()
      if (res.ok) {
        setStatus("saved")
        setMessage("Your preferences have been updated.")
        const newOriginal: Record<string, boolean> = {}
        lists.forEach((l) => { newOriginal[l.slug] = l.subscribed })
        setOriginal(newOriginal)
      } else {
        setStatus("ready")
        setMessage(data.error || "Failed to update preferences.")
      }
    } catch {
      setStatus("ready")
      setMessage("Something went wrong. Please try again.")
    }
  }

  if (status === "loading") {
    return (
      <section className="bg-[var(--color-bg-light)] min-h-[60vh] flex items-center">
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your subscriptions...</p>
        </div>
      </section>
    )
  }

  if (status === "error") {
    return (
      <section className="bg-[var(--color-bg-light)] min-h-[60vh] flex items-center">
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Unable to Load</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link href="/newsletters" className="text-[var(--color-accent)] hover:underline font-medium">
            Request a new link
          </Link>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-gray-700 mb-4">
            Manage Subscriptions
          </h1>
          <div className="border-b-2 border-[var(--color-accent)] w-12 mx-auto mb-6" />
          <p className="text-gray-600">
            Managing preferences for <strong>{email}</strong>
          </p>
        </div>
      </section>

      <section className="bg-[var(--color-bg-light)] py-16 md:py-20">
        <div className="max-w-xl mx-auto px-6">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg border text-sm ${
                status === "saved"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <div className="space-y-3 mb-8">
            {lists.map((list) => (
              <label
                key={list.slug}
                className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white hover:border-[var(--color-primary)] cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={list.subscribed}
                  onChange={() => toggleList(list.slug)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <div>
                  <span className="font-medium text-gray-900">{list.name}</span>
                  {list.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{list.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleSave}
              disabled={status === "saving"}
              className="px-8 py-2.5 bg-[var(--color-accent)] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {status === "saving" ? "Saving..." : "Save Preferences"}
            </button>
            <Link
              href="/newsletters"
              className="px-8 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Back
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default function ManagePage() {
  return (
    <Suspense
      fallback={
        <section className="bg-[var(--color-bg-light)] min-h-[60vh] flex items-center">
          <div className="max-w-lg mx-auto px-6 py-20 text-center">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </section>
      }
    >
      <ManageContent />
    </Suspense>
  )
}
