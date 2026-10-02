# ui-crawl

- Repo / commit: https://github.com/NatesVibeCode/ui-crawl @ 849b622 (2026-10-01)
- 조사일: 2026-10-02
- 한 줄 요약: 에이전트용 UI 감사 도구. 페이지를 크롤하며 overflow / overlap / clipped-text / contrast / touch-target / zoom-reflow / 구성(above-the-fold vacancy, hero scale, rhythm) 검사를 하고 `defect` vs `taste` 버킷 + `ui_fix_plan`(done/exitCriteria) + MCP를 제공. MIT, src ~13.9k줄, 테스트 파일 30여 개.

## 구조
- `src/layout.ts`(713줄) — overlap/overflow/clipped-text/text-line-collision/vertical-rhythm-drift/viewport-scale-imbalance/above-the-fold-vacancy 등 in-page 검사
- `src/reflow.ts` — 순수함수 zoom reflow(zoom 1/1.5/2: clip + 형제 overlap 비율 0.08/0.25 임계)
- `src/colors.ts`(733줄) — in-page WCAG contrast(`:594` 대형 3.0/일반 4.5), 배경 합성, 수정색 제안 + `verifyContrastFixes`
- `src/hitTest.ts` — small-touch-target(24px, `:34,124`), pointer-intercepted(elementFromPoint)
- `src/spacing.ts`(tight-target), `accessibility.ts`, `affordance.ts`
- `src/report.ts`/`triage.ts` — fix plan, `exitCriteria` (`report.ts:205,278`)
- `src/mcp.ts` — `ui_audit`, `ui_fix_plan`, `ui_open/act`, `ui_snapshot`, `ui_diff` 등, `SKILL.md`(Claude skill 포함), `AGENTS.md`
- `src/source.ts`/`locate.ts` — 결함을 소스 file:line으로 매핑
- `test/*.test.ts` — layout, reflow, colors, hitTest, spacing 등 단위 테스트

## 항목별 판정
| # | 항목 | 판정 | 근거 | 메모 |
|---|------|------|------|------|
| 1 | Intent/context | 미해결 | | 의도 개념 없음(taste 버킷으로 "판단은 사람") |
| 2 | Reference analysis | 미해결 | | |
| 3 | Composition reasoning | 부분 | `src/layout.ts:~535-570` viewport-scale-imbalance(h1 높이/viewport > 0.35), `:~635-680` above-the-fold-vacancy(lead gap >=130px & >=18%), `:~480-530` vertical-rhythm-drift | 임계값은 휴리스틱. 셀렉터가 `.kicker .eyebrow .container .wordmark` 등 특정 클래스에 과적합(`adjacent-wordmark-echo` 등) → 범용성 의심 |
| 4 | Typography | 부분 | `text-line-collision`(`layout.ts:210`, descender risk), 줄 수 계산(`range.getClientRects`) | wrap 품질/orphan/keep-all 검사 없음 |
| 5 | Responsive | 부분 | `src/config.ts:41,163` viewports 설정(기본 1개 desktop 1280x800), zoomLevels 기본 [1,1.5,2] | 320-1440 스윕은 직접 설정해야 함. 아래 실행 결과 참조 |
| 6 | Visual QA 실제 구현 | 해결(범위 내) | 위 검사 전부 `getComputedStyle`/`getBoundingClientRect` 기반; `layout.ts:145 viewport-overflow, :301 layout-overlap, :337 sibling-overlap, :369 container-overflow, :407 clipped-text, :447 text-border-collision`, `colors.ts:673 low-contrast`, `hitTest.ts:130,154` | |
| 7 | Anti-generic | 미해결 | | |
| 8 | Korean typography | 미해결 | grep `keep-all|word-break|hangul|korean|cjk` src 0건 (remediation 문구에 overflow-wrap:anywhere만 언급, `layout.ts:412`) | |
| 9 | Browser feedback loop | 해결 | `SKILL.md` "audit → fix_plan → edit → re-audit, stop when done == true", `report.ts:278 exitCriteria`, exit code 0/1/2 | 최대 반복 횟수는 없음; 종료는 done 플래그 |
| 10 | Human preference | 부분 | defect/taste 버킷: taste는 Claude가 임의로 바꾸지 않고 보고 | 외부 평가 아님 |

## 직접 실행 결과 (검증됨)
- 스크래치에 복사 후 `npm install --ignore-scripts`(playwright 1.63이 설치되어 chromium 1243 요구 → 실패), 글로벌 playwright 1.56.1 symlink로 교체 후 `tsc` 빌드 → `node bin/ui-crawl.js --dir ./site` 성공(headless, /opt/pw-browsers).
- 기본 설정(desktop 1280 단일): overflow 못 잡음, 20x20 버튼은 `small-touch-target`(taste)로 보고. 즉 **기본 설정으로는 모바일 overflow 누락**.
- `--config`로 viewports 320/1440 지정: 320에서 `viewport-overflow div.row` defect 보고, verdict `has_defects`. 정상.
- 관찰: 같은 fixture의 한글 `overflow:hidden;white-space:nowrap` 박스(`div.k`)는 **clipped-text로 보고되지 않음**(이유 미조사; reflowcheck는 잡음). 이 도구의 clipped-text 재현성은 불확실.
- vitest 스위트는 실행하지 않음.

## 재사용 가능한 것
- defect/taste 이원 버킷 + fix_plan(done/exitCriteria) 구조 — 우리 루프 종료 조건 설계에 직접 참고.
- `colors.ts`의 배경 합성 + 대형 텍스트 3.0/4.5 임계 + 수정색 제안·검증.
- `reflow.ts` 순수 함수 overlap 판정(포함 관계 제외, 비율 임계).
- above-the-fold-vacancy / hero scale 같은 composition 수치 검사 아이디어(단, 셀렉터는 일반화 필요).

## 한계
- 규모가 커서 사용 전 취사선택 필요. 일부 휴리스틱은 특정 사이트 취향에 과적합.
- 한글 wrap 없음. Node 22에서 SQLite experimental 경고(`db.ts`).
