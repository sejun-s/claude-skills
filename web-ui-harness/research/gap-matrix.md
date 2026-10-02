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
