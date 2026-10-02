# 인수인계: 남은 ~40% (Claude → ChatGPT) — 2026-10-02

Claude는 이 시점부터 **QA 담당**이다. 구현·실험은 ChatGPT가 이어받고, Claude가 결과를 검수한다. 사용자(의사결정자)는 마지막 판정을 한다.
먼저 읽을 것: `README.md`(현재 상태) → `decisions/log.md`(D-001~D-007) → `failures/log.md` → `experiments/eval/gpt-qa-response.md`(이전 QA와 정정 사항).

## 0. 반드시 지킬 원칙 (위반하면 Claude QA가 반려)
1. **자기평가를 최종 품질 판정으로 쓰지 않는다.** "개선됨/유지"의 최종 근거는 사용자 blind 평가다. 모델 평가자(Claude·GPT 모두)는 방향 신호일 뿐이다.
2. **승격 기준:** ≥2개 task에서 반복 + 기존 도구가 못 풂 + 위약 대조군/hold-out 통과. 근거 없이 규칙·수치를 확정하지 않는다.
3. **기존 결과를 덮어쓰지 않는다.** 도구·gold·brief를 바꾸면 **새 버전 파일**로 만들고 이전 수치와 섞지 않는다. 실험 도중 도구를 바꾸지 않는다.
4. **측정 환경을 도구가 검증하게 한다.** 제목 측정은 Pretendard가 로드된 상태에서만 유효하다(`heading-lines.mjs` v0.3은 미로드 시 exit 3). run 폴더에 `fonts/`가 필요하다(`experiments/tools/fetch-fonts.sh`, 각 run의 `fonts/`에 복사. gitignore됨).
5. **gold/키는 작성 주체에게 공개하지 않는다.** gold 파일(`benchmarks/**/gold-*.json`)과 `*-key.json`은 평가 대상 생성자·평가자가 보기 전에는 열지 않는다. 지침/예시에 벤치마크 문구를 넣지 않는다(과거 오염 사례: D-003).
6. **에이전트/모델의 자기 보고를 사실로 쓰지 않는다.** 문구 추가·수정 후 재확인 같은 주장은 렌더·diff·측정으로 검증한다.
7. 불확실한 것은 불확실하다고 쓴다. 정정이 생기면 숨기지 말고 로그에 남긴다.

## 1. 남은 일 (우선순위 순)
**A. 사용자 blind 평가 준비·수집 지원** (사용자가 응답하면 분석)
- `experiments/eval/human-blind-headings/`(12쌍), `human-blind/`(17쌍)는 v2로 재생성 완료. GPT는 **키를 보기 전에** 같은 패키지를 독립 평가해 `experiments/eval/gpt-qa-2026-10-02/` 형식으로 기록(375/768 응답 분리). 이전 GPT blind 결과(C 7 : B 2)는 폰트 누락 이미지에 대한 것이라 **무효**다.
- 사용자 응답(JSON export, `format: 2`)이 오면 키 파일로 해독 → 조건별 집계 → 유지/삭제 판정 초안(D-008).

**B. ko-heading-wrap 판정 정리** (사용자 평가 후)
- gold v2(`benchmarks/gold-nobreak-v2.json`)의 strong/soft는 결과를 본 뒤 나눈 **탐색적** 분류다. 확정하려면 **새 hold-out(예: T3c) + 새 gold를 실험 전에 고정**하고 재실험(B / D 위약 / C, 조건당 ≥3, 폰트 로드 확인).

**C. 후보 검증: 첫 화면 신뢰 증거·대상 명시** (T1 한 task의 근거만 있음)
- T1 v0.3: 실제처럼 보이는 가상 연락처/고객명, 내비 정리("가격" 대응 콘텐츠), brief에 문구 추가 금지 포함. B vs B+짧은 결정 규칙(후보). 5초 테스트(`experiments/protocol.md`) 사용. **승격하지 않고 후보로만 평가.**

**D. Benchmark 확장** (T2 대시보드, T4 reference 재해석, T6 컴포넌트/폼) — 명세·acceptance·gold를 **실험 전에 동결**. T5에서 본 F-010(표 셀 어절 분할)을 재현하는 task 포함.

**E. 패키징** — `skills/ko-heading-wrap`의 설치 가능성(경로 비하드코딩 점검 `doctor`), 회귀 테스트 유지, VERSION/CHANGELOG, README에 승격/후보/기각 표 갱신.

## 2. ChatGPT가 못 하는 것 / 하면 안 되는 것
- 사용자 대신 blind 평가 최종 판정을 내릴 수 없다.
- Claude의 서브에이전트(조건 A/B/C 생성기)를 그대로 재현할 수 없을 수 있다. 새 생성 조건이 필요하면 **조건 이름을 새로 붙이고(예: E=GPT 생성) 기존 A/B/C와 합산하지 않는다.** 생성 모델이 바뀌면 모델 효과가 섞인다.
- 이 세션의 푸시 권한은 브랜치 `claude/modest-shannon-s7z80t`뿐이었다(태그 403). 필요하면 사용자가 권한을 조정한다.

## 3. 작업 방식
- 같은 브랜치에 **작은 커밋**으로. 새 산출물은 `experiments/gpt-phase/` 아래, 새 버전 파일은 이름에 버전을 붙인다. 기존 `runs/`, `failures/`, `decisions/` 본문은 **추가만** 한다(정정은 새 섹션으로).
- 끝나면 `HANDOFF-REPORT.md`를 남긴다: 한 일, 재현 명령, 수치(원 데이터 경로), 한계, 미해결.
- Claude QA는 `QA-CHECKLIST.md` 기준으로 검수한다.
