import { defineStore } from 'pinia'

// OpenWeatherMap condition code -> 우리 오버레이가 이해하는 타입으로 매핑
// https://openweathermap.org/weather-conditions
function mapCondition(owmId, icon) {
  const isNight = icon?.endsWith('n')
  if (owmId >= 200 && owmId < 300) return { type: 'thunderstorm', isNight }
  if (owmId >= 300 && owmId < 600) return { type: 'rain', isNight }
  if (owmId >= 600 && owmId < 700) return { type: 'snow', isNight }
  if (owmId >= 700 && owmId < 800) return { type: 'fog', isNight }
  if (owmId === 800) return { type: 'clear', isNight }
  if (owmId > 800) return { type: 'clouds', isNight }
  return { type: 'clear', isNight }
}

export const useWeatherStore = defineStore('weather', {
  state: () => ({
    loading: false,
    error: null,
    tempC: null,
    condition: 'clear', // clear | clouds | rain | snow | thunderstorm | fog
    isNight: false,
    description: '',
    lastFetchedCityId: null,
  }),

  actions: {
    async fetchWeather(city) {
      if (!city) return

      // 갈리프레이처럼 실존 좌표가 없는 도시는 날씨 API를 호출하지 않습니다.
      // 대신 사용자의 실제 로컬 시간을 기준으로 낮/밤만 판단해서, 창밖 풍경이
      // 방문하는 시점(사용자의 지금)에 맞는 낮 배경/쌍둥이 태양 vs 밤 배경/두 개의 달을 보여줍니다.
      if (city.lat == null || city.lng == null) {
        const hour = new Date().getHours()
        this.tempC = null
        this.condition = 'clear'
        this.isNight = hour < 6 || hour >= 18
        this.description = ''
        this.error = null
        this.loading = false
        this.lastFetchedCityId = city.id
        return
      }

      this.loading = true
      this.error = null
      try {
        const res = await fetch(`/api/weather?lat=${city.lat}&lon=${city.lng}`)
        const data = await res.json()

        if (!res.ok) {
          // 서버(api/weather.js)가 명시적으로 보낸 에러 메시지를 그대로 노출
          throw new Error(data?.error || `weather api ${res.status}`)
        }

        const owmId = data.weather?.[0]?.id ?? 800
        const icon = data.weather?.[0]?.icon ?? '01d'
        const { type, isNight } = mapCondition(owmId, icon)

        this.tempC = Math.round(data.main?.temp ?? 20)
        this.condition = type
        this.isNight = isNight
        this.description = data.weather?.[0]?.description ?? ''
        this.lastFetchedCityId = city.id
      } catch (e) {
        // 실패한 도시(city.id)와 원인을 정확히 남겨서, "왜 실패했는지" 콘솔에서 바로 보이도록 함.
        // 이전 도시의 값(온도/날씨)을 그대로 재사용하지 않는다 — 그러면 매번 실패해도
        // 겉으로는 "정상 작동 중"인 것처럼 보이는 착시가 생기기 때문.
        console.error(`[weather] ${city.id} 날씨를 불러오지 못했습니다:`, e.message)
        this.error = e.message
        this.tempC = null
        this.condition = 'clear'
        this.isNight = false
        this.description = ''
        this.lastFetchedCityId = null
      } finally {
        this.loading = false
      }
    },
  },
})
