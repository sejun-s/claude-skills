# reflowcheck

- Repo / commit: https://github.com/hehehe224/reflowcheck @ dd4e2de (2026-09-21)
- 조사일: 2026-10-02
- 한 줄 요약: Playwright로 URL을 9개 폭(320~1440)에서 열어 overflow / clipped-text / obscured-control 3종만 computed style + rect로 검사하는 574줄짜리 CLI. 종료 조건은 exit code뿐(루프 없음). 라이선스 AGPL-3.0.

## 구조 (실제 파일 트리 기준)
- `bin/reflowcheck.js` — CLI, exit code 0/1/2 (`--fail-on error|warning|never`)
- `src/scan.js` — 폭 루프(기본 `[320,360,375,390,412,768,1024,1280,1440]`), 폭마다 새 page, `document.fonts.ready` 대기, fullPage 스크린샷, report.json/index.html 작성
- `src/analyze.js` — `page.evaluate`로 실행되는 단일 함수 `inspectResponsiveLayout` (실제 검사 로직 전부)
- `src/options.js`, `src/report.js` — 인자 파싱, HTML 리포트
- `test/` — node:test 3개 파일. 통합 테스트는 `REFLOWCHECK_INTEGRATION=1`일 때만 실행, fixture `broken.html`/`intentional.html`(의도적 스크롤러/ellipsis 무시 확인)

## 항목별 판정
| # | 항목 | 판정 | 근거 | 메모 |
|---|------|------|------|------|
| 1 | Intent/context handling | 미해결 | 해당 로직 없음 (`src/*.js` 전체 확인) | 순수 검사기 |
| 2 | Reference analysis | 미해결 | 없음 | |
| 3 | Composition reasoning | 미해결 | `src/analyze.js` 에 시각 무게/여백 검사 없음 | |
| 4 | Typography | 미해결 | font-size/line-height/wrap 검사 없음 | |
| 5 | Responsive (검증) | 해결(검증 한정) | `src/scan.js:8,18` 9개 폭 스윕, `src/analyze.js:150-169` horizontal-overflow | 구현 지침은 없음. 반응형 "검증"만 |
| 6 | Visual QA 실제 구현 | 부분 | `src/analyze.js:150-208` overflow, clipped-text(`:171-187`), obscured-control(`elementFromPoint` `:189-208`) | 터치타깃 크기, contrast, 요소 간 overlap, 텍스트 줄바꿈 품질 검사 없음. 스크린샷은 저장만 하고 분석 안 함 |
| 7 | Anti-generic | 미해결 | 없음 | |
| 8 | Korean typography | 미해결 | grep keep-all/word-break/hangul/korean 결과 0건 | 직접 실행에서 한글 `white-space:nowrap; overflow:hidden` 박스는 clipped-text로 잡힘(언어 무관 scrollWidth 비교) |
| 9 | Browser feedback loop | 부분 | `bin/reflowcheck.js` exit code 1 = 이슈 존재; 반복 루프/최대 횟수는 없음 | 종료 조건은 호출자(Claude)가 exit 0 확인 |
| 10 | Human preference | 미해결 | 없음 | |

## 직접 실행 결과 (검증됨)
- node 22 + 글로벌 Playwright 1.56.1(`/opt/node-tools/node_modules`를 node_modules에 symlink) + `/opt/pw-browsers` chromium으로 headless 실행 성공. `playwright install` 불필요.
- 600px 고정폭 div + 한글 텍스트 fixture: 320, 375px에서 `ERROR horizontal-overflow div.row`, 모든 폭에서 `WARNING clipped-text div.k`, 1440px에서는 overflow 없음. 정상.
- 20x20 버튼은 **보고되지 않음** (touch-target 검사 없음 확인).
- `REFLOWCHECK_INTEGRATION=1 node --test` 8/8 통과.
- 주의: `package.json`은 `playwright ^1.55.0`을 dependency로 선언. 단 npm install 하면 최신(예: 1.63)이 깔려 `/opt/pw-browsers`(chromium-1194)와 불일치할 수 있어, 이 컨테이너에서는 글로벌 1.56.1을 symlink해서 사용.

## 재사용 가능한 것
- `isInsideIntentionalScroller`, `isDecorative`, ellipsis 예외 처리로 false positive를 줄이는 방식 (`src/analyze.js:132-148`).
- `elementFromPoint` 기반 가려진 컨트롤 검사 — 단순하고 이식 쉬움.
- 폭 스윕 + 폭별 스크린샷 + 구조화 JSON 리포트 구조.

## 브리프 가정과 다른 점 (확인/반증)
- "overflow/clipping/viewport sweep" 확인. "touch target, contrast, overlap" 은 반증(없음).

## 한계
- AGPL-3.0-only(`package.json`): 코드 복사 시 라이선스 전염. 아이디어만 재구현 권장.
- 루프/수정 로직 없음. 검사 3종뿐.
