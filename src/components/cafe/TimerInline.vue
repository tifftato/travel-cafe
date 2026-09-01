<script setup>
import { usePomodoroStore } from '../../stores/pomodoro'
import { useImageRegion } from '../../composables/useImageRegion'

const props = defineProps({
  imgRef: { type: Object, required: true },
  region: { type: Object, required: true }, // { x, y, width, height } — 빈 화면 영역
})

const pomodoro = usePomodoroStore()
const { style } = useImageRegion(props.imgRef, props.region)
</script>

<template>
  <button
    class="timer-inline"
    :style="style"
    :aria-label="`포모도로 타이머 ${pomodoro.mode === 'focus' ? '집중' : '휴식'} 중, 남은 시간 ${pomodoro.minutes}분 ${pomodoro.seconds}초. 클릭하면 ${pomodoro.isRunning ? '일시정지' : '시작'}합니다.`"
    @click="pomodoro.toggle()"
  >
    <span class="timer-inline__time" aria-hidden="true">{{ pomodoro.minutes }}:{{ pomodoro.seconds }}</span>
    <div class="timer-inline__bar-track" aria-hidden="true">
      <div class="timer-inline__bar-fill" :style="{ width: pomodoro.progress * 100 + '%' }"></div>
    </div>
  </button>
</template>

<style scoped>
/* 카드/테두리/배경 없음 — 소품 자체의 "화면"처럼 보이도록 텍스트만 존재 */
.timer-inline {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: transparent;
  border: none;
  padding: 4px;
  border-radius: 6px;
  cursor: pointer;
  pointer-events: auto;
  user-select: none;
}

.timer-inline__time {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: clamp(10px, 1.6vw, 20px);
  color: #ffffff;
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.95),
    0 2px 8px rgba(0, 0, 0, 0.85),
    0 0 10px rgba(255, 179, 71, 0.35);
  line-height: 1;
  white-space: nowrap;
}

.timer-inline__bar-track {
  width: 70%;
  height: 2px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  overflow: hidden;
}

.timer-inline__bar-fill {
  height: 100%;
  background: var(--color-amber);
  transition: width 1s linear;
}
</style>
