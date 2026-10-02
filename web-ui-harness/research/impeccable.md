# Impeccable

- Repo / commit: https://github.com/pbakaus/impeccable @ 5a03dff (v4.4.0, Apache-2.0)
- 조사일: 2026-10-02
- 한 줄 요약: 단일 skill(`impeccable`) + 24개 sub-command reference + Rust 엔진(detector/live/hook/comp-diff)으로 구성. "프롬프트 가이드 + 결정론적 detector + 로컬 live 서버"가 실제 구현이며, 한글/CJK 타이포와 인간 선호 평가는 없음.

## 구조 (실제 파일 트리 기준)
- `skill/SKILL.src.md` (12.5KB): 단일 진입점. `{{scripts_path}}` 등 템플릿 변수; `plugin/`, `.cursor/` 등은 빌드 산출물(PRODUCT.md도 "generated distribution artifacts"라 명시).
- `skill/reference/*.md` (~38개, 합계 약 450KB): command별 playbook. 가장 큰 것: new-work 58.9KB, critique 45.2KB, live 36.3KB, document 27.4KB, visualize 16.5KB, craft-floor 7.3KB(UI 편집 직전 필수 로드).
- `skill/agents/`: impeccable-finish-reviewer(15KB), documenter, asset-producer, manual-edit-applier (서브에이전트 정의).
- `skill/scripts/impeccable` (launcher) + 다운로드되는 정적 Rust 바이너리. `live-browser.js`(547KB)는 페이지 주입용 번들.
- `crates/`: detect(CLI), core(규칙 로직 `checks/*.rs`), foundation(`registry.rs` 규칙 레지스트리), html(정적 DOM/cascade), browser(CDP/스크린샷), wasm, live(live 서버), context(PRODUCT/DESIGN 로딩, concept_seed), hook, comp(*-diff).
- `browser-bundle/*.js`: 확장/페이지용 JS. `tests/oracle/`: JS 시절 동작을 바이트 단위로 고정한 golden.
- 루트 `PRODUCT.md`(5.5KB), `DESIGN.md`(29KB): Impeccable 자신의 사이트용 실물 예시.

## 항목별 판정

| # | 항목 | 판정 | 근거 | 메모 |
|---|------|------|------|------|
| 1 | Intent/context handling | 해결 | `skill/reference/init.md:19,27,29,41`; `skill/SKILL.src.md` Setup 1 (`impeccable context`) | 코드/문서를 먼저 스캔, 부족한 부분만 최대 3문항/라운드로 질문, 추론은 확인 후 기록. 시각 취향은 init에서 묻지 않음(`init.md:41`). 3-way 키 `PRODUCT.md`(제품 진실), 표면별 brief, `DESIGN.md`(시각). 사용자 brief 우선(`SKILL.src.md` "The brief wins") |
| 2 | Reference analysis (Observed vs Inferred) | 부분 | `document.md:99,188` ("Include exact values only when observed"), `new-work.md:11` (옛 디자인=evidence) | 코드→DESIGN.md 추출은 "observed" 값 위주이나, 레퍼런스 사이트/이미지를 Observed/Inferred 표로 분리하는 흐름은 없음(grep으로 해당 구조 부재 확인). critique도 Assessment A/B 분리(격리 서브에이전트)일 뿐 관찰/추론 라벨링은 아님 |
| 3 | Composition reasoning (viewport 단위) | 부분 | `new-work.md:49,61` (FIRST VIEWPORT 블록, direction contract), `new-work.md:112-120` (comp-spec 격자 %좌표, scaffold CSS 변수) | 이미지 생성 comp 경로에서만 viewport 좌표 기반 측정(`comp-diff`)이 있음. 코드 전용 경로에서는 산문 계약 수준 |
| 4 | Typography | 해결 | `typeset.md:21,47-48` (45–75ch, 리딩 보정), `craft-floor.md` Type (65–75ch, display≤6rem, tracking≥-0.04em, balanced headings), detector `overused-font`, `flat-type-hierarchy`, `tight-leading`, `line-length`, `wide-tracking` 등 (`crates/foundation/src/registry.rs`) | 영문 중심. 폰트 인덱스 `skill/scripts/data/font-index.json` |
| 5 | Responsive (구현 지침 vs 검증) | 부분 | `adapt.md`, `new-work.md:120,140` (데스크톱+모바일 batched 스크린샷), detector `first-viewport-column-overflow`, `text-overflow` | 지침은 풍부. 검증은 detector(오버플로 등)와 2회 스크린샷 라운드. 임의 폭 스윕 루프는 아님 |
| 6 | Visual QA (스크린샷/DOM 루프 실제 구현) | 해결 | `crates/browser/src/{cdp,screenshot_contrast,snapshot_engine}.rs`; `crates/core/src/browser/driver.rs`; `crates/detect` URL 스캔(`docs/CLI-CONTRACT.md:322-325`: puppeteer, 기본 viewport 1280x800, networkidle0) | 실제 Chrome DOM+computed style로 규칙 실행, 대비는 스크린샷 기반(`screenshot_contrast.rs`). finish-reviewer는 브라우저 없이 캡처만 심사(`impeccable-finish-reviewer.md:19`) |
| 7 | Anti-generic / anti-AI (blacklist vs justify-or-change) | 부분 | `registry.rs` ANTIPATTERNS(아래 목록); `craft-floor.md` "Refuse: ... defaults, not bans: the brief's own words can earn any of them"; `hooks.md:32-35` ignore-value `--reason` | 기본은 blacklist(탐지→수정). 정당화 로직은 (a) brief가 허용하면 예외, (b) `data-impeccable-ignore`/config의 ignore-rule·value+reason뿐. detector가 정당성을 판단하지는 않음(코드 컨텍스트 휴리스틱 일부: 예 status/tab context에서 border 예외 `rules.rs:check_borders`). eyebrow 등 일부는 "no brief earns it back" |
| 8 | Korean typography (keep-all, 줄바꿈, 혼용) | 미해결 | grep `keep-all|korean|CJK|hangul|word-break|lang=` 결과: `skill/reference/harden.md:26,114,335`의 "Test with Chinese/Japanese/Korean" 3줄이 전부 | word-break/keep-all/lang 분기/한영 혼용 규칙 전무 |
| 9 | Browser feedback loop (반복 횟수/종료 조건) | 해결 | `SKILL.src.md` "Verify in bounded passes, not a loop": 1회 batched 검사 → 일괄 수정 → 최대 1회 재확인 후 종료; `new-work.md:144` 두 번째 라운드 이후 polishing 금지; live: `live.md:19-24` poll loop, 종료=`exit` 이벤트 | 자동 루프가 아니라 "상한 2라운드" 정책(프롬프트 규율). live는 사용자 주도 무한 poll(기본 timeout 600s, `timeout`→재poll)이며 journal로 복구 |
| 10 | Human preference / 외부 평가 | 부분 | `tests/oracle/README.md` (frozen JS golden, byte-equal), `crates/context/src/catalog.rs:381-386` (concept 카탈로그 큐레이션 rating 1–3), `CLI-CONTRACT.md:403` (rating 가중 추첨) | oracle은 엔진 회귀 테스트이지 디자인 품질/선호 평가가 아님. rating은 메인테이너 큐레이션이 방향 추첨 확률에 반영. 사용자 선택은 live accept/discard와 decision page로 수집되나 학습/평가 지표로 쓰이지 않음 |

## 요청 세부 항목

(a) PRODUCT/DESIGN 생성: PRODUCT.md는 `init`(`init.md`)이 repo 스캔 후 질문(라운드당 ≤3문항, 실제 답변 1회 필수, 추론 확인)으로 생성; 스키마 마커 `<!-- impeccable:product-schema 1 -->`. DESIGN.md는 `document`가 코드에서 토큰 추출(Stitch 스키마 frontmatter, 8개 sub-token 제한) + 코드로 못 얻는 부분만 2라운드(≤3문항) 질문 + `.impeccable/design.json` sidecar. 코드 없으면 Seed 모드(최소 frontmatter). 매 세션 `impeccable context`가 로드. 기존 파일 무단 덮어쓰기 금지, `doctor`가 drift 보고.

(b) 명령: craft(deprecated), shape, init, document, extract, critique, audit(+native), polish, bolder, quieter, distill, harden, onboard, animate, colorize, typeset, layout, delight, overdrive, clarify, adapt(+native), optimize, live, generate. 각 `reference/<cmd>.md`. 보조: routing, new-work, craft-floor, visualize, region-map, hooks, doctor, live-setup, component-review, ios/android, operate. 별도: pin, hooks, doctor.

(c) Detector: Rust(구 JS 포팅; `crates/core`, `crates/foundation/src/registry.rs`). 규칙 = 레지스트리 row(id, category slop|quality, scopes, severity, name, description) + `check_*` 함수. 실행 3경로: 정적 소스(regex/`crates/detect/src/regex_matchers.rs`), 정적 HTML cascade(`crates/html`), 브라우저 DOM/computed style(URL, wasm 번들·확장). README는 61규칙. 레지스트리 id: side-tab, border-accent-on-rounded, overused-font, flat-type-hierarchy, gradient-text, ai-color-palette, cream-palette, nested-cards, monotonous-spacing, bounce-easing, pulsing-dot, blinking-cursor, shape-assembled-illustration, organic-clip-path, buried-raster, dark-glow, radial-halo, radial-spotlight-glow, marquee, icon-tile-stack, italic-serif-display, hero-eyebrow-chip, kicker-above-heading, numbered-section-labels, em-dash-overuse, marketing-buzzword, aphoristic-cadence, oversized-h1, extreme-negative-tracking, broken-image, script-error, content-hidden-at-rest, edge-flush-cards, text-occlusion, first-viewport-column-overflow, gray-on-color, low-contrast, layout-transition, line-length, cramped-padding, body-text-viewport-edge, tight-leading, skipped-heading, heading-rhythm, justified-text, tiny-text, undersized-ui-text, all-caps-body, wide-tracking, text-overflow, repeated-container-text, clipped-overflow-container, design-system-{font,color,radius,font-size}, gpt-thin-border-wide-shadow, repeating-stripes-gradient, codex-grid-background, theater-slop-phrase, image-hover-transform (+testpack 2개). LLM 없이 동작. 결과적으로 blacklist 중심 + ignore/reason 메커니즘.

(d) Live: `live.md`. 요소를 브라우저에서 선택 → action/자유 프롬프트/count(보통 3 variants) → 서버가 이벤트 큐. 캡처: 주석(annotation)을 단 경우에만 요소 PNG(`screenshotPath`), 페이지 URL, element 메타, strokes/comments. 에이전트가 variant HTML+CSS를 소스에 wrapper로 삽입, HMR 핫스왑. 종료: 사용자 accept/discard/exit; 반복 횟수 상한 없음(사용자 구동).

(e) 없음 (항목 8).

(g) Observed/Inferred 분리: 없음(항목 2). 단, critique는 detector 결과가 판단을 anchoring하지 않도록 Assessment A 완료 전 격리(`critique.md:10`).

(h) 설치: `npx impeccable install`(하네스 감지 후 복사), 또는 Claude Code `/plugin marketplace add pbakaus/impeccable`(`plugin/.claude-plugin/plugin.json`, skills ./skills/). 컨텍스트 비용: 항상 로드되는 것은 SKILL.md 12.5KB(약 3k토큰) + description 약 1KB; 호출한 command의 reference와 craft-floor(7.3KB)만 추가 로드. 최악: new-work 59KB, critique 45KB(수십k토큰). 첫 실행 시 바이너리 다운로드 필요(네트워크).

## 재사용 가능한 것
- `craft-floor.md`의 Verify/Refuse 체크리스트 구조와 수치 기준(65–75ch, tracking≥-0.04em, 대비 4.5:1)을 그대로 차용 가능.
- `registry.rs` 규칙 목록 + `impeccable detect <url|dir> --json`을 결정론적 안티패턴 검사기로 그대로 호출(LLM 불필요; 단 CJK 규칙 없음).
- `init.md`/`document.md`의 "스캔 먼저, 부족분만 ≤3문항" 질문 패턴과 PRODUCT/DESIGN 분리 스키마.
- "bounded passes"(batched 2라운드 후 종료) 정책과 finish-reviewer 4-disposition(recapture/rebuild/fix/ship) 인터페이스.
- critique의 격리 2-assessment(주관 평가 후 detector 결과 투입) 설계.

## 브리프 가정과 다른 점 (확인/반증)
- PRODUCT.md: 확인 (init이 생성, 매 세션 `impeccable context`로 로드).
- DESIGN.md: 확인 (document 명령, Stitch 스키마 + sidecar). 단 시각 방향은 new-work에서 별도 결정/교체 가능.
- critique: 확인 (Nielsen 10 heuristics 0–4점, 페르소나, cognitive load, 격리 서브에이전트).
- deterministic audit: 부분 반증. 결정론적인 것은 `detect`(61규칙)이고 `audit` 명령 자체는 LLM playbook(a11y/perf/responsive 체크리스트) + detect 병용.
- anti-pattern: 확인하되 blacklist 중심. 정당화 판단 로직은 brief 우선 규칙과 수동 ignore 정도.
- browser-based iteration: 부분. live는 "사용자가 고른 요소의 variant 선택 도구"이지 에이전트의 자동 스크린샷 수정 루프가 아님. 자동 검증은 의도적으로 최대 2라운드로 제한.
- per-command reference structure: 확인 (24 command, 단일 SKILL + reference 온디맨드 로드).
- 브리프에 없던 것: Observed/Inferred 분리 없음, 한글 처리 없음, 인간 선호 평가 없음 확인.

## 한계
- 한글/CJK 타이포(keep-all, 한영 혼용 폭, lang) 전무; detector 규칙은 영문/라틴 전제(`line-length` ch 기준 등).
- 레퍼런스 분석(관찰/추론 라벨) 부재.
- 엔진이 외부 바이너리 다운로드에 의존; 규칙 추가는 Rust 수정+빌드 필요(`pack` 확장점은 있음).
- 품질 평가는 LLM 판단+detector뿐, 선호 데이터/벤치마크 없음. 본 조사는 shallow clone 정적 열람이며 바이너리 실행은 하지 않음.
