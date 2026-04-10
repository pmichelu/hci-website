import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const modelMap: Record<string, string> = {
  people: "person",
  projects: "project",
  partners: "partner",
  publications: "publication",
  videos: "video",
  settings: "siteSetting",
  users: "user",
  media: "mediaItem",
  newsletters: "newsletterList",
}

function getDelegate(entity: string) {
  const model = modelMap[entity]
  if (!model) return null
  return (prisma as any)[model]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string; id: string }> },
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { entity, id } = await params
  const delegate = getDelegate(entity)
  if (!delegate) return NextResponse.json({ error: "Unknown entity" }, { status: 404 })

  const item = await delegate.findUnique({ where: { id } })
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (entity === "users") {
    const { passwordHash, ...rest } = item
    return NextResponse.json(rest)
  }

  return NextResponse.json(item)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string; id: string }> },
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { entity, id } = await params
  const delegate = getDelegate(entity)
  if (!delegate) return NextResponse.json({ error: "Unknown entity" }, { status: 404 })

  const body = await request.json()

  try {
    if (entity === "users") {
      if (session.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      if (body.password) {
        body.passwordHash = await bcrypt.hash(body.password, 10)
      }
      delete body.password
      delete body.id
      delete body.createdAt
      delete body.updatedAt
      const user = await delegate.update({ where: { id }, data: body })
      const { passwordHash, ...sanitized } = user
      return NextResponse.json(sanitized)
    }

    if (["people", "projects", "partners", "publications", "videos"].includes(entity)) {
      if (body.sortOrder !== undefined) body.sortOrder = Number(body.sortOrder)
    }

    if (entity === "newsletters") {
      if (body.listmonkListId !== undefined) body.listmonkListId = Number(body.listmonkListId)
      if (body.displayOrder !== undefined) body.displayOrder = Number(body.displayOrder)
      if (body.active !== undefined) body.active = Boolean(body.active)
    }

    if (entity === "people" && body.socialLinks != null && typeof body.socialLinks !== "string") {
      body.socialLinks = JSON.stringify(body.socialLinks)
    }

    delete body.id
    delete body.createdAt
    delete body.updatedAt

    const item = await delegate.update({ where: { id }, data: body })
    return NextResponse.json(item)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Update failed" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string; id: string }> },
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { entity, id } = await params

  if (entity === "users" && session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const delegate = getDelegate(entity)
  if (!delegate) return NextResponse.json({ error: "Unknown entity" }, { status: 404 })

  try {
    await delegate.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Delete failed" }, { status: 500 })
  }
}
