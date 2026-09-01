import { defineStore } from 'pinia'
import { cities } from '../data/cities'

export const useJourneyStore = defineStore('journey', {
  state: () => ({
    searchResults: [], // 도시 검색 결과 (실제 검색 API 붙일 자리)
  }),

  getters: {
    // hidden: true인 도시(예: 이스터에그로만 갈 수 있는 갈리프레이)는 전광판/검색에 안 나옵니다.
    allCities: () => cities.filter((c) => !c.hidden),
  },

  actions: {
    // 도시 검색 (지금은 로컬 리스트 필터. 실제 서비스에선 지오코딩 API로 교체)
    searchCities(query) {
      const q = query.trim().toLowerCase()
      if (!q) {
        this.searchResults = []
        return
      }
      this.searchResults = cities.filter(
        (c) =>
          !c.hidden &&
          (c.name.includes(query) ||
            c.nameEn.toLowerCase().includes(q) ||
            c.country.includes(query))
      )
    },
  },
})
