"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import SortableList from "@/components/admin/SortableList"
import DeleteButton from "@/components/admin/DeleteButton"

interface Partner {
  id: string
  name: string
  logoUrl: string | null
  link: string | null
  sortOrder: number
}

export default function PartnersList({ partners }: { partners: Partner[] }) {
  const router = useRouter()

  return (
    <SortableList
      items={partners}
      entity="partners"
      onReordered={() => router.refresh()}
      header={
        <>
          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Logo</th>
          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Link</th>
          <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
        </>
      }
      renderRow={(partner) => (
        <>
          <td className="px-6 py-4 text-sm font-medium text-gray-900">{partner.name}</td>
          <td className="px-6 py-4 text-sm text-gray-500">
            {partner.logoUrl ? (
              <img src={partner.logoUrl} alt={partner.name} className="h-8 object-contain" />
            ) : (
              "—"
            )}
          </td>
          <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-48">{partner.link || "—"}</td>
          <td className="px-6 py-4 text-right space-x-3">
            <Link
              href={`/admin/partners/${partner.id}/edit`}
              className="text-[var(--color-primary)] hover:underline text-sm font-medium"
            >
              Edit
            </Link>
            <DeleteButton entity="partners" id={partner.id} />
          </td>
        </>
      )}
    />
  )
}
