/**
 * Restores legacy WordPress URLs lost in the Next.js rebuild.
 *
 *   npx tsx prisma/restore-legacy-pages.ts          # create/update missing entries
 *   npx tsx prisma/restore-legacy-pages.ts --force  # also overwrite content of existing rows
 *
 * Two kinds of entry:
 *   content  — recovered HTML from docs/recovered/<slug>.html (see
 *              scripts/recover-wayback-page.py), imported as a Page
 *   redirect — a legacy URL whose content now lives elsewhere on the new site
 *
 * Everything is created with status "disabled": present in the admin, no public
 * URL, nothing in the navigation. An editor reviews each one and switches it to
 * hidden or published from /admin/pages.
 *
 * Idempotent. By default an existing row's status, title and content are left
 * alone so it never clobbers editor changes; --force refreshes title/content
 * from disk but still never downgrades a status an editor has raised.
 */
import { PrismaClient } from "@prisma/client"
import { readFileSync } from "fs"
import { join } from "path"

const prisma = new PrismaClient()

type Entry = {
  slug: string
  title: string
  /** legacy URL content recovered to docs/recovered/<slug>.html */
  content?: true
  /** legacy URL that should redirect to an existing page on the new site */
  redirectTo?: string
  /** deliberate corrections to the original content, applied on every import */
  fixes?: [find: string, replace: string][]
  note?: string
}

const ENTRIES: Entry[] = [
  // --- recovered content -----------------------------------------------
  {
    slug: "beta-catchers-events",
    title: "Beta Catchers Events",
    content: true,
    fixes: [["demo.betacatcheres.com", "demo.betacatchers.com"]],
  },
  { slug: "hcomp-workshop", title: "Advancing Human Computation with Complexity Science", content: true },
  { slug: "nox", title: "Catchers who analyzed the NOX datasets", content: true },
  { slug: "media", title: "In the Media", content: true },
  {
    slug: "hybrid-intelligence-hackathon-for-alzheimers-research",
    title: "Hybrid Intelligence Hackathon for Alzheimer's Research",
    content: true,
  },
  {
    slug: "hybrid-intelligence-hackathon-for-alzheimers-research/hhai2023hackathon",
    title: "HHAI 2023 – Hackathon Details",
    content: true,
    note: "Slide images recovered from the original WordPress server; absent from the Wayback Machine.",
  },
  {
    slug: "hybrid-intelligence-hackathon-for-alzheimers-research/hhai2023registration",
    title: "Register for HHAI 2023 Hackathon",
    content: true,
    note: "Body is a Google Forms iframe; the form may be closed.",
  },

  // --- legacy URLs that now live elsewhere ------------------------------
  { slug: "civium", title: "Civium (legacy URL)", redirectTo: "/projects/civium" },
  { slug: "dream-catchers", title: "Dream Catchers (legacy URL)", redirectTo: "/projects/dream-catchers" },
  { slug: "crowdmeter", title: "CrowdMeter (legacy URL)", redirectTo: "/projects/crowdmeter" },
  { slug: "crowd2map-tanzania", title: "Crowd2Map Tanzania (legacy URL)", redirectTo: "/projects/crowd2map" },
  {
    slug: "support-the-human-computation-institute",
    title: "Support the Human Computation Institute (legacy URL)",
    redirectTo: "/donate",
    note: "Original page was only a PayPal donate button; /donate supersedes it.",
  },
]

/**
 * The recovered files carry a provenance comment and their own <h1>; the Page
 * renderer supplies the <h1> from the title, so strip the comment and demote
 * headings one level to keep a single <h1> and a sane hierarchy.
 */
function loadContent(entry: Entry): string {
  const raw = readFileSync(join(process.cwd(), "docs", "recovered", `${entry.slug}.html`), "utf8")
  let out = raw
    .replace(/^\s*<!--[\s\S]*?-->\s*/, "")
    .replace(/<(\/?)h3(\s|>)/g, "<$1h4$2")
    .replace(/<(\/?)h2(\s|>)/g, "<$1h3$2")
    .replace(/<(\/?)h1(\s|>)/g, "<$1h2$2")
    .trim()
  for (const [find, replace] of entry.fixes ?? []) out = out.split(find).join(replace)
  return out
}

async function main() {
  const force = process.argv.includes("--force")

  for (const entry of ENTRIES) {
    const content = entry.content ? loadContent(entry) : null
    const existing = await prisma.page.findUnique({ where: { slug: entry.slug } })

    if (!existing) {
      await prisma.page.create({
        data: {
          slug: entry.slug,
          title: entry.title,
          content,
          redirectTo: entry.redirectTo ?? null,
          status: "disabled",
          sortOrder: 0,
        },
      })
      console.log(`created  ${entry.slug.padEnd(62)} ${entry.redirectTo ? `redirect -> ${entry.redirectTo}` : `${content?.length ?? 0} bytes`}`)
    } else if (force) {
      await prisma.page.update({
        where: { slug: entry.slug },
        data: { title: entry.title, content, redirectTo: entry.redirectTo ?? null },
      })
      console.log(`refreshed ${entry.slug.padEnd(62)} (status left as "${existing.status}")`)
    } else {
      console.log(`skipped  ${entry.slug.padEnd(62)} (exists, status "${existing.status}")`)
    }

    if (entry.note) console.log(`         note: ${entry.note}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
