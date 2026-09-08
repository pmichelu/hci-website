"""
Shared access to the ORIGINAL WordPress site, which is still running on its old
Linode and is a far better recovery source than the Internet Archive:

  * MySQL (port 3306, open) holds the exact original `post_content` for every
    page and post, and the post IDs needed to render them.
  * Apache still serves the site: `index.php?page_id=<ID>` renders any page with
    plugin shortcodes expanded, and the whole `wp-content/uploads` tree is
    readable. Both only under the by-IP docroot path — the name-based vhost 301s
    to https://humancomputation.org, which now points at the new server.
  * Images the Wayback Machine never captured (all nine 2023 hackathon slides —
    verified absent from CDX and 404 from the archive) are here at full
    resolution.

Note on a correction: raw `post_content` looks much larger than recovered HTML
(the `nox` page is 46,073 chars stored vs ~16 KB recovered) but that gap is
WordPress markup, classes and inline styles, NOT lost content — the text is
identical, 881 words either way. Do not cite it as evidence of truncation.

Credentials are NOT stored in this repo. They live in the gitignored
`wpsites_server.txt` at the repo root; export them before running:

    export WP_DB_HOST=... WP_DB_USER=... WP_DB_PASS=... WP_DB_NAME=wp01
    export WP_HTTP_BASE=http://<ip>/humancomputation.org/public_html

This is a legacy machine kept only as a content source; treat it as read-only.
"""
import os
import re
import subprocess
import sys
from pathlib import Path

UPLOAD_DIR = Path("public/uploads/recovered")


def config():
    missing = [k for k in ("WP_DB_HOST", "WP_DB_USER", "WP_DB_PASS", "WP_HTTP_BASE") if not os.environ.get(k)]
    if missing:
        sys.exit(f"Missing environment variables: {', '.join(missing)}\n{__doc__}")
    return {
        "host": os.environ["WP_DB_HOST"],
        "user": os.environ["WP_DB_USER"],
        "password": os.environ["WP_DB_PASS"],
        "database": os.environ.get("WP_DB_NAME", "wp01"),
        "http_base": os.environ["WP_HTTP_BASE"].rstrip("/"),
    }


def connect(cfg):
    import pymysql
    return pymysql.connect(host=cfg["host"], user=cfg["user"], password=cfg["password"],
                           database=cfg["database"], connect_timeout=20, charset="utf8mb4")


BLOCK_TAGS = ("<p", "<div", "<ul", "<ol", "<li", "<h1", "<h2", "<h3", "<h4", "<h5", "<h6",
              "<table", "<thead", "<tbody", "<tr", "<td", "<th", "<figure", "<blockquote",
              "<pre", "<hr", "<form", "<iframe", "<section", "<article", "<style", "<script",
              "<img", "<a ", "<center")


def wpautop(text):
    """Approximate WordPress' wpautop: blank-line-separated chunks that do not
    already start with a block-level tag become paragraphs. Classic-editor
    content stores no <p> tags, so without this the page renders as one blob."""
    out = []
    for chunk in re.split(r"\n\s*\n", text):
        c = chunk.strip()
        if not c:
            continue
        if c.lower().startswith(BLOCK_TAGS):
            out.append(c)
        else:
            out.append("<p>" + c.replace("\n", "<br />\n") + "</p>")
    return "\n\n".join(out)


def clean(content):
    """Turn stored WordPress content into standalone HTML."""
    # Gutenberg block delimiters carry no meaning outside WordPress.
    content = re.sub(r"<!--\s*/?wp:[^>]*-->", "", content)
    # Inline <style> blocks would leak into the global page; site prose styles
    # cover the tables they were decorating.
    content = re.sub(r"<style[^>]*>.*?</style>", "", content, flags=re.S)
    content = re.sub(r"<script[^>]*>.*?</script>", "", content, flags=re.S)
    content = re.sub(r'\s+class="[^"]*"', "", content)
    content = re.sub(r"\n{3,}", "\n\n", content)
    return wpautop(content.strip())


def localise_images(content, http_base, verbose=True):
    """Download every asset the content references from the legacy server (or,
    for the media page's logo strip, from Google's CDN) into
    public/uploads/recovered/ and rewrite the reference. The new server has no
    wp-content tree (verified: 404), so unrescued images are broken images."""
    import hashlib
    wp = re.findall(r"https?://humancomputation\.org(/wp-content/uploads/[^\"'\s>)]+)", content)
    goog = re.findall(r"https://lh\d\.googleusercontent\.com/[^\"'\s>)]+", content)
    rescued, failed = [], []

    for path in sorted(set(wp)):
        name = re.sub(r"[^A-Za-z0-9._-]", "_", path.rsplit("/", 1)[-1])
        dest = UPLOAD_DIR / name
        if not dest.exists():
            raw = subprocess.run(["curl", "-sf", "--max-time", "180", http_base + path],
                                 capture_output=True).stdout
            if len(raw) < 100:
                failed.append(path)
                continue
            UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(raw)
        content = content.replace("https://humancomputation.org" + path, f"/uploads/recovered/{name}")
        content = content.replace("http://humancomputation.org" + path, f"/uploads/recovered/{name}")
        rescued.append(name)

    for url in sorted(set(goog)):
        stem = "logo-" + hashlib.sha1(url.encode()).hexdigest()[:10]
        existing = sorted(UPLOAD_DIR.glob(stem + ".*")) if UPLOAD_DIR.exists() else []
        if existing:
            name = existing[0].name
        else:
            raw = subprocess.run(["curl", "-sfL", "--max-time", "120", url], capture_output=True).stdout
            if len(raw) < 100:
                failed.append(url)
                continue
            ext = (".png" if raw[:8] == b"\x89PNG\r\n\x1a\n" else
                   ".jpg" if raw[:3] == b"\xff\xd8\xff" else
                   ".gif" if raw[:3] == b"GIF" else ".png")
            name = stem + ext
            UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
            (UPLOAD_DIR / name).write_bytes(raw)
        content = content.replace(url, f"/uploads/recovered/{name}")
        rescued.append(name)

    return content, rescued, failed
