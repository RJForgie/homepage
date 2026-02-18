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
  # Step 1: get the download URL (handles Git LFS files)
  API_RESPONSE=$(curl -sL \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$REPO/contents/$FILE_PATH")

  DOWNLOAD_URL=$(echo "$API_RESPONSE" | jq -r '.download_url')

  if [ -z "$DOWNLOAD_URL" ] || [ "$DOWNLOAD_URL" = "null" ]; then
    echo "Error: could not get download URL from GitHub API" >&2
    echo "$API_RESPONSE" >&2
    exit 1
  fi

  echo "Resolved download URL: ${DOWNLOAD_URL%%\?*}..."

  # Step 2: download the actual file (URL is already signed, no auth header needed)
  HTTP_CODE=$(curl -sL -w '%{http_code}' "$DOWNLOAD_URL" -o "$OUT_FILE")

  if [ "$HTTP_CODE" -ne 200 ]; then
    echo "Error: download returned HTTP $HTTP_CODE" >&2
    rm -f "$OUT_FILE"
    exit 1
  fi
else
  # Local dev — use gh cli (inherits user's auth)
  DOWNLOAD_URL=$(gh api "repos/$REPO/contents/$FILE_PATH" --jq '.download_url')
  gh api "$DOWNLOAD_URL" > "$OUT_FILE"
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
