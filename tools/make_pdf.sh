#!/usr/bin/env bash
# Render the whitepaper pages to PDF with headless Chrome (local step; the PDFs are committed in site/whitepaper/).
#   bash tools/make_pdf.sh [BASE_URL]   (default http://localhost:8787, a running preview of the built site)
set -euo pipefail
BASE="${1:-http://localhost:8787}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
command -v google-chrome >/dev/null 2>&1 && CHROME="$(command -v google-chrome)"
command -v chromium >/dev/null 2>&1 && CHROME="$(command -v chromium)"
[ -x "$CHROME" ] || { echo "no Chrome/Chromium found; skipping PDF"; exit 0; }
mkdir -p "$ROOT/site/whitepaper"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=4000 --print-to-pdf="$ROOT/site/whitepaper/cookwala-whitepaper.pdf" "$BASE/whitepaper/" 2>/dev/null
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=4000 --print-to-pdf="$ROOT/site/whitepaper/cookwala-whitepaper-ar.pdf" "$BASE/ar/whitepaper/" 2>/dev/null
ls -la "$ROOT/site/whitepaper/"
