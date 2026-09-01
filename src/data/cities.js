// 도시 하나를 추가하려면 이 배열에 객체 하나만 추가하면 됩니다.
//
// countryEn 으로 public/assets/ 밑의 이미지 파일을 찾습니다. (기획서 네이밍 규칙)
//   bg_{countryEn}.jpg      → 창밖 랜드마크 배경
//   frame_{countryEn}.png   → 창틀 + 테이블이 합쳐진 전경 (투명 PNG, 크로마키)
//
// 예) 베트남 → bg_vietnam.jpg, frame_vietnam.png
//     쿠바   → bg_cuba.jpg, frame_cuba.png
//
// 밤 배경은 따로 만들지 않고, 같은 bg 이미지에 CSS 필터로 야간 톤을 입힙니다
// (SceneBackground.vue 참고). 국가마다 밤 이미지까지 만드는 비용을 아끼기 위함입니다.
//
// hotspots (선택): frame_{countryEn}.png 안에 라디오/타이머 소품이 "그려져 있는" 경우 씁니다.
// 좌표 구하는 법: frame_{countryEn}.png 를 이미지 편집기로 열어서 소품 위치의 픽셀 좌표를
// 확인하고, 이미지 전체 크기(width,height)로 나누면 0~1 비율이 됩니다.
//
// ⚠️ 소품은 가로 0.3~0.7 사이(화면 중앙 근처)에 배치하세요. object-fit: cover는 세로로
// 좁은(모바일) 화면일수록 원본 사진의 좌우 가장자리를 잘라내므로, 0.2 이하/0.8 이상에
// 소품을 두면 모바일에서 화면 밖으로 잘려나갈 수 있습니다.
//
// timer: 소품이 "빈 화면"이 있는 형태(디지털 타이머 등)라면 screen(사각형)을 씁니다.
//        빈 화면이 없고 그냥 소품 하나만 있다면 x,y(점)만 써도 됩니다 — 클릭하면 팝오버가 뜹니다.
//   timer: { screen: { x: 0.42, y: 0.62, width: 0.16, height: 0.10 } }   // 빈 화면 직접 삽입
//   timer: { x: 0.5, y: 0.9 }                                            // 점 하나 → 팝오버
//
// radio: 이름/재생/볼륨을 각각 다른 방식으로 얹습니다. 셋 다 넣을 필요 없이 있는 것만 넣으면 됩니다.
//   radio: {
//     display: { x: 0.68, y: 0.58, width: 0.12, height: 0.04 }, // 방송국 이름 (빈 표시창)
//     power:   { x: 0.66, y: 0.66 },                             // 재생/정지 버튼
//     volume:  { x: 0.74, y: 0.66 },                              // 볼륨 노브 (드래그 회전)
//   }
//   radio: { x: 0.8, y: 0.86 }   // 소품이 하나로 뭉쳐있다면 점 하나로 팝오버 방식도 가능
//
// hotspots를 아예 안 넣거나 일부만 넣으면, 커버되지 않은 나머지는 화면 우하단
// 플로팅 위젯(CafeWidget)이 자동으로 보완합니다. 나라별로 순차 적용해도 안전합니다.

export const cities = [
  {
    id: 'seoul',
    countryEn: 'korea',
    tableTopVh: 21, // frame_korea.png(베이크인 버전) 알파 채널 분석으로 재측정한 테이블 상단 위치
    hotspots: {
      timer: {
        screen: { x: 0.5173, y: 0.7705, width: 0.0538, height: 0.0478 },
      },
      radio: {
        display: { x: 0.3858, y: 0.6854, width: 0.0748, height: 0.0712 },
        power: { x: 0.3947, y: 0.8225 },
        volume: { x: 0.4366, y: 0.7917 },
      },
      coffee: {
        region: { x: 0.616, y: 0.6482, width: 0.1136, height: 0.1913 },
        point: { x: 0.6699, y: 0.7651 },
        iced: true, // 아이스 아메리카노 — 얼음이 눈으로 확인됨
      },
    },
    name: '서울',
    nameEn: 'Seoul',
    country: '대한민국',
    countryCode: 'KR', // OpenWeatherMap sys.country 매핑용
    airportCode: 'ICN',
    landmark: 'N서울타워가 보이는 한강 야경',
    lat: 37.5665,
    lng: 126.9780,
    timezone: 'Asia/Seoul',
  },
  {
    id: 'rome',
    countryEn: 'italy',
    tableTopVh: 32, // frame_italy.png(베이크인 버전) 알파 채널 분석으로 재측정한 테이블 상단 위치
    // ⚠️ italy-night-frame.png는 원본 해상도가 다른 나라들과 달라(1536x1024, 3:2 비율)
    // mask_italy-night.png를 만들지 않았습니다. WeatherOverlay.vue가 밤에도 자동으로
    // mask_italy.png(낮 마스크)를 폴백으로 사용하므로 기능상 문제는 없습니다(이집트·프랑스와 동일 패턴).
    hotspots: {
      timer: {
        screen: { x: 0.5233, y: 0.7524, width: 0.0538, height: 0.0553 },
      },
      radio: {
        display: { x: 0.3828, y: 0.7014, width: 0.1465, height: 0.0553 },
        power: { x: 0.3917, y: 0.8108 },
        volume: { x: 0.4414, y: 0.7917 },
      },
      coffee: {
        region: { x: 0.5921, y: 0.7333, width: 0.1435, height: 0.1382 },
        point: { x: 0.6609, y: 0.8183 },
      },
    },
    name: '로마',
    nameEn: 'Rome',
    country: '이탈리아',
    countryCode: 'IT',
    airportCode: 'FCO',
    landmark: '트레비 분수',
    lat: 41.9028,
    lng: 12.4964,
    timezone: 'Europe/Rome',
  },
  {
    id: 'paris',
    countryEn: 'france',
    tableTopVh: 21, // frame_france.png(베이크인 버전) 알파 채널 분석으로 재측정한 테이블 상단 위치
    // ⚠️ france-night-frame.png는 원본 해상도가 다른 나라들과 달라(1536x1024, 3:2 비율)
    // mask_france-night.png를 만들지 않았습니다. WeatherOverlay.vue가 밤에도 자동으로
    // mask_france.png(낮 마스크)를 폴백으로 사용하므로 기능상 문제는 없습니다(이집트와 동일 패턴).
    hotspots: {
      timer: {
        screen: { x: 0.5114, y: 0.7991, width: 0.0598, height: 0.051 },
      },
      radio: {
        display: { x: 0.3559, y: 0.7354, width: 0.0628, height: 0.0744 },
        power: { x: 0.2841, y: 0.8236 },
        volume: { x: 0.4486, y: 0.7917 },
      },
      coffee: {
        region: { x: 0.5891, y: 0.7439, width: 0.1406, height: 0.1382 },
        point: { x: 0.6579, y: 0.8502 },
      },
    },
    name: '파리',
    nameEn: 'Paris',
    country: '프랑스',
    countryCode: 'FR',
    airportCode: 'CDG',
    landmark: '에펠탑이 보이는 우아한 발코니',
    lat: 48.8566,
    lng: 2.3522,
    timezone: 'Europe/Paris',
  },
  {
    id: 'newyork',
    countryEn: 'usa',
    tableTopVh: 36, // frame_usa.png(베이크인 버전) 알파 채널 분석으로 재측정한 테이블 상단 위치
    hotspots: {
      timer: {
        screen: { x: 0.5233, y: 0.7545, width: 0.0538, height: 0.0425 },
      },
      radio: {
        display: { x: 0.3828, y: 0.7173, width: 0.1376, height: 0.0393 },
        power: { x: 0.3708, y: 0.797 },
        volume: { x: 0.4336, y: 0.7758 },
      },
      coffee: {
        region: { x: 0.622, y: 0.6482, width: 0.1017, height: 0.2019 },
        point: { x: 0.6699, y: 0.7439 },
      },
    },
    name: '뉴욕',
    nameEn: 'New York',
    country: '미국',
    countryCode: 'US',
    airportCode: 'JFK',
    landmark: '자유의 여신상이 보이는 브루클린 창가',
    lat: 40.7128,
    lng: -74.0060,
    timezone: 'America/New_York',
  },
  {
    id: 'tokyo',
    countryEn: 'japan',
    tableTopVh: 25, // frame_japan.png(베이크인 버전) 알파 채널 분석으로 재측정한 테이블 상단 위치
    hotspots: {
      timer: {
        screen: { x: 0.4755, y: 0.797, width: 0.0508, height: 0.0531 },
      },
      radio: {
        display: { x: 0.3708, y: 0.7439, width: 0.0748, height: 0.051 },
        power: { x: 0.3636, y: 0.8289 },
        volume: { x: 0.4067, y: 0.8098 },
      },
      coffee: {
        region: { x: 0.5712, y: 0.5951, width: 0.2004, height: 0.271 },
        point: { x: 0.616, y: 0.7917 },
      },
    },
    name: '도쿄',
    nameEn: 'Tokyo',
    country: '일본',
    countryCode: 'JP',
    airportCode: 'HND',
    landmark: '도쿄 타워가 보이는 스카이라인',
    lat: 35.6762,
    lng: 139.6503,
    timezone: 'Asia/Tokyo',
  },
  {
    id: 'melbourne',
    countryEn: 'australia',
    tableTopVh: 43, // frame_australia.png 알파 채널 분석으로 측정한 테이블 상단 위치
    name: '멜버른',
    nameEn: 'Melbourne',
    country: '호주',
    countryCode: 'AU',
    airportCode: 'MEL',
    landmark: '플린더스 스트리트 역과 트램 거리',
    lat: -37.8136,
    lng: 144.9631,
    timezone: 'Australia/Melbourne',
  },
  {
    id: 'istanbul',
    countryEn: 'turkey',
    tableTopVh: 28, // frame_turkey.png(베이크인 버전) 알파 채널 분석으로 재측정한 테이블 상단 위치
    hotspots: {
      timer: {
        screen: { x: 0.5502, y: 0.7705, width: 0.0478, height: 0.0478 },
      },
      radio: {
        display: { x: 0.3618, y: 0.7279, width: 0.0568, height: 0.0638 },
        power: { x: 0.302, y: 0.8098 },
        volume: { x: 0.4456, y: 0.7811 },
      },
      coffee: {
        region: { x: 0.616, y: 0.7333, width: 0.1555, height: 0.1169 },
        point: { x: 0.6938, y: 0.797 },
      },
    },
    name: '이스탄불',
    nameEn: 'Istanbul',
    country: '튀르키예',
    countryCode: 'TR',
    airportCode: 'IST',
    landmark: '웅장한 아야 소피아 사원',
    lat: 41.0082,
    lng: 28.9784,
    timezone: 'Europe/Istanbul',
  },
  {
    id: 'vienna',
    countryEn: 'austria',
    tableTopVh: 34, // frame_austria.png(베이크인 버전) 알파 채널 분석으로 재측정한 테이블 상단 위치
    // 라디오/타이머 소품이 그림 속에 그려져 있어 클릭 가능한 인터랙션이 얹힙니다.
    // 좌표는 낮 이미지(frame_austria.png) 기준이며, 같은 --seed로 뽑은 밤 이미지도 구도가
    // 동일해서 그대로 재사용됩니다.
    hotspots: {
      timer: {
        screen: { x: 0.4533, y: 0.763, width: 0.0478, height: 0.0425 },
      },
      radio: {
        display: { x: 0.3361, y: 0.7311, width: 0.0736, height: 0.0372 },
        power: { x: 0.3427, y: 0.8183 },
        volume: { x: 0.3726, y: 0.7949 },
      },
      coffee: {
        region: { x: 0.5323, y: 0.6854, width: 0.2153, height: 0.1966 },
        point: { x: 0.6459, y: 0.7811 },
      },
    },
    name: '빈',
    nameEn: 'Vienna',
    country: '오스트리아',
    countryCode: 'AT',
    airportCode: 'VIE',
    landmark: '성 슈테판 대성당 앞 광장',
    lat: 48.2082,
    lng: 16.3738,
    timezone: 'Europe/Vienna',
  },
  {
    id: 'hanoi',
    countryEn: 'vietnam',
    tableTopVh: 28, // frame_vietnam.png(베이크인 버전) 알파 채널 분석으로 재측정한 테이블 상단 위치
    hotspots: {
      timer: {
        screen: { x: 0.5664, y: 0.7471, width: 0.0716, height: 0.0537 },
      },
      radio: {
        display: { x: 0.2865, y: 0.6885, width: 0.3125, height: 0.0439 },
        power: { x: 0.4089, y: 0.8105 },
        volume: { x: 0.4688, y: 0.791 },
      },
      coffee: {
        region: { x: 0.651, y: 0.6836, width: 0.1562, height: 0.1758 },
        point: { x: 0.7292, y: 0.7812 },
      },
    },
    name: '하노이',
    nameEn: 'Hanoi',
    country: '베트남',
    countryCode: 'VN',
    airportCode: 'HAN',
    landmark: '호안끼엠 호수와 거북탑',
    lat: 21.0285,
    lng: 105.8542,
    timezone: 'Asia/Ho_Chi_Minh',
  },
  {
    id: 'havana',
    countryEn: 'cuba',
    tableTopVh: 37, // frame_cuba.png(베이크인 버전) 알파 채널 분석으로 재측정한 테이블 상단 위치
    // 이 라디오는 별도의 전원 버튼이 뚜렷하지 않아, 두 번째(작은) 노브를 전원 토글로 대체 사용합니다.
    hotspots: {
      timer: {
        screen: { x: 0.5861, y: 0.7141, width: 0.0628, height: 0.0776 },
      },
      radio: {
        display: { x: 0.4187, y: 0.6674, width: 0.1136, height: 0.0744 },
        power: { x: 0.5233, y: 0.779 },
        volume: { x: 0.4545, y: 0.7758 },
      },
      coffee: {
        region: { x: 0.6699, y: 0.7598, width: 0.1675, height: 0.1541 },
        point: { x: 0.7536, y: 0.8236 },
      },
    },
    name: '아바나',
    nameEn: 'Havana',
    country: '쿠바',
    countryCode: 'CU',
    airportCode: 'HAV',
    landmark: '엘 카피톨리오와 빈티지 올드카',
    lat: 23.1136,
    lng: -82.3666,
    timezone: 'America/Havana',
  },
  {
    id: 'rio',
    countryEn: 'brazil',
    tableTopVh: 31, // frame_brazil.png 알파 채널 분석으로 측정한 테이블 상단 위치
    // 라디오/타이머 소품이 그림 속에 그려져 있어 클릭 가능한 인터랙션이 얹힙니다.
    hotspots: {
      timer: {
        screen: { x: 0.5502, y: 0.7173, width: 0.0598, height: 0.0425 },
      },
      radio: {
        display: { x: 0.4127, y: 0.6695, width: 0.0658, height: 0.0553 },
        power: { x: 0.3977, y: 0.7917 },
        volume: { x: 0.4486, y: 0.7651 },
      },
      coffee: {
        region: { x: 0.6429, y: 0.7014, width: 0.1316, height: 0.1488 },
        point: { x: 0.7057, y: 0.7864 },
      },
    },
    name: '리우데자네이루',
    nameEn: 'Rio de Janeiro',
    country: '브라질',
    countryCode: 'BR',
    airportCode: 'GIG',
    landmark: '코르코바두 예수상과 구아나바라 만',
    lat: -22.9068,
    lng: -43.1729,
    timezone: 'America/Sao_Paulo',
  },
  {
    id: 'prague',
    countryEn: 'czech',
    tableTopVh: 31, // frame_czech.png 알파 채널 분석으로 측정한 테이블 상단 위치
    // 라디오/타이머 소품이 그림 속에 그려져 있어 클릭 가능한 인터랙션이 얹힙니다.
    hotspots: {
      timer: {
        screen: { x: 0.5532, y: 0.7226, width: 0.0508, height: 0.0584 },
      },
      radio: {
        display: { x: 0.3888, y: 0.661, width: 0.1914, height: 0.0808 },
        power: { x: 0.4067, y: 0.7758 },
        volume: { x: 0.4545, y: 0.7598 },
      },
      coffee: {
        region: { x: 0.6459, y: 0.7439, width: 0.1256, height: 0.1594 },
        point: { x: 0.7057, y: 0.8289 },
      },
    },
    name: '프라하',
    nameEn: 'Prague',
    country: '체코',
    countryCode: 'CZ',
    airportCode: 'PRG',
    landmark: '카를교와 프라하 성',
    lat: 50.0755,
    lng: 14.4378,
    timezone: 'Europe/Prague',
  },
  {
    id: 'cairo',
    countryEn: 'egypt',
    tableTopVh: 31, // frame_egypt.png 알파 채널 분석으로 측정한 테이블 상단 위치
    // ⚠️ egypt-night-frame.png는 원본 해상도가 다른 나라들과 달라(1536x1024, 3:2 비율)
    // mask_egypt-night.png를 만들지 않았습니다. WeatherOverlay.vue가 밤에도 자동으로
    // mask_egypt.png(낮 마스크)를 폴백으로 사용하므로 기능상 문제는 없습니다 — 낮/밤이
    // 같은 구도라 창문 위치가 동일하기 때문입니다. 나중에 올바른 비율(1672x941)의
    // 야간 프레임이 생기면 mask_egypt-night.png를 추가로 만들어 교체하면 됩니다.
    hotspots: {
      timer: {
        screen: { x: 0.5562, y: 0.7226, width: 0.0508, height: 0.0584 },
      },
      radio: {
        display: { x: 0.3888, y: 0.6674, width: 0.1914, height: 0.0744 },
        power: { x: 0.4085, y: 0.7758 },
        volume: { x: 0.4486, y: 0.7598 },
      },
      coffee: {
        region: { x: 0.6429, y: 0.7439, width: 0.1286, height: 0.1594 },
        point: { x: 0.7057, y: 0.8289 },
      },
    },
    name: '카이로',
    nameEn: 'Cairo',
    country: '이집트',
    countryCode: 'EG',
    airportCode: 'CAI',
    landmark: '기자의 피라미드',
    lat: 30.0444,
    lng: 31.2357,
    timezone: 'Africa/Cairo',
  },
  {
    id: 'hongkong',
    countryEn: 'hongkong',
    tableTopVh: 35, // frame_hongkong.png 알파 채널 분석으로 측정한 테이블 상단 위치
    hotspots: {
      timer: {
        screen: { x: 0.5562, y: 0.7226, width: 0.0658, height: 0.0584 },
      },
      radio: {
        display: { x: 0.3947, y: 0.6748, width: 0.1824, height: 0.067 },
        power: { x: 0.4079, y: 0.7917 },
        volume: { x: 0.5161, y: 0.7651 },
      },
      coffee: {
        region: { x: 0.634, y: 0.7333, width: 0.1376, height: 0.1382 },
        point: { x: 0.6998, y: 0.8077 },
      },
    },
    name: '홍콩',
    nameEn: 'Hong Kong',
    country: '홍콩',
    countryCode: 'HK',
    airportCode: 'HKG',
    landmark: '빅토리아 하버와 IFC 타워',
    lat: 22.3193,
    lng: 114.1694,
    timezone: 'Asia/Hong_Kong',
  },
  {
    id: 'porto',
    countryEn: 'portugal',
    tableTopVh: 27, // frame_portugal.png 알파 채널 분석으로 측정한 테이블 상단 위치
    hotspots: {
      timer: {
        screen: { x: 0.5353, y: 0.7354, width: 0.0538, height: 0.0563 },
      },
      radio: {
        display: { x: 0.3917, y: 0.6961, width: 0.1824, height: 0.0606 },
        power: { x: 0.4127, y: 0.8108 },
        volume: { x: 0.4486, y: 0.7917 },
      },
      coffee: {
        region: { x: 0.5981, y: 0.7226, width: 0.1376, height: 0.1275 },
        point: { x: 0.6639, y: 0.797 },
      },
    },
    name: '포르투',
    nameEn: 'Porto',
    country: '포르투갈',
    countryCode: 'PT',
    airportCode: 'OPO',
    landmark: '동 루이스 다리와 도루 강',
    lat: 41.1579,
    lng: -8.6291,
    timezone: 'Europe/Lisbon',
  },
  {
    id: 'barcelona',
    countryEn: 'spain',
    tableTopVh: 28, // frame_spain.png 알파 채널 분석으로 측정한 테이블 상단 위치
    hotspots: {
      timer: {
        screen: { x: 0.5383, y: 0.7333, width: 0.0508, height: 0.0584 },
      },
      radio: {
        display: { x: 0.3888, y: 0.6961, width: 0.1854, height: 0.0606 },
        power: { x: 0.3977, y: 0.8108 },
        volume: { x: 0.4545, y: 0.7917 },
      },
      coffee: {
        region: { x: 0.5981, y: 0.7226, width: 0.1495, height: 0.1275 },
        point: { x: 0.6519, y: 0.797 },
      },
    },
    name: '바르셀로나',
    nameEn: 'Barcelona',
    country: '스페인',
    countryCode: 'ES',
    airportCode: 'BCN',
    landmark: '사그라다 파밀리아',
    lat: 41.3874,
    lng: 2.1686,
    timezone: 'Europe/Madrid',
  },
  {
    id: 'zermatt',
    countryEn: 'swiss',
    tableTopVh: 31, // frame_swiss.png 알파 채널 분석으로 측정한 테이블 상단 위치
    hotspots: {
      timer: {
        screen: { x: 0.5443, y: 0.7173, width: 0.0508, height: 0.0531 },
      },
      radio: {
        display: { x: 0.3469, y: 0.6716, width: 0.2602, height: 0.0531 },
        power: { x: 0.3959, y: 0.7705 },
        volume: { x: 0.4414, y: 0.7492 },
      },
      coffee: {
        region: { x: 0.6041, y: 0.6908, width: 0.1256, height: 0.0956 },
        point: { x: 0.6669, y: 0.7439 },
      },
    },
    name: '체르마트',
    nameEn: 'Zermatt',
    country: '스위스',
    countryCode: 'CH',
    airportCode: 'ZRH',
    landmark: '마터호른',
    lat: 46.0207,
    lng: 7.7491,
    timezone: 'Europe/Zurich',
  },
  {
    id: 'london',
    countryEn: 'uk',
    tableTopVh: 31, // frame_uk.png 알파 채널 분석으로 측정한 테이블 상단 위치
    hotspots: {
      timer: {
        screen: { x: 0.5383, y: 0.7386, width: 0.0478, height: 0.0531 },
      },
      radio: {
        display: { x: 0.3917, y: 0.7014, width: 0.1376, height: 0.0553 },
        power: { x: 0.3678, y: 0.797 },
        volume: { x: 0.4306, y: 0.7758 },
      },
      coffee: {
        region: { x: 0.622, y: 0.7333, width: 0.1376, height: 0.1169 },
        point: { x: 0.6878, y: 0.797 },
      },
    },
    name: '런던',
    nameEn: 'London',
    country: '영국',
    countryCode: 'GB',
    airportCode: 'LHR',
    landmark: '빅벤과 웨스트민스터',
    lat: 51.5074,
    lng: -0.1278,
    timezone: 'Europe/London',
  },
  {
    id: 'gallifrey',
    countryEn: 'gallifrey',
    hidden: true, // 전광판/검색에는 안 나오고, 화면을 가로지르는 타디스를 클릭해야만 갈 수 있는 이스터에그 도시
    tableTopVh: 33, // frame_gallifrey.png 알파 채널 분석으로 측정한 테이블 상단 위치
    hotspots: {
      timer: {
        screen: { x: 0.5413, y: 0.7226, width: 0.0508, height: 0.0531 },
      },
      radio: {
        display: { x: 0.2632, y: 0.6695, width: 0.2661, height: 0.0723 },
        power: { x: 0.3947, y: 0.7917 },
        volume: { x: 0.4396, y: 0.7705 },
      },
      coffee: {
        region: { x: 0.6041, y: 0.6908, width: 0.1435, height: 0.1594 },
        point: { x: 0.6758, y: 0.7758 },
      },
    },
    name: '갈리프레이',
    nameEn: 'Gallifrey',
    country: '타임로드 행성',
    countryCode: 'XX', // 실존 국가가 아니라 날씨 API는 호출하지 않음 (weather.js에서 별도 처리)
    airportCode: 'GAL',
    landmark: '쌍둥이 태양 아래 빛나는 판옵티콘의 돔',
    lat: null,
    lng: null,
    timezone: 'relative', // 실제 타임존이 없어서, 사용자의 현지 시간을 그대로 보여줌
    youtubeId: 'cl-H1DcKgJw', // "Gallifrey, Our Childhood, Our Home" — 도시 배경음악으로 재생
    youtubeLabel: 'Gallifrey, Our Childhood, Our Home',
  },
]

export function getCityById(id) {
  return cities.find((c) => c.id === id) || null
}
