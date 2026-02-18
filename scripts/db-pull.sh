#!/usr/bin/env bash
set -euo pipefail

REPO="RJForgie/tech-jobs-nz"
FILE_PATH="prod.db"
OUT_DIR="data"
OUT_FILE="$OUT_DIR/prod.db"
MIN_SIZE=1000000 # 1MB sanity check

mkdir -p "$OUT_DIR"

echo "Downloading prod.db from $REPO..."

if [ -n "${GITHUB_TOKEN:-}" ]; then
  # CI / Cloudflare Pages — use curl with PAT
  curl -sL \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3.raw" \
    "https://api.github.com/repos/$REPO/contents/$FILE_PATH" \
    -o "$OUT_FILE"
else
  # Local dev — use gh cli (inherits user's auth)
  gh api "repos/$REPO/contents/$FILE_PATH" \
    -H "Accept: application/vnd.github.v3.raw" \
    > "$OUT_FILE"
fi

# Sanity check
FILE_SIZE=$(wc -c < "$OUT_FILE" | tr -d ' ')
if [ "$FILE_SIZE" -lt "$MIN_SIZE" ]; then
  echo "Error: downloaded file is only ${FILE_SIZE} bytes (expected >1MB)" >&2
  echo "The download may have failed or returned an error response." >&2
  rm -f "$OUT_FILE"
  exit 1
fi

echo "Downloaded prod.db (${FILE_SIZE} bytes)"
