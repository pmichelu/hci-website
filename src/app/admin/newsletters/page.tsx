import { prisma } from "@/lib/prisma"
import Link from "next/link"
import DeleteButton from "@/components/admin/DeleteButton"
import SyncFromListmonkButton from "./SyncFromListmonkButton"


export default async function AdminNewslettersPage() {
  const newsletters = await prisma.newsletterList.findMany({
    orderBy: { displayOrder: "asc" },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Newsletters</h1>
        <SyncFromListmonkButton />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Display Name</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Listmonk ID</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {newsletters.map((nl) => (
              <tr key={nl.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{nl.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{nl.slug}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{nl.listmonkListId}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${nl.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {nl.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{nl.displayOrder}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <Link
                    href={`/admin/newsletters/${nl.id}/edit`}
                    className="text-[var(--color-primary)] hover:underline text-sm font-medium"
                  >
                    Edit
                  </Link>
                  <DeleteButton entity="newsletters" id={nl.id} />
                </td>
              </tr>
            ))}
            {newsletters.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  No newsletters configured yet. Click &quot;Sync from Listmonk&quot; to import lists.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
