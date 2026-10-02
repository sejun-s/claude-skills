# skillui (amaancoderx/npxskillui)

- Repo / commit: https://github.com/amaancoderx/npxskillui @ bc913a8 (2026-05-08), v1.3.4
- 조사일: 2026-10-02
- 한 줄 요약: URL/디렉터리/Git repo에서 디자인 시스템을 추출해 Claude가 읽는 `.skill` 폴더(DESIGN.md, tokens, ANIMATIONS/COMPONENTS/LAYOUT/INTERACTIONS md)로 포장하는 TS CLI. URL 모드는 Playwright computed style. **테스트 파일 없음**(git ls-files 확인). MIT.

## 구조
- `src/extractors/tokens/computed.ts`(266줄) — URL 모드: 1440x900 단일 뷰포트, 최대 5페이지, `page.waitForTimeout(1500)` 후 computed style에서 colors/fonts/spacing/shadows(`:167`)/borderRadius(`:173`)/transition durations·easings/CSS 변수/z-index/containerMaxWidth 수집
- `src/extractors/ultra/` — `animations.ts`(535줄), `interactions.ts`, `layout.ts`(flex/grid 컨테이너 레이아웃), `components-dom.ts`, `pages.ts`
- `src/normalizer.ts`, `src/font-resolver.ts`, `src/writers/*`(design-md, tokens-json, skill 등)
- 정적 모드: `tokens/css.ts`, `tailwind.ts`, `modes/repo.ts|dir.ts`

## 항목별 판정
| # | 항목 | 판정 | 근거 | 메모 |
|---|------|------|------|------|
| 1-3,7,10 | Intent/Reference/Composition/Anti-generic/Human | 미해결 | | `ultra/layout.ts`는 컨테이너 기록(구조 목록), 균형 판단 아님 → Composition 부분 정도 |
| 4 | Typography | 부분 | `computed.ts` fonts(family,size,weight), `font-resolver.ts` | 역할별 스케일 정제 수준은 소스 미정독(불명) |
| 5 | Responsive | 미해결 | `computed.ts` 뷰포트 1440x900 고정, `screenshot.ts` | 모바일 추출 없음 |
| 6 | Visual QA | 미해결 | | |
| 8 | Korean | 미해결 | grep 0건 | |
| 9 | Feedback loop | 미해결 | | 일회성 생성 |

## 재사용 가능한 것
- "추출 결과를 Claude Code가 자동으로 읽는 skill 폴더로 패키징" 출력 형식(DESIGN.md + 보조 md) 아이디어.
- `ultra/animations.ts`: keyframes/transition 수집(미정독, 존재만 확인).

## 한계 / 실행 여부
- 테스트 없음, 단일 뷰포트, 고정 User-Agent(Chrome/120 위장, `computed.ts:~40`) — 사이트 정책 고려 필요.
- **실행하지 않음**. 신뢰도는 dembrandt/designlang보다 낮음. 4개 중 보조 참고.
