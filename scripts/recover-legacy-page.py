#!/usr/bin/env python3
"""
PRIMARY recovery tool. Recovers a legacy page into docs/recovered/<slug>.html by
asking the ORIGINAL WordPress install to render it, then localising its images.

    python3 scripts/recover-legacy-page.py <wp-slug> [<output-slug>]

Why render rather than read the database: many pages use plugin shortcodes
([su_row], [su_column], [tmm], [embedyt] ...) that only WordPress can expand, so
raw `post_content` is not self-contained HTML. Verified 2026-09-08 on
/hcomp-workshop, whose stored content contains zero <img> tags but renders with
columns, a team-member card and two embedded videos.

Why not the Wayback Machine (scripts/recover-wayback-page.py, kept as a fallback
for when the legacy box is gone): it never captured many of the assets — all nine
2023 hackathon slide images are absent from CDX entirely — and it can only ever
show what a crawler happened to see. Its text, where captured, matches the
database exactly (verified on /nox: 881 words either way).

The legacy vhost 301s to https://humancomputation.org (now the new site), so
requests must go to the by-IP docroot path and through index.php with a query
permalink — pretty permalinks are not available there.

Credentials and base URL come from the environment — see scripts/wp_source.py.
"""
import html
import re
import subprocess
import sys
from pathlib import Path

from wp_source import config, connect, localise_images, wpautop

LOOKUP = ("SELECT ID, post_title, post_type, post_modified FROM wp_posts "
          "WHERE post_name=%s AND post_status='publish' AND post_type IN ('page','post') "
          "ORDER BY CHAR_LENGTH(post_content) DESC LIMIT 1")


def render(http_base, post_id, post_type):
    key = "page_id" if post_type == "page" else "p"
    url = f"{http_base}/index.php?{key}={post_id}"
    raw = subprocess.run(["curl", "-sf", "--max-time", "90", url], capture_output=True).stdout
    return url, raw.decode("utf-8", errors="replace")


def extract(doc):
    m = re.search(r'<div class="entry-content[^"]*">(.*?)</div>\s*<!--\s*\.entry-content', doc, re.S)
    if not m:
        m = re.search(r'<div class="entry-content[^"]*">(.*?)</div>\s*</(?:article|div)>', doc, re.S)
    if m:
        frag = m.group(1)
    else:
        b = re.search(r"<body[^>]*>(.*)</body>", doc, re.S)
        if not b:
            return None
        frag = b.group(1)
    frag = re.sub(r"<script.*?</script>|<style.*?</style>|<!--.*?-->", "", frag, flags=re.S)
    frag = re.sub(r'<div class="statcounter">.*?</div>', "", frag, flags=re.S)
    frag = re.sub(r"<noscript>.*?</noscript>", "", frag, flags=re.S)
    frag = re.sub(r'\s+data-saferedirecturl="[^"]*"', "", frag)
    frag = re.sub(r'\s+class="[^"]*"', "", frag)
    frag = re.sub(r'\s+(?:aria-level|style|decoding|srcset|sizes|loading)="[^"]*"', "", frag)
    frag = re.sub(r"</?span>", "", frag)
    # WordPress emits <th> for every cell in the agenda tables; <td> is correct.
    frag = re.sub(r"<(/?)th>", r"<\1td>", frag)
    frag = re.sub(r"<thead>|</thead>", "", frag)
    frag = re.sub(r"\n{3,}", "\n\n", frag)
    return frag.strip()


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    wp_slug = sys.argv[1].strip("/")
    out_slug = (sys.argv[2] if len(sys.argv) > 2 else wp_slug).strip("/")

    cfg = config()
    with connect(cfg) as conn:
        cur = conn.cursor()
        cur.execute(LOOKUP, (wp_slug,))
        row = cur.fetchone()
    if not row:
        sys.exit(f"No published page or post with slug {wp_slug!r}")
    post_id, title, post_type, modified = row

    url, doc = render(cfg["http_base"], post_id, post_type)
    if not doc:
        sys.exit(f"Legacy WordPress returned nothing for {url}")
    content = extract(doc)
    if not content:
        sys.exit(f"Could not locate content in the rendered output of {url}")
    content = wpautop(content)
    content, rescued, failed = localise_images(content, cfg["http_base"])

    out = Path("docs/recovered") / f"{out_slug}.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    header = (f"<!--\nRecovered content for the legacy WordPress page "
              f"https://humancomputation.org/{wp_slug}/\n"
              f"Source: original WordPress install, rendered from wp_posts ID {post_id} "
              f"({post_type}, last modified {modified}) — shortcodes expanded.\n"
              f"Original title: {html.unescape(title)!r}\n"
              f"WordPress classes and inline style/script stripped; images copied to "
              f"/uploads/recovered/.\n-->\n")
    out.write_text(header + content + "\n", encoding="utf-8")

    print(f"OK   {wp_slug:<56} -> {out}")
    print(f"     {len(content)} bytes, {len(rescued)} images"
          f"{', ' + str(len(failed)) + ' FAILED' if failed else ''}, title={html.unescape(title)!r}")
    for f in failed:
        print(f"     IMAGE FAILED: {f}")


if __name__ == "__main__":
    main()
