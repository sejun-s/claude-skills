# ui-assert

- Repo / commit: https://github.com/Aakashpai/ui-assert @ 608c7ec (2026-09-15)
- 조사일: 2026-10-02
- 한 줄 요약: viewport x color-scheme 매트릭스로 토큰 사용 / 레이아웃(overflow, clipping, offscreen, 24px 타깃) / axe(contrast 포함)를 검사하고 PASS/FAIL 한 덩어리 텍스트를 돌려주는 CLI + MCP (MIT, ~1350줄, vitest).

## 구조
- `src/run.ts` — 매트릭스 루프(`DEFAULT_VIEWPORTS=375x812,768x1024,1280x800` × `light,dark`, `src/types.ts:103-104`), 에러 셀만 스크린샷
- `src/checks/layout.ts` — 단일 `page.evaluate` 함수 `collect`
- `src/checks/a11y.ts` — `@axe-core/playwright`
- `src/checks/tokens.ts` — 하드코딩 색 / 미정의 CSS 변수 검사(스타일시트 규칙 + 인라인)
- `src/cli.ts` — exit code (`return report.summary.passed ? 0 : 1`), `src/mcp.ts` — MCP 서버 (`claude mcp add ui-assert` 가이드는 README), README에 Claude Code hook 예시
- `test/run.test.ts`, `cli.test.ts`, `mcp.test.ts` + `fixtures/bad.html|good.html`

## 항목별 판정
| # | 항목 | 판정 | 근거 | 메모 |
|---|------|------|------|------|
| 1 | Intent/context | 미해결 | 없음 | |
| 2 | Reference analysis | 미해결 | 없음 | |
| 3 | Composition | 미해결 | `src/checks/layout.ts` 에 없음 | |
| 4 | Typography | 미해결 | | |
| 5 | Responsive (검증) | 해결(검증 한정) | `src/run.ts:65-69` setViewportSize 루프 | 기본 폭이 3개뿐; 320 등은 `--viewports`로 직접 지정 필요 |
| 6 | Visual QA | 부분 (레이아웃 측정 중 가장 폭넓음) | `src/checks/layout.ts:51-58` page-overflow, `:109-124` text-overflow(ellipsis 예외), `:126-135` 세로 클리핑, `:137-144` offscreen(+clippedByAncestor), `:146-158` target-size 24x24 (WCAG 2.5.8 inline-link 예외), `src/checks/a11y.ts` axe 전체 규칙(color-contrast 포함) | 요소 간 overlap 검사 없음. contrast는 axe 위임(자체 계산 아님) |
| 7 | Anti-generic | 불명→미해결 | 토큰 준수 검사는 있으나 "generic 판정" 없음 | tokens.ts는 디자인 시스템 준수 강제기 |
| 8 | Korean typography | 미해결 | grep 0건 | |
| 9 | Feedback loop | 부분 | `src/cli.ts` exit 0/1, `--fail-on error|warning|none` (`src/run.ts` summarise) | 같은 문제를 셀 수로 중복 계산하지 않음(`:117-` "distinct problems") |
| 10 | Human preference | 미해결 | | |

## 재사용 가능한 것
- `collect` 의 `visible()`에 `checkVisibility({opacityProperty,visibilityProperty})` 사용 — 조상의 opacity/visibility까지 반영(`:87-94`).
- `target-size` 24px 규칙 + 문장 속 인라인 링크 예외.
- 요약 시 "problem x cell"이 아니라 distinct problem 수로 센다.
- MCP/hook 통합 방식과 "FAIL이면 스크린샷 없이 고칠 수 있게 위치 출력" 철학.

## 브리프 가정과 다른 점
- 44px 터치 타깃은 아님(24px 최소). 우리 Mechanical QA는 44px 기준 별도 필요.

## 한계 / 실행 여부
- **직접 실행하지 않음** (소스 읽기만). 빌드(tsc)와 `@axe-core/playwright` 설치 필요 → 이 컨테이너 headless 가능성은 높으나 미검증.
- overlap, 한글 줄바꿈, composition 없음. `package.json` dependencies에 `playwright ^1.56.0` — 글로벌 1.56.1 symlink로 맞출 수 있을 것(미검증).
