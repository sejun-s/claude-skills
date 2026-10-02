# GPT 독립 QA — 2026-10-02

검토 대상: `claude/modest-shannon-s7z80t`의 `a5b8b32f3ddef8f20ff84527294c42d72dd850bb`.

먼저 [QA-report.md](QA-report.md)를 읽으세요. 현재 experimental 유지 결정은 타당하나 평가 패키지의 localStorage 충돌, 측정기의 소형 타깃 누락·줄 수 오판정, JSON 출력·gold coverage, 폰트 재현 경로를 수정할 필요가 있습니다. 실험 구현을 수정한 PR이 아니라 QA 기록입니다.

## 근거 파일

- [blind-headings-pre-key.json](blind-headings-pre-key.json): 키 공개 전 최초 판정. 아래 정정 파일과 함께 해석해야 합니다.
- [blind-headings-correction.json](blind-headings-correction.json): P10 이미지 확인 오류 철회, 키 공개 후 재확인에 따른 독립 집계 제외, 최종 집계.
- [gold-review.json](gold-review.json): 한국어 gold 14개 구의 독립 판정.
- [reproduction-results.json](reproduction-results.json): 도구 결함 재현, 저장된 mechanical report 42개 검사, 평가 저장 충돌 확인.
- [corpus-T1-T3.json](corpus-T1-T3.json), [corpus-T3b.json](corpus-T3b.json): 원 HTML을 Windows/Chrome 154에서 다시 측정한 27개 run 결과. 원 실험과 동일 환경의 재현으로 해석하지 마세요.
- [mixed-font-one-line.png](mixed-font-one-line.png): 검사기가 세 줄로 판정한 실제 한 줄 화면.

기존 Claude 패널은 T1 A/B 전체 페이지 순위입니다. 이번 제목 B/C·D/C 평가와 직접 순위 일치 여부를 비교할 수 없습니다. P10은 정상 이미지이며 빈 화면 결함이 아닙니다.

## 재현 코드

`reproduce.mjs`와 `corpus-headings.mjs`는 원 QA 코드에서 실행 경로만 이 폴더 기준으로 정리한 것입니다. Playwright와 Chromium이 필요하며 이 기록은 의존성을 설치하지 않습니다. 기존 환경의 모듈 경로는 `PLAYWRIGHT_PATH`, 브라우저 실행 파일은 `CHROME_BIN`으로 지정할 수 있습니다. 원 실험 Linux 환경에서는 두 변수를 `/opt/node-tools/node_modules/playwright`, `/opt/pw-browsers/chromium`으로 지정하세요.

1. `generated/fonts/`에 Pretendard Regular/Medium/SemiBold/Bold의 `.woff2` 파일을 준비합니다. 공용 `experiments/tools/fetch-fonts.sh`의 결과를 복사할 수 있습니다. 폰트는 이 QA 커밋에 포함하지 않습니다.
2. 이 폴더에서 `node corpus-headings.mjs T1 T3 T3b`를 실행합니다. 원 HTML을 수정하지 않고 `generated/rerender/`에 폰트 경로를 복원한 복사본을 만듭니다.
3. `node reproduce.mjs`를 실행합니다. 결함 재현 결과는 `generated/reproduction-results.json`에 기록됩니다. 이 단계는 앞서 생성된 `generated/rerender/T3b-C-1.html`을 폰트 로드 확인에 사용합니다.

새 출력은 `.gitignore` 처리된 `generated/`에 저장되어 기존 QA 결과를 덮어쓰지 않습니다. 원 실험과 다른 브라우저·폰트·OS를 사용하면 정확한 측정 수치가 달라질 수 있습니다. `--json` 출력의 기존 결함 때문에 corpus 코드는 JSON 배열 뒤의 요약을 분리하여 읽습니다.
