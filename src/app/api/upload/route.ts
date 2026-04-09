import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })

    const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`
    const filePath = path.join(uploadsDir, uniqueName)
    await writeFile(filePath, buffer)

    const url = `/uploads/${uniqueName}`
    const mediaItem = await prisma.mediaItem.create({
      data: {
        filename: file.name,
        url,
        mimeType: file.type,
        size: file.size,
      },
    })

    return NextResponse.json(mediaItem, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 })
  }
}
