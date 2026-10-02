# claude-skill-playwright-browser (AndyShiu)

- Repo / commit: https://github.com/AndyShiu/claude-skill-playwright-browser @ 2b1b528 (2026-09-26)
- 조사일: 2026-10-02
- 한 줄 요약: Claude Code skill(SKILL.md + 628줄 `scripts/pw.mjs` CLI). 스크린샷 / 감사(audit) / 베이스라인 diff / 스크립트 플로우. 레이아웃 검사는 얕음(overflow, 11px 미만 텍스트 수, 24px 미만 타깃 수). MIT.

## 구조
- `SKILL.md` — 언제 Chrome 대신 이 skill을 쓸지, 커맨드(`inspect|shot|audit|run|login|diff`), 해석 가이드
- `scripts/pw.mjs` — 단일 CLI. 뷰포트 프리셋 `:110-113` (desktop 1440x900, laptop, tablet 768, mobile 390), `layoutCheck` `:228-243`, axe `:293`, pixelmatch 베이스라인 diff `:308`
- `references/analysis.md` — 임계값/해석 (LCP, CLS, 24px 타깃, 11px 텍스트)
- 테스트: **없음** (tests 디렉터리 없음, package.json에 test 스크립트 없음)

## 항목별 판정
| # | 항목 | 판정 | 근거 | 메모 |
|---|------|------|------|------|
| 1-4,7,10 | Intent, Reference, Composition, Typography, Anti-generic, Human pref | 미해결 | | |
| 5 | Responsive | 부분 | `pw.mjs:110-113` 4개 프리셋 + `1366x768` 임의 지정 | 320 등 소폭 스윕은 수동 지정 |
| 6 | Visual QA | 부분 | `pw.mjs:228-243` scrollWidth>viewport+1 시 offender 열거(최대 15), tinyText(<11px) 개수, smallTargets(<24px) **개수만** | clipping/overlap/contrast는 axe(`:293`)만. 문서가 직접 "휴리스틱은 overlap/clipping/z-index를 놓친다"고 인정(`references/analysis.md`) |
| 8 | Korean | 미해결 | grep 0건 (`--locale zh-TW` 옵션만 존재) | |
| 9 | Feedback loop | 부분 | `SKILL.md`에 "다시 audit로 확인" 정도, 반복/종료 코드 없음 | 베이스라인 diff `mismatchPct` 임계 해석만 문서화 |

## 재사용 가능한 것
- "스크린샷 한 장 ≈ 1.5-2k 토큰 → 필요한 것만 찍어라, `inspect`(텍스트 아웃라인)로 구조를 먼저 보라" 토큰 절약 지침.
- 고정/sticky 헤더가 fullPage 스크린샷에서 잘못 그려진다는 주의와 `getBoundingClientRect` 재확인 지침.
- 동적 영역 `--mask`, `animations:'disabled'`, `caret:'hide'` (`pw.mjs:209-213`) — 스크린샷 안정화.

## 한계 / 실행 여부
- **실행하지 않음**: `@playwright/test ^1.63`, `@axe-core`, `pixelmatch`를 `setup.mjs`로 설치하고 브라우저를 내려받는 구조라 `/opt/pw-browsers`(1.56) 와 버전 불일치 위험. 소스 읽기만 함.
- Mechanical QA 재사용 가치는 낮음(검사 3종 카운트 수준). 스킬 패키징 참고용.
- 참고: ChrisBrooksbank/cb-visual-qa(`commands/cb-visual-qa.md`)도 클론해 읽었으나 프로젝트별 smoke test 템플릿 + Ralph 루프 프롬프트 생성기이며 overflow/contrast 같은 측정 코드는 없음(blank page, console error, 높이>100px, toHaveScreenshot). 별도 문서 생략.
