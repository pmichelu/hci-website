import { prisma } from "@/lib/prisma"
import Link from "next/link"
import DeleteButton from "@/components/admin/DeleteButton"

export default async function PublicationsPage() {
  const publications = await prisma.publication.findMany({
    orderBy: { sortOrder: "asc" },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Publications</h1>
        <Link
          href="/admin/publications/new"
          className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          Add Publication
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Link</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {publications.map((pub) => (
              <tr key={pub.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{pub.title}</td>
                <td className="px-6 py-4">
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                    {pub.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-48">
                  {pub.link ? (
                    <a href={pub.link} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline">
                      View
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{pub.sortOrder}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <Link
                    href={`/admin/publications/${pub.id}/edit`}
                    className="text-[var(--color-primary)] hover:underline text-sm font-medium"
                  >
                    Edit
                  </Link>
                  <DeleteButton entity="publications" id={pub.id} />
                </td>
              </tr>
            ))}
            {publications.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  No publications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
