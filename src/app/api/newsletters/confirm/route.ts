import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifySubscribeToken } from "@/lib/newsletter-token"
import { findSubscriberByEmail, createSubscriber, addSubscriberToLists } from "@/lib/listmonk"

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 })
  }

  const payload = verifySubscribeToken(token)
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
  }

  try {
    const newsletterLists = await prisma.newsletterList.findMany({
      where: { slug: { in: payload.listSlugs }, active: true },
    })

    if (newsletterLists.length === 0) {
      return NextResponse.json({ error: "No valid newsletters found" }, { status: 400 })
    }

    const listmonkListIds = newsletterLists.map((l) => l.listmonkListId)

    let subscriber = await findSubscriberByEmail(payload.email)

    if (subscriber) {
      await addSubscriberToLists([subscriber.id], listmonkListIds)
    } else {
      subscriber = await createSubscriber(
        payload.email,
        payload.name,
        listmonkListIds,
        true,
      )
    }

    return NextResponse.json({
      success: true,
      message: "Subscription confirmed!",
      lists: newsletterLists.map((l) => l.name),
    })
  } catch (err: unknown) {
    console.error("Newsletter confirm error:", err)
    return NextResponse.json(
      { error: "Failed to confirm subscription" },
      { status: 500 },
    )
  }
}
