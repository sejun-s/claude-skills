#!/bin/sh
# 회귀 테스트: 알려진 픽스처에서 검사기가 기대한 결함을 내는지 확인한다.
set -e
D=$(cd "$(dirname "$0")/.." && pwd)
OUT=$(node "$D/scripts/heading-lines.mjs" "$D/tests/fixture.html" --keep "신규가입혜택,가입하기전에" --widths 320,768 --selector "h1,h2" || true)
echo "$OUT"
echo "$OUT" | grep -q "쪼개짐: 신규가입혜택" || { echo "FAIL: 쪼개진 구를 못 찾음"; exit 1; }
echo "$OUT" | grep -q "가로 넘침" || { echo "FAIL: 가로 넘침을 못 찾음"; exit 1; }
NK=$(node "$D/scripts/heading-lines.mjs" "$D/tests/fixture.html" --widths 320 --selector "h1,h2" || true)
echo "$NK" | grep -q "미검사(--keep 없음)" || { echo "FAIL: --keep 없음 안내가 없음"; exit 1; }
echo "PASS"
# --- v0.3 회귀 (GPT QA 2026-10-02 지적 재현) ---
M="$D/scripts/heading-lines.mjs"
O=$(node "$M" "$D/tests/fixture-mixed.html" --keep "신규가입혜택" --widths 800 2>&1 || true)
echo "$O" | grep -q "✗ 쪼개짐" && { echo "FAIL: 글자 크기가 섞인 한 줄을 여러 줄로 오판정"; exit 1; }
node "$M" "$D/tests/fixture-mixed.html" --widths 800 --json 2>/dev/null | node -e 'JSON.parse(require("fs").readFileSync(0,"utf8"))' || { echo "FAIL: --json이 유효한 JSON이 아님"; exit 1; }
O=$(node "$M" "$D/tests/fixture-mixed.html" --keep "없는구" --widths 800 2>&1 || true)
echo "$O" | grep -q "찾지 못한 구" || { echo "FAIL: 못 찾은 구를 보고하지 않음"; exit 1; }
RC=0; node "$M" "$D/tests/fixture-mixed.html" --keep "없는구" --strict-keep --widths 800 >/dev/null 2>&1 || RC=$?; [ $RC -eq 4 ] || { echo "FAIL: --strict-keep이 exit 4가 아님"; exit 1; }
RC=0; node "$M" "$D/tests/fixture-nofont.html" --widths 800 >/dev/null 2>&1 || RC=$?; [ $RC -eq 3 ] || { echo "FAIL: 웹폰트 미로드를 exit 3으로 알리지 않음"; exit 1; }
echo "PASS v0.3"
