import crypto from "crypto"

const SECRET = process.env.NEWSLETTER_SECRET || process.env.AUTH_SECRET || "fallback-secret"
const TOKEN_EXPIRY_HOURS = 24

interface SubscribePayload {
  type: "subscribe"
  email: string
  name: string
  listSlugs: string[]
  exp: number
}

interface ManagePayload {
  type: "manage"
  email: string
  exp: number
}

type TokenPayload = SubscribePayload | ManagePayload

function sign(payload: TokenPayload): string {
  const json = JSON.stringify(payload)
  const data = Buffer.from(json).toString("base64url")
  const hmac = crypto.createHmac("sha256", SECRET).update(data).digest("base64url")
  return `${data}.${hmac}`
}

function verify(token: string): TokenPayload | null {
  const parts = token.split(".")
  if (parts.length !== 2) return null

  const [data, hmac] = parts
  const expectedHmac = crypto.createHmac("sha256", SECRET).update(data).digest("base64url")

  if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
    return null
  }

  try {
    const payload: TokenPayload = JSON.parse(Buffer.from(data, "base64url").toString())
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function createSubscribeToken(email: string, name: string, listSlugs: string[]): string {
  return sign({
    type: "subscribe",
    email,
    name,
    listSlugs,
    exp: Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
  })
}

export function createManageToken(email: string): string {
  return sign({
    type: "manage",
    email,
    exp: Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
  })
}

export function verifySubscribeToken(token: string): { email: string; name: string; listSlugs: string[] } | null {
  const payload = verify(token)
  if (!payload || payload.type !== "subscribe") return null
  return { email: payload.email, name: payload.name, listSlugs: payload.listSlugs }
}

export function verifyManageToken(token: string): { email: string } | null {
  const payload = verify(token)
  if (!payload || payload.type !== "manage") return null
  return { email: payload.email }
}
