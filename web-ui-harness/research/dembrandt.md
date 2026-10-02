# dembrandt

- Repo / commit: https://github.com/dembrandt/dembrandt @ 22cb9f9 (2026-09-29), v0.37.0
- 조사일: 2026-10-02
- 한 줄 요약: Playwright(playwright-core)로 라이브 페이지의 computed style을 수집해 colors/typography/spacing/radius/shadow/motion/breakpoints/components를 사용 빈도·신뢰도 기반으로 정제하고 W3C DTCG 등으로 출력하는 TypeScript CLI + MCP. MIT, 테스트 파일 약 49개.

## 구조
- `lib/extractors/` — `colors.ts`(1068줄, `confidence` 필드 `:562`), `typography.ts`(526줄), `spacing.ts`, `breakpoints.ts`(449줄; `:265` transition duration/easing/animation 정적 패스), `components.ts`(borderRadius/boxShadow/상태별 `:64-165`), `consent.ts`(쿠키 배너 처리), `index.ts`(오케스트레이터, `--mobile`/`--dark-mode` `:1193-`)
- `lib/shadow-parse.ts`, `lib/radius-normalize.ts`, `lib/dtcg/`, `lib/formatters/`(dtcg, tailwind, shadcn, html, pdf, brand-guide …), `lib/drift.ts`/`compare.ts`(두 추출 결과 diff)
- `lib/mcp/` + `package.json` bin `dembrandt-mcp`; README에 `claude mcp add --transport stdio dembrandt -- npx -y --package dembrandt dembrandt-mcp`
- `test/` 49 파일(color-parse, colors-fixture, typography 등)

## 항목별 판정
| # | 항목 | 판정 | 근거 | 메모 |
|---|------|------|------|------|
| 1 | Intent/context | 미해결 | | |
| 2 | Reference analysis (Observed vs Inferred) | 부분 | `colors.ts:562` confidence(isToken 여부), `typography.ts:44-56` `applyFamilyUsageFloor`(사용률 2% 미만 폰트 제거, 제거 목록은 `filteredFamilies`로 노출) | 관측값 + 휴리스틱 필터를 구분해 노출하는 점이 좋음. 라벨이 Observed/Inferred 이분법은 아님 |
| 3 | Composition | 미해결 | | 토큰만 |
| 4 | Typography | 해결(추출 범위) | `typography.ts` body family 판별(`pickBodyFamily`), UA 기본 serif 배제, 3rd-party 폰트 필터; computed style 기반 | 한글 폰트 스택 특화 없음 |
| 5 | Responsive | 부분 | `index.ts:1193` `--mobile` 옵션 1회 추가 추출, `breakpoints.ts` 미디어쿼리 수집 | 뷰포트 스윕 아님(데스크톱+선택적 모바일) |
| 6 | Visual QA | 미해결 | | 추출기 |
| 7 | Anti-generic | 미해결 | | |
| 8 | Korean | 미해결 | grep keep-all/hangul/korean/cjk `lib test` 0건 | `locale`/`acceptLanguage` 옵션만(`index.ts:277` 주석) |
| 9 | Feedback loop | 부분 | `lib/drift.ts`, `compare.ts`, exit-codes — 두 결과 비교는 가능 | 렌더→수정→재측정 루프는 아님 |
| 10 | Human preference | 미해결 | | |

## 재사용 가능한 것
- 실제 사용률(coverage) 기반 필터링 원칙: "토큰으로 보이는 노이즈(3rd-party 위젯 폰트)를 제거하되 제거 내역을 보고".
- `shadow-parse.ts`, `radius-normalize.ts`, motion duration/easing 분류(`breakpoints.ts:265-`).
- 소비 측: 레퍼런스 사이트에서 값을 뽑아 DESIGN 토큰으로 변환하는 용도.

## 한계 / 실행 여부
- **실행하지 않음**(소스 읽기만). playwright-core를 `1.62.1`로 고정(`package.json:125`) → 컨테이너 chromium-1194(1.56)와 불일치, `install-browser` 필요하므로 그대로는 headless 실행이 막힐 가능성 높음(미검증). 봇 우회 `--stealth` 옵션이 있어 이용 약관/robots 고려 필요(`lib/robots.ts` 존재).
- 한글 사이트 특화 처리 없음.
