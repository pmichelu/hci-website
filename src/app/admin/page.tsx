import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdminDashboard() {
  const [people, projects, partners, publications, videos, media, users] =
    await Promise.all([
      prisma.person.count(),
      prisma.project.count(),
      prisma.partner.count(),
      prisma.publication.count(),
      prisma.video.count(),
      prisma.mediaItem.count(),
      prisma.user.count(),
    ])

  const stats = [
    { label: "People", count: people, href: "/admin/people" },
    { label: "Projects", count: projects, href: "/admin/projects" },
    { label: "Partners", count: partners, href: "/admin/partners" },
    { label: "Publications", count: publications, href: "/admin/publications" },
    { label: "Videos", count: videos, href: "/admin/videos" },
    { label: "Media", count: media, href: "/admin/media" },
    { label: "Users", count: users, href: "/admin/users" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
          >
            <p className="text-sm text-gray-500 uppercase tracking-wide">{stat.label}</p>
            <p className="text-3xl font-bold text-[var(--color-primary)] mt-1">{stat.count}</p>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/people/new"
          className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          Add Person
        </Link>
        <Link
          href="/admin/projects/new"
          className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          New Project
        </Link>
        <Link
          href="/admin/media"
          className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          Upload Media
        </Link>
        <Link
          href="/admin/settings"
          className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          Site Settings
        </Link>
      </div>
    </div>
  )
}
