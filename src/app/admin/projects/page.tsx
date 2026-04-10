import { prisma } from "@/lib/prisma"
import Link from "next/link"
import ProjectsList from "./ProjectsList"

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { sortOrder: "asc" },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          New Project
        </Link>
      </div>

      <ProjectsList projects={JSON.parse(JSON.stringify(projects))} />
    </div>
  )
}
