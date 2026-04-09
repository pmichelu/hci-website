import { prisma } from "@/lib/prisma"
import Link from "next/link"
import DeleteButton from "@/components/admin/DeleteButton"

export default async function PeoplePage() {
  const people = await prisma.person.findMany({
    orderBy: { sortOrder: "asc" },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">People</h1>
        <Link
          href="/admin/people/new"
          className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          Add Person
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {people.map((person) => (
              <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{person.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{person.title || "—"}</td>
                <td className="px-6 py-4">
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                    {person.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{person.sortOrder}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <Link
                    href={`/admin/people/${person.id}/edit`}
                    className="text-[var(--color-primary)] hover:underline text-sm font-medium"
                  >
                    Edit
                  </Link>
                  <DeleteButton entity="people" id={person.id} />
                </td>
              </tr>
            ))}
            {people.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  No people yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
