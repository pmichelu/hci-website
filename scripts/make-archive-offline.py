#!/usr/bin/env python3
"""
Makes an archived site's rendered HTML viewable after the legacy box is gone.

    python3 scripts/make-archive-offline.py <archive-site-dir>   # e.g. .../humancomputation.org

The rendered snapshots produced by archive-legacy-wordpress.py are faithful: they
still reference theme, plugin and WordPress-core assets by absolute URL on the
legacy host. Those URLs already 404 for humancomputation.org (the domain now
serves the rebuilt site) and will die entirely when the box is retired, leaving
the archived pages unstyled.

This writes a SEPARATE `rendered-offline/` tree alongside `rendered/`, with the
referenced assets downloaded into the site directory and the HTML rewritten to
root-relative paths. `rendered/` is left untouched as the faithful record.

View it with:

    cd <archive-site-dir> && python3 -m http.server 8899
    open http://localhost:8899/rendered-offline/

Credentials/base URL come from the environment — see scripts/wp_source.py.
"""
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import urljoin, urlparse

ASSET_RE = re.compile(r'''(?:href|src)=['"]([^'"]*(?:wp-content|wp-includes)[^'"]*)['"]''')


def fetch(url):
    return subprocess.run(["curl", "-sfL", "--max-time", "120", url], capture_output=True).stdout


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    site_dir = Path(sys.argv[1]).expanduser().resolve()
    rendered = site_dir / "rendered"
    if not rendered.is_dir():
        sys.exit(f"No rendered/ directory in {site_dir}")

    domain = site_dir.name
    host = sys.argv[2] if len(sys.argv) > 2 else None
    if not host:
        import os
        host = os.environ.get("WP_DB_HOST")
    if not host:
        sys.exit("Pass the legacy host as the 2nd argument or set WP_DB_HOST.")
    base = f"http://{host}/{domain}/public_html"

    out_dir = site_dir / "rendered-offline"
    out_dir.mkdir(exist_ok=True)

    wanted = set()
    for f in sorted(rendered.glob("*.html")):
        wanted |= {m for m in ASSET_RE.findall(f.read_text(encoding="utf-8", errors="replace"))}

    # Normalise every reference to a site-root-relative path.
    paths = set()
    for ref in wanted:
        p = urlparse(ref if ref.startswith("http") else urljoin(f"http://{domain}/", ref)).path
        if p:
            paths.add(p)

    print(f"{domain}: {len(paths)} distinct assets referenced by {len(list(rendered.glob('*.html')))} pages")

    saved = failed = skipped = 0
    css_files = []
    for p in sorted(paths):
        target = site_dir / p.lstrip("/")
        if target.exists() and target.stat().st_size > 0:
            skipped += 1
            if p.endswith(".css"):
                css_files.append(p)
            continue
        raw = fetch(base + p)
        if not raw:
            failed += 1
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(raw)
        saved += 1
        if p.endswith(".css"):
            css_files.append(p)
    print(f"  assets: {saved} downloaded, {skipped} already present, {failed} unavailable")

    # Fonts and images referenced from inside the stylesheets.
    extra = 0
    for css in css_files:
        f = site_dir / css.lstrip("/")
        text = f.read_text(encoding="utf-8", errors="replace")
        for ref in set(re.findall(r"url\(\s*['\"]?([^'\")]+)['\"]?\s*\)", text)):
            if ref.startswith(("data:", "http", "//")):
                continue
            p = urlparse(urljoin("http://x" + css, ref.split("?")[0])).path
            target = site_dir / p.lstrip("/")
            if target.exists():
                continue
            raw = fetch(base + p)
            if raw:
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(raw)
                extra += 1
    print(f"  stylesheet dependencies: {extra} downloaded")

    written = 0
    for f in sorted(rendered.glob("*.html")):
        html = f.read_text(encoding="utf-8", errors="replace")
        html = html.replace(base, "")
        html = re.sub(rf"https?://(?:www\.)?{re.escape(domain)}", "", html)
        html = re.sub(r"https?://web\.archive\.org/web/\d+(?:id_|im_)?/", "", html)
        (out_dir / f.name).write_text(html, encoding="utf-8")
        written += 1
    print(f"  rendered-offline/: {written} pages rewritten to root-relative paths")
    print(f"\nView: cd {site_dir} && python3 -m http.server 8899 "
          f"-> http://localhost:8899/rendered-offline/")


if __name__ == "__main__":
    main()
