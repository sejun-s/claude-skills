# Visual QA 도구 + 디자인 추출기 비교 (2026-10-02)

개별 문서: `reflowcheck.md`, `ui-assert.md`, `ui-crawl.md`, `playwright-browser-skill.md`, `dembrandt.md`, `designlang.md`, `web-design-extractor.md`, `skillui.md`. 클론 위치 `/home/user/research-clones/<owner>/<repo>` (shallow, 읽기 전용). 별 개수/최근 커밋은 약한 신호로만 사용.

검증 구분: **[실행]** = 이 컨테이너에서 직접 돌려 확인, **[소스]** = 소스 정독, **[문서]** = README/검색 결과만.

## A. Visual QA

| 항목 | reflowcheck | ui-assert | ui-crawl | playwright-browser skill |
|---|---|---|---|---|
| 규모/테스트 | 574줄, 테스트 3 파일 [소스] | ~1350줄, vitest 3 파일 [소스] | ~13.9k줄, 30+ 테스트 [소스] | 628줄, 테스트 없음 [소스] |
| 라이선스 | **AGPL-3.0** | MIT | MIT | MIT |
| 실제 computed style | O | O | O | 부분(layoutCheck) |
| overflow (가로) | O | O (page + offscreen) | O (viewport-overflow, container-overflow) | O (offender 15개) |
| clipping / 텍스트 잘림 | O (clipped-text) | O (text-overflow, 세로 clipped) | O (clipped-text) — 단 내 fixture에서 한글 nowrap 박스는 **미검출** [실행] | X |
| overlap | X (obscured-control만) | X | O (layout/sibling/text-overlap, zoom-overlap) | X |
| contrast | X | axe 위임 | 자체 계산, 대형 3.0/4.5 (`colors.ts:594`) | axe 위임 |
| touch target | X [실행: 20px 버튼 미검출] | 24px (WCAG 2.5.8) | 24px (+ tight-target 간격) [실행: 검출] | 24px **개수만** |
| 줄바꿈 품질 | X | X | text-line-collision(descender)만 | X |
| composition | X | X | hero 높이 비율, above-fold vacancy, rhythm drift | X |
| 뷰포트 스윕 | 기본 9개 320~1440 [실행] | 기본 3개 x light/dark | 기본 1개; config로 지정 [실행]; zoom 1/1.5/2 | 프리셋 4개 |
| 종료 조건 | exit code | exit code, `--fail-on` | `ui_fix_plan` done/exitCriteria, exit code | 없음 |
| 한글/CJK | 없음 | 없음 | 없음 | 없음 |
| headless 실행 | **성공** [실행] | 미실행 | **성공**(빌드 후, playwright 버전 symlink 필요) [실행] | 미실행 |
| Claude Code 연동 | CLI | CLI + MCP + hook 예시 | CLI + MCP + SKILL.md | SKILL.md + CLI |

참고: ChrisBrooksbank/cb-visual-qa는 smoke test 템플릿/프롬프트 생성기(측정 코드 없음)라 표에서 제외.

## B. 디자인 추출기

| 항목 | dembrandt | designlang | web-design-extractor | skillui |
|---|---|---|---|---|
| 규모/테스트 | TS, 테스트 ~49 | JS ~6.3k줄(extractors), 테스트 ~43 | 11KB, 테스트 2개(스모크) | 테스트 없음 |
| computed style | O | O | O (24개 속성 화이트리스트) | O |
| typography | 사용률 필터, body 판별 | + clamp() 복원, 역할 | raw 값 빈도 | 기본 |
| color / spacing / radius / shadow | O | O | O (빈도만) | O |
| motion | duration/easing 정적 패스 | 깊음(runtime, spring, scroll-linked) | transition 값만 | transition + animations.ts |
| 뷰포트 | desktop + `--mobile` | 4개 (375/768/1280/1920) | 기본 1440+390 | 1440 고정 |
| 노이즈 정제 | 우수 (3rd-party 폰트 제거, 제거 내역 보고) | 우수 | 없음 | 보통 |
| 루프/검증 | drift/compare | **verify: 재현→픽셀 diff→귀속** | 없음 | 없음 |
| 한글/CJK | 없음 | 없음 | 없음 | 없음 |
| Claude 연동 | MCP | MCP + skill + commands | SKILL.md | skill 폴더 생성 |
| 실행 | 미실행(playwright-core 1.62.1 고정) | 미실행 | 미실행 | 미실행 |

## Mechanical QA 레이어에서 재사용 가능한 것
- **직접 이식 후보(우선순위)**: ui-crawl `layout.ts`/`colors.ts`/`hitTest.ts`/`reflow.ts`(MIT, 단위 테스트 있음)와 ui-assert `checks/layout.ts`(MIT, 단일 함수라 이식 쉬움). reflowcheck는 AGPL이므로 **아이디어만** 재구현.
- overflow: ui-assert `page-overflow` + `offscreen` + `clippedByAncestor`, reflowcheck의 "의도적 스크롤러/장식 요소/ellipsis 예외" 규칙.
- 가시성 판정: `checkVisibility({opacityProperty,visibilityProperty})` (ui-assert).
- overlap: ui-crawl `reflow.ts` — 포함 관계 제외, 작은 박스 대비 교차 비율 0.08(애매)/0.25(결함).
- contrast: ui-crawl `colors.ts` 배경 합성 + 대형 텍스트 3.0/일반 4.5 + 수정색 제안. (axe color-contrast는 이미지/그라디언트 배경에서 incomplete가 잦아 보완용)
- touch target: 24px는 두 도구 공통(WCAG 2.5.8 최소). 우리 요구(44px 권장)는 임계값만 바꾸면 됨 + 인라인 링크 예외 유지.
- 가려진 컨트롤: `elementFromPoint` (reflowcheck, ui-crawl pointer-intercepted).
- 스윕/종료: reflowcheck 폭 목록(320~1440), ui-assert 매트릭스 + "distinct problem" 집계, ui-crawl defect/taste 이원 버킷 + `done`/`exitCriteria`.
- 추출 측: dembrandt의 사용률 필터, designlang `verify`(추출 토큰 재현도 측정) 및 motion 추출.

## 여전히 빠진 것
1. **한글 줄바꿈 검사**: 8개 도구 전부 keep-all/word-break/hangul grep 0건. 필요: `word-break: keep-all` + `overflow-wrap` 계산값 확인, 한글 본문/제목의 어절 중간 줄바꿈(Range.getClientRects로 줄별 텍스트 추출 후 어절 경계 위반 탐지), 한 글자 고아 줄(orphan), 혼용 폰트 fallback. ui-crawl의 `range.getClientRects` 줄 계산(`layout.ts` viewport-scale-imbalance 부근)이 출발점.
2. **좁은 컨테이너 내 텍스트 줄 수/행간** 같은 wrapping 품질(폭 320~1440 스윕에서 헤드라인 줄 수 급변, 1~2글자 줄).
3. **composition / visual-weight**: ui-crawl의 hero 비율/vacancy/rhythm만 존재하며 특정 클래스명(`.kicker .eyebrow .container .wordmark`)에 과적합. 시각 무게, 정렬 축 일관성, 요소 간 간격 스케일 준수, 이미지/텍스트 균형은 없음.
4. 최대 반복 횟수(무한 루프 방지)와 "수정 후 동일 결함 재발" 판정은 ui-crawl fingerprint 외 미확인.
5. 이미지/그라디언트 위 텍스트 contrast, 상태(hover/focus) 별 검사는 부분적.
6. 텍스트 확대(zoom)·`prefers-reduced-motion`·다크 테마 조합 중 ui-assert의 scheme 매트릭스 외는 없음.

## 직접 실행 결과 요약 (이 컨테이너)
- 공통: Playwright 1.56.1은 `/opt/node-tools/node_modules`(글로벌, `/opt/node22/lib/node_modules/playwright` symlink 대상)에 있고 chromium-1194가 `/opt/pw-browsers`에 있음. 도구를 `npm install` 하면 최신 playwright(1.63)가 깔려 chromium-1243을 요구하며 **실패**했고, node_modules/playwright를 글로벌로 symlink하여 해결. `playwright install`은 실행하지 않음.
- 테스트 fixture(`/tmp/.../scratchpad/t.html`): 600px 고정폭 div(+한글), 120px nowrap/hidden 한글 박스, 20x20 버튼.
- reflowcheck: 320/375에서 `horizontal-overflow` error, 전 폭 `clipped-text` warning, 1440에서 overflow 없음, 버튼 미검출. 내장 테스트 8/8 통과.
- ui-crawl: 기본(1280)에서는 overflow 미검출 + small-touch-target(taste) 검출. config로 320 지정 시 `viewport-overflow` defect 검출, verdict `has_defects`. 한글 nowrap 박스의 clipped-text는 미검출.
- 가장 유망한 Mechanical QA 후보: **ui-crawl**(범위, 종료 조건, MIT, 테스트), 이식 용이성은 **ui-assert**.
