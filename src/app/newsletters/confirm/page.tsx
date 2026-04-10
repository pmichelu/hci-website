"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"

function ConfirmContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [lists, setLists] = useState<string[]>([])

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Missing confirmation token.")
      return
    }

    fetch(`/api/newsletters/confirm?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json()
        if (res.ok) {
          setStatus("success")
          setMessage(data.message || "Subscription confirmed!")
          setLists(data.lists || [])
        } else {
          setStatus("error")
          setMessage(data.error || "Failed to confirm subscription.")
        }
      })
      .catch(() => {
        setStatus("error")
        setMessage("Failed to confirm subscription. Please try again.")
      })
  }, [token])

  return (
    <section className="bg-[var(--color-bg-light)] min-h-[60vh] flex items-center">
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        {status === "loading" && (
          <div>
            <div className="w-10 h-10 border-4 border-gray-300 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Confirming your subscription...</p>
          </div>
        )}

        {status === "success" && (
          <div>
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">You&apos;re Subscribed!</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            {lists.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">You&apos;ve been subscribed to:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {lists.map((name) => (
                    <li key={name}>&#10003; {name}</li>
                  ))}
                </ul>
              </div>
            )}
            <Link
              href="/newsletters"
              className="text-[var(--color-accent)] hover:underline font-medium"
            >
              Back to Newsletters
            </Link>
          </div>
        )}

        {status === "error" && (
          <div>
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">Confirmation Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              href="/newsletters"
              className="text-[var(--color-accent)] hover:underline font-medium"
            >
              Try again
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export default function ConfirmPage() {
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
      <ConfirmContent />
    </Suspense>
  )
}
