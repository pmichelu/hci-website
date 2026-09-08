"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import DeleteButton from "@/components/admin/DeleteButton"

interface Page {
  id: string
  slug: string
  title: string
  hidden: boolean
  navParent: string | null
  sortOrder: number
}

const navParentLabels: Record<string, string> = {
  top: "Top level",
  about: "Under About",
  projects: "Under Projects",
  publications: "Under Publications",
}

export default function PagesList({ pages: initialPages }: { pages: Page[] }) {
  const router = useRouter()
  const [pages, setPages] = useState(initialPages)
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())

  async function toggleHidden(page: Page) {
    setTogglingIds((prev) => new Set(prev).add(page.id))
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: !page.hidden }),
      })
      if (res.ok) {
        setPages((prev) =>
          prev.map((p) => (p.id === page.id ? { ...p, hidden: !p.hidden } : p)),
        )
        router.refresh()
      }
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev)
        next.delete(page.id)
        return next
      })
    }
  }

  const visiblePages = pages.filter((p) => !p.hidden)
  const hiddenPages = pages.filter((p) => p.hidden)

  function renderRow(page: Page) {
    return (
      <tr key={page.id} className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 text-sm font-medium text-gray-900">{page.title}</td>
        <td className="px-6 py-4 text-sm text-gray-500">
          <code className="bg-gray-50 px-1.5 py-0.5 rounded text-xs">/{page.slug}</code>
        </td>
        <td className="px-6 py-4 text-sm">
          {page.hidden ? (
            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              Hidden — direct link only
            </span>
          ) : (
            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
              In navigation
            </span>
          )}
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">
          {page.hidden ? "—" : navParentLabels[page.navParent || "top"]}
        </td>
        <td className="px-6 py-4 text-center">
          <button
            onClick={() => toggleHidden(page)}
            disabled={togglingIds.has(page.id)}
            className="text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50 cursor-pointer"
            title={page.hidden ? "Add to navigation" : "Remove from navigation"}
          >
            {page.hidden ? "Make visible" : "Make hidden"}
          </button>
        </td>
        <td className="px-6 py-4 text-right space-x-3">
          <Link
            href={`/admin/pages/${page.id}/edit`}
            className="text-[var(--color-primary)] hover:underline text-sm font-medium"
          >
            Edit
          </Link>
          <Link
            href={`/${page.slug}`}
            target="_blank"
            className="text-gray-500 hover:underline text-sm font-medium"
          >
            View
          </Link>
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
              <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Visibility</th>
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
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Visible in navigation ({visiblePages.length})
        </h2>
        {renderTable(visiblePages, "No visible pages.")}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Hidden — direct link only ({hiddenPages.length})
        </h2>
        {renderTable(hiddenPages, "No hidden pages.")}
      </div>
    </div>
  )
}
