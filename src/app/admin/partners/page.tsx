import { prisma } from "@/lib/prisma"
import Link from "next/link"
import DeleteButton from "@/components/admin/DeleteButton"

export default async function PartnersPage() {
  const partners = await prisma.partner.findMany({
    orderBy: { sortOrder: "asc" },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
        <Link
          href="/admin/partners/new"
          className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          Add Partner
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Logo</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Link</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {partners.map((partner) => (
              <tr key={partner.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{partner.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {partner.logoUrl ? (
                    <img src={partner.logoUrl} alt={partner.name} className="h-8 object-contain" />
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-48">{partner.link || "—"}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{partner.sortOrder}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <Link
                    href={`/admin/partners/${partner.id}/edit`}
                    className="text-[var(--color-primary)] hover:underline text-sm font-medium"
                  >
                    Edit
                  </Link>
                  <DeleteButton entity="partners" id={partner.id} />
                </td>
              </tr>
            ))}
            {partners.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  No partners yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
