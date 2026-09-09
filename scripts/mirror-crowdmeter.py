#!/usr/bin/env python3
"""
Builds a self-contained static mirror of crowdmeter.app so it can be served from
the current infrastructure and the legacy WordPress box can be retired.

    python3 scripts/mirror-crowdmeter.py [--dest <dir>] [--drop-dead-form]

Why static is safe here: the site has not changed since 2022-08-23 and nothing on
it needs PHP, MySQL or WordPress.

By default the capture is FAITHFUL: nothing is edited except WordPress plumbing
and URL rewriting, because this is an archive of what the site was, and content
decisions belong to whoever rebuilds it.

Known staleness to address in any rebuild, not here:
  * the signup form POSTs to stallcatchers.us16.list-manage.com, and HCI no
    longer has a MailChimp subscription (they self-host listmonk at
    mail.hcinst.org), so it cannot work;
  * its button still reads "Notify me when you go live!" although the App Store
    and Play Store links sit directly above it;
  * `/index.php/about/`, `/contact/`, `/blog/`, `/sample-page/` and
    `/the-new-umoma-opens-its-doors-2/` are unedited theme demo pages.

Pass --drop-dead-form to swap the MailChimp block for a link to the CrowdMeter
project page (see REPLACEMENT_HTML), which is the minimum needed if this is ever
served publicly again as-is.

Note for a rebuild: a static form cannot post directly to listmonk's public
endpoint. mail.hcinst.org/subscription/form requires a per-page-load `nonce`, and
the only publicly exposed list there is a generic "Opt-in list" — there is no
CrowdMeter audience in listmonk at all (lists are 4 Stall Catchers, 7 Beta
Catchers, 8 PolyPlus, 9 HCH2-workshop), and the CrowdMeter project page on
humancomputation.org has no newsletterSlug set either.

Why URL fidelity matters: the CrowdMeter iOS and Android apps are published
(apps.apple.com/us/app/crowdmeter/id1581145687,
play.google.com/store/apps/details?id=org.hcinst.crowdmeterapp), and app-store
listings must point at a working privacy-policy URL. Both privacy URLs contain
the WordPress `/index.php/` prefix, so every published page is mirrored at its
exact original path:

    /                                                    (front page, ID 6)
    /index.php/crowdmeter-privacy-policy/
    /index.php/crowdmeter-privacy-policy-and-terms-of-use/
    ... and the remaining published pages, including the unused theme demo
        pages, so no URL that used to work starts 404ing.

Pages are fetched from the legacy WordPress by IP (its vhost 301s to
https://crowdmeter.app, whose certificate expired 2026-06-14), assets are
downloaded and rewritten to site-root-relative paths, and WordPress plumbing
(wp-json, xmlrpc, oEmbed, feeds, emoji loader, generator) is stripped.

Credentials come from the environment — see scripts/wp_source.py.
"""
import argparse
import os
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import urljoin, urlparse

from wp_source import config, connect

SITE = "crowdmeter.app"
DOCROOT = "/crowdmeter.app/public_html"

# WordPress head plumbing that has no meaning without WordPress behind it.
STRIP_PATTERNS = [
    r"<link rel='https://api\.w\.org/'[^>]*/>",
    r'<link rel="EditURI"[^>]*/>',
    r'<link rel="wlwmanifest"[^>]*/>\s*',
    r'<meta name="generator"[^>]*/>',
    r"<link rel='shortlink'[^>]*/>",
    r'<link rel="alternate" type="application/json\+oembed"[^>]*/>',
    r'<link rel="alternate" type="text/xml\+oembed"[^>]*/>',
    r'<link rel="alternate" type="application/rss\+xml"[^>]*/>',
    r"<link rel='dns-prefetch'[^>]*/>",
    r"<script[^>]*wp-emoji-release[^>]*></script>",
    r"<script type='text/javascript'>\s*window\._wpemojiSettings.*?</script>",
    r"<!-- This site is optimized with the Yoast SEO plugin.*?-->",
]


# The MailChimp block: the "<!-- Begin Mailchimp Signup Form -->" wrapper through
# its trailing validation scripts, plus the CDN stylesheet in the head.
MAILCHIMP_BLOCK = re.compile(
    r'<div id="mc_embed_signup".*?mc-validate\.js"></script><script type="text/javascript">.*?</script>',
    re.S)
MAILCHIMP_CSS = re.compile(r'<link href="//cdn-images\.mailchimp\.com[^>]*>\s*')
MAILCHIMP_STYLE = re.compile(r"<style type=\"text/css\">\s*#mc_embed_signup.*?</style>\s*", re.S)

# Change this if a real CrowdMeter mailing list is created in listmonk.
REPLACEMENT_HTML = """<div id="crowdmeter-updates" style="text-align:center;margin:1.5em 0;">
<p><a href="https://humancomputation.org/projects/crowdmeter/">Follow CrowdMeter at the Human Computation Institute</a></p>
</div>"""


def fetch(url, binary=False):
    out = subprocess.run(["curl", "-sfL", "--max-time", "120", url], capture_output=True).stdout
    return out if binary else out.decode("utf-8", errors="replace")


def published_items(cfg):
    with connect(cfg) as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT ID, post_name, post_type FROM wp_posts WHERE post_status='publish' "
            "AND post_name<>'' AND post_type IN ('page','post') ORDER BY ID")
        return cur.fetchall()


def output_path(dest, post_id, name, post_type, front_id):
    if post_id == front_id:
        return dest / "index.html", "/"
    # WordPress permalink structure on this site is /index.php/<slug>/
    rel = f"index.php/{name}/"
    return dest / rel / "index.html", "/" + rel


class Mirror:
    def __init__(self, cfg, dest, drop_dead_form=False):
        self.base = f"http://{cfg['host']}{DOCROOT}"
        self.dest = dest
        self.assets = {}      # site-root-relative path -> saved?
        self.failed = []
        self.form_replaced = False
        self.drop_dead_form = drop_dead_form

    def asset_url(self, path):
        return self.base + path

    def save_asset(self, path):
        """path is site-root-relative, e.g. /wp-content/themes/x/style.css"""
        clean = path.split("?")[0].split("#")[0]
        if clean in self.assets:
            return clean
        self.assets[clean] = False
        raw = fetch(self.asset_url(clean), binary=True)
        if not raw:
            self.failed.append(clean)
            return clean
        target = self.dest / clean.lstrip("/")
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(raw)
        self.assets[clean] = True
        # CSS can reference fonts and images of its own.
        if clean.endswith(".css"):
            self.follow_css(clean, raw.decode("utf-8", errors="replace"))
        return clean

    def follow_css(self, css_path, text):
        changed = text
        for ref in set(re.findall(r"url\(\s*['\"]?([^'\")]+)['\"]?\s*\)", text)):
            if ref.startswith("data:") or ref.startswith("http") or ref.startswith("//"):
                continue
            abs_path = urljoin("http://x" + css_path, ref.split("?")[0])
            rel = urlparse(abs_path).path
            self.save_asset(rel)
            changed = changed.replace(ref, rel)
        if changed != text:
            (self.dest / css_path.lstrip("/")).write_text(changed, encoding="utf-8")

    def rewrite(self, html):
        for pattern in STRIP_PATTERNS:
            html = re.sub(pattern, "", html, flags=re.S)
        # Dead MailChimp signup -> link to the project page (opt-in).
        if self.drop_dead_form and MAILCHIMP_BLOCK.search(html):
            html = MAILCHIMP_BLOCK.sub(REPLACEMENT_HTML, html)
            self.form_replaced = True
            html = MAILCHIMP_CSS.sub("", html)
            html = MAILCHIMP_STYLE.sub("", html)
        # Absolute self-references become root-relative. The pages are fetched
        # through the legacy box's by-IP docroot, so that form of the base URL
        # leaks into a few links (wp-admin, comment permalinks) and must go too.
        html = html.replace(self.base, "")
        html = re.sub(r"https?://(?:www\.)?crowdmeter\.app", "", html)
        # Download every local asset and drop cache-busting query strings.
        for ref in sorted(set(re.findall(r'(?:href|src)=[\'"](/wp-(?:content|includes)/[^\'"]+)[\'"]', html))):
            saved = self.save_asset(ref)
            html = html.replace(ref, saved)
        # Protocol-relative third-party assets (MailChimp CSS/JS) need a scheme.
        html = html.replace('href="//cdn-images.mailchimp.com', 'href="https://cdn-images.mailchimp.com')
        html = html.replace('src="//s3.amazonaws.com', 'src="https://s3.amazonaws.com')
        html = re.sub(r"\n{3,}", "\n\n", html)
        return html


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dest", default="build/crowdmeter.app")
    ap.add_argument("--drop-dead-form", action="store_true",
                    help="replace the dead MailChimp form with a project-page link")
    args = ap.parse_args()

    cfg = config()
    dest = Path(args.dest)
    dest.mkdir(parents=True, exist_ok=True)

    with connect(cfg) as conn:
        cur = conn.cursor()
        cur.execute("SELECT option_value FROM wp_options WHERE option_name='page_on_front'")
        front_id = int(cur.fetchone()[0])

    mirror = Mirror(cfg, dest, drop_dead_form=args.drop_dead_form)
    items = published_items(cfg)
    print(f"Mirroring {len(items)} published items (front page ID {front_id}) into {dest}\n")

    written = []
    for post_id, name, post_type in items:
        query = f"page_id={post_id}" if post_type == "page" else f"p={post_id}"
        doc = fetch(f"{mirror.base}/index.php?{query}")
        if not doc or len(doc) < 500:
            mirror.failed.append(f"page {post_id} ({name})")
            print(f"  FAILED  {post_type} {name} (id {post_id})")
            continue
        out, url = output_path(dest, post_id, name, post_type, front_id)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(mirror.rewrite(doc), encoding="utf-8")
        written.append(url)
        print(f"  {url:<58} <- {post_type} id {post_id}  ({out.stat().st_size} bytes)")

    # favicon and robots.txt, if the legacy site had them
    for extra in ("favicon.ico", "robots.txt"):
        raw = fetch(f"{mirror.base}/{extra}", binary=True)
        if raw and len(raw) > 10:
            (dest / extra).write_bytes(raw)
            print(f"  /{extra:<57} <- legacy file ({len(raw)} bytes)")

    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>',
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url in written:
        sitemap.append(f"  <url><loc>https://{SITE}{url}</loc></url>")
    sitemap.append("</urlset>")
    (dest / "sitemap.xml").write_text("\n".join(sitemap) + "\n", encoding="utf-8")

    print(f"\nMailChimp signup form replaced: {mirror.form_replaced}"
          f"{'' if args.drop_dead_form else '  (faithful capture; pass --drop-dead-form to replace it)'}")
    ok_assets = sum(1 for v in mirror.assets.values() if v)
    total = sum(p.stat().st_size for p in dest.rglob("*") if p.is_file())
    print(f"\n{len(written)} pages, {ok_assets} assets, {total / 1e6:.1f} MB")
    if mirror.failed:
        print(f"{len(mirror.failed)} FAILURES:")
        for f in mirror.failed:
            print("  ", f)
    else:
        print("no failures")


if __name__ == "__main__":
    main()
