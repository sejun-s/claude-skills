# GPT practical delivery — 2026-10-02

사용자는 후속 대화에서 목적을 ‘실제 웹 UI를 잘 만들면서 스킬도 완성’으로 명확히 했고, 오픈소스를 활용해 불필요한 연구 시간을 줄이도록 요청했다. 이번 단계는 그 범위에 맞춘 실사용 산출물이다. 기존 blind 평가·하니스 승격 판정을 대신하지 않는다.

## 결과

- 새 스킬: `skills/web-ui-craft/`. 맥락 읽기 → 구성/타이포/시각물 구현 → 실제 캡처 → 수정 → 근거 전달. Codex/Claude Code용 설치 스크립트, Playwright 캡처, 의존성·라이선스·출처 포함.
- OSS: Impeccable `508d7e8955de3b3caf2d8676e85206723d41a887`의 craft-floor/layout/typeset/colorize 지침 일부를 재사용·수정. Apache-2.0 원문과 NOTICE를 보존. upstream CLI나 binary는 포함하지 않음.
- 웹 UI: `experiments/gpt-phase/alphalog-v1/`. full-width working product canvas, 선택 가능한 설비·기간, 키보드 탭과 점검 표, 기능 disclosure, 모바일 메뉴, 실제 validation·요청 준비·clipboard·입력 정보 페이지.
- 시작 문서: `GETTING-STARTED.md`. 설치·실행·캡처·검증 명령과 제한을 포함.

## 검증 근거

`experiments/gpt-phase/alphalog-v1/evidence/capture.json`: 320/375/768/1440 모두 asset/폰트 오류·콘솔 오류·document/heading overflow 미검출. 첫 화면과 전체 페이지를 실제로 열어 확인함. 폰트는 Regular/Bold 둘 다 loaded이며 네트워크 font SHA-256을 저장.

`evidence/interaction-tests.json`: 15개 검사 통과. 설비 선택, 기간 변경, 키보드 탭, disclosure, required/email validation, 준비된 텍스트의 inert 처리와 POST 없음, clipboard 실제 내용, 입력 수정 시 stale 결과 숨김, mobile menu/Escape/anchor, 상태 변경 후 6개 폭 overflow, 정보 페이지, visible HTML text 대비, capture overflow/missing font negative controls, reduced motion.

`verify.mjs`의 대비 검사는 보이는 HTML 텍스트/solid 배경을 대상으로 한다. SVG 텍스트, focus/hover, 이미지 대비와 모든 WCAG 조건을 보증하지 않는다. 실제 SVG 축 라벨은 모바일에서 확대하고 직접 확인함. 개선 중 제목의 장식 마침표 대비 실패를 발견해 색을 변경했으며, 요청 내용을 만든 후 입력을 수정하면 오래된 결과를 숨기도록 보완했다.

스킬은 공식 `skill-creator/scripts/quick_validate.py`로 검증했다(Windows UTF-8 모드). 검증기는 구조·frontmatter를 확인하며 모델의 자동 선택이나 미적 판단을 증명하지 않는다. 이 패키지는 같은 작성 모델이 첫 UI에 적용한 사용 예시이며 독립 생성 실험은 아니다.

환경: Windows, Node 24.18.0, Playwright 1.62.1, installed Chrome 154.0.8037.93. 생성자는 이 Codex 세션의 GPT 계열이다. 정확한 호출 모델 식별자는 실행 환경에서 노출되지 않아 임의로 기록하지 않는다. 이전 Claude A/B/C/D 결과와 합산하지 않는다.

폰트 출처는 Pretendard `7aeb0698819be2b4097dae8ec8fe6a795e5cf3ae`, OFL-1.1. `fonts/manifest.json`에 URL/SHA-256이 있고 `fetch-fonts.mjs`로 같은 자산을 복원할 수 있다. 폰트 바이너리는 ignored이며 원본 라이선스만 저장한다. 스크린샷과 raw 결과는 근거로 저장한다.

## 재현 및 남은 제한

`GETTING-STARTED.md`의 명령으로 폰트 복원 → 서버 → 캡처/verify를 실행한다. 새 스킬은 local Codex/Claude Code 디렉터리에 복사 설치할 수 있으며 동명 스킬은 덮어쓰지 않는다.

- 사용자 선호, ‘AI티 감소’ 또는 일반적인 미적 개선은 아직 확정하지 않음. 실제 화면을 확인한 사용자 판단이 남아 있음.
- 스킬 자동 호출은 모델/클라이언트별로 실사용 확인 필요. 구조 검증과 명시적 적용만 완료.
- 데모는 가상 서비스이며 실제 문의 전송·저장·인증이 없음. 입력은 화면에서만 처리됨.
- T1 대비 새 slogan/카피/제품 시각물/생성 모델이 달라 통제된 디자인 효과 비교로 해석할 수 없음.
- 기존 experimental ko-heading-wrap, 과거 blind 패키지, gold, 스윕 도구는 수정하지 않았다. 하니스 승격된 실험 기능 수는 여전히 0개다. 새 스킬은 별도 사용 가능 초안이다.

추가 제언: 다음 작업은 새 연구 task를 늘리는 것보다 사용자가 실제로 만들 사이트에 이 스킬을 적용해 화면을 다듬는 것이 효율적이다. 반복해서 도움이 된 지침은 남기고, 의미 없는 고정 규칙과 불필요한 context는 줄인다. 폼의 서버 전송은 실제 서비스를 운영할 때 별도로 연결한다.
