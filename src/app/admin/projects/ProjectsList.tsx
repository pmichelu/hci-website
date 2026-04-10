"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import SortableList from "@/components/admin/SortableList"
import DeleteButton from "@/components/admin/DeleteButton"

interface Project {
  id: string
  name: string
  slug: string
  link: string | null
  sortOrder: number
}

export default function ProjectsList({ projects }: { projects: Project[] }) {
  const router = useRouter()

  return (
    <SortableList
      items={projects}
      entity="projects"
      onReordered={() => router.refresh()}
      header={
        <>
          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Link</th>
          <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
        </>
      }
      renderRow={(project) => (
        <>
          <td className="px-6 py-4 text-sm font-medium text-gray-900">{project.name}</td>
          <td className="px-6 py-4 text-sm text-gray-500">{project.slug}</td>
          <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-48">{project.link || "—"}</td>
          <td className="px-6 py-4 text-right space-x-3">
            <Link
              href={`/admin/projects/${project.id}/edit`}
              className="text-[var(--color-primary)] hover:underline text-sm font-medium"
            >
              Edit
            </Link>
            <DeleteButton entity="projects" id={project.id} />
          </td>
        </>
      )}
    />
  )
}
