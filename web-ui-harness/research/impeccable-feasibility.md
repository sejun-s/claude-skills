# Impeccable 실행 가능성 확인 (이 클라우드 세션)

실행일 2026-10-02. impeccable 4.1.0 (npm), Node v22.22.0 (요구 ≥22.18). 스킬 설치는 하지 않고 `detect`만 실행.
프로브 파일: `../experiments/probes/impeccable-probe.html` (의도적으로 보라 그라디언트, 그라디언트 텍스트, glow shadow, Inter, 한국어 `word-break:break-all`, 1600px 가로 오버플로를 넣음).

## 결과
| 모드 | 명령 | 결과 |
|------|------|------|
| 정적 | `npx --yes impeccable detect --json t.html` | **동작.** gradient-text, dark-glow, overused-font, ai-color-palette 검출 |
| 브라우저(URL) | 같은 명령에 `http://localhost:...` | 기본값은 **실패**: root 실행 시 Chromium 샌드박스 오류 |
| 브라우저 + 래퍼 | `IMPECCABLE_BROWSER=<--no-sandbox 래퍼>` | **동작.** 위 4종 + low-contrast 검출, exit code 2(검출 있음) |

- 브라우저 경로는 `IMPECCABLE_BROWSER` / `PUPPETEER_EXECUTABLE_PATH` / `CHROME_PATH` 순으로 탐색 (`crates/browser/src/discovery.rs:6-20`).
- 래퍼 내용: `exec /opt/pw-browsers/chromium "$@" --no-sandbox --disable-dev-shm-usage`. 컨테이너 한정 우회이며 일반 환경 설정이 아님.
- 엔진은 npm 패키지가 플랫폼 바이너리를 내려받아 실행함. 이 세션에서는 npm/바이너리 다운로드가 가능했음.
- 샌드박스 프록시가 `www.google.com:443` 연결 2건을 거부했다고 보고함(브라우저 부수 요청으로 추정, 결과에 영향 없음).

## 프로브에서 **검출되지 않은** 것 (의도적으로 넣은 결함)
- 1600px 요소로 인한 **가로 오버플로** (정적/브라우저 모드 모두 미검출)
- 한국어 헤드라인에 `word-break: break-all` — 한국어 줄바꿈 문제 (미검출)
- `border-left` + `border-radius` 카드 (`side-tab`/`border-accent-on-rounded` 미검출 — 조건이 더 좁을 수 있음, 미조사)

해석 주의: 프로브 1개 파일의 결과이므로 "Impeccable이 오버플로를 못 잡는다"는 일반화는 하지 않는다. 문서상 `first-viewport-column-overflow`, `text-overflow`, `clipped-overflow-container` 규칙이 있으므로 조건 확인이 필요함(다음 조사 항목).

## 결론
- Baseline B 조건에서 Impeccable `detect`를 Mechanical/anti-pattern 검사기로 쓸 수 있다 (정적·브라우저 모드 모두, 래퍼 필요).
- 한국어 줄바꿈과 뷰포트 오버플로는 이 프로브에서는 비어 있었다. 후보 gap으로 유지하되 Failure Log에서 재확인.
