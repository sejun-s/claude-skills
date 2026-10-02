# Experiment Protocol v0.1 (STEP 2 — 환경)

Baseline A/B 실행 전에 측정 환경을 고정한다. 이 문서는 **측정 도구가 무엇을 재고 무엇을 못 재는지**를 정의한다. 디자인 품질 판정은 여기서 하지 않는다 (External Quality Signal 담당).

## 환경 (이 클라우드 세션에서 확인됨)
- Node v22.22, Playwright 1.56.1 (전역 `/opt/node-tools/node_modules/playwright`), Chromium `/opt/pw-browsers/chromium`. `playwright install` 금지.
- Chromium은 root에서 `--no-sandbox` 필요 → `tools/qa.mjs`가 내장, Impeccable용은 `tools/chrome-nosandbox.sh` (`IMPECCABLE_BROWSER`).
- 한국어 시스템 폰트가 사실상 없음(WenQuanYi Zen Hei만). jsDelivr CDN 차단. 한국어 측정은 Pretendard를 GitHub raw에서 받아 로컬 `@font-face`로 사용: `tools/fetch-fonts.sh` (OFL, 폰트 파일은 커밋하지 않음).
  → **모든 run은 같은 폰트로 렌더해야 하며, 폰트가 다르면 줄바꿈 결과를 비교할 수 없다.** 산출물이 CDN 폰트를 쓰면 이 환경에서는 로드되지 않으므로, 조건 A/B/C 모두 로컬 폰트 경로를 쓰도록 brief에 고정한다.

## tools/qa.mjs
`node tools/qa.mjs <file|url> --out <dir> [--sweep 320:1440:64] [--shots 320,375,768,1024,1440] [--impeccable]`

- DOM 스윕: 기본 320→1440, 64px 간격 + shot 폭(375 등) 포함. 스크린샷(viewport/fullPage)은 shot 폭에서만.
- 출력: `report.json`(defects + 폭별 raw), `shot-*.png`, `full-*.png`, 콘솔 요약.
- `--impeccable`: `npx impeccable detect --json`을 같은 대상에 실행해 `report.json`에 포함.

### 측정하는 것
| 체크 | 정의 | 비고 |
|------|------|------|
| horizontal-overflow | `scrollWidth > clientWidth+1` + 범위를 넘은 요소 상위 5개 | |
| clipped-text / ellipsis-truncated | `overflow-x:hidden|clip`이면서 `scrollWidth > clientWidth` | ellipsis는 의도일 수 있어 구분 |
| touch-target<24px | 상호작용 요소의 w 또는 h < 24 (WCAG 2.2 AA 최소) | 44px는 권고치라 별도 판정하지 않음 |
| korean-mid-word-break | Hangul 텍스트 노드에서 공백으로 구분된 어절이 두 줄에 걸침 | 글자별 Range rect로 측정 |
| korean-orphan-line | 2줄 이상이면서 마지막 줄이 ≤2글자 | 임계값은 임의. 조정 대상 |

### 측정하지 않는 것 (의도적, 한계)
- **대비, 오버랩, 시각적 무게/구성**: 미구현. 대비는 Impeccable `low-contrast`, 오버랩/구성은 STEP 5 failure 확인 후 결정.
- 한국어 줄바꿈은 **텍스트 노드 단위**. 인라인 태그(`<b>` 등)를 가로지르는 어절은 못 잡는다.
- mid-word-break 검출은 "keep-all이 맞는 선택인가"를 판정하지 않는다. 사실(어절이 쪼개짐)만 보고하고, 의도 여부는 Design Contract QA/사람이 본다. 긴 단일 어절이 폭을 넘어 어쩔 수 없이 쪼개지는 경우도 같은 결함으로 나온다.
- Hover/focus/상태/모션은 보지 않는다.

## 검증 (도구 자체)
`tools/fixtures/korean-wrap.html`로 확인함 (2026-10-02):
- `word-break:normal` 제목은 "이해|하는", "방|법" 등 실제 어절 중간에서 끊긴 폭에서 검출, `keep-all` 제목은 같은 폭들에서 0건 (스크린샷 768px로 육안 확인).
- 600px 고정 폭 요소 → 576px 이하에서 horizontal-overflow 검출 (Impeccable `detect`는 같은 종류 프로브에서 못 잡았음, `research/impeccable-feasibility.md`).
- 한계: 픽스처 1개. 실제 페이지에서의 오탐률은 미측정 → Baseline run에서 오탐을 수동 대조한다.

## 5초 테스트 (External Quality Signal — clear/trust 평가용)
2026-10-02 사용자 결정으로 평가 절차에 포함. 평가자 부담을 줄이기 위해 **blind pairwise 비교와 같은 세션에서 수행**한다.

절차
1. 각 산출물의 첫 viewport(1440×800, 375×812) 스크린샷 1장씩을 **5초만** 보여준다. 조건명/출처/브랜드 힌트는 가린다. 순서 랜덤화.
2. 5초 후 화면을 가리고 묻는다(자유 서술 2줄 이내):
   - Q1. 이 회사/제품은 무엇을 하는 곳인가?
   - Q2. 누구를 위한 것인가?
   - Q3. 다음에 무엇을 하겠는가?
   - Q4. 이 회사를 믿을 수 있는가? 한 문장으로 이유는?
3. 채점은 정답 기준(task별 `acceptance.md`에 사전 기록)과 대조: Q1~Q3은 정답/부분/오답, Q4는 **구체 증거를 언급했는가**(예/아니오)만 기록한다. 미적 호불호는 여기서 묻지 않는다.
4. 결과는 조건별로 집계하되 단일 평가자 결과는 **방향성 신호**로만 쓴다(통계적 주장 금지).

한계: 평가자가 사용자 한 명이면 task 내용을 이미 알고 있어 Q1~Q3이 오염된다. 가능하면 task 내용을 모르는 평가자 1~2명을 추가한다(사용자 결정 필요).
