import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const entityConfig: Record<
  string,
  {
    model: string
    orderBy?: Record<string, string>
    include?: Record<string, boolean>
  }
> = {
  people: { model: "person", orderBy: { sortOrder: "asc" } },
  projects: { model: "project", orderBy: { sortOrder: "asc" } },
  partners: { model: "partner", orderBy: { sortOrder: "asc" } },
  publications: { model: "publication", orderBy: { sortOrder: "asc" } },
  videos: { model: "video", orderBy: { sortOrder: "asc" } },
  settings: { model: "siteSetting", orderBy: { key: "asc" } },
  users: { model: "user", orderBy: { createdAt: "desc" } },
  media: { model: "mediaItem", orderBy: { createdAt: "desc" } },
}

function getModel(entity: string) {
  const config = entityConfig[entity]
  if (!config) return null
  return { delegate: (prisma as any)[config.model], config }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> },
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { entity } = await params
  const result = getModel(entity)
  if (!result) return NextResponse.json({ error: "Unknown entity" }, { status: 404 })

  const { delegate, config } = result
  const items = await delegate.findMany({
    orderBy: config.orderBy,
    include: config.include,
  })

  if (entity === "users") {
    return NextResponse.json(
      items.map((u: any) => {
        const { passwordHash, ...rest } = u
        return rest
      }),
    )
  }

  return NextResponse.json(items)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> },
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { entity } = await params
  const result = getModel(entity)
  if (!result) return NextResponse.json({ error: "Unknown entity" }, { status: 404 })

  const { delegate } = result
  const body = await request.json()

  try {
    if (entity === "users") {
      if (session.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      const { password, ...userData } = body
      const passwordHash = await bcrypt.hash(password, 10)
      const user = await delegate.create({ data: { ...userData, passwordHash } })
      const { passwordHash: _, ...sanitized } = user
      return NextResponse.json(sanitized, { status: 201 })
    }

    if (entity === "settings") {
      const existing = await (prisma as any).siteSetting.findUnique({
        where: { key: body.key },
      })
      if (existing) {
        const updated = await delegate.update({
          where: { id: existing.id },
          data: { value: body.value },
        })
        return NextResponse.json(updated)
      }
    }

    if (["people", "projects", "partners", "publications", "videos"].includes(entity)) {
      if (body.sortOrder !== undefined) body.sortOrder = Number(body.sortOrder)
    }

    if (entity === "people" && body.socialLinks != null && typeof body.socialLinks !== "string") {
      body.socialLinks = JSON.stringify(body.socialLinks)
    }

    const item = await delegate.create({ data: body })
    return NextResponse.json(item, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Create failed" }, { status: 500 })
  }
}
