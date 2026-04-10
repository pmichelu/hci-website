import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyManageToken } from "@/lib/newsletter-token"
import {
  findSubscriberByEmail,
  addSubscriberToLists,
  removeSubscriberFromLists,
} from "@/lib/listmonk"

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 })
  }

  const payload = verifyManageToken(token)
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
  }

  try {
    const allLists = await prisma.newsletterList.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
    })

    const subscriber = await findSubscriberByEmail(payload.email)

    const subscribedListIds = new Set(
      (subscriber?.lists || [])
        .filter((l) => l.subscription_status === "confirmed")
        .map((l) => l.id),
    )

    const lists = allLists.map((nl) => ({
      slug: nl.slug,
      name: nl.name,
      description: nl.description,
      subscribed: subscribedListIds.has(nl.listmonkListId),
    }))

    return NextResponse.json({
      email: payload.email,
      lists,
    })
  } catch (err: unknown) {
    console.error("Get subscriptions error:", err)
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { token, subscribe, unsubscribe } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 })
    }

    const payload = verifyManageToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    const subscriber = await findSubscriberByEmail(payload.email)
    if (!subscriber) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 })
    }

    if (subscribe && Array.isArray(subscribe) && subscribe.length > 0) {
      const listsToAdd = await prisma.newsletterList.findMany({
        where: { slug: { in: subscribe }, active: true },
      })
      if (listsToAdd.length > 0) {
        await addSubscriberToLists(
          [subscriber.id],
          listsToAdd.map((l) => l.listmonkListId),
        )
      }
    }

    if (unsubscribe && Array.isArray(unsubscribe) && unsubscribe.length > 0) {
      const listsToRemove = await prisma.newsletterList.findMany({
        where: { slug: { in: unsubscribe }, active: true },
      })
      if (listsToRemove.length > 0) {
        await removeSubscriberFromLists(
          [subscriber.id],
          listsToRemove.map((l) => l.listmonkListId),
        )
      }
    }

    return NextResponse.json({ success: true, message: "Subscriptions updated." })
  } catch (err: unknown) {
    console.error("Update subscriptions error:", err)
    return NextResponse.json(
      { error: "Failed to update subscriptions" },
      { status: 500 },
    )
  }
}
