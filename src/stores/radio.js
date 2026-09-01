import { defineStore } from 'pinia'
import { RadioBrowserApi } from 'radio-browser-api'

// radio-browser-api 는 브라우저에서 바로 호출 가능한 공개 API 래퍼입니다.
// (별도 서버 프록시 없이 클라이언트에서 직접 호출)
const api = new RadioBrowserApi('Travel Cafe App', true) // hideBroken=true

// 갈리프레이처럼 실제 방송국이 없는 도시는 city.youtubeId로 유튜브 영상을 대신 재생합니다.
// YouTube IFrame API는 전역에 한 번만 로드하면 되므로 모듈 스코프에 싱글턴 프라미스로 캐싱합니다.
let ytApiPromise = null
function loadYoutubeApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT)
  if (ytApiPromise) return ytApiPromise
  ytApiPromise = new Promise((resolve) => {
    const prevReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prevReady?.()
      resolve(window.YT)
    }
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
  })
  return ytApiPromise
}

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
    isYoutube: false, // 지금 재생 중인 게 유튜브 음악인지 (라디오 방송 대신)
    _audioEl: null,
    _ytPlayer: null,
  }),

  actions: {
    async loadStationForCity(city) {
      if (!city) return
      this._teardownAudio()
      this._teardownYoutube()

      if (city.youtubeId) {
        return this._loadYoutube(city)
      }

      this.loading = true
      this.error = null
      this.autoplayBlocked = false
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

    // 유튜브 영상 하나를 "라디오 방송"처럼 재생합니다. 화면엔 안 보이는 1x1 iframe만 만들고
    // RadioInline.vue는 평소처럼 isPlaying/volume/stationName만 바라보면 됩니다.
    async _loadYoutube(city) {
      this.loading = true
      this.error = null
      this.autoplayBlocked = false
      this.isYoutube = true
      this.stationName = city.youtubeLabel || '오늘의 노래'

      try {
        const YT = await loadYoutubeApi()

        let container = document.getElementById('yt-radio-player')
        if (!container) {
          container = document.createElement('div')
          container.id = 'yt-radio-player'
          // 화면에 전혀 안 보이게 (음소거는 아니고, 그냥 시각적으로만 숨김)
          container.style.cssText =
            'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;'
          document.body.appendChild(container)
        }

        await new Promise((resolve) => {
          this._ytPlayer = new YT.Player(container.id, {
            videoId: city.youtubeId,
            playerVars: { autoplay: 1, controls: 0 },
            events: {
              onReady: () => {
                this._ytPlayer.setVolume(Math.round(this.volume * 100))
                try {
                  this._ytPlayer.playVideo()
                } catch {
                  /* 자동재생 실패는 아래 상태 체크에서 감지 */
                }
                resolve()
              },
              onStateChange: (e) => {
                // YT.PlayerState: 1=재생중, 2=일시정지, 0=종료
                if (e.data === 0) {
                  this._ytPlayer?.playVideo() // 끝나면 반복 재생
                  return
                }
                this.isPlaying = e.data === 1
              },
              onError: () => {
                this.error = 'youtube playback error'
              },
            },
          })
        })

        // 자동재생이 브라우저 정책에 막혔는지 잠깐 뒤에 확인 (재생 버튼 안내용)
        setTimeout(() => {
          if (this._ytPlayer?.getPlayerState?.() !== 1) {
            this.autoplayBlocked = true
          }
        }, 1200)
      } catch (e) {
        this.error = String(e)
      } finally {
        this.loading = false
      }
    },

    _teardownYoutube() {
      if (this._ytPlayer) {
        try {
          this._ytPlayer.destroy()
        } catch {
          /* 이미 파괴된 상태여도 무시 */
        }
        this._ytPlayer = null
      }
      this.isYoutube = false
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
      if (this.isYoutube) {
        if (!this._ytPlayer) return
        const shouldPlay = forcePlay ?? !this.isPlaying
        if (shouldPlay) {
          this._ytPlayer.playVideo()
          this.autoplayBlocked = false
        } else {
          this._ytPlayer.pauseVideo()
        }
        return
      }
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
      if (this.isYoutube) {
        this._ytPlayer?.setVolume?.(Math.round(v * 100))
        return
      }
      if (this._audioEl) this._audioEl.volume = v
    },
  },
})
