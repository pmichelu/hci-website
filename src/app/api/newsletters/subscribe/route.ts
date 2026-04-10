import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createSubscribeToken } from "@/lib/newsletter-token"
import { sendTransactionalEmail, findSubscriberByEmail, createSubscriber } from "@/lib/listmonk"

const LISTMONK_CONFIRM_TEMPLATE_ID = parseInt(process.env.LISTMONK_CONFIRM_TEMPLATE_ID || "0")

export async function POST(request: NextRequest) {
  try {
    const { email, name, slugs } = await request.json()

    if (!email || !slugs || !Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json(
        { error: "Email and at least one newsletter selection are required" },
        { status: 400 },
      )
    }

    const emailNormalized = email.trim().toLowerCase()

    const newsletterLists = await prisma.newsletterList.findMany({
      where: { slug: { in: slugs }, active: true },
    })

    if (newsletterLists.length === 0) {
      return NextResponse.json({ error: "No valid newsletters selected" }, { status: 400 })
    }

    const token = createSubscribeToken(emailNormalized, name || "", slugs)
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const confirmUrl = `${baseUrl}/newsletters/confirm?token=${encodeURIComponent(token)}`

    if (LISTMONK_CONFIRM_TEMPLATE_ID > 0) {
      const existingSubscriber = await findSubscriberByEmail(emailNormalized).catch(() => null)

      if (!existingSubscriber) {
        await createSubscriber(emailNormalized, name || "", [], false).catch(() => {
          // Subscriber may already exist; that's fine
        })
      }

      await sendTransactionalEmail(emailNormalized, LISTMONK_CONFIRM_TEMPLATE_ID, {
        url: confirmUrl,
        lists: newsletterLists.map((l) => l.name),
      })
    }

    return NextResponse.json({
      success: true,
      message: "Please check your email to confirm your subscription.",
      // Include confirmUrl in dev for testing when no email template is configured
      ...(LISTMONK_CONFIRM_TEMPLATE_ID === 0 ? { confirmUrl } : {}),
    })
  } catch (err: unknown) {
    console.error("Newsletter subscribe error:", err)
    return NextResponse.json(
      { error: "Failed to process subscription request" },
      { status: 500 },
    )
  }
}
