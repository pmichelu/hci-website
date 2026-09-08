"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import DeleteButton from "@/components/admin/DeleteButton"
import { PAGE_STATUSES, type PageStatus } from "@/lib/page-status"

interface Page {
  id: string
  slug: string
  title: string
  status: string
  redirectTo: string | null
  navParent: string | null
  sortOrder: number
}

const navParentLabels: Record<string, string> = {
  top: "Top level",
  about: "Under About",
  projects: "Under Projects",
  publications: "Under Publications",
}

const statusLabels: Record<PageStatus, string> = {
  published: "In navigation",
  hidden: "Hidden — direct link only",
  disabled: "Disabled — no public URL",
}

const statusBadgeClasses: Record<PageStatus, string> = {
  published: "bg-green-100 text-green-700",
  hidden: "bg-amber-100 text-amber-800",
  disabled: "bg-gray-100 text-gray-600",
}

function asStatus(value: string): PageStatus {
  return (PAGE_STATUSES as readonly string[]).includes(value) ? (value as PageStatus) : "disabled"
}

export default function PagesList({ pages: initialPages }: { pages: Page[] }) {
  const router = useRouter()
  const [pages, setPages] = useState(initialPages)
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())

  async function setStatus(page: Page, status: PageStatus) {
    if (status === asStatus(page.status)) return
    setUpdatingIds((prev) => new Set(prev).add(page.id))
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setPages((prev) =>
          prev.map((p) => (p.id === page.id ? { ...p, status } : p)),
        )
        router.refresh()
      }
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev)
        next.delete(page.id)
        return next
      })
    }
  }

  const groups: { status: PageStatus; heading: string; empty: string }[] = [
    { status: "published", heading: "Visible in navigation", empty: "No visible pages." },
    { status: "hidden", heading: "Hidden — direct link only", empty: "No hidden pages." },
    { status: "disabled", heading: "Disabled — not published", empty: "No disabled pages." },
  ]

  function renderRow(page: Page) {
    const status = asStatus(page.status)
    const live = status !== "disabled"
    return (
      <tr key={page.id} className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 text-sm font-medium text-gray-900">{page.title}</td>
        <td className="px-6 py-4 text-sm text-gray-500">
          <code className={`bg-gray-50 px-1.5 py-0.5 rounded text-xs ${live ? "" : "line-through text-gray-400"}`}>
            /{page.slug}
          </code>
          {!live && (
            <span className="ml-1.5 text-xs text-gray-400">not live</span>
          )}
          {page.redirectTo && (
            <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              Redirect → {page.redirectTo}
            </span>
          )}
        </td>
        <td className="px-6 py-4 text-sm">
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClasses[status]}`}>
            {statusLabels[status]}
          </span>
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">
          {status === "published" ? navParentLabels[page.navParent || "top"] : "—"}
        </td>
        <td className="px-6 py-4 text-center">
          <select
            value={status}
            disabled={updatingIds.has(page.id)}
            onChange={(e) => setStatus(page, e.target.value as PageStatus)}
            className="text-xs font-medium px-2 py-1 rounded-lg border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 transition disabled:opacity-50 cursor-pointer"
            title="Change page status"
          >
            {PAGE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </td>
        <td className="px-6 py-4 text-right space-x-3">
          <Link
            href={`/admin/pages/${page.id}/edit`}
            className="text-[var(--color-primary)] hover:underline text-sm font-medium"
          >
            Edit
          </Link>
          {live ? (
            <Link
              href={`/${page.slug}`}
              target="_blank"
              className="text-gray-500 hover:underline text-sm font-medium"
            >
              View
            </Link>
          ) : (
            <span
              className="text-gray-300 text-sm font-medium cursor-not-allowed"
              title="Disabled pages have no public URL"
            >
              View
            </span>
          )}
          <DeleteButton
            entity="pages"
            id={page.id}
            onDeleted={() => setPages((prev) => prev.filter((p) => p.id !== page.id))}
          />
        </td>
      </tr>
    )
  }

  function renderTable(items: Page[], emptyMessage: string) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">URL</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nav Placement</th>
              <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Set Status</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map(renderRow)}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {groups.map(({ status, heading, empty }) => {
        const items = pages.filter((p) => asStatus(p.status) === status)
        return (
          <div key={status}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {heading} ({items.length})
            </h2>
            {renderTable(items, empty)}
          </div>
        )
      })}
    </div>
  )
}
