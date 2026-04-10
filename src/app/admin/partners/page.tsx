import { prisma } from "@/lib/prisma"
import Link from "next/link"
import PartnersList from "./PartnersList"

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

      <PartnersList partners={JSON.parse(JSON.stringify(partners))} />
    </div>
  )
}
