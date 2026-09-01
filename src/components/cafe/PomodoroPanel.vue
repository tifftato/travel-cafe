<script setup>
import { usePomodoroStore } from '../../stores/pomodoro'

const pomodoro = usePomodoroStore()
</script>

<template>
  <section class="pomodoro-panel">
    <p class="pomodoro-panel__label">POMODORO · {{ pomodoro.mode === 'focus' ? '집중' : '휴식' }}</p>
    <div class="pomodoro-panel__timer">
      <svg viewBox="0 0 100 100" class="pomodoro-panel__ring-svg">
        <circle cx="50" cy="50" r="44" class="pomodoro-panel__ring-track" />
        <circle
          cx="50"
          cy="50"
          r="44"
          class="pomodoro-panel__ring-progress"
          :style="{ strokeDashoffset: 276 - 276 * pomodoro.progress }"
        />
      </svg>
      <span class="pomodoro-panel__timer-text">{{ pomodoro.minutes }}:{{ pomodoro.seconds }}</span>
    </div>
    <div class="pomodoro-panel__buttons">
      <button @click="pomodoro.toggle()">{{ pomodoro.isRunning ? '일시정지' : '시작' }}</button>
      <button class="pomodoro-panel__btn-ghost" @click="pomodoro.reset()">리셋</button>
    </div>
    <p class="pomodoro-panel__meta">완료한 세션 {{ pomodoro.completedFocusCount }}회</p>
  </section>
</template>

<style scoped>
.pomodoro-panel__label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--color-amber-dim);
  margin: 0 0 10px;
  text-align: center;
}

.pomodoro-panel__timer {
  position: relative;
  width: 108px;
  height: 108px;
  margin: 0 auto 12px;
}

.pomodoro-panel__ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.pomodoro-panel__ring-track {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 6;
}

.pomodoro-panel__ring-progress {
  fill: none;
  stroke: var(--color-amber);
  stroke-width: 6;
  stroke-linecap: round;
  stroke-dasharray: 276;
  transition: stroke-dashoffset 1s linear;
}

.pomodoro-panel__timer-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 19px;
  color: var(--color-cream);
}

.pomodoro-panel__buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.pomodoro-panel__buttons button {
  background: var(--color-amber);
  color: #1c1a15;
  border: none;
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
}

.pomodoro-panel__btn-ghost {
  background: transparent !important;
  color: var(--color-cream) !important;
  border: 1px solid var(--color-line) !important;
}

.pomodoro-panel__meta {
  text-align: center;
  font-size: 11px;
  color: var(--color-amber-dim);
  margin: 8px 0 0;
}
</style>
