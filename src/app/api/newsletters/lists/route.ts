import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const lists = await prisma.newsletterList.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
      select: {
        slug: true,
        name: true,
        description: true,
      },
    })

    return NextResponse.json(lists)
  } catch (err: unknown) {
    console.error("Fetch newsletter lists error:", err)
    return NextResponse.json(
      { error: "Failed to fetch newsletter lists" },
      { status: 500 },
    )
  }
}
