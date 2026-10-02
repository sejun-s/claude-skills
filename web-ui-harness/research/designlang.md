# designlang (Manavarya09/design-extract)

- Repo / commit: https://github.com/Manavarya09/design-extract @ fed355b (2026-09-29), v13.3.2
- 조사일: 2026-10-02
- 한 줄 요약: 가장 방대한 추출기(src/extractors 약 50개 모듈, 약 6.3k줄). colors/typography/spacing/shadows/motion(runtime 포함)/responsive/zindex/components 추출 + 추출한 토큰만으로 컴포넌트를 재스타일해 라이브와 픽셀 diff 하는 `verify`(fidelity loop) + MCP + Claude Code skill/commands. MIT, tests 약 43 파일(node:test).

## 구조
- `src/extractors/` — `typography.js`(454줄; clamp()는 computed로 풀리므로 stylesheet 선언에서 fluid type 복원 `:~55`), `motion.js`/`motion-runtime.js`/`motion-choreography.js`(easing 분류, spring, scroll-timeline), `shadows.js`, `spacing.js`, `responsive.js`(375/768/1280/1920 4개 뷰포트로 재추출 후 diff, `:3-9`), `zindex.js`, `components.js`, `css-health.js`, `a11y-remediation.js`, `page-intent.js`(휴리스틱 페이지 분류)
- `src/verify/`(`index.js`, `restyle.js`, `render.js`, `diff.js`, `tokens.js`) — 추출→재현→pixel diff→token-family별 귀속(`index.js` 헤더 주석)
- `src/fidelity/correction-plan.js` — 측정된 격차를 `expectedGain`이 있는 수정 지시로 변환
- `src/mcp/`(extract_design, get_tokens, get_typography, compute_drift …), `skills/extract-design/SKILL.md`, `commands/*.md`(extract, verify, fidelity …)
- `tests/` 43 파일 + fixtures

## 항목별 판정
| # | 항목 | 판정 | 근거 | 메모 |
|---|------|------|------|------|
| 1 | Intent/context | 부분 | `src/extractors/page-intent.js` ("Heuristic-only by default" 주석) | 페이지 유형 분류만 |
| 2 | Reference analysis | 부분 | `src/verify/index.js` — 추출값이 실제를 얼마나 재현하는지 fidelity %로 계량 | Observed/Inferred 라벨링은 코드에서 확인 못함(불명) |
| 3 | Composition | 부분 | `section-roles.js`, `semantic-regions.js` | 역할 분류, 균형/무게 측정 아님 |
| 4 | Typography | 해결(추출) | `typography.js` GENERIC/ICON/MONO 필터, `rendersText` 필터(head/meta 제외), fluid clamp 복원; test `tests/typography-usage.test.js`(gov.uk 사례) | 한글 없음 |
| 5 | Responsive | 해결(추출) | `responsive.js:5-9` 4개 뷰포트 | 검증이 아니라 값 비교 |
| 6 | Visual QA | 부분 | `src/verify/` 픽셀 diff 루프 | 레이아웃 결함(overflow 등) 검사는 아님. `a11y-remediation.js` 존재 |
| 7 | Anti-generic | 미해결 | | |
| 8 | Korean | 미해결 | grep: `word-break:break-all` 가 studio/pair UI CSS에만 존재(`src/studio.js:509`) — 한글 처리 아님 | |
| 9 | Feedback loop | 해결(추출 정합성 한정) | `commands/verify.md` `--min <score>` CI 게이트, `correction-plan.js` | "측정→설명→다음 수정 처방" 구조 명시 |
| 10 | Human preference | 미해결 | | `bench/`는 자체 벤치 |

## 재사용 가능한 것
- verify 루프의 핵심 아이디어: 추출 토큰만으로 재스타일 → 렌더 → diff → 토큰 family별 귀속. 우리 harness의 "레퍼런스 대비 재현도" 측정에 적합.
- computed style이 clamp()를 한 값으로 풀어버리는 문제를 stylesheet 선언에서 복원하는 접근.
- motion 추출(easing 분류/spring/scroll-linked) — 모션 값을 실제로 뽑는 유일하게 깊은 구현.

## 한계 / 실행 여부
- **실행하지 않음**. 규모가 커서(리포 1740 파일, Figma/VSCode/Raycast 확장 포함) 필요한 모듈만 발췌해야 함.
- 브라우저 실행은 `launchChromium`(`src/browser.js`) 래퍼를 통함 — 컨테이너 chromium 경로 사용 가능 여부 미검증.
