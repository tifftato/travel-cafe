# Travel Café — Claude 작업 지침

먼저 `HANDOFF.md`를 읽을 것 (구조·스키마·함정·이슈 정리). 상세는 `README.md`.

## 명령어
- 설치: `npm install` / 개발: `vercel dev` (`/api/weather` 필요, `npm run dev`는 날씨 불가) / 빌드: `npm run build`
- 변경 후엔 **빌드 + 실제 브라우저(Playwright) 검증**까지 할 것. 코드 리뷰만으로 끝내지 말 것.

## 규칙 (어기면 실제로 깨졌던 것들)
- 기준 이미지 ref는 **props로 내리지 말고 `provide/inject('frameImgRef')`** 사용 (템플릿 ref 자동 언랩 함정).
- 컴포저블(`onMounted` 포함)은 조건부 호출 금지.
- 베이크인 도시는 `frame_*.png`를 화면에 그리지 말 것 (마스크·좌표 기준 전용).
- 낮/밤 `<img>`를 따로 두고 `v-show`로 숨기지 말 것 (기준 요소 크기 0 문제).
- `public/sounds/jet-takeoff.mp3`, `stamp-thud.mp3` 삭제 금지.
- 새 도시 = `cities.js` 항목 + `bg/frame/mask` 에셋 + README 도시 수 갱신. 절차는 `HANDOFF.md` 6장.
- 트리비아/문구는 사실 확인 후 작성, 불확실하면 단정하지 말 것.

## 작업 방식
- 한국어로 답하고, 주석도 한국어(왜 그렇게 했는지 중심).
- 작업 단위마다 커밋·push 권장 (샌드박스가 리셋되며 미push 작업이 유실된 적 있음).
- 토큰은 저장소/`.git/config`에 남기지 말고 `HANDOFF.md` 11장 절차로 임시 사용 후 삭제.
- `.env`(실제 API 키)는 읽거나 커밋하지 않는다.
