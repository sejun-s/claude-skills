# Claude QA — GPT 실사용 산출물 검수 (2026-10-02)

검수 대상: 커밋 `a7dfb13`(web-ui-craft 스킬)·`ebf1f07`(알파로그 UI, HANDOFF-REPORT). 기준: `QA-CHECKLIST.md`. 환경: Linux, Node 22, Playwright 1.56.1, Chromium(`/opt/pw-browsers/chromium`) — GPT의 Windows/Chrome 154/Playwright 1.62.1과 다름. 검수 중 GPT 파일은 수정하지 않았다.

**결론: 조건부 PASS.** 보고된 기능·검증은 재현되고 정직한 범위 표기도 지켜졌다. 반려할 항목은 없으나 아래 P2 한 건(글자 크기)은 수정을 권고한다. 이 산출물은 **하니스 연구 결과가 아니라 실사용 초안**이며, 남은 연구 과제(HANDOFF A–E)는 수행되지 않았다.

## 체크리스트 결과
| 항목 | 결과 | 근거 |
|------|------|------|
| 보고 수치 재현 | PASS | `verify.mjs` 15개 검사 전부 통과(제 환경). `capture.mjs` 320/375/768/1440: errors `[]`, network `[]`, exit 0 |
| 측정 환경 검증(폰트) | PASS | `fetch-fonts.mjs`로 받은 woff2의 SHA-256이 커밋된 `manifest.json`과 일치(git diff 없음 = 같은 바이너리). 캡처/검증 도구가 누락 폰트를 negative control로 검사 |
| 독립 도구로 교차 측정 | PASS(+지적) | 제 `qa.mjs` 20폭 스윕: 가로 오버플로·잘림·터치 타깃·한국어 어절 끊김·고아 줄 **0건**. `heading-lines` v0.3: 제목 11개×5폭 넘침 0, 고아 0. 지적은 아래 F1 |
| 출처·라이선스 | PASS | 인용한 Impeccable 커밋 `508d7e8`과 4개 참조 파일(craft-floor/layout/typeset/colorize)이 실제 존재(blob 확인). Apache-2.0 원문·NOTICE 보존, 자체 코드 MIT 분리 표기, upstream 바이너리 미포함 |
| 기존 결과 미덮어쓰기 | PASS | `14eaf66..HEAD`에서 수정(M)된 파일은 `README.md`(루트 한 줄 → 안내문), `web-ui-harness/README.md`, `decisions/log.md`(D-008 추가)뿐. `runs/`·`failures/`·gold·기존 도구 변경 없음 |
| 합산 금지 | PASS | D-008이 새 조건 `E-GPT practical v1`로 분리, 기존 A/B/C/D와 합산 불가·승격 0개 명시 |
| 주장 대 데이터 | PASS | "AI티 감소/효과 입증"을 주장하지 않음. 같은 작성 모델이 첫 UI에 적용한 사례이고 독립 생성 실험이 아니라고 스스로 표기 |
| 스킬 구조 | PASS | 설치 스크립트 정상(임시 프로젝트에 설치, 재설치는 덮어쓰지 않고 거부). frontmatter 유효(description 303자), 본문 34줄로 간결. 과거 결과와 모순 없음("긴 절 전체 nowrap·고정 `<br>`를 일반 해법으로 쓰지 않는다" = D-006과 일치) |
| 시각 확인(제 판단) | 양호 | 1440 첫 화면: 구 단위 제목 줄바꿈("멈추기 전에," / "이미 알고 있도록."), 실제 제품 화면 같은 대시보드. 320px: 구조 재배치 양호. (평가자 1인, 비-blind) |

## 발견 사항
**F1 [P2] 기능 텍스트가 너무 작다.** 실제 화면 기준 10px 14곳(상태 라벨 "주의 78%", "점검 권장", "정상 18%", "지난주 대비 +34%p"), 11px 27곳, 12px 42곳. Impeccable `undersized-ui-text` 12건·`tiny-text` 4건으로도 검출. `verify.mjs`는 대비만 검사하고 글자 크기 하한은 보지 않으며, 스킬의 '기술' 체크 목록(폰트·넘침·대비·focus·reduced motion)에도 최소 글자 크기가 없다. 권고: 상태 라벨·보조 수치를 ≥12px로 올리거나 의도된 예외임을 명시, `capture.mjs`에 최소 크기 경고 추가(차단 아닌 경고).

**F2 [P3] 판단 사항.** Impeccable `gpt-thin-border-wide-shadow` 1건(대시보드 카드의 1px 테두리 + 50px 블러 그림자). 결함이 아닐 수 있는 휴리스틱 경고. 의도라면 유지.

**F3 [P2, 과정] 연구 과제 미수행.** `HANDOFF-TO-GPT.md`의 A(사용자 blind 평가 지원)·B(ko-heading-wrap 판정, 새 hold-out)·C(T1 v0.3 후보 검증)·D(benchmark 확장)·E(패키징 일부)는 수행되지 않았다. 사용자의 후속 지시(D-008)에 따른 방향 전환이므로 위반은 아니다. 다만 `web-ui-harness/README.md`의 '다음 단계'가 이 사실을 반영해 갱신되었는지는 확인하지 못했다 → 연구를 이어갈지 실사용에 집중할지 사용자 결정 필요.

**F4 [P3] 스킬 효과 미검증.** 자동 선택 여부, Claude Code에서의 `/web-ui-craft` 명시 호출, 스킬이 결과를 개선하는지는 검증되지 않았다(GPT 보고도 동일하게 명시). 이 세션에서는 스킬이 설치돼 있지 않아 `/web-ui-craft`가 실행되지 않았다.

## 확인하지 못한 것
- GPT의 Windows 환경 수치 재현(환경 상이), "첫 화면과 전체 페이지를 실제로 열어 확인했다"는 주장(서술만 확인), 접근성 전체(스크린리더, focus/hover 대비), SVG 텍스트 대비, 클립보드 동작의 타 브라우저 호환.
- 사용자 선호·미적 개선(사용자 판단 몫).

## 권고 순서
1. F1 수정(글자 크기) 후 `verify.mjs`·`capture.mjs` 재실행 — GPT 또는 사용자 지시로.
2. 사용자가 실제로 만들 사이트에 이 스킬을 적용해 보고 피드백(HANDOFF-REPORT의 제언에 동의).
3. 연구 과제(A–D)는 사용자가 필요하다고 판단할 때 재개. 재개 시 `QA-CHECKLIST.md`와 폰트 로드 검증 유지.
