import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', {
  state: () => ({
    unit: 'celsius', // 'celsius' | 'fahrenheit'
  }),

  getters: {
    unitSymbol: (state) => (state.unit === 'celsius' ? '°C' : '°F'),
  },

  actions: {
    toggleUnit() {
      this.unit = this.unit === 'celsius' ? 'fahrenheit' : 'celsius'
    },

    // 항상 섭씨로 저장된 값을 받아 현재 단위에 맞게 변환
    displayTemp(celsius) {
      if (celsius == null) return '—'
      if (this.unit === 'fahrenheit') return Math.round((celsius * 9) / 5 + 32)
      return Math.round(celsius)
    },
  },
})
