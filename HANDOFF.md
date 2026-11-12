# Travel Café — 핸드오프 문서

> 이 문서만 읽으면 프로젝트를 이어받아 바로 작업할 수 있도록 쓴 요약본입니다.
> 상세한 설명은 `README.md`(특히 "개발 중 겪은 실수와 수정 기록")에 있습니다.

## 1. 한 줄 요약

세계 도시의 창가 카페에 "여행"해서, 창밖 풍경(실시간 날씨·낮/밤)을 보며 포모도로·라디오로
작업하는 로파이 웹앱. **Vue 3 + Vite + Pinia + Vue Router + Vercel 서버리스**.

- 저장소: `https://github.com/tifftato/travel-cafe` (브랜치 `main`, 공개 저장소)
- 마지막 push 커밋: `92507cd` ("멜버른 베이크인 완성 + 어디로든 버튼 + 랜드마크 트리비아")
- ⚠️ **아직 push 안 된 작업**: 랜드마크 트리비아 확장(도시당 3→5개, 바르셀로나 2026년 완공 소식 반영).
  `landmarkTrivia.js` 변경 + 이 핸드오프 문서 2개(`HANDOFF.md`, `CLAUDE.md`)

## 2. 화면 흐름

| 경로 | 화면 | 설명 |
|---|---|---|
| `/` | `AirportBillboard` | 도트 매트릭스 전광판(도시명·현지 시각), 도시 검색, 🎲 어디로든(랜덤 도시) |
| `/boarding/:cityId` | `BoardingPass` | 프린터가 탑승권 인쇄(+포물선 비행기) → BOARDED 도장 → 2초 뒤 카페 |
| `/cafe/:cityId` | `CafeWorkspace` | 창밖 풍경 + 소품(라디오/타이머/커피) + 날씨/트리비아 |

사운드 순서: 도시 클릭 → `jet-takeoff.mp3` → 도장 순간 `stamp-thud.mp3` → 카페.

## 3. 실행 / 배포

```bash
npm install
vercel dev        # ← npm run dev 아님. /api/weather 서버리스 함수가 필요해서
```

- 환경 변수: `OPENWEATHER_API_KEY` (Vercel 대시보드에 등록 후 재배포). **없으면 날씨가 "불러오지 못했습니다"로 뜨고
  항상 낮/맑음으로 폴백** — 로컬 `npm run dev`에서도 같은 상태가 정상입니다.
- 배포: Vercel. `vercel.json`은 `/api/*` 외 모든 경로를 `index.html`로 보내는 SPA 규칙. (정적 파일은
  Vercel이 먼저 서빙하므로 에셋 경로와 충돌하지 않음 — 확인 완료)

## 4. 폴더 구조 (핵심만)

```
api/weather.js                    OWM 프록시 (서버리스)
src/data/cities.js                도시 19개 데이터 (좌표·핫스팟·tableTopVh) ← 가장 자주 만지는 파일
src/data/landmarkTrivia.js        도시별 트리비아 (도시당 5개)
src/data/coffeeFortunes.js        커피점 50문구
src/data/tardisPaths.js           타디스 비행 경로 24개
src/stores/                       journey(도시목록) weather radio pomodoro config
src/composables/                  useImageRegion / useImageHotspot / useOptionalImage
src/utils/dailyPick.js            날짜+시드 결정적 선택 (커피점·트리비아 공용)
src/utils/dotMatrixFont.js        5×7 도트 폰트 (영문/숫자/기호만, 한글 없음)
src/utils/worldTime.js            도시별 현지 시각 + 사용자 대비 날짜 차이(+1D)
src/components/common/DotMatrixText.vue   canvas 도트 글자 (전광판·프린터 LCD 공용)
src/components/cafe/              FrameForeground(핵심) WeatherOverlay SceneBackground 등
public/assets/                    bg_/frame_/mask_{country}[-night].{jpg,png}  (104개+)
public/sounds/                    jet-takeoff.mp3, stamp-thud.mp3
docs/midjourney-prompts.md        이미지 생성 프롬프트
```

## 5. 핵심 아키텍처 — "베이크인" 이미지 시스템

한 도시 = 이미지 4장 (낮/밤 × 배경/프레임).

- `bg_{country}.jpg` : 소품(라디오·타이머·커피)까지 **다 그려진** 원본 사진. 화면에 그대로 표시.
- `frame_{country}.png` : 창문 부분이 투명한 PNG. **화면엔 그리지 않음**(opacity 0). 핫스팟 좌표 계산의
  기준 `<img>`로만 DOM에 유지.
- `mask_{country}.png` : frame 알파를 반전한 흑백 마스크. `WeatherOverlay`가 비·눈을 **창문 모양으로만**
  클리핑하는 데 사용. 생성: `convert frame_x.png -alpha extract -negate mask_x.png`
- 밤 전용 파일이 없으면 낮 파일로 **자동 폴백** (이집트·프랑스·이탈리아는 밤 프레임이 3:2라 밤 마스크 생략).
- 핫스팟 좌표는 **0~1 비율**(원본 이미지 기준) → 어떤 화면 비율에서도 `object-fit: cover`와 같은 공식으로 환산.

### cities.js 도시 객체 스키마

```js
{
  id: 'rome', countryEn: 'italy',      // countryEn = 에셋 파일명 접미사
  tableTopVh: 32,                      // 테이블 상단 위치(하단 기준 vh, +2 버퍼)
  hotspots: {
    timer: { screen: { x, y, width, height } },
    radio: { display: {x,y,width,height}, power: {x,y}, volume: {x,y} },
    coffee: { region: {x,y,width,height}, point: {x,y}, iced: true? },  // iced 없으면 뜨거운 음료(김)
  },
  name, nameEn, country, countryCode, airportCode, landmark, lat, lng, timezone,
  hidden?: true,            // 전광판/검색에서 제외 (갈리프레이)
  youtubeId?, youtubeLabel? // 라디오 대신 유튜브 재생 (갈리프레이)
}
```

특수값: `timezone: 'relative'`(사용자 현지 시간 그대로), `lat/lng: null`(날씨 API 호출 생략, 사용자 시간으로 낮/밤 판정).

## 6. 새 도시 추가 절차 (표준 파이프라인)

1. 이미지 4장 크기 확인(`identify`) — 기본 1672×941. **bg와 frame은 같은 비율이어야 함**(다르면 frame을 bg 크기로 리사이즈).
2. 프레임 알파 투명 비율 확인 + `bg+frame` 합성 미리보기.
3. `tableTopVh` 측정: 프레임 알파에서 아래→위로 행별 불투명 비율 `<0.85`인 첫 행(하단 3~4px 노이즈 제외),
   **자동값이 이상하면(0~2vh) 눈으로 창문/테이블 경계 재확인**. `(H - row)/H*100 + 2`.
4. 핫스팟 좌표 추출(현재는 격자+확대로 눈대중, 사용자가 **색상 오버레이**를 주기로 함 → 색상 픽셀 min/max·중심 계산으로 전환 예정).
5. 밤 이미지에 박스를 겹쳐 좌표 검증 → 0~1 비율 변환.
6. `convert`로 `-strip -quality 85` JPG / PNG 최적화, 마스크 생성, `cities.js`에 항목 추가.
7. **실제 브라우저(Playwright)로 검증** — 아래 7장 참고.
8. README 도시 개수 문구 갱신, 빌드, push.

## 7. 검증 방법 (중요)

정적 코드 리뷰만으로는 못 잡는 버그가 있었음(8장 1번). **반드시 실제 브라우저로 확인**:

```python
from playwright.sync_api import sync_playwright
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"   # 환경에 따라 경로 다름: find / -iname chrome -type f
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
    page = b.new_page(viewport={"width":1400,"height":800})
    page.on("pageerror", lambda e: print(e.message))
    page.goto("http://localhost:5173/cafe/vienna", wait_until="networkidle")
    # .radio-inline__power / .timer-inline / .radio-inline__display 의 opacity가 1이고
    # getBoundingClientRect()가 서로 다른 실제 위치인지 확인
```

- 백그라운드 서버는 **호출 간에 유지되지 않음** → 서버 기동과 테스트를 한 bash 호출 안에서 같이 실행.
- `playwright install`은 네트워크 제한으로 실패할 수 있음 → 이미 설치된 Chromium 경로 사용.

## 8. 반드시 알아야 할 함정 (실제로 겪은 것들)

1. **Vue 템플릿 ref 자동 언랩**: `:img-ref="frameImgRef"`처럼 ref를 props로 내리면 자식은 ref 객체가 아니라
   `.value`(null/DOM)를 받음 → 컴포저블의 `imgRef.value`가 터지거나 조용히 실패해서 라디오/타이머/커피가
   전부 `opacity:0, 크기 0`에 멈춤. **해결: `provide('frameImgRef')` / `inject`** (현재 적용됨). 새 컴포넌트가
   기준 이미지를 쓸 땐 props가 아니라 inject로 받을 것.
2. **낮/밤 `<img>`를 따로 만들고 v-show로 숨기지 말 것** — 기준 요소가 `display:none`이 되면 크기 0. 지금은
   하나의 `<img>`가 `src`만 바꿈.
3. **세션/샌드박스가 수시로 리셋됨** — push 안 한 작업은 사라질 수 있음. **작업 단위마다 push**할 것.
   (실제로 멜버른 작업이 한 번 유실될 뻔함 — 원본 업로드 이미지로 복구)
4. 컴포저블(`onMounted` 포함)을 **조건부로 호출하지 말 것**. (`RadioInline.vue`에 props 기반 삼항 호출이 남아
   있음 — 도시 단위로 값이 고정이라 지금은 동작하지만 리팩터 후보)
5. 베이크인 도시는 `frame.png`를 **화면에 그리면 안 됨**(이중 합성). 마스크로만 사용.
6. 정적 파일이 없을 때 `vite dev/preview`는 404가 아니라 `index.html`(200)을 반환 — 에셋 존재 확인은
   `Image` 프리로드의 `onerror`로 판단(`useOptionalImage`, `WeatherOverlay`).
7. 오디오 파일(`public/sounds/*.mp3`)은 코드가 참조하므로 **지우지 말 것**. `airport-chime.mp3`는 의도적으로 제거함.
8. 트리비아·문구는 **사실 확인 후** 작성(불확실한 전설은 "확인되지 않았지만"으로 표기). 최신 사실은 변할 수 있음
   (예: 사그라다 파밀리아는 2026년 6월 완공).

## 9. 현재 알려진 이슈 / 미완료

- ✅ (수정됨) 탑승권 하단 진행 막대가 안 차던 문제: 막대가 gate 단계에서야 `v-if`로 생겨서 마운트 시점 gsap 타깃이
  null이었음 → CSS 애니메이션(`gate-fill`)으로 교체, 카페 이동은 타임라인 `tl.call(enterCafe)`로 분리.
- 🎞️ 탑승권 연출 길이가 약 1초 늘었음(프린터 인쇄 1.3s). 더 빠르길 원하면 `BoardingPass.vue`의 `PRINT_DUR`만 줄이면 됨.
- 🔇 프린터 인쇄음은 아직 없음 (`public/sounds/`에 파일 추가 후 `playSfx` 호출 지점만 넣으면 됨).

- 🐛 `AmbientSound.vue` 페이드에서 볼륨이 `-0.0001` 수준 음수로 오버슈트 → 콘솔에
  `Failed to set the 'volume' property` 에러. (기능엔 영향 거의 없음, `Math.max(0, …)` 클램프로 해결 가능)
- 🔇 `pomodoro.js`의 완료 알림음 훅이 `TODO` 상태.
- 🍵 `coffee.iced`는 **서울만 true**. 나머지는 전부 뜨거운 음료로 가정(사진 확인 필요 — 베트남 카페 쓰어다 등 애매).
- 🖼️ 갈리프레이: `day-frame`이 3:2라 16:9로 강제 리사이즈(가로 +8.9%/세로 −8.1% 왜곡, 육안상 미미). 밤 프레임 없음 → 낮 마스크 폴백.
  타디스는 실제 3D 모델이 아니라 CSS 3D 박스.
- 🔑 날씨는 `OPENWEATHER_API_KEY` 필수(미설정 시 폴백 동작).
- 🧪 PWA, `pinia-plugin-persistedstate`, Notification API는 미구현.

## 10. 사용자 선호 / 협업 방식

- 한국어로 소통, 코드 주석도 한국어(이유 중심 설명 위주).
- 큰 변경은 **빌드 → 실제 브라우저 검증 → zip 전달(`/mnt/user-data/outputs/travel-cafe.zip`)** 순서를 선호.
  push는 사용자가 요청할 때만.
- 사용자가 좌표를 직접 찍기 어려워해서, **색상 오버레이 이미지**(원본과 같은 크기, 원색으로 영역/점 표시)를 주기로 함.
- 설계상 불확실한 부분은 가정을 명시하고 진행하는 걸 선호.

## 11. Git push 절차 (토큰 안전 취급)

토큰을 `.git/config`나 저장소에 **절대 남기지 않기**:

```bash
# 1) 토큰을 임시 파일에만 저장
mkdir -p ~/.secrets && printf '%s\n' "<TOKEN>" > ~/.secrets/gh_token && chmod 600 ~/.secrets/gh_token
# 2) 매 git 명령마다 헤더로만 인증 (-c 옵션은 config에 저장되지 않음)
TOKEN=$(cat ~/.secrets/gh_token)
AUTH="Authorization: Basic $(printf 'x-access-token:%s' "$TOKEN" | base64 -w0)"
git -c http.extraHeader="$AUTH" clone https://github.com/tifftato/travel-cafe.git repo
# (작업물 복사 → git add -A → commit → push 전 fetch로 원격이 그대로인지 확인)
git -c http.extraHeader="$AUTH" push origin main
# 3) 끝나면 즉시 삭제
shred -u ~/.secrets/gh_token
```

- 푸시 전 `git status`로 의도치 않은 삭제(특히 `public/sounds/`)가 없는지 확인.
- 대화에 노출된 토큰은 **폐기 후 재발급** 권장.

## 12. 다음에 하면 좋을 것 (논의된 아이디어)

1. 🌅 골든아워 오버레이(사진 불필요), 🎄 크리스마스 전구(12월 자동), 흐림/안개 강화
2. 🌧️ 비/눈 오는 날 전용 배경(물량 큼 → 자주 가는 도시부터)
3. 🛂 여권 스탬프 페이지 + 도시별 누적 집중 시간 통계
4. 📮 엽서 이미지 저장, 🌸 계절 변주, 시즌 한정 이스터에그
5. 색상 오버레이 기반 좌표 추출로 핫스팟 정밀도 개선
