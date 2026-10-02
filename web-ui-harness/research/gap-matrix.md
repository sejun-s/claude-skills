# Gap Matrix — STEP 1 결과

조사일 2026-10-02. 대상 commit: anthropics/skills@8a1541c, pbakaus/impeccable@5a03dff, nextlevelbuilder/ui-ux-pro-max-skill@09170ee.
근거는 각 도구 노트(`frontend-design.md`, `impeccable.md`, `ui-ux-pro-max.md`)의 파일 경로 참조. 조사는 서브에이전트가 수행했고, 아래 4개 주장은 직접 재확인함:
frontend-design SKILL.md 71줄 / Impeccable README "61 deterministic detector rules" / Impeccable CJK 언급은 harden.md 2곳뿐 / 세 도구 모두 keep-all 처리 없음.
나머지 판정은 에이전트 보고 기준이며 STEP 3 이전에 샘플 재검증이 필요하다.

판정: ● 해결  ◐ 부분  ○ 미해결

| # | 항목 | frontend-design | Impeccable | UI/UX Pro Max | 남는 gap |
|---|------|:---:|:---:|:---:|----------|
| 1 | Intent/context | ◐ | ● (init/document, 질문 ≤3/round) | ◐ | 거의 없음 → **재사용** |
| 2 | Reference 분석 (Observed/Inferred) | ○ | ◐ (분리 없음) | ○ | **큼** |
| 3 | Composition (viewport 단위) | ◐ | ◐ | ◐ | 중간 (코드 전용 경로는 산문 수준) |
| 4 | Typography | ◐ (라틴) | ● | ◐ | 한국어 제외 시 작음 |
| 5 | Responsive | ◐ (1줄) | ◐ | ◐ | 중간 |
| 6 | Visual QA | ◐ | ● | ○ (샘플 스크립트만) | 작음 → Impeccable 재사용 |
| 7 | Anti-generic | ● (산문) | ◐ (blacklist 61규칙) | ◐ | **justify-or-change 로직은 없음** |
| 8 | 한국어 타이포 | ○ | ○ | ◐ (Noto Sans KR 1행) | **큼 — 가장 확실** |
| 9 | Browser feedback loop | ○ | ● (verify 1~2라운드, live mode는 사용자 주도) | ○ | 작음~중간 |
| 10 | 사람 선호/외부 평가 | ○ | ◐ (oracle은 엔진 회귀용, 디자인 평가 아님) | ○ | **큼** |

## 브리프 가정 대조
- 확인: PRODUCT.md/DESIGN.md, critique, 명령별 reference 구조, anti-pattern, searchable CSV 지식, 미적 방향성.
- 부분 반증: Impeccable "deterministic audit" — 결정론적인 것은 `detect`이고 `audit` 명령은 LLM playbook. "browser iteration" — 자동 스크린샷-수정 루프가 아니라 사용자 주도 live mode.
- 반증/약함: frontend-design의 색·레이아웃 지침은 얇음. UI/UX Pro Max의 규칙은 대부분 모호한 라벨("modern", "elegant")이며 Condition→Decision 구조는 ui-reasoning.csv 일부(Reasoning/Confidence는 192행 중 31행)뿐.
- 미확인: Visual QA / design extractor 계열(webapp-testing 제외)은 아직 조사하지 않음.

## 결론 (잠정)
재사용: Impeccable의 context 파일, detector, critique, verify 루프. UI/UX Pro Max의 Do/Don't CSV 형식과 `Decision_Rules` 문법 참고. frontend-design 방향성 지침.
직접 필요 후보 (Baseline에서 failure로 재확인되기 전까지 가설):
1. 한국어 타이포 (3개 도구 전부 비어 있음 — 가장 강한 근거)
2. Reference 분석의 Observed/Inferred 분리
3. 사람 선호 루프와 blind 평가
4. justify-or-change형 Design Decision 단위 (detector가 blacklist 중심이라는 사실에 근거)

**범위 축소 판단:** 아직 축소하지 않는다. 다만 1(Intent), 6(Visual QA), 9(Loop)는 직접 만들지 않는다. Harness 범위가 "Impeccable + 한국어 레이어 + 선호/평가 루프"로 수렴할 가능성이 높으며, 이는 Baseline B 조건으로 검증한다.

## 남은 확인
- Baseline B 후보 확정: `frontend-design` + Impeccable (+ 필요 시 Playwright). 설치/실행 가능성(바이너리 다운로드, 네트워크)은 STEP 2에서 확인.
- Visual QA / design extractor 계열 추가 조사 여부는 사용자 결정 필요.

---

## 추가 조사 반영 (Visual QA / Design extractor) — 2026-10-02
상세: `visual-qa-and-extractors.md`와 도구별 노트(`reflowcheck`, `ui-assert`, `ui-crawl`, `playwright-browser-skill`, `dembrandt`, `designlang`, `web-design-extractor`, `skillui`).
조사는 서브에이전트가 수행. 직접 재확인한 것: 8개 클론 소스에서 keep-all/hangul/korean/cjk 검색 결과 0건, 라이선스(reflowcheck=AGPL-3.0, 나머지 MIT, skillui는 LICENSE 파일 없음).
에이전트가 직접 실행해 확인한 것(내가 재실행하지는 않음): reflowcheck 자체 테스트 8개 통과, 픽스처에서 320/375px 가로 오버플로와 clipped text 검출 / ui-crawl은 기본 1280px 단일 뷰포트에서는 오버플로를 놓치고 320+1440 설정에서 검출.

| 항목 | 상태 | 비고 |
|------|------|------|
| #6 Visual QA | ● 확인 | ui-crawl(오버랩·대비·터치 타깃·줌 reflow·above-the-fold 검사, `done`/exitCriteria 루프, MCP), ui-assert(뷰포트×라이트/다크 매트릭스, axe 대비, MCP, 이식 쉬움), reflowcheck(가로 오버플로·clipped text). 모두 터치 타깃 24px 기준(보고) |
| Mechanical QA 뷰포트 스윕 | ◐ | ui-crawl은 **뷰포트를 명시 설정해야** 오버플로를 잡음(기본값은 놓침). 우리 harness가 320–1440 스윕을 직접 정의해야 함 |
| Design extractor | ● 확인 | dembrandt, designlang 실질적. designlang은 토큰으로 재렌더 후 live 사이트와 픽셀 diff하는 verify 루프 보유. web-design-extractor는 빈도 카운터 수준, skillui는 테스트 없음 |
| #8 한국어 줄바꿈 검사 | ○ **확정 gap** | 조사한 11개 도구 전부 0건. 필요: keep-all 적용 여부, 단어 중간 끊김, 고아 줄(orphan), 스윕 전 구간 줄바꿈 품질 |
| 구성/시각적 무게 검사 | ○ | ui-crawl의 composition 셀렉터는 `.kicker`/`.eyebrow` 같은 특정 클래스에 과적합. 일반 visual-weight 검사는 없음 |

### 수정된 잠정 결론
- **직접 만들지 않음(추가):** 오버플로/클리핑/오버랩/대비/터치 타깃 검사 — ui-crawl 또는 ui-assert를 재사용. 토큰 추출 — dembrandt/designlang 재사용.
- **직접 만들 후보(강화):** 한국어 줄바꿈 검사(스윕 연동)는 11개 도구 전부 비어 있어 근거가 가장 강함. 구성 검사는 gap이나 난이도가 높아 Baseline failure 확인 후 결정.
- **재사용 시 리스크:** reflowcheck는 AGPL-3.0이라 우리 산출물과 결합 시 라이선스 영향을 검토해야 함(직접 코드 포함 대신 외부 CLI 호출로 한정 권장). Playwright 버전 충돌(번들 1.56.1 vs 도구 pin 1.62~1.63) 때문에 도구마다 실행 환경 조정이 필요하며, dembrandt는 미실행.
- **범위 축소 판단:** 여전히 축소하지 않음. 수렴 방향은 "Impeccable(detect/critique/context) + 기존 Mechanical QA 도구 + 한국어 줄바꿈 레이어 + 선호/평가 루프".

### 남은 미확인
- ui-assert, playwright-browser-skill, 추출기 4종은 실행해 보지 않음.
- ui-crawl이 한국어 clipped text를 놓친 이유 미조사.
- Impeccable `detect`의 오버플로 관련 규칙이 프로브에서 안 잡힌 이유 미조사.
