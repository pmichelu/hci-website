#!/usr/bin/env python3
"""
Full offline capture of the legacy WordPress Linode before it disappears.

That 2018-era Ubuntu box is the ONLY copy of the pre-rebuild content. It hosts
three sites (humancomputation.org, civium.io, crowdmeter.app) and is reachable
only over HTTP and an open MySQL port — no SSH key we hold is authorised — so
this captures everything through those two channels:

  1. every table of each site's database, as a restorable .sql dump
  2. the complete wp-content/uploads tree, mirrored via Apache directory indexes
  3. a rendered HTML snapshot of every published page and post, with plugin
     shortcodes expanded (index.php?page_id=<ID> / ?p=<ID>)
  4. a manifest plus SHA-256 checksums, and a README describing how to restore

Resumable: existing files of the right size are skipped, so it can be re-run
after an interruption.

    python3 scripts/archive-legacy-wordpress.py --dry-run   # size it up first
    python3 scripts/archive-legacy-wordpress.py

Destination defaults to ~/archives/humancomputation-legacy-wp-<date> and is
deliberately OUTSIDE this git repository: the dumps contain wp_users password
hashes and must not be committed.

Credentials come from the environment (see scripts/wp_source.py); WP_DB_NAME and
WP_HTTP_BASE are not used here because this walks all three sites.
"""
import argparse
import datetime
import hashlib
import json
import os
import re
import subprocess
import sys
import urllib.parse
from pathlib import Path

SITES = [
    {"domain": "humancomputation.org", "db": "wp01", "user": "wp01user"},
    {"domain": "civium.io", "db": "wp02", "user": "wp02user"},
    {"domain": "crowdmeter.app", "db": "wp03", "user": "wp03user"},
]

SKIP_INDEX = re.compile(r"^(?:\?|/|https?://)")


def host_and_password():
    host = os.environ.get("WP_DB_HOST")
    password = os.environ.get("WP_DB_PASS")
    if not host or not password:
        sys.exit("Set WP_DB_HOST and WP_DB_PASS (values are in the gitignored wpsites_server.txt).")
    return host, password


def base_url(host, domain):
    return f"http://{host}/{domain}/public_html"


def get(url, binary=False):
    out = subprocess.run(["curl", "-sf", "--max-time", "300", url], capture_output=True).stdout
    return out if binary else out.decode("utf-8", errors="replace")


# --------------------------------------------------------------------------- DB

def dump_database(host, password, site, dest, dry_run):
    import pymysql
    out = dest / f"{site['db']}-{site['domain']}.sql"
    conn = pymysql.connect(host=host, user=site["user"], password=password,
                           database=site["db"], connect_timeout=30, charset="utf8mb4")
    cur = conn.cursor()
    cur.execute("SHOW TABLES")
    tables = [r[0] for r in cur.fetchall()]
    if dry_run:
        total = 0
        for t in tables:
            cur.execute(f"SELECT COUNT(*) FROM `{t}`")
            total += cur.fetchone()[0]
        conn.close()
        print(f"  {site['db']}: {len(tables)} tables, {total} rows -> {out.name}")
        return None

    def literal(v):
        if v is None:
            return "NULL"
        if isinstance(v, (int, float)):
            return str(v)
        if isinstance(v, (bytes, bytearray)):
            return "0x" + v.hex()
        if isinstance(v, (datetime.datetime, datetime.date)):
            return "'" + str(v) + "'"
        return "'" + str(v).replace("\\", "\\\\").replace("'", "\\'").replace("\0", "") + "'"

    rows_written = 0
    with out.open("w", encoding="utf-8") as fh:
        fh.write(f"-- Legacy WordPress dump: {site['domain']} ({site['db']})\n")
        fh.write(f"-- Captured {datetime.datetime.now().isoformat(timespec='seconds')} "
                 f"from {host} via MySQL\n")
        fh.write("SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS=0;\n\n")
        for t in tables:
            cur.execute(f"SHOW CREATE TABLE `{t}`")
            fh.write(f"DROP TABLE IF EXISTS `{t}`;\n{cur.fetchone()[1]};\n\n")
            cur.execute(f"SELECT * FROM `{t}`")
            cols = [d[0] for d in cur.description]
            batch = []
            for row in cur:
                batch.append("(" + ",".join(literal(v) for v in row) + ")")
                rows_written += 1
                if len(batch) >= 200:
                    fh.write(f"INSERT INTO `{t}` (`" + "`,`".join(cols) + "`) VALUES\n"
                             + ",\n".join(batch) + ";\n")
                    batch = []
            if batch:
                fh.write(f"INSERT INTO `{t}` (`" + "`,`".join(cols) + "`) VALUES\n"
                         + ",\n".join(batch) + ";\n")
            fh.write("\n")
        fh.write("SET FOREIGN_KEY_CHECKS=1;\n")
    conn.close()
    print(f"  {site['db']}: {len(tables)} tables, {rows_written} rows, "
          f"{out.stat().st_size / 1e6:.1f} MB -> {out.name}")
    return out


# ---------------------------------------------------------------- uploads mirror

def crawl_index(url, prefix=""):
    """Walk Apache's directory indexes and yield (relative path, size-or-None)."""
    doc = get(url)
    for href, label in re.findall(r'<a href="([^"]+)">([^<]*)</a>', doc):
        if SKIP_INDEX.match(href) or href.startswith("?") or label.startswith("Parent"):
            continue
        rel = prefix + urllib.parse.unquote(href)
        if href.endswith("/"):
            yield from crawl_index(url + href, rel)
        else:
            yield rel


def upload_dirs_from_db(host, password, site):
    """The top-level uploads/ index is not listable (an index file blocks it), so
    seed the crawl from the directories WordPress records for its attachments."""
    import pymysql
    conn = pymysql.connect(host=host, user=site["user"], password=password,
                           database=site["db"], connect_timeout=30, charset="utf8mb4")
    cur = conn.cursor()
    cur.execute("SELECT meta_value FROM wp_postmeta WHERE meta_key='_wp_attached_file'")
    files = [r[0] for r in cur.fetchall()]
    conn.close()
    dirs, known = set(), set()
    for f in files:
        known.add(f)
        if "/" in f:
            parts = f.split("/")
            dirs.add("/".join(parts[:-1]) + "/")
    return dirs, known


def mirror_uploads(host, password, site, dest, dry_run):
    domain = site["domain"]
    base = base_url(host, domain) + "/wp-content/uploads/"
    root = dest / "uploads"

    seed_dirs, known = upload_dirs_from_db(host, password, site)
    # civium.io has uploads but no _wp_attached_file rows, so also probe the
    # year directories WordPress creates by convention.
    for year in range(2013, datetime.date.today().year + 1):
        if subprocess.run(["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}",
                           "--max-time", "20", f"{base}{year}/"],
                          capture_output=True, text=True).stdout.strip() == "200":
            seed_dirs.add(f"{year}/")

    files = set(crawl_index(base))          # works when the root is listable
    for d in sorted(seed_dirs):             # ... and covers it when it is not
        files.update(crawl_index(base + d, d))
    missing_from_index = known - files      # recorded in the DB but not listed
    files.update(missing_from_index)
    files = sorted(files)
    print(f"  {domain}: {len(files)} files in wp-content/uploads "
          f"({len(seed_dirs)} dirs seeded from the database, "
          f"{len(missing_from_index)} known only from the database)")
    if dry_run:
        return len(files), 0

    fetched = skipped = failed = 0
    total_bytes = 0
    for rel in files:
        target = root / rel
        if target.exists() and target.stat().st_size > 0:
            skipped += 1
            total_bytes += target.stat().st_size
            continue
        raw = get(base + urllib.parse.quote(rel), binary=True)
        if not raw:
            failed += 1
            print(f"    FAILED {rel}")
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(raw)
        fetched += 1
        total_bytes += len(raw)
        if fetched % 50 == 0:
            print(f"    ... {fetched} fetched, {total_bytes / 1e6:.0f} MB")
    print(f"  {domain}: {fetched} fetched, {skipped} already present, {failed} failed, "
          f"{total_bytes / 1e6:.1f} MB")
    return len(files), failed


# ------------------------------------------------------------- rendered content

def snapshot_rendered(host, password, site, dest, dry_run):
    import pymysql
    conn = pymysql.connect(host=host, user=site["user"], password=password,
                           database=site["db"], connect_timeout=30, charset="utf8mb4")
    cur = conn.cursor()
    cur.execute("SELECT ID, post_name, post_type FROM wp_posts WHERE post_status='publish' "
                "AND post_name<>'' AND post_type NOT IN "
                "('nav_menu_item','custom_css','attachment','revision') ORDER BY post_type, post_name")
    posts = cur.fetchall()
    conn.close()
    print(f"  {site['domain']}: {len(posts)} published items to render")
    if dry_run:
        return len(posts), 0

    out_dir = dest / "rendered"
    out_dir.mkdir(parents=True, exist_ok=True)
    base = base_url(host, site["domain"])
    written = failed = 0
    for post_id, name, post_type in posts:
        # Custom post types (employees, clients, projects, services, tmm, news)
        # 404 on a bare ?p=<ID>; WordPress needs the post_type in the query.
        if post_type == "page":
            query = f"page_id={post_id}"
        elif post_type == "post":
            query = f"p={post_id}"
        else:
            query = f"post_type={urllib.parse.quote(post_type)}&p={post_id}"
        doc = get(f"{base}/index.php?{query}")
        if not doc or len(doc) < 500:
            failed += 1
            print(f"    FAILED {post_type}/{name} (id {post_id})")
            continue
        safe = re.sub(r"[^A-Za-z0-9._-]", "_", f"{post_type}-{post_id}-{name}")[:120]
        (out_dir / f"{safe}.html").write_text(doc, encoding="utf-8")
        written += 1
    print(f"  {site['domain']}: {written} rendered, {failed} failed")
    return written, failed


# ------------------------------------------------------------------------- main

def checksums(dest):
    lines = []
    for path in sorted(p for p in dest.rglob("*") if p.is_file() and p.name != "SHA256SUMS"):
        h = hashlib.sha256()
        with path.open("rb") as fh:
            for chunk in iter(lambda: fh.read(1 << 20), b""):
                h.update(chunk)
        lines.append(f"{h.hexdigest()}  {path.relative_to(dest)}")
    (dest / "SHA256SUMS").write_text("\n".join(lines) + "\n", encoding="utf-8")
    return len(lines)


README = """# Legacy WordPress capture — humancomputation.org, civium.io, crowdmeter.app

Captured {when} from the pre-rebuild WordPress Linode ({host}) by
`scripts/archive-legacy-wordpress.py` in the hci-website repo.

That machine hosts the only copy of the pre-rebuild content. SSH is
publickey-only and no key we hold is authorised, so this capture was made over
the two channels that are open: MySQL on 3306 and Apache on 80. It exists
because the box is old, unmaintained, and one failure away from taking this
content with it.

## Contents

- `<db>-<domain>.sql` — complete dump of each site's database, all tables,
  restorable with `mysql <db> < <file>`. **Contains `wp_users` password hashes:
  keep this archive off version control and off shared storage.**
- `<domain>/uploads/` — full mirror of `wp-content/uploads`, including every
  WordPress-generated size variant.
- `<domain>/rendered/` — one HTML file per published page/post as WordPress
  actually renders it, named `<type>-<id>-<slug>.html`. These matter because
  several pages are built from plugin shortcodes (`[su_row]`, `[su_column]`,
  `[tmm]`, `[embedyt]`) that are meaningless outside a running WordPress: the
  stored `post_content` alone will not reproduce the page.
- `manifest.json` — per-site counts and failures from the capture run.
- `SHA256SUMS` — checksums for everything above.

## Notes for a future restore

- Pages are served on the legacy box only via the by-IP docroot path and query
  permalinks: `http://<host>/<domain>/public_html/index.php?page_id=<ID>`
  (`?p=<ID>` for posts). The name-based vhost 301s to https://humancomputation.org,
  which now points at the rebuilt Next.js site.
- Recovered content already imported into the new site lives in the repo under
  `docs/recovered/`, with images at `public/uploads/recovered/`. The remaining
  legacy URLs are listed by `python3 scripts/wp-inventory.py`.
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="report sizes without downloading")
    ap.add_argument("--dest", default=None)
    args = ap.parse_args()

    host, password = host_and_password()
    stamp = datetime.date.today().isoformat()
    dest = Path(args.dest or Path.home() / "archives" / f"humancomputation-legacy-wp-{stamp}")
    if not args.dry_run:
        dest.mkdir(parents=True, exist_ok=True)
    print(f"Destination: {dest}\n")

    manifest = {"captured": datetime.datetime.now().isoformat(timespec="seconds"),
                "host": host, "sites": {}}

    for site in SITES:
        print(f"== {site['domain']} ({site['db']})")
        site_dest = dest / site["domain"]
        if not args.dry_run:
            site_dest.mkdir(parents=True, exist_ok=True)
        entry = {}
        dump_database(host, password, site, dest, args.dry_run)
        n_files, failed_files = mirror_uploads(host, password, site, site_dest, args.dry_run)
        n_rendered, failed_rendered = snapshot_rendered(host, password, site, site_dest, args.dry_run)
        entry.update(uploads_files=n_files, uploads_failed=failed_files,
                     rendered=n_rendered, rendered_failed=failed_rendered)
        manifest["sites"][site["domain"]] = entry
        print()

    if args.dry_run:
        print("Dry run only — nothing written.")
        return

    (dest / "README.md").write_text(
        README.format(when=manifest["captured"], host=host), encoding="utf-8")
    (dest / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    n = checksums(dest)
    size = sum(p.stat().st_size for p in dest.rglob("*") if p.is_file())
    print(f"DONE  {n} files, {size / 1e6:.1f} MB in {dest}")


if __name__ == "__main__":
    main()
