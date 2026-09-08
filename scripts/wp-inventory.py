#!/usr/bin/env python3
"""
Inventory of everything published on the ORIGINAL WordPress site, cross-checked
against what the rebuilt site serves today. Use it to find content that was lost
in the migration.

    python3 scripts/wp-inventory.py            # pages + posts
    python3 scripts/wp-inventory.py --all      # include custom post types

Credentials come from the environment — see scripts/wp_source.py.
"""
import subprocess
import sys

from wp_source import config, connect

LIVE = "https://humancomputation.org"


def http_status(path):
    return subprocess.run(
        ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-L", "--max-time", "25", LIVE + path],
        capture_output=True, text=True).stdout.strip()


def main():
    cfg = config()
    types = ("page", "post") if "--all" not in sys.argv else None

    with connect(cfg) as conn:
        cur = conn.cursor()
        if types:
            cur.execute(
                "SELECT post_type, post_name, post_title, post_modified, CHAR_LENGTH(post_content) "
                "FROM wp_posts WHERE post_status='publish' AND post_type IN %s AND post_name<>'' "
                "ORDER BY post_type, post_name", (types,))
        else:
            cur.execute(
                "SELECT post_type, post_name, post_title, post_modified, CHAR_LENGTH(post_content) "
                "FROM wp_posts WHERE post_status='publish' AND post_name<>'' "
                "AND post_type NOT IN ('nav_menu_item','custom_css','attachment','revision') "
                "ORDER BY post_type, post_name")
        rows = cur.fetchall()

    print(f"{len(rows)} published items in the legacy WordPress database\n")
    print(f"{'TYPE':<10} {'SLUG':<58} {'CHARS':>7}  {'LIVE':<5} TITLE")
    print("-" * 130)
    lost = []
    for post_type, name, title, modified, length in rows:
        status = http_status("/" + name)
        if status != "200":
            lost.append((post_type, name, title, length, status))
        print(f"{post_type:<10} {name[:58]:<58} {length:>7}  {status:<5} {title[:40]}")

    print(f"\n{len(lost)} of {len(rows)} legacy URLs do not resolve on the new site:\n")
    for post_type, name, title, length, status in sorted(lost, key=lambda r: -r[3]):
        print(f"  [{status}] {post_type:<8} /{name:<56} {length:>7} chars  {title[:50]}")


if __name__ == "__main__":
    main()
