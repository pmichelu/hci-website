#!/usr/bin/env python3
"""
Recover a lost legacy WordPress page from the Internet Archive into
docs/recovered/<slug>.html, cleaned and ready for the admin rich-text editor.

Usage: python3 scripts/recover-wayback-page.py <path> [<slug>]
  <path>  original WordPress path, e.g. hcomp-workshop
          or hybrid-intelligence-hackathon-for-alzheimers-research/hhai2023registration
  <slug>  output slug (defaults to <path>)

Picks the NEWEST snapshot that is still the WordPress page. This matters: for
paths the rebuilt site now 404s, recent snapshots capture the Next.js
"This page could not be found" page instead of the original content.
"""
import hashlib
import html
import re
import subprocess
import sys
from pathlib import Path

CDX = ("https://web.archive.org/cdx/search/cdx?url=humancomputation.org/{path}"
       "&output=text&fl=timestamp,statuscode&collapse=digest&filter=statuscode:200")


def snapshots(path):
    """CDX exact-match is sensitive to the trailing slash and pages are archived
    inconsistently, so query both spellings and merge."""
    stamps = []
    for variant in (path, path + "/"):
        out = fetch(CDX.format(path=variant))
        stamps += [l.split()[0] for l in out.strip().splitlines() if l.strip() and l.split()[0].isdigit()]
    return sorted(set(stamps))


def fetch(url):
    # Binary + explicit decode: some archived responses come back gzipped or in
    # a legacy encoding, which text=True cannot handle.
    raw = subprocess.run(["curl", "-sL", "--compressed", "--max-time", "60", url],
                         capture_output=True).stdout
    if raw[:2] == b"\x1f\x8b":
        import gzip
        try:
            raw = gzip.decompress(raw)
        except OSError:
            pass
    return raw.decode("utf-8", errors="replace")


def is_wordpress_page(doc):
    if "could not be found" in doc or "next-error" in doc:
        return False
    return "entry-content" in doc or "wp-content" in doc


def extract(doc):
    m = re.search(r'<div class="entry-content[^"]*">(.*?)</div>\s*<!--\s*\.entry-content', doc, re.S)
    if not m:
        m = re.search(r'<div class="entry-content[^"]*">(.*?)</div>\s*</(?:article|div)>', doc, re.S)
    if m:
        frag = m.group(1)
    else:
        # Custom page templates (e.g. the HHAI hackathon pages) have no
        # entry-content wrapper: the whole body IS the content.
        b = re.search(r"<body[^>]*>(.*)</body>", doc, re.S)
        if not b:
            return None
        frag = b.group(1)
        frag = re.sub(r'<div class="statcounter">.*?</div>', "", frag, flags=re.S)
        frag = re.sub(r"<noscript>.*?</noscript>", "", frag, flags=re.S)
    frag = re.sub(r"<script.*?</script>|<style.*?</style>|<!--.*?-->", "", frag, flags=re.S)
    # Strip archive rewriting and WordPress/Google editor cruft.
    frag = re.sub(r"https?://web\.archive\.org/web/\d+(?:id_|im_)?/", "", frag)
    frag = re.sub(r'\s+data-saferedirecturl="[^"]*"', "", frag)
    frag = re.sub(r'\s+class="[^"]*"', "", frag)
    frag = re.sub(r'\s+aria-level="[^"]*"', "", frag)
    frag = re.sub(r'\s+style="[^"]*"', "", frag)
    # <span> with no attributes left carries no meaning.
    frag = re.sub(r"</?span>", "", frag)
    # WordPress emits <th> for every cell in these agenda tables; <td> is correct.
    frag = re.sub(r"<(/?)th>", r"<\1td>", frag)
    frag = re.sub(r"<thead>|</thead>", "", frag)
    frag = re.sub(r"\n{3,}", "\n\n", frag)
    return frag.strip()


UPLOAD_DIR = Path("public/uploads/recovered")


def rescue_images(frag, ts):
    """Download every wp-content/uploads asset from the archive into
    public/uploads/recovered/ and rewrite references to /uploads/recovered/<file>.
    The old wp-content tree is gone from the server (verified: 404), so without
    this every image on a recovered page is broken."""
    wp = re.findall(r"https?://humancomputation\.org/wp-content/uploads/[^\"'\s>)]+", frag)
    # Logo strips on the media page are hotlinked from Google's CDN; localise
    # them too so the page does not depend on someone else's storage.
    goog = re.findall(r"https://lh\d\.googleusercontent\.com/[^\"'\s>)]+", frag)
    rescued, failed = [], []
    for url in sorted(set(wp + goog)):
        is_goog = "googleusercontent.com" in url
        if is_goog:
            stem = "logo-" + hashlib.sha1(url.encode()).hexdigest()[:10]
        else:
            stem = re.sub(r"[^A-Za-z0-9._-]", "_", url.rsplit("/", 1)[-1])
        fetch_url = url if is_goog else f"http://web.archive.org/web/{ts}im_/{url}"
        existing = sorted(UPLOAD_DIR.glob(stem + ".*")) if UPLOAD_DIR.exists() else []
        if existing:
            name = existing[0].name
        else:
            raw = subprocess.run(["curl", "-sL", "--max-time", "120", fetch_url],
                                 capture_output=True).stdout
            if len(raw) < 200 or raw[:15].lower().startswith(b"<!doctype html"):
                failed.append(url)
                continue
            ext = (".png" if raw[:8] == b"\x89PNG\r\n\x1a\n" else
                   ".jpg" if raw[:3] == b"\xff\xd8\xff" else
                   ".gif" if raw[:3] == b"GIF" else
                   ".webp" if raw[8:12] == b"WEBP" else
                   Path(stem).suffix or ".png")
            name = stem if Path(stem).suffix else stem + ext
            UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
            (UPLOAD_DIR / name).write_bytes(raw)
        frag = frag.replace(url, f"/uploads/recovered/{name}")
        rescued.append(name)
    return frag, rescued, failed


def page_title(doc):
    m = re.search(r"<title>(.*?)</title>", doc, re.S)
    if not m:
        return None
    t = html.unescape(re.sub(r"\s+", " ", m.group(1))).strip()
    return re.sub(r"\s*[–|-]\s*Human Computation Institute\s*$", "", t)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    path = sys.argv[1].strip("/")
    slug = (sys.argv[2] if len(sys.argv) > 2 else path).strip("/")

    stamps = snapshots(path)
    if not stamps:
        print(f"NO SNAPSHOTS for {path}")
        sys.exit(2)

    for ts in reversed(stamps):
        doc = fetch(f"http://web.archive.org/web/{ts}id_/https://humancomputation.org/{path}/")
        if not is_wordpress_page(doc):
            continue
        content = extract(doc)
        if not content:
            continue
        content, rescued, failed = rescue_images(content, ts)
        out = Path("docs/recovered") / f"{slug}.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        header = (f"<!--\nRecovered content for the legacy WordPress page "
                  f"https://humancomputation.org/{path}/\n"
                  f"Source: Wayback Machine snapshot {ts} "
                  f"(http://web.archive.org/web/{ts}/https://humancomputation.org/{path}/)\n"
                  f"Newest snapshot of {len(stamps)} that still holds the WordPress page.\n"
                  f"Cleaned of WordPress/Google editor cruft and archive URL rewriting.\n-->\n")
        out.write_text(header + content + "\n", encoding="utf-8")
        print(f"OK   {path}  snapshot={ts}  title={page_title(doc)!r}  bytes={len(content)}  "
              f"images={len(rescued)} failed={len(failed)}  -> {out}")
        for u in failed:
            print(f"     IMAGE FAILED: {u}")
        return
    print(f"FAIL {path}: no snapshot among {len(stamps)} contained WordPress content")
    sys.exit(3)


if __name__ == "__main__":
    main()
