# web-design-extractor (ghostlives)

- Repo / commit: https://github.com/ghostlives/web-design-extractor @ 239dd03 (2026-09-18)
- 조사일: 2026-10-02
- 한 줄 요약: 약 11KB(분 압축 형태의 TS 7파일)의 최소 구현. 뷰포트별로 `body *` 최대 2500개의 computed style 24종을 수집해 빈도순 토큰(color/type/space/radius/shadow)을 만든다. MIT. LLM 호출 0.

## 구조
- `src/capture.ts` — `page.evaluate`로 `getComputedStyle` 수집. 속성: color, backgroundColor, fontFamily/Size/Weight, lineHeight, letterSpacing, margin*, padding*, borderRadius, borderWidth, borderColor, boxShadow, display, position, gap, transition, animationName (`capture.ts:5`). `:root` CSS 변수와 `CSSMediaRule.conditionText`도 수집
- `src/analyze.ts` — 단순 빈도 집계(`tokens()`), 태그/클래스 기반 컴포넌트 분류
- `src/generate.ts`, `src/cli.ts`(기본 viewports `1440x900,390x844`, `--screenshots`), `SKILL.md`(skill), `scripts/install-skill.mjs`
- `test/analyze.test.ts`(1케이스), `test/install.test.ts`

## 항목별 판정
| # | 항목 | 판정 | 근거 | 메모 |
|---|------|------|------|------|
| 1-3,7,10 | Intent, Reference, Composition, Anti-generic, Human | 미해결 | | |
| 2 | Observed/Inferred | 부분 | `analyze.ts` 토큰에 `source:"computed"` 필드, 빈도 `count` | 추론 계층 없음 → 사실상 모두 Observed |
| 4 | Typography | 부분 | `capture.ts:5` font 5종 속성 수집 | 폰트 스택 정제/역할(h1/body) 분류 없음 — raw 값 목록 |
| 5 | Responsive | 해결(추출) | `cli.ts` 기본 2개 뷰포트, 뷰포트별 capture | 값 diff 없음 |
| 6 | Visual QA | 미해결 | | 스크린샷은 저장만 |
| 8 | Korean | 미해결 | grep 0건 | |
| 9 | Feedback loop | 미해결 | | |

## 재사용 가능한 것
- 아이디어: 24개 computed 속성 화이트리스트 + `:root` 커스텀 프로퍼티 덤프 + 미디어쿼리 목록 — 우리 extractor를 직접 작성할 때 최소 골격으로 적합(수십 줄).
- "사이트 전체를 모델에 붙이지 말고 JSON 요약만 읽게 한다" SKILL.md 정책.

## 한계 / 실행 여부
- 로직이 얕다: 빈도 정렬뿐 → 색 노이즈/3rd-party 폰트 필터, clamp 복원, 모션 분류 없음. 테스트 사실상 스모크 수준.
- **실행하지 않음**(소스 읽기만). `playwright ^1.55`, `playwright install chromium` 안내(`SKILL.md`).
