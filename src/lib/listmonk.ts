const LISTMONK_URL = process.env.LISTMONK_URL || "https://mail.hcinst.org"
const LISTMONK_API_USER = process.env.LISTMONK_API_USER || ""
const LISTMONK_API_TOKEN = process.env.LISTMONK_API_TOKEN || ""

function authHeaders(): HeadersInit {
  const credentials = Buffer.from(`${LISTMONK_API_USER}:${LISTMONK_API_TOKEN}`).toString("base64")
  return {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
  }
}

async function listmonkFetch(path: string, init?: RequestInit) {
  const url = `${LISTMONK_URL}${path}`
  const res = await fetch(url, {
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Listmonk API error ${res.status}: ${text}`)
  }
  return res.json()
}

export interface ListmonkList {
  id: number
  uuid: string
  name: string
  type: string
  optin: string
  status: string
  tags: string[]
  subscriber_count?: number
  created_at: string
  updated_at: string
}

export interface ListmonkSubscription {
  id: number
  name: string
  type: string
  uuid: string
  subscription_status: string
  subscription_created_at: string
  subscription_updated_at: string
}

export interface ListmonkSubscriber {
  id: number
  uuid: string
  email: string
  name: string
  status: string
  lists?: ListmonkSubscription[]
  attribs: Record<string, unknown>
  created_at: string
  updated_at: string
}

export async function getLists(): Promise<ListmonkList[]> {
  const data = await listmonkFetch("/api/lists?per_page=100&page=1")
  return data.data?.results || []
}

export async function getPublicLists(): Promise<{ uuid: string; name: string }[]> {
  const res = await fetch(`${LISTMONK_URL}/api/public/lists`)
  if (!res.ok) throw new Error(`Failed to fetch public lists: ${res.status}`)
  return res.json()
}

export async function findSubscriberByEmail(email: string): Promise<ListmonkSubscriber | null> {
  const query = encodeURIComponent(`subscribers.email = '${email}'`)
  const data = await listmonkFetch(`/api/subscribers?query=${query}&per_page=1`)
  const results = data.data?.results || []
  return results.length > 0 ? results[0] : null
}

export async function createSubscriber(
  email: string,
  name: string,
  listIds: number[],
  preconfirm = true,
): Promise<ListmonkSubscriber> {
  const data = await listmonkFetch("/api/subscribers", {
    method: "POST",
    body: JSON.stringify({
      email,
      name,
      status: "enabled",
      lists: listIds,
      preconfirm_subscriptions: preconfirm,
    }),
  })
  return data.data
}

export async function addSubscriberToLists(
  subscriberIds: number[],
  listIds: number[],
): Promise<void> {
  await listmonkFetch("/api/subscribers/lists", {
    method: "PUT",
    body: JSON.stringify({
      ids: subscriberIds,
      action: "add",
      target_list_ids: listIds,
      status: "confirmed",
    }),
  })
}

export async function removeSubscriberFromLists(
  subscriberIds: number[],
  listIds: number[],
): Promise<void> {
  await listmonkFetch("/api/subscribers/lists", {
    method: "PUT",
    body: JSON.stringify({
      ids: subscriberIds,
      action: "unsubscribe",
      target_list_ids: listIds,
    }),
  })
}

export async function sendTransactionalEmail(
  subscriberEmail: string,
  templateId: number,
  data: Record<string, unknown>,
): Promise<void> {
  await listmonkFetch("/api/tx", {
    method: "POST",
    body: JSON.stringify({
      subscriber_email: subscriberEmail,
      template_id: templateId,
      data,
      content_type: "html",
    }),
  })
}
