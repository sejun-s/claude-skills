# Web UI Design Harness — 상태 (2026-10-02)

**한 줄 상태: 기반·측정·baseline 완료, 승격된 기능 0개, 품질 판정은 사용자 blind 평가 대기. GPT 독립 QA(2026-10-02)로 측정 결함을 찾아 수정했고 일부 수치를 정정했다(`experiments/eval/gpt-qa-response.md`).**

목표(브리프): Claude가 만든 한국어 웹 UI를 평균적인 AI 디자인에서 *의도 있는 디자인*으로 끌어올리는 Harness. 원칙: 기존 OSS 재사용 → baseline에서 반복 관찰된 failure만 기능으로 승격 → 자기평가를 최종 판정으로 쓰지 않는다.

## 현재 산출물
| 구분 | 위치 | 상태 |
|------|------|------|
| 기존 도구 조사 (frontend-design, Impeccable, UI/UX Pro Max, QA/추출기 8종) | `research/` | 완료. 결론: Intent·시각 QA·루프는 재사용, 한국어/평가는 비어 있음(단 한국어 줄바꿈 가설은 부분 반증) |
| Operational Design Vocabulary | `vocabulary/v0.1.md` | 11개 candidate. 신뢰감·전문성은 관찰 근거 없음 |
| Benchmark (T1 랜딩 / T3 한국어 장문 / T3b hold-out 제목 / T5 반응형) | `benchmarks/` | 콘텐츠 동결(T1 v0.1, 나머지 v0.2 brief). 가상 연락처가 가짜처럼 보임(T1 결함) |
| 측정 환경 | `experiments/tools/` (`qa.mjs`, `new-run.sh`, `collect-run.sh`) | 동작. 320–1440 스윕, 오버플로·잘림·터치·한국어 끊김·고아 줄, Impeccable 연동 |
| Run 기록 | `experiments/runs/` | T1 A/B/CL/C, T3 A/B/CL/C, T3b B/D/C, T5 A/B/C (조건당 3회) |
| Failure Log / Decision Log | `failures/log.md`, `decisions/log.md` | F-001~F-010, D-001~D-006 |
| 확장 후보 1: 한국어 제목 구 줄바꿈 | `skills/ko-heading-wrap/` (v0.2.0) | **experimental, 효과 미입증** (T3b hold-out 재현 실패) |
| 사용자 blind 평가 패키지 | `experiments/eval/human-blind/` (17쌍), `human-blind-headings/` (12쌍) | 저장 충돌 수정·제목 이미지 폰트 복원 후 **재생성**(v2). **응답 대기** |
| 독립 QA (GPT) | `experiments/eval/gpt-qa-2026-10-02/`, 대응: `experiments/eval/gpt-qa-response.md` | 6개 지적 모두 재현·수정. 폰트 누락으로 이전 제목 수치·crop 무효 → 재측정 |
| gold v2 | `benchmarks/gold-nobreak-v2.json` | strong/soft 분리(탐색적). v1과 수치 혼합 금지 |

## 승격 상태
- **승격 기능: 0개.** ko-heading-wrap은 T1·T3(자명한 gold)에서는 10→1이었으나 hold-out(어려운 gold, 위약 D 포함)에서 재현 실패 → 후보로 격하.
- 후보(근거 부족): F-010 표 셀 한국어 어절 분할(T5 한 task), 첫 화면 신뢰 증거·대상 명시(T1 한 task, 카피 교란), 카드 반복 구성(T1 A-1).
- 기각/보류: hero 구성 수렴(F-001, 에셋 제약으로 정당화).

## 확인된 사실 (측정 기준)
- 기존 스택(B)은 plain Claude(A)보다 T1 proxy 평가에서 일관되게 상위였으나, 카피 교란·같은 모델 계열 평가라 **품질 개선 근거로 쓰지 않는다**.
- 반응형 기본 품질(오버플로·잘림·터치)은 T5(1 task, 조건당 3회)에서 A/B/C 모두 0건 → 현재 T5에서 추가 기능의 필요성은 관찰되지 않음(측정기의 미탐 가능성 포함).
- 한국어 어절 중간 끊김은 본문/제목에서는 `keep-all`로 6/6 해결, 표 셀에서는 조건 무관 발생.
- 에이전트 자기 보고는 반복해서 실측과 달랐다(문구 추가, "0건" 보고, 수정 후 재확인). 모든 사실은 렌더·측정으로 검증.

## 역할 분담 (2026-10-02~)
- 구현·실험: ChatGPT(인수인계 문서 `HANDOFF-TO-GPT.md`) / **QA: Claude**(`QA-CHECKLIST.md`) / 최종 판정: 사용자.

## 사용자가 해야 할 일 (최종 판정)
1. `experiments/eval/human-blind-headings/index.html` — 12쌍, 약 5분. 제목 줄바꿈이 더 자연스러운 쪽 선택. **이 결과가 ko-heading-wrap 유지/삭제를 결정.**
2. `experiments/eval/human-blind/index.html` — 17쌍, 약 15분(`전체 보기`는 선택). B(스킬 스택) vs C(+확장), A 앵커 3쌍, 일관성 점검용 재출제 2쌍.
3. `JSON 내보내기` 결과를 전달. 키 파일(`*-key.json`)은 **평가 전에 열지 말 것.**
4. 5초 테스트(`experiments/protocol.md`)는 task 내용을 모르는 평가자 1~2명이 별도 필요.

## 실행 방법
- 새 run 폴더: `experiments/tools/new-run.sh <T1|T3|T3b|T5> <A|B|C|D> <n>` → 에이전트가 작업 → `collect-run.sh <workdir>`(산출물 복사 + `qa.mjs` 측정).
- 제목 줄바꿈 측정: `node skills/ko-heading-wrap/scripts/heading-lines.mjs <html> [--keep "구1,구2"] --widths 320,375,768,1024,1440` (`--keep` 없으면 구 쪼개짐은 검사하지 않음). 회귀 테스트: `skills/ko-heading-wrap/tests/run.sh`.
- 환경 전제: Playwright 전역 설치, Chromium `/opt/pw-browsers/chromium`(root에서 `--no-sandbox`), 한국어 폰트는 `experiments/tools/fetch-fonts.sh`(Pretendard).

## 버전 고정점 (git 태그는 이 세션에서 푸시 권한이 없어 커밋 SHA로 기록)
- benchmark 콘텐츠 동결(T1/T3/T5 v0.1): 커밋 `af15dfb` (로컬 태그 `benchmark-v0.1-frozen`)
- ko-heading-wrap v0.2.0 고정(T3b·T5 실험에 사용): 커밋 `02b91ea` (로컬 태그 `ko-heading-wrap-v0.2.0`)
- 재현: `git checkout <SHA> -- web-ui-harness/skills/ko-heading-wrap`

## 알려진 한계
- 모든 에이전트·proxy 평가자가 같은 모델 계열. gold 구와 의미 단위 판정은 Claude의 판단. 표본은 조건당 3회, task 4개.
- B는 스킬을 설치한 것이 아니라 읽고 따르게 한 것이며, Impeccable의 일부 단계(`concept-seed`, `context`)는 생략·degraded.
- T1은 문구 추가 교란과 가짜처럼 보이는 가상 연락처로 신뢰 평가가 오염. T2/T4/T6 미구현.
- 비용: 지출 한도에 한 번 걸려 일부 run을 재실행(D-005).

## 다음 단계 (우선순위)
1. 사용자 blind 평가 응답 수령 → 결과 분석 → ko-heading-wrap 유지/삭제 결정.
2. T1 v0.3(실제처럼 보이는 가상 값, 내비 정리)로 *첫 화면 신뢰 증거·대상 명시* 후보 검증(B vs B+짧은 결정 규칙, 후보로만).
3. F-010(표 셀) 추가 task에서 재현되면 승격 검토.
