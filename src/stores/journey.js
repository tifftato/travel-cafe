import { defineStore } from 'pinia'
import { cities, findNearestCity } from '../data/cities'

export const useJourneyStore = defineStore('journey', {
  state: () => ({
    nearestCityId: null,
    searchResults: [], // 도시 검색 결과 (실제 검색 API 붙일 자리)
  }),

  getters: {
    allCities: () => cities,
    nearestCity: (state) => cities.find((c) => c.id === state.nearestCityId) || cities[0],
  },

  actions: {
    // 초기 진입 시 사용자 위치 기반으로 가장 가까운 주요 도시를 기본 선택해둔다
    async initNearestCity() {
      try {
        const pos = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) return reject(new Error('no geolocation'))
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        })
        const nearest = findNearestCity(pos.coords.latitude, pos.coords.longitude)
        this.nearestCityId = nearest.id
      } catch {
        // 위치 권한 거부/미지원 시 기본값(서울)
        this.nearestCityId = 'seoul'
      }
    },

    // 도시 검색 (지금은 로컬 리스트 필터. 실제 서비스에선 지오코딩 API로 교체)
    searchCities(query) {
      const q = query.trim().toLowerCase()
      if (!q) {
        this.searchResults = []
        return
      }
      this.searchResults = cities.filter(
        (c) =>
          c.name.includes(query) ||
          c.nameEn.toLowerCase().includes(q) ||
          c.country.includes(query)
      )
    },
  },
})
