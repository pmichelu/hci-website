/**
 * Imports a recovered legacy WordPress page from docs/recovered/<slug>.html
 * into the Page table as a hidden page (reachable at /<slug>, absent from nav).
 *
 * Usage:  npx tsx prisma/import-recovered-page.ts <slug> "<Page Title>"
 * Idempotent: upserts on slug.
 *
 * The recovered HTML file keeps a provenance comment at the top and its own
 * <h1>; the Page renderer already prints the title as the page <h1>, so the
 * comment is stripped and the heading levels are demoted by one to keep a
 * single <h1> and a sane hierarchy.
 */
import { PrismaClient } from "@prisma/client"
import { readFileSync } from "fs"
import { join } from "path"

const prisma = new PrismaClient()

async function main() {
  const [slug, title] = process.argv.slice(2)
  if (!slug || !title) {
    console.error('Usage: npx tsx prisma/import-recovered-page.ts <slug> "<Page Title>"')
    process.exit(1)
  }

  const file = join(process.cwd(), "docs", "recovered", `${slug}.html`)
  let html = readFileSync(file, "utf8")

  html = html.replace(/^\s*<!--[\s\S]*?-->\s*/, "")
  html = html
    .replace(/<(\/?)h3(\s|>)/g, "<$1h4$2")
    .replace(/<(\/?)h2(\s|>)/g, "<$1h3$2")
    .replace(/<(\/?)h1(\s|>)/g, "<$1h2$2")

  const content = html.trim()

  const page = await prisma.page.upsert({
    where: { slug },
    update: { title, content },
    create: { title, slug, content, hidden: true, sortOrder: 0 },
  })

  console.log(`Imported ${content.length} bytes -> page "${page.title}" at /${page.slug} (hidden: ${page.hidden})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
