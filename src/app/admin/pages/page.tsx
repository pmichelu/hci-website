import { prisma } from "@/lib/prisma"
import Link from "next/link"
import PagesList from "./PagesList"

export default async function PagesPage() {
  const pages = await prisma.page.findMany({
    orderBy: [{ status: "asc" }, { sortOrder: "asc" }],
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
        <Link
          href="/admin/pages/new"
          className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          New Page
        </Link>
      </div>

      <PagesList pages={JSON.parse(JSON.stringify(pages))} />
    </div>
  )
}
