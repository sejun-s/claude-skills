#!/bin/sh
# usage: collect-run.sh <workdir>   → experiments/runs/<id>/ 로 산출물 복사 + qa.mjs 실행
set -e
W=$1; ID=$(basename "$W")
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
R="$ROOT/experiments/runs/$ID"
rm -rf "$R"; mkdir -p "$R"
(cd "$W" && find . -maxdepth 3 -type f ! -path './fonts/*' ! -path './node_modules/*' ! -name '*.woff2' | while read f; do mkdir -p "$R/$(dirname "$f")"; cp "$f" "$R/$f"; done)
mkdir -p "$R/fonts" && cp "$ROOT"/experiments/tools/fonts/*.woff2 "$R/fonts/" 2>/dev/null || true
node "$ROOT/experiments/tools/qa.mjs" "$R/index.html" --out "$R/qa" --impeccable | tee "$R/qa-summary.txt"
rm -rf "$R/fonts"   # 폰트는 커밋하지 않음
