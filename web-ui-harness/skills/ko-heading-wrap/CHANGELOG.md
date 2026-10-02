# Changelog
## 0.3.0 (2026-10-02) — GPT 독립 QA(experiments/eval/gpt-qa-2026-10-02) 지적 반영
- heading-lines.mjs: 선언된 웹폰트가 로드되지 않으면 경고하고 exit 3(대체 폰트로 측정된 결과를 걸러냄). 줄 구분을 글자 세로 구간의 겹침으로 판정(글자 크기가 섞인 한 줄을 여러 줄로 오판정하던 문제). `--json`은 유효한 JSON 객체(사람용 요약은 stderr). `--keep` 구를 못 찾으면 보고, `--strict-keep`이면 exit 4.
- tests/: 위 결함 재현 픽스처와 회귀 테스트 추가.
- **v0.2.0 이하로 측정한 수치는 run 폴더에 fonts/가 없어 대체 폰트로 측정된 것이 있다(failures/log.md 정정 참조).**
## 0.2.0 (2026-10-02)
- SKILL.md: 구현 2번 수정(좁은 폭 해제 금지, 묶음이 320px에서도 들어가야 함, 구두점은 앞 구에 붙이지 않음).
- heading-lines.mjs: `--keep` 없이도 모든 제목의 폭별 줄 구성·고아 줄·가로 넘침 출력. `--keep` 없으면 구 쪼개짐 미검사임을 명시(0건 오해 방지). playwright/크롬 경로 하드코딩 제거(환경변수·기본 탐색).
- tests/: 회귀 픽스처와 `run.sh`.
## 0.1.0 (2026-10-02)
- 최초 버전. ablation 결과는 failures/log.md. 예시에 benchmark 문구가 포함되어 있어(오염) clean 재실험으로 대체.
