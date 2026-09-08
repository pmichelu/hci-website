// Idempotent migration for replacing Page.hidden (Boolean) with
// Page.status ("disabled" | "hidden" | "published").
//
// EXACT ORDERING (dev and production alike):
//   1. npx tsx prisma/migrate-page-status.ts dump
//        Reads `id, hidden` from the Page table via a raw query and writes
//        the mapping to /tmp/hci-page-status.json. If the `hidden` column is
//        already gone (push already ran) this step is a no-op.
//   2. npx prisma db push --accept-data-loss
//        Applies the new schema; this DROPS the `hidden` column, so the dump
//        MUST happen first. (This project uses `db push` only — never
//        `prisma migrate dev`/`reset`; migration history has drifted.)
//   3. npx prisma generate
//        Regenerates the client with the new fields.
//   4. npx tsx prisma/migrate-page-status.ts apply
//        Sets `status` from the dumped mapping: hidden=true -> "hidden",
//        hidden=false -> "published". Rows not present in the mapping (created
//        after the dump) keep the schema default "disabled". Safe to re-run.
//
// Mapping values: 1/true = hidden -> "hidden", 0/false = visible ->
// "published", anything else = unrecognised -> left at "disabled"
// (fail closed). The raw SQLite driver may return the boolean column as
// either 0/1 or JS booleans depending on the driver version.

import { PrismaClient } from "@prisma/client"
import { existsSync, readFileSync, writeFileSync } from "fs"

const MAPPING_FILE = "/tmp/hci-page-status.json"

const prisma = new PrismaClient()

async function dump() {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ id: string; hidden: number | boolean }>>(
      "SELECT id, hidden FROM Page",
    )
    const mapping: Record<string, number | boolean> = {}
    for (const row of rows) mapping[row.id] = row.hidden
    writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2))
    console.log(`Dumped ${rows.length} page(s) to ${MAPPING_FILE}`)
  } catch {
    console.log("Column Page.hidden not found — nothing to dump (safe to continue).")
  }
}

async function apply() {
  if (!existsSync(MAPPING_FILE)) {
    console.log(`No mapping file at ${MAPPING_FILE} — nothing to apply.`)
    return
  }
  const mapping = JSON.parse(readFileSync(MAPPING_FILE, "utf8")) as Record<string, number | boolean>
  let updated = 0
  for (const [id, hidden] of Object.entries(mapping)) {
    if (hidden === 1 || hidden === true) {
      await prisma.page.update({ where: { id }, data: { status: "hidden" } })
      updated++
    } else if (hidden === 0 || hidden === false) {
      await prisma.page.update({ where: { id }, data: { status: "published" } })
      updated++
    } else {
      console.log(`Skipping ${id}: unrecognised hidden value ${hidden} (leaving default "disabled")`)
    }
  }
  console.log(`Applied status to ${updated} page(s)`)
}

async function main() {
  const command = process.argv[2]

  if (command === "dump") {
    await dump()
  } else if (command === "apply") {
    await apply()
  } else {
    console.error("Usage: npx tsx prisma/migrate-page-status.ts <dump|apply>")
    process.exit(1)
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
