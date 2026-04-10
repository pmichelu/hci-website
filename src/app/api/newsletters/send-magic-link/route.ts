import { NextRequest, NextResponse } from "next/server"
import { createManageToken } from "@/lib/newsletter-token"
import { sendTransactionalEmail, findSubscriberByEmail, createSubscriber } from "@/lib/listmonk"

const LISTMONK_MANAGE_TEMPLATE_ID = parseInt(process.env.LISTMONK_MANAGE_TEMPLATE_ID || "0")

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const emailNormalized = email.trim().toLowerCase()
    const token = createManageToken(emailNormalized)
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const manageUrl = `${baseUrl}/newsletters/manage?token=${encodeURIComponent(token)}`

    if (LISTMONK_MANAGE_TEMPLATE_ID > 0) {
      const existingSubscriber = await findSubscriberByEmail(emailNormalized).catch(() => null)

      if (!existingSubscriber) {
        await createSubscriber(emailNormalized, "", [], false).catch(() => {})
      }

      await sendTransactionalEmail(emailNormalized, LISTMONK_MANAGE_TEMPLATE_ID, {
        url: manageUrl,
      })
    }

    // Always return success to avoid leaking whether an email is subscribed
    return NextResponse.json({
      success: true,
      message: "If this email is in our system, you will receive a link to manage your subscriptions.",
      ...(LISTMONK_MANAGE_TEMPLATE_ID === 0 ? { manageUrl } : {}),
    })
  } catch (err: unknown) {
    console.error("Send magic link error:", err)
    return NextResponse.json({
      success: true,
      message: "If this email is in our system, you will receive a link to manage your subscriptions.",
    })
  }
}
