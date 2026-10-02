# anthropics/skills 디자인 계열 (frontend-design 중심)

- Repo / commit: https://github.com/anthropics/skills @ 8a1541c (shallow clone, 읽기 전용)
- 조사일: 2026-10-02
- 한 줄 요약: frontend-design은 71줄짜리 순수 산문 가이드(스크립트/체크 0개)로, "계획 -> 브리프 대비 자기검토 -> 구현 -> 스크린샷 자기비평"을 권고만 한다. 결정적 검증은 webapp-testing의 Playwright 도구(with_server.py)에만 있고, 둘은 서로 연결되어 있지 않다.

## 구조 (실제 파일 트리 기준)
- `skills/frontend-design/SKILL.md` (71줄) + `LICENSE.txt`. 스크립트/참조 파일 없음. SKILL.md가 전부.
- `skills/webapp-testing/`: `SKILL.md`(95줄), `scripts/with_server.py`(서버 기동/대기 래퍼), `examples/{element_discovery,static_html_automation,console_logging}.py`. Playwright 헤드리스 자동화 툴킷이며 디자인 평가 기준은 없음.
- `skills/web-artifacts-builder/`: `SKILL.md`(73줄), `scripts/{init-artifact.sh,bundle-artifact.sh,shadcn-components.tar.gz}`. React+Vite+Tailwind+shadcn 번들러. 디자인 지침은 "AI slop" 금지 한 문장뿐.
- `skills/canvas-design/`: `SKILL.md`(129줄) + `canvas-fonts/`(.ttf). 정적 PNG/PDF 포스터용. 웹 UI 아님.
- `skills/theme-factory/`: `SKILL.md`(59줄), `themes/*.md` 10종, `theme-showcase.pdf`. 팔레트+폰트 프리셋.
- `skills/brand-guidelines/`: `SKILL.md`(73줄). Anthropic 브랜드 색/폰트 고정값.

## 항목별 판정
| # | 항목 | 판정 | 근거 | 메모 |
|---|------|------|------|------|
| 1 | Intent/context handling | 부분 | `frontend-design/SKILL.md:13` "identify it yourself before designing, and confirm with the client"; `:47-51` 계획에 color/type/layout/principles | 주제/오디언스/주요 job을 "제안하고 확인"하라는 지시는 있으나, 질문 목록/스키마/파일 고정이 없음. intent를 파일에 저장하라는 지시 없음(메모 언급은 `:59`의 "jot down notes"가 유일, 선택사항). theme-factory는 `SKILL.md` Usage 2-3단계에서 테마 선택만 묻는다(좁은 범위). |
| 2 | Reference analysis (Observed vs Inferred 구분) | 미해결 | `frontend-design/SKILL.md` 전체에 reference/screenshot 분석 절차 없음. grep 결과 레퍼런스 분석 문구 없음 | canvas-design `:89` "DEDUCING THE SUBTLE REFERENCE"는 주제 추론이지 외부 레퍼런스 분석이 아님. Observed/Inferred 구분 없음. |
| 3 | Composition reasoning (viewport 단위) | 부분 | `:17` hero 지침, `:50` "ASCII wireframes ... alignment guidance", `:47` 토큰 계획 | 레이아웃을 ASCII 와이어프레임으로 비교하라는 것은 유용하나, viewport/fold/breakpoint 단위 추론은 없음. 산문. |
| 4 | Typography | 부분 | `:19-23` 서체 1~2종, "type scale following ... The Elements of Typographic Style", 줄길이 <80자, 세리프 line-height 가산; `:25-28` 금지 처리 | 원칙 수준은 가장 구체적. 수치 스케일/폰트 로딩/fallback 규칙 없음. 라틴 기준. |
| 5 | Responsive (구현 지침 vs 검증) | 부분 | `:59` "responsive down to mobile, visible keyboard focus, reduced motion respected" | 구현 품질 바닥선으로 한 줄 언급뿐. 검증 절차(viewport 매트릭스) 없음. webapp-testing에도 viewport 설정 예시 없음(`page.screenshot(full_page=True)`만, `SKILL.md:69`). 즉 "mentions"이므로 부분 이하. |
| 6 | Visual QA (스크린샷/DOM 루프 실제 구현) | 부분 | frontend-design `:59` "taking screenshots to review if your environment supports it"; webapp-testing `SKILL.md:65-76` Reconnaissance-Then-Action, `scripts/with_server.py` | 스크린샷은 선택적 권고(frontend-design). 실행 가능한 도구는 webapp-testing에 있으나 "기능 테스트/셀렉터 탐색" 목적이며 시각 결함 판정 기준(겹침, 잘림, 대비 등)이 없음. 두 스킬 간 연결 지시 없음. |
| 7 | Anti-generic / anti-AI (blacklist vs justify-or-change) | 해결 | `:36-53` 5가지 클러스터(#F4F1EA 크림+테라코타 #D97757 등) 명시 후 "if any part ... reads like the generic default ... revise that part, say what you changed and why"; `:25-28`, `:30`, `:32` | 블랙리스트 + justify-or-change 혼합이 실제 문서화됨. "brief's own words always win"(`:45`)로 오버라이드 규칙도 명확. 단 전부 자기판단(산문), 자동 검출 없음. web-artifacts-builder `:16`은 블랙리스트 한 줄(purple gradients, Inter 등). |
| 8 | Korean typography (keep-all, 줄바꿈, 혼용) | 미해결 | 6개 디렉터리 grep `keep-all\|korean\|cjk\|word-break\|hangul` -> 텍스트 파일 매치 0건(canvas-fonts의 .ttf 바이너리 1건은 Lora 폰트 이름 오탐) | 완전 부재. 줄길이 "80 characters"(`:23`)도 라틴 가정. |
| 9 | Browser feedback loop (반복 횟수/종료 조건) | 미해결 | `:53` "Only after you've confirmed ... start to write the code"; `:59` 스크린샷 자기비평; canvas-design `:126` "Take a second pass" | 반복 횟수/종료 조건/통과 기준 어디에도 없음. 계획 단계 게이트만 존재하고 브라우저 루프는 정의되지 않음. web-artifacts-builder `Step 5`는 오히려 "avoid testing the artifact upfront"(지연 회피)로 반대 방향. |
| 10 | Human preference / 외부 평가 | 미해결 | 근거 없음. 평가 신호는 `:53` 자기검토, `:59` "Critique your own work" 뿐 | 자기판단 외 신호(점수, 다중 후보 비교, 사용자 선호 수집) 없음. theme-factory의 사용자 테마 선택(`SKILL.md` Usage)은 사전 선택이지 평가 아님. |

## 재사용 가능한 것
1. `frontend-design/SKILL.md:36-53`의 "AI 디자인 클러스터 5종 + justify-or-change + 브리프 우선" 블록은 그대로 주입 가능한 anti-generic 프롬프트다.
2. `:47-53`의 2-pass(토큰 계획: 4-6 named hex, 타입 역할, ASCII 와이어프레임 -> 브리프 대비 수정 -> 구현) 워크플로는 그대로 쓸 수 있다.
3. `:19-32`의 타이포/모션/구조요소 금지 규칙(단일 단어 강조, ALL-CAPS 라벨, 불필요한 numbering, 산발적 모션)은 점검 체크리스트로 변환 가능하다.
4. `:61-71` 카피라이팅 지침(능동태, CTA 일관성, 에러/빈 화면)은 UI 문구 품질 기준으로 그대로 사용 가능하다.
5. `webapp-testing/scripts/with_server.py` + `networkidle` 대기 패턴은 스크린샷 캡처 인프라의 기반으로 재사용 가능하나, 시각 판정 기준은 직접 만들어야 한다.

## 브리프 가정과 다른 점 (확인/반증)
브리프 주장: "frontend-design strengths: aesthetic direction, visual direction, generic-AI-aesthetics prevention, typography/layout/color principles".
- aesthetic/visual direction: 확인(부분). 방향을 "정해라(브리프에 맞는 opinionated 선택, `:9`)"는 지시는 있으나, 방향을 도출하는 절차(질문, 레퍼런스 분석)는 없음. 방향 "고정"이 아니라 "제안 후 confirm"(`:13`).
- generic-AI-aesthetics prevention: 확인. 이 스킬의 가장 강한 부분(`:36-53`). 다만 전부 산문이며 결정적 검사 없음.
- typography 원칙: 확인(라틴 한정, 한국어 0).
- layout principles: 부분 반증. 레이아웃은 ASCII 와이어프레임/정렬 선택 권고 정도이고 그리드/반응형/viewport 원칙은 거의 없음(`:50`, `:59`).
- color principles: 대체로 반증. 색은 "4-6 named hex"와 금지 클러스터만 있고 대비/팔레트 구성 원칙은 사실상 없음(`:48`, `:59`의 "harmonious color palettes" 한 구절).
- 추가 발견: 브리프에 없는 강점은 카피라이팅 섹션(`:61-71`)과 "restraint"(`:57-59`). 반대로 브리프가 기대할 만한 검증/QA는 이 스킬에 없다.

## 한계
- 결정적 검사 0개: frontend-design은 스크립트/린터/테스트가 없는 순수 프롬프트. 규칙 준수 여부는 모델의 자기보고에 의존.
- 질문/의도 고정: 사용자 질문 프로토콜과 intent 파일 모두 없음. "confirm with the client"는 한 문장.
- 레퍼런스 분석, 한국어/CJK, 반복 루프 종료 조건, 외부 평가 신호 전부 부재.
- 스킬 간 단절: webapp-testing(도구)과 frontend-design(판단)은 서로를 참조하지 않으며, web-artifacts-builder는 테스트를 후순위로 미룬다.
- canvas-design/theme-factory/brand-guidelines는 정적 아트 또는 Anthropic 고정 팔레트(`brand-guidelines`의 #d97757은 frontend-design이 "tell"로 경고하는 색과 동일)라 웹 UI 하네스에는 제한적으로만 유용. 
