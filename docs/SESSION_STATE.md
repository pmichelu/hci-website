# hci-website — session state

## Locked (2026-09-08)

- **Legacy WordPress content is recoverable from the Wayback Machine, not from `mysql-export.json`.**
  `mysql-export.json` (53 KB, at repo root) contains **no** `beta-catchers` rows — verified by grep. The
  WordPress pages that were dropped during the Next.js/admin-console rebuild must be pulled from
  `web.archive.org`. Useful queries:
  - `curl -s "https://web.archive.org/cdx/search/cdx?url=humancomputation.org&matchType=domain&output=text&fl=original&collapse=urlkey&filter=statuscode:200&from=2023&to=2025"`
  - raw page HTML: `curl -s "http://web.archive.org/web/<TIMESTAMP>id_/<URL>"` (the `id_` suffix strips
    the archive's injected banner/rewrites).

- **`/beta-catchers-events/` content recovered.** Cleaned, paste-ready HTML at
  `docs/recovered/beta-catchers-events.html`; raw provenance snapshot at
  `docs/recovered/beta-catchers-events.wayback-20240227.html`.
  Snapshots 2024-02-27, 2025-11-11 and 2026-03-13 are byte-identical (41,831 bytes), so the 2024 capture
  is the final published version. The page carried no images beyond the site logo — text and two agenda
  tables only. Original typo `demo.betacatcheres.com` corrected to `demo.betacatchers.com` in the clean copy.

- **Other legacy top-level URLs also 404 on the new site** (checked 2026-09-08 with `curl -L`):
  `/civium/`, `/dream-catchers/`, `/crowdmeter/`, `/crowd2map-tanzania/` — these have equivalents under
  `/projects/<slug>`, so only the old URLs are missing (redirect candidates).
  `/hcomp-workshop/`, `/hybrid-intelligence-hackathon-for-alzheimers-research/` (+ its two subpages),
  `/nox/`, `/media/`, `/support-the-human-computation-institute/` — content genuinely absent from the new
  site; recoverable the same way if wanted.

## Locked (2026-09-08) — generic Page content type

Decision: option (b), a real `Page` model plus a root `/[slug]` route. Rejected the alternative of
expressing standalone pages as `hidden = true` `Project` rows, because six-plus non-project legacy pages
would then be filed under `/projects/`. Existing hidden-project landing pages were deliberately NOT
migrated — out of scope.

- **Schema**: `Page { id, slug @unique, title, content (HTML from TipTap), hidden Boolean @default(true),
  navParent String?, sortOrder, createdAt, updatedAt }`.
  - `hidden = true` (the default) ⇒ absent from all navigation, still fully served at `/<slug>`. Hidden is a
    navigation property only; the public renderer never consults it.
  - `navParent` applies only when `hidden = false`: `"top" | "about" | "projects" | "publications"`
    (null/unknown ⇒ top level, inserted after Newsletters and before Donate).
- **Database workflow**: this project is maintained with `npx prisma db push`, **not** `prisma migrate dev`.
  The migration history has drifted — `prisma/migrations/20260408232256_init/` predates several live columns
  (`Project.imageFull`, `Project.newsletterHeading`, ...). Running `migrate dev` or `migrate reset` would
  attempt a destructive reconcile. Never run them here.
- **Reserved slugs**: `src/lib/reserved-slugs.ts` is the single source of truth, used by both the admin API
  and the admin forms. A Page slug colliding with a top-level route would be silently shadowed by the static
  route, so collisions are rejected with HTTP 400.
- **No redirect needed for legacy URLs** whose slug is reused verbatim: `/beta-catchers-events` is served
  directly by the new route at the original WordPress path.
- **Files**: `prisma/schema.prisma`, `src/lib/reserved-slugs.ts`, `src/app/[slug]/page.tsx`,
  `src/app/admin/pages/{page.tsx,PagesList.tsx,new/page.tsx,[id]/edit/page.tsx}`,
  `src/app/api/admin/[entity]/route.ts` + `[id]/route.ts` (entity key `pages`), `src/app/layout.tsx`,
  `src/components/Header.tsx`, `src/components/admin/AdminSidebar.tsx`.
- **Import script**: `npx tsx prisma/import-recovered-page.ts <slug> "<Title>"` reads
  `docs/recovered/<slug>.html`, strips the provenance comment, demotes headings by one level (the renderer
  supplies the `<h1>`), and upserts a hidden Page. Idempotent.
- **Verified locally 2026-09-08** (dev server): `/beta-catchers-events` 200 with both agenda tables and 22
  `<td>`s intact; absent from the home-page nav while hidden; appears in nav when flipped visible
  (`navParent: "top"` renders a top-level link; `"about"` populates the About dropdown, which the desktop
  header renders on hover, so it appears in the RSC payload rather than the initial HTML — expected);
  `/no-such-page` 404; `/`, `/about/mission`, `/projects`, `/blog`, `/videos` unaffected;
  `POST /api/admin/pages` with slug `about` rejected 400. `npm run build` clean.

## Deployed (2026-09-08)

Commit `bc53425` is live on 173.255.232.249. Deploy sequence used (the documented
`git pull && npm run build && pm2 restart` is NOT sufficient when the schema changes):

```
cp prisma/prod.db prisma/prod.db.bak-$(date +%Y%m%d-%H%M%S)   # backup kept: prod.db.bak-20260908-213412
git pull && npx prisma db push && npx prisma generate
npm run build
npx tsx prisma/import-recovered-page.ts beta-catchers-events "Beta Catchers Events"
pm2 restart hci-website
```

`db push` added the `Page` table only; no existing data touched. Verified in production: `/beta-catchers-events`
200 with 2 tables / 22 cells, header+footer present, zero references in the home-page nav; `/`,
`/about/mission`, `/projects`, `/blog`, `/videos`, `/newsletters`, `/donate` all 200; unknown slug 404s.

**SSH access note**: `sshpass` is not installed on the Mac and no SSH key is authorised for
`hcinst_user@173.255.232.249` (key auth returns "Permission denied (publickey,password)"), so deploys go
through an `expect` wrapper using the password in `.cursor/rules/deployment.mdc`. Installing
`~/.ssh/id_ed25519.pub` into the server's `authorized_keys` would remove that friction — not done, as it
changes server config.

## Locked (2026-09-08) — the ORIGINAL WordPress server is alive and is the best recovery source

The pre-rebuild WordPress install is still running on its own Linode and is a **better source than the
Internet Archive**. Access details are in the gitignored `wpsites_server.txt` at the repo root (host, DB
name `wp01`, DB user/password). Do not put those credentials in tracked files.

- **MySQL 3306 is open** and holds the exact original `post_content` plus post IDs. 58 published
  pages/posts survive.
- **Apache still renders the site**, but only via the by-IP docroot path with query permalinks:
  `http://<ip>/humancomputation.org/public_html/index.php?page_id=<ID>` (`?p=<ID>` for posts). The
  name-based vhost 301s to `https://humancomputation.org`, which now resolves to the new server, and
  `/?page_id=` without `index.php` 404s.
- **Rendering beats reading the database**: many pages use plugin shortcodes (`[su_row]`, `[su_column]`,
  `[tmm]`, `[embedyt]`) that only WordPress can expand. `/hcomp-workshop` stores zero `<img>` tags but
  renders with columns, a team-member card and two YouTube embeds.
- **`wp-content/uploads` is readable** under the same by-IP path. All nine 2023 hackathon slide images —
  which the Wayback Machine never captured at all (absent from CDX, 404 from the archive) — were recovered
  at full resolution from here.
- The new server has **no** WordPress leftovers (searched: only `/home/hcinst_user/hci-website`), and the
  old `wp-content` tree 404s on the new site, so every recovered image must be copied into
  `public/uploads/recovered/` and served from there.
- SSH to the legacy box is **publickey-only and none of the local keys are authorised** (root password auth
  refused). HTTP + MySQL are the available channels; that is sufficient.

### Trap: do not cite raw `post_content` length as evidence of archive truncation
An earlier session claimed the archive had truncated `/nox` because the DB row is 46,073 chars while the
recovered HTML is ~16 KB. That was wrong — it compared raw WordPress markup against cleaned HTML. Word-level
comparison shows **881 words in both**, 414 distinct capitalised tokens in both. The verified deficiencies of
the Wayback Machine here are uncaptured assets and unexpanded-by-crawler state, not text loss.

### Tooling
- `scripts/wp_source.py` — shared config (env vars), content cleaning, `wpautop`, image localisation.
- `scripts/recover-legacy-page.py <wp-slug> [<output-slug>]` — **primary** recovery: renders via the legacy
  WordPress, cleans, pulls images into `public/uploads/recovered/`, writes `docs/recovered/<slug>.html`.
- `scripts/recover-all.sh` — re-recovers the whole staged set; idempotent.
- `scripts/wp-inventory.py [--all]` — every published legacy page/post cross-checked against the live site.
- `scripts/recover-wayback-page.py` — fallback for when the legacy box is gone.
- `prisma/restore-legacy-pages.ts [--force]` — manifest-driven upsert into the `Page` table; creates
  everything `disabled`; never downgrades a status an editor raised; `fixes` array carries deliberate
  content corrections (currently the `demo.betacatcheres.com` typo) so they survive re-recovery.
  Supersedes the deleted `prisma/import-recovered-page.ts`.

### Legacy inventory result (2026-09-08)
58 published items in the legacy DB; **55 legacy URLs 404 on the new site**. Full listing:
`python3 scripts/wp-inventory.py`. Several have equivalents under new paths (`/mission` →
`/about/mission`, `/articles` → `/publications/articles`, `/staff` + `/core-team` → `/about/people`,
project pages → `/projects/<slug>`); the ~12 legacy blog posts have no home at all, because the new
`/blog` is just an outbound link. Staged so far (all `disabled` except `beta-catchers-events`, which is
`hidden`): `hcomp-workshop`, `nox`, `media`, the HHAI hackathon page + its two subpages, and redirect-only
entries for `civium`, `dream-catchers`, `crowdmeter`, `crowd2map-tanzania`,
`support-the-human-computation-institute`. Not yet touched: the microvolunteering set
(`microvolunteering-60-minute-session-diy`, `-30-minutes-diy`, `-15-minutes-session`, `supported-event`,
`msftleague`), `events`, `workshop`, `ecsa-irb-workshop`, `board-of-directors-2`, `briefs`, `tldr`,
`882-2` (21 KB, untitled), the duplicate `external-faculty` rows, and all legacy posts.

## Traps

- A stale `.next` directory (mixed `next build` + `next dev` artifacts) makes **every** dev route 404,
  including `/`. Fix: `rm -rf .next` and restart. Not a routing bug.
- `npx`/node on this machine needs the nvm path: `export PATH="$HOME/.nvm/versions/node/v20.19.6/bin:$PATH"`.
  `/usr/local/bin/node` is a broken old install.
- The bundled Next.js 16 App Router docs contain **no** explicit static-vs-dynamic route precedence
  statement (only the Pages Router API-routes doc does). Root-level `[slug]` not shadowing static siblings is
  established empirically here, so re-test it after any Next.js upgrade.
- `old_chats/` is untracked and contains historical chat logs; keep it out of commits.

## Open questions

- Remaining lost legacy pages (`/hcomp-workshop/`, the HHAI hackathon page + `hhai2023hackathon` and
  `hhai2023registration` subpages, `/nox/`, `/media/`, `/support-the-human-computation-institute/`) are not
  yet recovered or imported.
- `/civium/`, `/dream-catchers/`, `/crowdmeter/`, `/crowd2map-tanzania/` still 404; their content lives at
  `/projects/<slug>`, so they want redirects in `next.config.ts`. Not yet added.
- Page slug changes silently break the old URL (no redirect bookkeeping). Acceptable for now.
