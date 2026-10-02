# UI/UX Pro Max

- Repo / commit: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill @ 09170ee (skill.json version 2.13.0)
- 조사일: 2026-10-02
- 한 줄 요약: 정규 소스는 `src/ui-ux-pro-max/`의 CSV 13종 + BM25 검색 + CSV 기반 규칙 조합기(design_system.py)다. 지식 DB이지 디자인 판단 루프가 아니며, 브라우저 QA는 본체가 아니라 별도 `stack/` 샘플에만 있다.

## 구조 (실제 파일 트리 기준)
- 정규(canonical): `src/ui-ux-pro-max/{data,scripts,templates}`. 나머지(`cli/assets/`, `.claude/skills/`, `.claude-plugin`)는 빌드/복사본 (`.github/workflows/check-asset-sync.yml`가 동기화 검사). 무시함.
- `scripts/core.py` (993줄): CSV_CONFIG(도메인별 search_cols/output_cols), 자체 구현 `class BM25(k1=1.5,b=0.75)` (core.py:282), `detect_domain`, `search`, `search_stack`.
- `scripts/design_system.py` (1668줄): 디자인 시스템 생성기. `scripts/reasoning_contract.py`: Decision_Rules JSON 문법 검증/적용. `scripts/validate_data.py` (1095줄): 데이터 계약 검증. `scripts/tests/*` (유닛테스트, `test_relevance_evaluator.py` 등).
- `templates/base/skill-content.md` (26.5KB), `quick-reference.md` (27KB): 에이전트가 읽는 SKILL 본문.
- `stack/`: 별도 샘플 프로젝트 (playwright MCP + `scripts/design-audit.mjs` 232줄 + `.github/workflows/design-review.yml`). 본체 스킬과 분리.

## (a) 데이터 모델
행 수(DictReader 실측): styles 88, colors 192, typography 74, ui-reasoning 192, ux-guidelines 119, products 192, landing 34, charts 25, motion 17, app-interface 32, react-performance 44, icons 105, google-fonts 1934, stacks/*.csv 22개 합계 1271.
- 검색: BM25 (core.py:282-345), 도메인별 지정 컬럼 토큰화, 최대 3건(`MAX_RESULTS=3`), 도메인 자동감지 `detect_domain`(core.py:628) + 쿼리 재작성 + 오타 제안. 임베딩 없음.
- 대부분 행은 태그/권고 형태(Keywords, Best For, Do Not Use For). 예외: `ui-reasoning.csv`는 `Decision_Rules` 컬럼에 `{"if_data_heavy":["style:glassmorphism"]}` 형태의 Condition→Decision JSON이 있으나 조건이 `reasoning_contract.py:12-49`의 닫힌 신호 약 37개(키워드 부분일치)로 제한. Reasoning/Confidence(근거) 컬럼은 192행 중 31행만 채워짐. 즉 Condition→Decision은 있고 Rationale은 거의 없음. `ux-guidelines.csv`/`app-interface`는 Do/Don't/Code Example Good·Bad/Severity가 있어 가장 규칙에 가까움.

## (b) 디자인 시스템 생성
`design_system.py`의 `generate()` (474행~): 쿼리 → products.csv로 카테고리 매칭 → `ui-reasoning.csv` 규칙 선택(`_find_reasoning_rule`, 382) → Decision_Rules를 쿼리 키워드로 활성화 → style/color/landing/typography 각각 BM25 다중 검색 후 reasoning의 Style_Priority가 우선권(441행 주석) → 대비율 계산·다크 팔레트 파생(129-220행) → ASCII/Markdown 출력, `--persist`로 MASTER.md + 페이지 오버라이드 저장. 입력은 자유 텍스트 쿼리뿐 (레퍼런스 이미지/viewport/브랜드 입력 없음). 규칙 기반이며 LLM 호출 없음.

## (c) 샘플 5행 품질 판단
1. styles `Vibrant & Block-based`: Keywords "Bold, energetic, playful, modern" 같은 무드 라벨 + Implementation Checklist "Block layout with 48px+ gaps, Large typography 32px+, 4-6 vibrant colors" → 라벨 + 일부 수치. 부분적 operational.
2. ui-reasoning `SaaS (General)`: Style_Priority "Glassmorphism + Flat Design", Color_Mood "Trust blue + Accent contrast", Typography_Mood "Professional + Hierarchy" → 모호한 라벨. Anti_Patterns "Excessive animation" 역시 모호.
3. ux-guidelines `Container Width`: Do "max-width 65-75ch", Code `max-w-prose` → 구체적, 실행 가능.
4. products `E-commerce Luxury`: Primary Style "Liquid Glass + Glassmorphism", Key Considerations "Elegance & sophistication. Premium materials." → 사실상 태그, 모호.
5. charts `Correlation / Distribution`: "<500 pts: SVG; 500-5000: Canvas at 0.6-0.8 opacity; >5000: hexbin" → 임계값 있는 operational.
총평: 스타일/제품/무드 도메인은 'modern/minimal/elegant' 류 라벨이 다수, ux/charts/stack/react 도메인은 수치·코드 포함으로 구체적. 구체성은 도메인별 편차가 크다.

## 항목별 판정
| # | 항목 | 판정 | 근거 | 메모 |
|---|------|------|------|------|
| 1 | Intent/context handling | 부분 | `design_system.py:474 generate()`, `reasoning_contract.py:12` | 쿼리 키워드→제품 카테고리/조건 신호 매칭. 의도 추론이 아닌 어휘 매칭. 사용자·목적·청중 구조화 없음 |
| 2 | Reference analysis (Observed vs Inferred) | 미해결 | 레퍼런스 이미지/URL 입력 경로 없음 (`search.py`, `design_system.py` 입력은 텍스트 쿼리) | grep 결과 관련 코드 없음 |
| 3 | Composition reasoning (viewport 단위) | 부분 | `data/landing.csv` Section Order/Primary CTA Placement, `styles.csv` Implementation Checklist | 섹션 순서 패턴 수준(34행). viewport/fold 단위 구성 추론 없음 |
| 4 | Typography | 부분 | `data/typography.csv` 74쌍(Heading/Body/CSS Import/Tailwind), `google-fonts.csv` 1934 | 폰트 페어 추천은 풍부. 스케일·행간·measure 규칙은 `ux-guidelines.csv`(65-75ch 등) 소수 |
| 5 | Responsive (구현 지침 vs 검증) | 부분 | 지침: `ux-guidelines.csv`, `skill-content.md:295-302` "Test on 375px" 산문. 검증: 스킬 본체에 없음 (`stack/scripts/design-audit.mjs:30` 1440 등 3 viewport는 별도) | 본체는 지침만, 검증은 산문 |
| 6 | Visual QA (스크린샷/DOM 루프) | 미해결 (본체) | 본체: 스크린샷/브라우저 코드 없음. `stack/scripts/design-audit.mjs` (Playwright, viewport별 overflow·contrast·meta 휴리스틱 + 스크린샷 232줄), `stack/.github/workflows/design-review.yml` | 아래 Visual QA 절 참조. 본체 스킬에는 없고 샘플 스택에만 존재 |
| 7 | Anti-generic / anti-AI | 부분 | `ui-reasoning.csv` Anti_Patterns 컬럼, `styles.csv` "Do Not Use For", `ux-guidelines.csv` Don't | 블랙리스트형 라벨 ("Corporate templates + Generic layouts"). justify-or-change 메커니즘 없음. `stack/README.md`가 외부 frontend-design 플러그인에 위임 |
| 8 | Korean typography | 부분 | `typography.csv:24` "Korean Modern" = Noto Sans KR 단일 페어; `google-fonts.csv`에 Subsets 컬럼 | keep-all, Pretendard, CJK 줄바꿈 규칙은 데이터/스크립트/템플릿 grep 0건. `ux-guidelines.csv:112`는 오히려 overflow-wrap:anywhere 권고(영문 토큰용). README.ko.md는 번역 문서 |
| 9 | Browser feedback loop | 미해결 (본체) | 본체 없음. `stack/docs/WORKFLOW.md`, `stack/CLAUDE.md`에 산문 워크플로, `design-audit.mjs`는 `\|\| true`로 1회 실행 | 반복 횟수/종료 조건의 실행 가능한 구현 없음 |
| 10 | Human preference / 외부 평가 | 미해결 | 선호 수집/랭킹 코드 없음. `scripts/tests/test_relevance_evaluator.py`는 검색 관련성 회귀테스트이지 디자인 평가 아님 | `Confidence` 컬럼도 31/192행만 채움 |

## (e) 검증/체크리스트
- `skill-content.md:295-302`, `:374-400` Pre-Delivery Checklist: 산문(`- [ ]`) 체크리스트, 실행 불가. 상당 부분이 네이티브 앱 UI 한정이라 명시됨(scope notice).
- `styles.csv`의 Implementation Checklist("☐ ... verified (7:1+)")도 산문.
- 실행 가능한 것은 데이터 검증 `validate_data.py`, `tests/`뿐이고 이는 DB 무결성용이지 UI 검증이 아님.
- 실행형 UI 감사는 `stack/scripts/design-audit.mjs`(Playwright; overflow, 크기 없는 미디어, 제목 구조, viewport meta, 콘솔 에러, 근사 대비)만.

## (g) 컨텍스트 비용
CSV는 로드하지 않고 쿼리당 상위 3건만 반환(CLI 출력). 상시 비용은 `skill-content.md` 26.5KB(약 7k 토큰). `quick-reference.md` 27KB(약 7k 토큰)는 필요 시. 전체 data 약 1.3MB는 컨텍스트에 안 들어감. 검색 호출당 수백~수천 토큰 추정(실측 안 함).

## Visual QA 별도 점검
본체(`src/`)에는 스크린샷·DOM 검사·브라우저 코드가 없다. 존재하는 것은 `stack/`(별도 샘플, README 상 `YMungerDev/claude-website-design-stack` 복제본): `.mcp.json`(playwright, chrome-devtools, shadcn MCP), `design-audit.mjs`(viewport 3종 이상 스크린샷 + 휴리스틱 JSON/MD 리포트), `.claude/agents`의 design-review 서브에이전트(7-phase, 산문 프롬프트), CI 워크플로(`|| true`로 게이트 아님). 휴리스틱은 기계적 결함(overflow/대비 근사)만 잡고 심미 판단은 서브에이전트 프롬프트에 위임.

## 재사용 가능한 것
1. `data/ux-guidelines.csv`, `app-interface.csv`, `charts.csv`, `stacks/*.csv`: Do/Don't/코드예시/Severity 구조의 규칙 행. 그대로 인용/검색 가능.
2. `scripts/core.py`의 BM25 + CSV_CONFIG 패턴과 `search.py` CLI: 자체 지식 CSV를 붙이는 용도로 재사용 가능.
3. `reasoning_contract.py`의 Decision_Rules 닫힌 문법(`if_x: [style:..., constraint:...]`): Condition→Decision 스키마 참고(Rationale 컬럼은 직접 채워야 함).
4. `typography.csv`/`google-fonts.csv` 폰트 페어 + CSS Import 스니펫 (한글은 Noto Sans KR 1건뿐).
5. `stack/scripts/design-audit.mjs`: viewport별 overflow/contrast/meta 감사와 스크린샷 생성(휴리스틱, 한국어 줄바꿈 검사 없음).

## 브리프 가정과 다른 점 (확인/반증)
브리프: "searchable design knowledge, rule/database structure, various UI/UX patterns".
- 확인: 검색 가능한 지식(BM25, 13 CSV, 3천여 행 중 google-fonts 제외 약 2천 행)과 DB/규칙 구조(ui-reasoning Decision_Rules)는 실재.
- 단서: 규칙은 키워드 신호 약 37개 기반의 얕은 조건이고 근거(Reasoning) 컬럼은 16%만 채워짐. 스타일/제품 행의 상당수는 'modern, elegant' 류 태그. "다양한 패턴"은 양 중심(88 스타일, 34 랜딩)이며 구도·viewport·레퍼런스 분석은 없음.
- 반증 대상 아님이지만 주의: 브라우저 QA, 한국어 타이포, 선호 평가는 이 도구가 해결하지 않음.

## 한계
- 소스만 읽음. `search.py`/`design_system.py`를 실제 실행해 출력 품질·토큰량을 측정하지 않음.
- `stack/.claude/agents` 서브에이전트 프롬프트 본문은 상세 정독하지 않음 (존재와 개요만 확인).
- 샘플 5행은 도메인별 1행 임의 추출이라 통계적 대표성 없음.
- `ui-reasoning` 중 Decision_Rules 보유 행은 192/192이나 규칙 내용의 질은 샘플 2건만 확인.
