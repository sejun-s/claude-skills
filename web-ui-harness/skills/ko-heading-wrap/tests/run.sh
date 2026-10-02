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
