# Changelog
## 0.2.0 (2026-10-02)
- SKILL.md: 구현 2번 수정(좁은 폭 해제 금지, 묶음이 320px에서도 들어가야 함, 구두점은 앞 구에 붙이지 않음).
- heading-lines.mjs: `--keep` 없이도 모든 제목의 폭별 줄 구성·고아 줄·가로 넘침 출력. `--keep` 없으면 구 쪼개짐 미검사임을 명시(0건 오해 방지). playwright/크롬 경로 하드코딩 제거(환경변수·기본 탐색).
- tests/: 회귀 픽스처와 `run.sh`.
## 0.1.0 (2026-10-02)
- 최초 버전. ablation 결과는 failures/log.md. 예시에 benchmark 문구가 포함되어 있어(오염) clean 재실험으로 대체.
