import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getLists } from "@/lib/listmonk"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const lists = await getLists()
    return NextResponse.json(
      lists.map((l) => ({
        id: l.id,
        uuid: l.uuid,
        name: l.name,
        type: l.type,
        status: l.status,
        subscriber_count: l.subscriber_count || 0,
      })),
    )
  } catch (err: unknown) {
    console.error("Listmonk sync error:", err)
    return NextResponse.json(
      { error: "Failed to fetch lists from Listmonk" },
      { status: 500 },
    )
  }
}
