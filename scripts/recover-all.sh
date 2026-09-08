#!/usr/bin/env bash
# Re-recovers every legacy page currently staged in the admin, from the original
# WordPress install. Idempotent: rewrites docs/recovered/*.html and re-uses any
# image already present in public/uploads/recovered/.
#
# Requires the legacy-server environment variables (see scripts/wp_source.py);
# the values live in the gitignored wpsites_server.txt at the repo root.
#
#   export WP_DB_HOST=... WP_DB_USER=... WP_DB_PASS=... WP_DB_NAME=wp01
#   export WP_HTTP_BASE=http://<ip>/humancomputation.org/public_html
#   ./scripts/recover-all.sh
set -euo pipefail
cd "$(dirname "$0")/.."

run() { PYTHONPATH=scripts python3 scripts/recover-legacy-page.py "$@"; }

HHAI=hybrid-intelligence-hackathon-for-alzheimers-research

run beta-catchers-events
run hcomp-workshop
run nox
run media
run "$HHAI"
run hhai2023hackathon   "$HHAI/hhai2023hackathon"
run hhai2023registration "$HHAI/hhai2023registration"
run support-the-human-computation-institute
