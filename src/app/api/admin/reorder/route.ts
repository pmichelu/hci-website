import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const allowedEntities: Record<string, string> = {
  projects: "project",
  partners: "partner",
  people: "person",
  publications: "publication",
  videos: "video",
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { entity, ids } = await request.json()

  const model = allowedEntities[entity]
  if (!model) {
    return NextResponse.json({ error: "Invalid entity" }, { status: 400 })
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids must be a non-empty array" }, { status: 400 })
  }

  const delegate = (prisma as any)[model]

  await prisma.$transaction(
    ids.map((id: string, index: number) =>
      delegate.update({ where: { id }, data: { sortOrder: index } })
    )
  )

  return NextResponse.json({ success: true })
}
