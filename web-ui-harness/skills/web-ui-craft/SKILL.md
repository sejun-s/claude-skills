---
name: web-ui-craft
description: Build or refine distinctive, usable website and web-app UI through composition, typography, product visuals, and rendered iteration. Use for landing pages, dashboards, or frontend polish, including Korean UI. Preserve an established design system. Not for research-only audits or unrelated backend work.
license: Original instructions MIT; adapted Impeccable guidance Apache-2.0, see THIRD-PARTY.md.
---

# Web UI Craft

목표는 실제로 쓰고 싶은 웹 UI다. 계획 문서, 디자인 용어, 검사 통과를 화면의 완성도로 착각하지 않는다. 한국어/영어 요청 모두 처리하며 기존 프레임워크·디자인 시스템·사용자 지정 스타일을 우선한다.

## 작업 흐름

**맥락을 읽고 바로 시작한다.** 저장소, 기존 화면, 브리프, 제공된 레퍼런스에서 목적·주 행동·제약을 파악한다. 빠진 내용은 합리적으로 추론해 짧게 알리고 결과를 크게 바꿀 정보만 질문한다. 이미 답한 질문을 반복하지 않는다.

**방향을 화면으로 번역한다.** [references/visual-craft.md](references/visual-craft.md)의 관련 항목만 읽는다. 새 페이지라면 콘텐츠에 맞는 구성, 타이포, 색·밀도, 시각물의 역할을 결정해 구현한다. 기존 정체성은 요청 없이 교체하지 않는다. 제품 기능은 실제 UI로, 관계는 다이어그램으로, 제품의 물성은 적절한 이미지로 표현한다. 이미지가 필요할 때 합법적 에셋·이미지 도구를 활용하고 라이선스와 출처를 보존한다. SVG는 아이콘·차트·정확한 도형에 적합하며 사진을 흉내내는 조잡한 도형은 피한다.

**중요한 부분부터 완성한다.** 첫 화면의 초점과 주 행동, 제품 시각물, 대표 콘텐츠, 모바일 재구성에 먼저 시간을 쓴다. 의미가 다른 섹션을 똑같은 카드 격자로 처리하지 않는다. 카드·그라데이션·분할 hero를 일률적으로 금지하지도 않는다. 선택이 제품과 목적에 맞는지 화면으로 판단한다. 실제 링크·컨트롤·상태도 구현한다. 가상의 서비스·데이터는 표시하고 없는 전송·저장·인증을 성공했다고 보이지 않는다.

**렌더하고 수정한다.** 브라우저를 사용할 수 있으면 첫 구현과 최종 수정 후 실제 화면을 확인한다. 검사 도구가 이미 있으면 재사용하고, 없으면 `scripts/capture.mjs`로 모바일·중간 폭·데스크톱을 한 번에 캡처한다. 첫 화면과 전체 페이지를 둘 다 본다. 가장 영향이 큰 문제를 묶어서 고치고 다시 캡처한다. 통상 1–3회면 충분하지만 남은 기능/표시 오류를 그대로 완료 처리하지 않는다.

한국어는 `lang="ko"`, 읽기 편한 행간, 실제 로드된 폰트를 확인한다. `word-break: keep-all`을 기본 후보로 쓰되 좁은 표·긴 단어의 overflow를 확인한다. 짧은 복합어나 숫자+단위는 필요할 때 보존하지만 긴 절 전체 nowrap과 고정 `<br>`를 일반 해법으로 쓰지 않는다. 좁은 폭에서 글자를 과도하게 줄여 문장을 억지로 맞추지 않는다.

**근거를 남기고 전달한다.** 아래를 함께 확인한다.
- 시각: 초점, 그룹 간 리듬, 내용이 담긴 시각물, 타이포·색·디테일의 일관성.
- 기술: 폰트·이미지 로드, 가로 넘침, 대비, 키보드 focus, reduced motion, 주 행동과 폼 상태.
- 범위: 요구사항, 바뀐 콘텐츠, 가상 데이터와 미연결 기능.

결과 링크/실행법, 검사한 폭과 주요 행동, 미해결 제한을 짧게 보고한다. DOM 검사는 기술적 근거이며 'AI티 제거'나 미적 개선의 증명이 아니다. 사용자 평가 없이 효과를 확정하거나 검증된 하니스 기능이라고 승격하지 않는다. GitHub 등록·배포는 세션에서 승인된 범위만 수행한다.

## 도구 실행

Node 20+와 Playwright가 필요하다. `scripts/package.json` 디렉터리에서 `npm install`하거나 기존 모듈 경로를 `PLAYWRIGHT_PATH`로 지정한다. 설치된 Chrome은 `--browser chrome`, 실행 파일은 `CHROME_BIN`으로 선택한다. 브라우저가 없을 때 필요한 설치만 진행한다.

```sh
node scripts/serve.mjs --root /path/to/site --port 8787
node scripts/capture.mjs http://127.0.0.1:8787 --out /path/to/evidence --widths 320,375,768,1440
```

`capture.mjs`는 화면과 DOM 근거를 저장하며 asset/폰트 오류·가로 넘침·콘솔 오류에 exit 1이다. 미적 품질은 직접 봐야 한다. 도구 실행 불가 시 확인하지 못한 내용을 밝힌다.
