#!/bin/sh
# usage: new-run.sh <T1|T3|T5> <A|B|C> <n> [workroot]
# 격리된 작업 폴더를 만든다: brief.md, content.md, assets/, fonts/ 만 복사 (연구 노트·vocabulary·다른 run은 보이지 않게).
set -e
T=$1; C=$2; N=$3
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
WORK=${4:-${RUN_WORKROOT:-/tmp/claude-0/-home-user-claude-skills/44707535-7341-5401-9a40-8309df3e1da6/scratchpad/work}}
SRC=$(ls -d "$ROOT"/benchmarks/$T-*)
D="$WORK/$T-$C-$N"
rm -rf "$D"; mkdir -p "$D/fonts"
cp "$SRC/brief.md" "$SRC/content.md" "$D/"
[ -d "$SRC/assets" ] && cp -r "$SRC/assets" "$D/assets"
"$ROOT/experiments/tools/fetch-fonts.sh" >/dev/null
cp "$ROOT"/experiments/tools/fonts/*.woff2 "$D/fonts/"
echo "$D"
