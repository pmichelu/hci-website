// Publication status for the Page content type.
//
// - "disabled":  exists in the admin only. The public URL returns 404 and the
//                page appears in no navigation surface. Default for new pages.
// - "hidden":    served at /<slug> (200) but absent from navigation.
// - "published": served at /<slug> (200) and listed in navigation per navParent.
//
// Unrecognised values are treated as "disabled" (fail closed — a bad value
// must never expose content).

export const PAGE_STATUSES = ["disabled", "hidden", "published"] as const

export type PageStatus = (typeof PAGE_STATUSES)[number]

export function isPageStatus(value: unknown): value is PageStatus {
  return typeof value === "string" && (PAGE_STATUSES as readonly string[]).includes(value)
}

export function normalizePageStatus(value: unknown): PageStatus {
  return isPageStatus(value) ? value : "disabled"
}

// Validates the redirectTo field: when present it must be a site-relative
// path starting with "/" or an absolute http(s):// URL. Returns an error
// message or null. Callers should normalise "" to null before storing.
export function validateRedirectTo(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null
  if (typeof value !== "string") {
    return "Redirect target must be a string"
  }
  if (value.startsWith("/") || /^https?:\/\//.test(value)) return null
  return 'Redirect target must be a site-relative path starting with "/" or an absolute http(s):// URL'
}
