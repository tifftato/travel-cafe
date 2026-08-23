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

export const cities = [
  {
    id: 'seoul',
    countryEn: 'korea',
    tableTopVh: 37, // frame_korea.png 알파 채널 분석으로 측정한 테이블 상단 위치
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
    tableTopVh: 36, // frame_italy.png 알파 채널 분석으로 측정한 테이블 상단 위치
    name: '로마',
    nameEn: 'Rome',
    country: '이탈리아',
    countryCode: 'IT',
    airportCode: 'FCO',
    landmark: '콜로세움 근처 고풍스러운 노천카페',
    lat: 41.9028,
    lng: 12.4964,
    timezone: 'Europe/Rome',
  },
  {
    id: 'paris',
    countryEn: 'france',
    tableTopVh: 30, // frame_france.png 알파 채널 분석으로 측정한 테이블 상단 위치
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
    tableTopVh: 37, // frame_usa.png 알파 채널 분석으로 측정한 테이블 상단 위치
    name: '뉴욕',
    nameEn: 'New York',
    country: '미국',
    countryCode: 'US',
    airportCode: 'JFK',
    landmark: '타임스퀘어의 화려한 네온사인',
    lat: 40.7128,
    lng: -74.0060,
    timezone: 'America/New_York',
  },
  {
    id: 'tokyo',
    countryEn: 'japan',
    tableTopVh: 27, // frame_japan.png 알파 채널 분석으로 측정한 테이블 상단 위치
    name: '도쿄',
    nameEn: 'Tokyo',
    country: '일본',
    countryCode: 'JP',
    airportCode: 'HND',
    landmark: '시부야 교차로와 도쿄 타워',
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
    tableTopVh: 38, // frame_turkey.png 알파 채널 분석으로 측정한 테이블 상단 위치
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
    tableTopVh: 35, // frame_austria.png 알파 채널 분석으로 측정한 테이블 상단 위치
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
    tableTopVh: 40, // frame_vietnam.png 알파 채널 분석으로 측정한 테이블 상단 위치
    name: '하노이',
    nameEn: 'Hanoi',
    country: '베트남',
    countryCode: 'VN',
    airportCode: 'HAN',
    landmark: '호안끼엠 호수 주변의 활기찬 거리',
    lat: 21.0285,
    lng: 105.8542,
    timezone: 'Asia/Ho_Chi_Minh',
  },
  {
    id: 'havana',
    countryEn: 'cuba',
    tableTopVh: 34, // frame_cuba.png 알파 채널 분석으로 측정한 테이블 상단 위치
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
]

export function getCityById(id) {
  return cities.find((c) => c.id === id) || null
}

// Haversine 공식으로 사용자 위치에서 가장 가까운 도시 찾기 (초기 화면용)
export function findNearestCity(lat, lng) {
  if (lat == null || lng == null) return cities[0]

  const toRad = (deg) => (deg * Math.PI) / 180
  const R = 6371 // km

  let nearest = cities[0]
  let minDist = Infinity

  for (const city of cities) {
    const dLat = toRad(city.lat - lat)
    const dLng = toRad(city.lng - lng)
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat)) * Math.cos(toRad(city.lat)) * Math.sin(dLng / 2) ** 2
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    if (dist < minDist) {
      minDist = dist
      nearest = city
    }
  }
  return nearest
}
