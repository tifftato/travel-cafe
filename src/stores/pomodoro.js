import { defineStore } from 'pinia'

const FOCUS_SECONDS = 25 * 60
const BREAK_SECONDS = 5 * 60

export const usePomodoroStore = defineStore('pomodoro', {
  state: () => ({
    mode: 'focus', // 'focus' | 'break'
    remaining: FOCUS_SECONDS,
    isRunning: false,
    completedFocusCount: 0,
    _intervalId: null,
  }),

  getters: {
    minutes: (state) => String(Math.floor(state.remaining / 60)).padStart(2, '0'),
    seconds: (state) => String(state.remaining % 60).padStart(2, '0'),
    progress: (state) => {
      const total = state.mode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS
      return 1 - state.remaining / total
    },
  },

  actions: {
    start() {
      if (this.isRunning) return
      this.isRunning = true
      this._intervalId = setInterval(() => this._tick(), 1000)
    },

    pause() {
      this.isRunning = false
      clearInterval(this._intervalId)
    },

    toggle() {
      this.isRunning ? this.pause() : this.start()
    },

    reset() {
      this.pause()
      this.remaining = this.mode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS
    },

    _tick() {
      if (this.remaining > 0) {
        this.remaining -= 1
        return
      }
      // 사이클 전환
      if (this.mode === 'focus') {
        this.completedFocusCount += 1
        this.mode = 'break'
        this.remaining = BREAK_SECONDS
      } else {
        this.mode = 'focus'
        this.remaining = FOCUS_SECONDS
      }
      // TODO: 여기서 알림음 재생 훅 연결 (예: new Audio('/sounds/chime.mp3').play())
    },
  },
})
