"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import SortableList from "@/components/admin/SortableList"
import DeleteButton from "@/components/admin/DeleteButton"

interface Project {
  id: string
  name: string
  slug: string
  link: string | null
  sortOrder: number
  hidden: boolean
}

export default function ProjectsList({ projects }: { projects: Project[] }) {
  const router = useRouter()
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())

  async function toggleHidden(project: Project) {
    setTogglingIds((prev) => new Set(prev).add(project.id))
    try {
      await fetch(`/api/admin/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: !project.hidden }),
      })
      router.refresh()
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev)
        next.delete(project.id)
        return next
      })
    }
  }

  const listKey = projects.map((p) => `${p.id}:${p.hidden}`).join(",")

  return (
    <SortableList
      key={listKey}
      items={projects}
      entity="projects"
      onReordered={() => router.refresh()}
      header={
        <>
          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Link</th>
          <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hide</th>
          <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
        </>
      }
      renderRow={(project, _index, removeItem) => (
        <>
          <td className="px-6 py-4 text-sm font-medium text-gray-900">{project.name}</td>
          <td className="px-6 py-4 text-sm text-gray-500">{project.slug}</td>
          <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-48">{project.link || "—"}</td>
          <td className="px-6 py-4 text-center">
            <input
              type="checkbox"
              checked={project.hidden}
              disabled={togglingIds.has(project.id)}
              onChange={() => toggleHidden(project)}
              className="h-4 w-4 rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)] cursor-pointer disabled:opacity-50"
            />
          </td>
          <td className="px-6 py-4 text-right space-x-3">
            <Link
              href={`/admin/projects/${project.id}/edit`}
              className="text-[var(--color-primary)] hover:underline text-sm font-medium"
            >
              Edit
            </Link>
            <DeleteButton entity="projects" id={project.id} onDeleted={removeItem} />
          </td>
        </>
      )}
    />
  )
}
