#!/bin/sh
# 사이트 폴더(index.html 포함)에 대해 기존 측정 도구를 한 번에 돌린다. 판정이 아니라 근거 수집이다.
# usage: check-site.sh <site_dir> [out_dir]
# 전제: Playwright 설치(PLAYWRIGHT_PATH), 사이트의 fonts/ 가 준비되어 있을 것(없으면 제목 측정이 무효 → heading-lines가 exit 3).
set -u
SITE=$(cd "$1" && pwd); OUT=${2:-$SITE/.check}; mkdir -p "$OUT"
H=$(cd "$(dirname "$0")/.." && pwd)            # web-ui-harness/website
R=$(cd "$H/.." && pwd)                          # web-ui-harness
PORT=${PORT:-8791}
node "$R/skills/web-ui-craft/scripts/serve.mjs" --root "$SITE" --port "$PORT" >"$OUT/serve.log" 2>&1 & SP=$!
trap 'kill $SP 2>/dev/null' EXIT; sleep 1.5
URL=http://127.0.0.1:$PORT/
echo "== 1/4 스윕 + 스크린샷 + Impeccable detect (qa.mjs) =="; node "$R/experiments/tools/qa.mjs" "$URL" --out "$OUT/qa" --impeccable 2>&1 | grep -v '^report:'
echo; echo "== 2/4 글자 크기 하한 =="; node "$H/scripts/min-text-size.mjs" "$URL" --widths 375,1440; S2=$?
echo; echo "== 3/4 제목 줄바꿈 (--keep 없이 줄 구성 확인; 폰트 미로드면 exit 3) =="; node "$R/skills/ko-heading-wrap/scripts/heading-lines.mjs" "$SITE/index.html" --selector "h1,h2,h3" 2>&1 | tail -14; S3=$?
echo; echo "== 4/4 사람이 볼 것 =="; echo "  $OUT/qa/shot-375.png, shot-1440.png, full-1440.png 을 직접 열어 checklists/review-gate.md 의 '시각' 항목을 확인하라."
echo; echo "요약: 글자 크기 하한 위반=$S2 (1이면 수정 필요). 나머지는 위 출력에서 결함 줄을 확인."
exit 0
