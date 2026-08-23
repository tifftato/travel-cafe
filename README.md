# Travel Café — 세계 도시 카페 워크스페이스

Vue 3 + Vite + Pinia + Vue Router 기반. Vercel 배포를 전제로 한 프로젝트입니다.

## 실행

```bash
npm install
npm run dev
```

로컬에서 `/api/weather` 를 테스트하려면 `vercel dev` 를 쓰는 게 가장 정확합니다
(Vercel CLI: `npm i -g vercel`, 이후 `vercel dev`). 라디오는 `radio-browser-api` 패키지가
브라우저에서 직접 호출하므로 별도 서버 설정이 필요 없습니다.

## 환경 변수

`.env.example` 참고. Vercel 프로젝트 설정 → Environment Variables 에 `OPENWEATHER_API_KEY` 를 등록하세요.

## 화면 흐름

```
/                    (0) 공항 출발 전광판 — 도시 검색 + 10개 주요 도시 리스트
/boarding/:cityId    (1) 탑승권 발권 → BOARDED 스탬프 → 2초 자동 카운트다운 → 카페 입장
/cafe/:cityId        (2) 카페 워크스페이스 (배경/날씨/창틀+테이블 + 플로팅 위젯)
```

`/boarding/:cityId` 는 스탬프가 찍힌 직후부터 2초짜리 프로그레스 바가 자동으로 채워지고,
다 채워지면 별도 클릭 없이 바로 카페 화면으로 전환됩니다.

## 이미지 에셋 (public/assets/)

| 종류 | 파일명 규칙 | 설명 |
| --- | --- | --- |
| 배경 | `bg_{country}.jpg` | 창밖 랜드마크 |
| 창틀+테이블 | `frame_{country}.png` | 투명 배경 PNG, 창틀+빈 테이블 통합 |

10개 도시의 `{country}` 키: `korea`, `italy`, `france`, `usa`, `japan`, `australia`, `turkey`, `austria`, `vietnam`, `cuba`

나라별로 사진 구도(테이블이 시작되는 높이)가 다 달라서, `frame_*.png` 를 알파 채널 분석으로
실측해 `src/data/cities.js` 의 `tableTopVh` 값에 반영해두었습니다. 이미지를 교체하면 이 값도 다시
맞춰야 할 수 있습니다.

## 레이어 구조 (카페 워크스페이스, z-index 낮음 → 높음)

```
1. SceneBackground    bg_{country}.jpg, 밤에는 CSS 필터로 톤다운
2. WeatherOverlay      날씨 API 연동 자동 애니메이션 (아래 표 참고)
3. FrameForeground     frame_{country}.png (창틀+테이블) + 비행기 티켓(도시 검색/전환)
4. CafeWidget          포모도로 타이머 + 라디오 컨트롤 (화면 우하단 고정 플로팅 위젯)
5. UnitToggler / HUD   섭씨·화씨 토글, 현재 날씨 텍스트
```

### 날씨 → 애니메이션 매핑 (자동)

`weather.js` 스토어가 OpenWeatherMap 응답을 아래 조건으로 변환하고, `CafeWorkspace.vue` 가
`:condition`, `:is-night` 를 실시간으로 넘겨주므로 도시를 바꾸거나 시간이 지나 날씨가 바뀌면
별도 코드 수정 없이 오버레이가 자동으로 갱신됩니다.

| condition | 효과 |
| --- | --- |
| `clear` (낮) | 효과 없음 (맑은 배경 그대로) |
| `clear` (밤) | 반짝이는 별 |
| `clouds` | 흘러가는 구름 |
| `rain` | 빗줄기 |
| `thunderstorm` | 빗줄기 + 화면 번쩍임 |
| `snow` | 눈송이 |
| `fog` | 뿌연 블러 오버레이 |

## 포모도로 + 라디오 위젯

기존에는 테이블 위 스마트폰 아이콘을 눌러야 열리는 방식이었지만, 화면 전체와 더 잘 어울리도록
화면 우하단에 항상 떠있는 위젯(`CafeWidget.vue`)으로 변경했습니다. 우상단 `—` 버튼으로 접고 펼 수 있습니다.

라디오는 [`radio-browser-api`](https://www.npmjs.com/package/radio-browser-api) 패키지로 국가 코드
(`city.countryCode`, 예: KR/FR/JP)를 기준으로 인기순 방송국을 가져옵니다. 스트림이 죽어있으면
`<audio>` 의 `error` 이벤트를 감지해 다음 후보 방송국으로 자동 전환합니다.

## 화면 우상단 컨트롤

- 🪟 / 🏞️ — 창틀+테이블 오버레이 on/off. 끄면 배경 랜드마크가 화면 가득 보입니다 (동시에 시계 위젯도 같이 사라집니다). 선택 상태는 브라우저에 저장됩니다.
- 🔊 / 🔇 — 배경음 음소거
- °C / °F — 온도 단위 토글

## 라디오 자동 재생

카페 화면에 진입하면 해당 도시 방송국을 찾아 **자동으로 재생을 시도**합니다. 브라우저의 자동재생 정책 때문에 막히는 경우(주로 페이지를 새로고침해서 바로 들어왔을 때) 위젯에 "재생 버튼을 눌러주세요" 안내가 뜨고, 한 번 눌러주면 그 이후에는 도시를 바꿔도 자동재생이 허용됩니다.

## 새 도시 추가하는 법

1. `src/data/cities.js` 에 도시 객체 추가 (좌표, 랜드마크 설명, `countryEn`/`countryCode`, `tableTopVh`)
2. 같은 나라(`countryEn`)의 에셋이 이미 있으면 이미지 작업 없이 바로 동작합니다
3. 새 나라라면 `public/assets/` 에 `bg_{country}.jpg`, `frame_{country}.png` 2개만 추가

## 아직 손 안 댄 부분 (다음 단계 후보)

## 사운드 (public/sounds/)

전부 선택 사항입니다 — 파일이 없으면 조용히 무시되고 화면/애니메이션은 정상 동작합니다.

**탑승 시퀀스 (1회성 효과음)**
- `airport-chime.mp3` — 발권 시 공항 차임벨
- `stamp-thud.mp3` — BOARDED 스탬프 찍히는 소리
- `jet-takeoff.mp3` — 카페 입장 시 이륙음

**카페 배경음 (반복 재생, `AmbientSound.vue`가 자동으로 크로스페이드)**
- `cafe-murmur-loop.mp3` — 날씨와 무관하게 항상 약하게 깔리는 카페 웅성거림
- `weather/clear-night-loop.mp3` — 맑은 밤 (낮에 맑을 땐 별도 날씨음 없이 cafe-murmur만)
- `weather/clouds-loop.mp3` — 흐림 (아주 약한 바람)
- `weather/rain-loop.mp3` — 비
- `weather/thunderstorm-loop.mp3` + `weather/thunder-hit.mp3` — 뇌우 (루프 + 화면 번쩍임에 맞춰 6초마다 트리거되는 천둥 단발음)
- `weather/snow-loop.mp3` — 눈 (먹먹하고 조용한 바람)
- `weather/fog-loop.mp3` — 안개 (묵직한 앰비언트)

우상단 🔊 버튼으로 음소거할 수 있고, 설정은 브라우저에 저장되어 다음 방문에도 유지됩니다.
- 상태 영속화 (새로고침 시 포모도로/도시 초기화됨) — `pinia-plugin-persistedstate` 추천
- 포모도로 완료 시 브라우저 알림 (Notification API)
