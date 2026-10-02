#!/bin/sh
# Pretendard (SIL OFL 1.1, https://github.com/orioncactus/pretendard) — 한국어 측정용 로컬 폰트.
# CDN(jsDelivr)이 이 환경에서 차단되어 GitHub raw에서 직접 받는다. 폰트 파일은 커밋하지 않는다.
set -e
cd "$(dirname "$0")/fonts"
B=https://raw.githubusercontent.com/orioncactus/pretendard/main
for w in Regular Medium SemiBold Bold; do
  [ -s Pretendard-$w.woff2 ] || curl -sS -fL -o Pretendard-$w.woff2 $B/packages/pretendard/dist/web/static/woff2/Pretendard-$w.woff2
done
[ -s LICENSE ] || curl -sS -fL -o LICENSE $B/LICENSE
ls -la
