# Benchmarks (STEP 4 초안 — 사용자 검토 대기)

디자인 효과와 콘텐츠 효과를 분리하기 위해 아래를 **모든 조건(A/B/C)에서 고정**한다.

| 고정 | 규칙 |
|------|------|
| 텍스트 | `content.md`의 문구를 **그대로** 사용. 추가/삭제/수정 금지. 순서 변경은 허용(IA 재배치는 디자인 판단), 단 누락 금지 |
| 이미지 | `assets/`의 파일만 사용. 외부 이미지·스톡·생성 이미지 금지. 사용하지 않아도 됨 |
| 기능 | `acceptance.md`의 기능 요구를 충족 |
| 폰트 | `experiments/tools/fonts/Pretendard-*.woff2`를 작업 폴더의 `fonts/`에서 상대경로 `@font-face`로 사용 (run 시작 시 `new-run.sh`가 복사). CDN/외부 요청 금지 (이 환경은 CDN 차단, 측정 일관성 목적) |
| 산출물 | 단일 `index.html` + 선택적 `style.css`/`script.js`. 프레임워크/빌드 불필요 |
| 프롬프트 | 각 task의 `brief.md` 본문을 **한 글자도 바꾸지 않고** 조건 A/B에 전달 |

가상 회사/수치는 전부 허구다. 실제 브랜드와 무관하며, 수치는 검증 대상이 아닌 고정 입력이다.

## 시작 세트
| ID | 목적 | 주 관측 개념 (vocabulary) |
|----|------|---------------------------|
| T1 Marketing Landing | hero 구성, 범주 전달, 추상적 B2B 서비스 설명 | V-01, V-04, V-06, V-07, V-10 |
| T3 Korean Content Page | 한국어 타이포, 장문 가독성, 한영·숫자 혼용 | V-11, Korean wrap(Mechanical) |
| T5 Responsive Stress | 복합 레이아웃의 320–1440 반응형 | Mechanical QA, V-03 |

T2/T4/T6은 파이프라인 안정 후 추가. 각 task의 선호 방향(사용자 선호 데이터셋)은 **brief에 넣지 않는다**: brief는 일반 사용자 요청처럼 쓰고, 선호 정의는 조건 C(Harness)에서만 context로 주입되므로 A/B와 공정 비교가 가능하다. (B의 Impeccable은 자체 init 질문을 쓰므로 그 응답은 `experiments/runs/*/context.md`에 기록한다.)

## 폴더 규약
`brief.md`(전달 프롬프트) / `content.md`(고정 문구) / `assets/` / `acceptance.md`(기능, 5초 테스트 정답, 기계 기준)
