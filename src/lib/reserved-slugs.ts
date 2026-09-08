// Top-level URL segments that a Page slug must never collide with.
// Derived from the first-level route directories under src/app/ plus
// public asset prefixes served outside the app router.
export const RESERVED_SLUGS: string[] = [
  // src/app/ route directories
  "about",
  "admin",
  "api",
  "blog",
  "donate",
  "newsletters",
  "projects",
  "publications",
  "videos",
  // asset / framework paths
  "uploads",
  "images",
  "_next",
  "favicon.ico",
]

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const MAX_SLUG_SEGMENTS = 3

export function validatePageSlug(slug: unknown): string | null {
  if (typeof slug !== "string" || slug.length === 0) {
    return "Slug is required"
  }
  // Slugs may be multi-segment to mirror legacy nested URLs
  // (e.g. "hybrid-intelligence-hackathon-for-alzheimers-research/hhai2023registration").
  if (slug.startsWith("/") || slug.endsWith("/")) {
    return "Slug must not start or end with a slash"
  }
  const segments = slug.split("/")
  if (segments.length > MAX_SLUG_SEGMENTS) {
    return `Slug must have at most ${MAX_SLUG_SEGMENTS} path segments`
  }
  if (segments.some((segment) => !SLUG_PATTERN.test(segment))) {
    return "Each slug segment must be lowercase letters, numbers, and hyphens only (e.g. \"my-page\" or \"legacy/path\")"
  }
  if (RESERVED_SLUGS.includes(segments[0])) {
    return `Slug "${segments[0]}" is reserved by an existing site route and cannot be used for a page`
  }
  return null
}
