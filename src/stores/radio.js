import { defineStore } from 'pinia'
import { RadioBrowserApi } from 'radio-browser-api'

// radio-browser-api 는 브라우저에서 바로 호출 가능한 공개 API 래퍼입니다.
// (별도 서버 프록시 없이 클라이언트에서 직접 호출)
const api = new RadioBrowserApi('Travel Cafe App', true) // hideBroken=true

export const useRadioStore = defineStore('radio', {
  state: () => ({
    loading: false,
    error: null,
    isPlaying: false,
    autoplayBlocked: false, // 브라우저 자동재생 정책 때문에 자동 시작이 막힌 경우
    volume: 0.6,
    stationName: '',
    streamUrl: '',
    stationList: [], // 재생 실패 시 다음 후보로 넘어가기 위한 후보 목록
    stationIndex: 0,
    _audioEl: null,
  }),

  actions: {
    async loadStationForCity(city) {
      if (!city) return
      this.loading = true
      this.error = null
      this.autoplayBlocked = false
      this._teardownAudio()
      this.stationName = ''
      this.streamUrl = ''
      this.stationIndex = 0

      try {
        const stations = await api.searchStations({
          countryCode: city.countryCode, // ISO 3166-1 alpha-2 (예: KR, FR)
          order: 'clickcount',
          reverse: true,
          limit: 10,
          hideBroken: true,
        })

        this.stationList = stations.filter((s) => s.urlResolved || s.url)

        if (!this.stationList.length) {
          this.error = 'no stations found'
          return
        }

        this._setupStation(0)
        // 도시 진입 시 자동 재생 (사용자가 이전에 음소거하지 않았다면)
        await this._attemptPlay({ isAutoplay: true })
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    _setupStation(index) {
      const station = this.stationList[index]
      if (!station) {
        this.error = 'no playable station'
        return
      }
      this.stationIndex = index
      this.stationName = station.name || '이름 없는 방송국'
      this.streamUrl = station.urlResolved || station.url

      this._teardownAudio()
      const audio = new Audio(this.streamUrl)
      audio.volume = this.volume
      audio.crossOrigin = 'anonymous'
      // 스트림이 죽어있으면 다음 후보 방송국으로 자동 전환
      audio.addEventListener('error', () => this._tryNextStation())
      this._audioEl = audio
    },

    _tryNextStation() {
      const nextIndex = this.stationIndex + 1
      if (nextIndex >= this.stationList.length) {
        this.error = 'all candidate stations failed'
        this.isPlaying = false
        return
      }
      const wasPlaying = this.isPlaying
      this._setupStation(nextIndex)
      if (wasPlaying) this._attemptPlay({ isAutoplay: false })
    },

    _teardownAudio() {
      if (this._audioEl) {
        this._audioEl.pause()
        this._audioEl = null
      }
      this.isPlaying = false
    },

    // 실제 play() 시도. 자동재생 정책 차단(NotAllowedError)과
    // 스트림 자체 오류를 구분해서 처리한다.
    async _attemptPlay({ isAutoplay }) {
      if (!this._audioEl) return
      try {
        await this._audioEl.play()
        this.isPlaying = true
        this.autoplayBlocked = false
      } catch (e) {
        this.isPlaying = false
        if (isAutoplay && e.name === 'NotAllowedError') {
          // 스트림 문제가 아니라 브라우저가 자동재생을 막은 것 — 다음 방송국으로 넘기지 않는다.
          this.autoplayBlocked = true
        } else {
          this.error = e.message
          this._tryNextStation()
        }
      }
    },

    togglePlay(forcePlay) {
      if (!this._audioEl) return
      const shouldPlay = forcePlay ?? !this.isPlaying
      if (shouldPlay) {
        this._attemptPlay({ isAutoplay: false })
      } else {
        this._audioEl.pause()
        this.isPlaying = false
      }
    },

    setVolume(v) {
      this.volume = v
      if (this._audioEl) this._audioEl.volume = v
    },
  },
})
