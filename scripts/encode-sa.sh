#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 path/to/service-account.json"
  exit 1
fi
INPUT="$1"
if [ ! -f "$INPUT" ]; then
  echo "File not found: $INPUT"
  exit 2
fi
# Create base64 without newlines (portable)
if command -v base64 >/dev/null 2>&1; then
  base64 "$INPUT" | tr -d '\n' > "$INPUT.base64"
else
  # fallback (should exist on most systems)
  openssl base64 -in "$INPUT" -out "$INPUT.base64" -A
fi
printf "Wrote %s\n" "$INPUT.base64"
printf "Use the produced file content as value for GOOGLE_SERVICE_ACCOUNT_JSON (paste or use CLI to set secret).\n"