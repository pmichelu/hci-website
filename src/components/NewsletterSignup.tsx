"use client"

import { useState, useEffect } from "react"

interface NewsletterList {
  slug: string
  name: string
  description: string | null
}

interface NewsletterSignupProps {
  slugs?: string[]
  compact?: boolean
}

export default function NewsletterSignup({ slugs, compact }: NewsletterSignupProps) {
  const [lists, setLists] = useState<NewsletterList[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [devConfirmUrl, setDevConfirmUrl] = useState("")

  useEffect(() => {
    fetch("/api/newsletters/lists")
      .then((r) => r.json())
      .then((data: NewsletterList[]) => {
        const filtered = slugs
          ? data.filter((l) => slugs.includes(l.slug))
          : data
        setLists(filtered)
        if (filtered.length === 1) {
          setSelected(new Set([filtered[0].slug]))
        }
      })
      .catch(() => setLists([]))
  }, [slugs])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selected.size === 0) {
      setMessage("Please select at least one newsletter.")
      setStatus("error")
      return
    }

    setStatus("loading")
    setMessage("")
    setDevConfirmUrl("")

    try {
      const res = await fetch("/api/newsletters/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          slugs: Array.from(selected),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus("success")
        setMessage(data.message || "Check your email to confirm your subscription!")
        if (data.confirmUrl) setDevConfirmUrl(data.confirmUrl)
        setEmail("")
        setName("")
      } else {
        setStatus("error")
        setMessage(data.error || "Something went wrong. Please try again.")
      }
    } catch {
      setStatus("error")
      setMessage("Something went wrong. Please try again.")
    }
  }

  function toggleList(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  if (lists.length === 0) return null

  const isSingle = lists.length === 1

  if (status === "success") {
    return (
      <div className={compact ? "" : "max-w-xl mx-auto"}>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <svg className="w-10 h-10 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-green-800 font-medium">{message}</p>
          {devConfirmUrl && (
            <a href={devConfirmUrl} className="text-sm text-green-600 underline mt-2 block">
              (Dev: click to confirm)
            </a>
          )}
          <button
            onClick={() => { setStatus("idle"); setSelected(isSingle ? new Set([lists[0].slug]) : new Set()) }}
            className="mt-4 text-sm text-green-700 hover:underline"
          >
            Subscribe another email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={compact ? "" : "max-w-xl mx-auto"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isSingle && lists.length > 0 && (
          <div className="space-y-2">
            {lists.map((list) => (
              <label
                key={list.slug}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-[var(--color-primary)] cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.has(list.slug)}
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
        )}

        {isSingle && lists[0].description && !compact && (
          <p className="text-gray-600 text-sm">{lists[0].description}</p>
        )}

        <div className={isSingle && compact ? "flex gap-2" : "space-y-3"}>
          {!compact && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className={`${isSingle && compact ? "flex-1" : "w-full"} px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none`}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-2.5 bg-[var(--color-accent)] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap"
          >
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </button>
        </div>

        {status === "error" && message && (
          <p className="text-red-600 text-sm">{message}</p>
        )}
      </form>
    </div>
  )
}
