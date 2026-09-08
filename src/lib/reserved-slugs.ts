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

export function validatePageSlug(slug: unknown): string | null {
  if (typeof slug !== "string" || slug.length === 0) {
    return "Slug is required"
  }
  if (!SLUG_PATTERN.test(slug)) {
    return "Slug must be lowercase letters, numbers, and hyphens only (e.g. \"my-page\")"
  }
  if (RESERVED_SLUGS.includes(slug)) {
    return `Slug "${slug}" is reserved by an existing site route and cannot be used for a page`
  }
  return null
}
