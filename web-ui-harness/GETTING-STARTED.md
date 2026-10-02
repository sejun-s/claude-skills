# 웹 UI 만들기 — 시작하기

새로 만든 `web-ui-craft`는 Impeccable의 시각 설계 지침을 재사용하고 한국어 화면·실제 캡처·수정 흐름을 연결한 실사용 스킬입니다. 첫 적용 결과는 [알파로그 데모](experiments/gpt-phase/alphalog-v1/index.html)입니다. 사용자 선호 개선 효과가 검증됐다고 주장하는 연구 릴리스는 아닙니다.

## 스킬 설치

저장소 루트에서 아래 중 사용하는 도구를 선택하세요. 기존 동명 스킬이 있으면 덮어쓰지 않고 중단합니다.

```sh
node web-ui-harness/skills/web-ui-craft/scripts/install.mjs --agent codex
node web-ui-harness/skills/web-ui-craft/scripts/install.mjs --agent claude
```

Codex에는 `~/.codex/skills/web-ui-craft`, Claude Code에는 `~/.claude/skills/web-ui-craft`로 설치됩니다. Codex의 `CODEX_HOME` 설정은 존중합니다. 특정 프로젝트에만 설치하려면 `--project /path/to/project`를 붙입니다. Codex 프로젝트는 `.agents/skills`, Claude Code 프로젝트는 `.claude/skills`를 사용합니다. 설치된 스킬은 새 세션에서 불러오세요.

예시 요청:

> $web-ui-craft를 사용해 이 웹 UI를 만들어주세요. 제공한 콘텐츠와 레퍼런스를 바탕으로 구성·타이포·제품 시각물을 다듬고, 모바일과 데스크톱을 렌더해서 확인해주세요.

Claude Code에서는 `/web-ui-craft`로 명시적으로 호출하거나 한국어 웹 UI 제작/개선 요청으로 사용합니다. 이 패키지는 기본 자동 선택을 허용합니다. 실제 자동 선택과 미적 품질은 모델과 요청에 따라 달라질 수 있습니다.

## 알파로그 데모 실행

Node 20+ 환경에서:

```sh
node web-ui-harness/experiments/gpt-phase/alphalog-v1/fetch-fonts.mjs
node web-ui-harness/skills/web-ui-craft/scripts/serve.mjs --root web-ui-harness/experiments/gpt-phase/alphalog-v1 --port 8787
```

[http://127.0.0.1:8787](http://127.0.0.1:8787)에서 열립니다. 첫 명령은 고정된 Pretendard 커밋에서 Regular/Bold만 받고 SHA-256과 OFL 라이선스를 기록합니다. 폰트 바이너리는 Git에 포함하지 않습니다. 둘째 명령은 종료할 때까지 로컬 서버를 유지합니다.

데모에서는 설비 선택, 분석 기간 변경, 점검 일정 탭, 모바일 메뉴, 기능 펼치기, 요청 내용 준비·복사가 동작합니다. 회사·제품 데이터·성과·고객은 가상이며 서버 전송 기능은 없습니다.

## 캡처와 확인

기존 Playwright가 있으면 `PLAYWRIGHT_PATH`로 모듈 경로를 지정합니다. 없으면 `web-ui-harness/skills/web-ui-craft/scripts`에서 `npm install`합니다. 설치된 Chrome은 `--browser chrome` 또는 `CHROME_BIN`을 사용합니다. Playwright 브라우저를 쓰려면 필요한 Chromium을 별도 준비합니다.

```sh
node web-ui-harness/skills/web-ui-craft/scripts/capture.mjs http://127.0.0.1:8787 --browser chrome --out /path/to/evidence
node web-ui-harness/experiments/gpt-phase/alphalog-v1/verify.mjs
```

`verify.mjs`는 설치된 Chrome을 기본으로 사용하고 `CHROME_BIN`을 존중합니다. 커스텀 포트는 `UI_PREVIEW_URL`로 지정합니다. 캡처 도구는 asset·폰트·가로 넘침·콘솔 오류를 검사하며, 데모 검증은 실제 컨트롤·키보드·폼·클립보드와 텍스트 대비를 확인합니다. 캡처 도구의 overflow와 누락 폰트 실패 검출도 검사합니다. 어느 것도 미적 품질의 자동 점수는 아닙니다.

오픈소스 출처·고정 커밋·라이선스는 [THIRD-PARTY.md](skills/web-ui-craft/THIRD-PARTY.md), 이번 작업과 한계는 [HANDOFF-REPORT.md](HANDOFF-REPORT.md)에 있습니다.
