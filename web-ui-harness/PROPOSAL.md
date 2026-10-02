# Web UI Design Harness — 착수 제안서 (v0.1, 검토용)

상태: **검토 대기**. 이 문서는 구현 전 합의를 위한 제안이며, 코드/Skill 본문은 작성하지 않았다.
원칙: Baseline에서 반복 관찰된 failure만 기능으로 승격한다. 기존 OSS 조합으로 충분하면 범위를 줄인다.

> 주의: 브리프의 기존 도구(frontend-design, Impeccable, UI/UX Pro Max 등) 설명은 아직 **소스로 확인하지 않은 가정**이다. STEP 1에서 검증하기 전까지 "강점"으로 확정하지 않는다.

---

## 1. Repository 구조 (제안)

현재 저장소는 `README.md`만 있는 빈 상태. 처음엔 문서와 실험 중심으로 두고, Skill 파일은 Baseline 이후에 만든다.

```
web-ui-harness/
├── PROPOSAL.md                  # 이 문서
├── research/                    # STEP 1: 기존 도구 조사 (한 도구 = 한 파일)
│   ├── _template.md             # 조사 항목 10개 체크리스트
│   ├── frontend-design.md
│   ├── impeccable.md
│   ├── ui-ux-pro-max.md
│   ├── visual-qa-tools.md
│   └── gap-matrix.md            # 도구 × 기능 → 해결/부분/미해결 + 근거 링크
├── vocabulary/                  # STEP 3: Operational Design Vocabulary
│   └── v0.1.md                  # hierarchy, density, calm, … 각각 operational definition
├── benchmarks/                  # STEP 4
│   ├── README.md                # 고정 조건 (텍스트/이미지/기능/IA 고정)
│   └── T1-marketing-landing/    # brief.md, content.md, assets/, acceptance.md
├── experiments/                 # STEP 5~
│   ├── protocol.md              # 실행/기록/블라인드 평가 절차
│   └── runs/<date>-<cond>-<task>-<n>/   # 산출물, 스크린샷, 로그
├── failures/
│   └── log.md                   # F-001… (STEP 6)
└── decisions/                   # STEP 7 이후에만 생성
    └── log.md
```

의도적으로 **만들지 않는 것**: `SKILL.md`, `references/*`, `schemas/*`, 별도 Hero/Responsive Skill. Failure Log에서 근거가 생기면 그때 추가한다. (브리프 §37과 일치)

## 2. 조사 계획 (STEP 1)

대상: Anthropic `frontend-design`, Impeccable, UI/UX Pro Max, Visual QA 계열, Design extractor 계열.
방법: 실제 repo 소스를 읽고(README 요약 금지), 아래 10개 항목마다 `해결 / 부분 / 미해결 / 불명` 과 근거(파일 경로·라인)를 기록한다.

| # | 항목 | 확인할 것 |
|---|------|-----------|
| 1 | Intent/context | 질문을 하는가, 파일(PRODUCT.md 등)로 고정하는가 |
| 2 | Reference 분석 | Observed/Inferred 구분이 있는가 |
| 3 | Composition | viewport 단위 판단 규칙이 있는가 |
| 4 | Typography | 규칙 vs 판단 근거 |
| 5 | Responsive | 구현 지침인가, 검증까지 있는가 |
| 6 | Visual QA | 스크린샷 루프/DOM 검사의 실제 구현 |
| 7 | Anti-generic | blacklist인가 justify-or-change인가 |
| 8 | 한국어 타이포 | `keep-all`, 줄바꿈, 혼용 처리 유무 |
| 9 | Browser feedback loop | 반복 횟수·종료 조건 |
| 10 | 평가/선호 | 자기평가 vs 외부 신호 |

산출물: `gap-matrix.md` + "재사용 / 참고만 / 직접 필요" 결론. 한국어 근거는 W3C Korean Layout Requirements(klreq) 등 1차 자료를 별도 목록으로 만든다.
**조사 결과 gap이 작으면 여기서 프로젝트 범위 축소를 제안한다.**

## 3. Baseline Protocol (STEP 5)

조건
- **A** Plain Claude
- **B** Claude + 가장 강한 기존 조합 (STEP 1 결과로 확정: 예상 후보 `frontend-design` + Impeccable + browser QA)
- **C** Harness v0.1 — **STEP 7 이후에만 실행**. 지금은 A/B만.

통제 변수: 프롬프트 원문, 콘텐츠 텍스트, 이미지, 기능 요구, 모델/버전, 브라우저·viewport 세트는 모든 조건에서 동일. 조건당 **3회**(variance 확인), T1 하나로 시작해 파이프라인 검증 후 확장.

실행 절차 (run 1회)
1. 조건별 깨끗한 디렉터리에서 동일 brief로 생성, 최대 보정 루프 3회(브리프 §30).
2. Playwright로 320/375/768/1024/1440 스크린샷, DOM 기반 가로 sweep(320→1440, 64px 간격) 결과 저장.
3. Mechanical QA 자동 체크(overflow, clipping, overlap, contrast, touch target, 줄바꿈 이상) 결과를 JSON으로 저장.
4. 각 run에서 관찰된 문제를 `failures/log.md`에 기록(작업·viewport·증상·영향·분류·심각도).

평가 (층 분리)
- Mechanical QA: 자동. 
- Design Contract QA: Baseline 단계에선 생략(계약이 아직 없음).
- External signal: 조건명을 가린 pairwise 비교, 순서 랜덤화, `A / B / 차이 없음` + 한 줄 이유. 평가자는 처음엔 사용자, 이후 1~2명 추가.
Harness 자체의 점수는 최종 판정에 쓰지 않는다.

## 4. Benchmark 구조 (STEP 4)

6개 후보(T1–T6)는 유지하되 **T1, T3, T5 세 개로 시작**한다.
- T1 Marketing Landing: Hero/CTA/composition
- T3 Korean Content Page: 한국어 타이포 (유력 차별화 영역이라 필수)
- T5 Responsive Stress: 복합 레이아웃의 반응형

T2/T4/T6은 파이프라인이 안정된 후 추가. 각 task 폴더는 `brief.md`(사용자 요청 원문), `content.md`(고정 텍스트), `assets/`, `acceptance.md`(기능·IA 요구)로 구성한다. T4(Reference-driven)는 reference 분석 설계가 필요하므로 후순위.

## 5. Operational Design Vocabulary v0.1 (STEP 3)

- 형식: `label / operational definition / hard constraints / preferred range / relational rules / anti-patterns / exceptions`.
- 범위: 사용자 선호 데이터셋에서 이미 나온 개념 위주 — `calm`, `clear`, `structured`, `distinctive-not-experimental`, `dynamic-not-playful`, `minimal-not-empty`, `informative-not-text-heavy`, `hierarchy`, `density`. 약 8~10개.
- 숫자화는 강제하지 않는다. "heading ≥ body × 2.5" 같은 보편 수치 규칙 금지.
- 선호 가설(§33)과 DG-001/002는 **candidate** 상태로만 기록하고, 확정 Rule로 쓰지 않는다. Reference에서 온 추론은 `observed / inferred(confidence, alternatives, verification) / adopted`를 분리한다.

## 6. 최소 v0.1 구현 계획 (STEP 7, 조건부)

Failure Log에서 **2회 이상 반복되고 기존 조합이 해결하지 못한 것만** 대상으로 한다. 현재 사전 예상(미검증):

1. **Korean typography 모듈** — 한국어 Hero 줄바꿈/keep-all/혼용 판단 (reference 1개 + 자동 검사 1개)
2. **Design Decision 단위** (`Condition→Decision→Rationale→Implementation→Anti-pattern→Exception`) 5~10개, 실패 사례에서 역으로 도출
3. **Human preference loop** — A/B/C 후보 렌더 → 선택 + 이유 기록 (High impact ∧ High uncertainty일 때만)

형태: 가능하면 기존 도구 위에 얹는 얇은 `SKILL.md` 하나 + 참조 문서. 독립 Skill 분리는 context isolation 필요가 입증될 때만.
종료 후: 동일 benchmark로 C 조건 재실행 → rule별 ablation(제거 실험) → Keep / Modify / Delete 결정.

## 7. 단계별 게이트

| 단계 | 산출물 | 다음으로 가는 조건 |
|------|--------|--------------------|
| 1 조사 | gap-matrix | 직접 만들 gap이 실재하는가? 아니면 범위 축소안 제출 |
| 2 실험 환경 | Playwright 캡처 + Mechanical QA 스크립트 | 임의 HTML에 대해 재현 가능하게 동작 |
| 3 Vocabulary | v0.1 | 사용자 검토 |
| 4 Benchmark | T1/T3/T5 | 사용자 검토 (콘텐츠 고정본 승인) |
| 5–6 Baseline/Failure | runs, F-log | 반복 failure ≥ 2건 확인 |
| 7+ | Harness v0.1 | 위 failure에만 대응 |

## 8. 검토 요청 사항

1. 저장소 구조와 `web-ui-harness/` 위치에 동의하는지
2. 시작 benchmark를 T1/T3/T5로 좁히는 것에 동의하는지
3. Baseline의 B 조건을 STEP 1 결과로 정하는 것에 동의하는지
4. 평가자: 처음엔 사용자 단독 + 이후 1~2명 추가로 괜찮은지
5. 실행 환경: 이 클라우드 세션(Chromium/Playwright 설치됨)에서 Baseline을 돌려도 되는지, 외부 사이트 접근(OSS repo 조사)이 허용되는지 확인 필요

승인되면 STEP 1(조사)부터 시작한다.
