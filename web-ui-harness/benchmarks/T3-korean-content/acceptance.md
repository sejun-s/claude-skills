# T3 acceptance

## 기능
- 제목, 부제, 작성자 줄, 본문 6단락, 소제목 3, 목록 4항목, 인용문, 관련 기사 링크 2가 모두 존재.
- 이미지 없음(없는 것이 정상). 장식용 이미지 추가 금지.

## 관측 포인트
- 한국어 본문 줄바꿈(어절 중간 끊김), 줄 길이, 행간, 제목 줄바꿈, 한영·숫자 혼용("API", "p95", "480ms", "31%")의 정렬/폭.
- 5초 테스트는 적용하지 않음(장문 페이지). 대신 사람 평가는 pairwise 비교만.

## Mechanical 기준
horizontal-overflow 0, korean-mid-word-break: **제목/소제목/부제 0, 본문은 기록(keep-all 선택 여부가 다를 수 있음)**, korean-orphan-line은 제목류에서 0 목표, touch-target<24px 0.
