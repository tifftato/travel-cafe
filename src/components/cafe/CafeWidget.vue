<script setup>
import { ref } from 'vue'
import { usePomodoroStore } from '../../stores/pomodoro'
import { useRadioStore } from '../../stores/radio'

defineProps({
  city: { type: Object, required: true },
})

const pomodoro = usePomodoroStore()
const radio = useRadioStore()

const collapsed = ref(false)
</script>

<template>
  <div class="widget" :class="{ 'widget--collapsed': collapsed }">
    <button class="widget__collapse-btn" @click="collapsed = !collapsed" :aria-label="collapsed ? '위젯 펼치기' : '위젯 접기'">
      {{ collapsed ? '☕' : '—' }}
    </button>

    <div v-show="!collapsed" class="widget__body">
      <!-- 포모도로 -->
      <section class="widget__section">
        <p class="widget__label">POMODORO · {{ pomodoro.mode === 'focus' ? '집중' : '휴식' }}</p>
        <div class="widget__timer">
          <svg viewBox="0 0 100 100" class="widget__ring-svg">
            <circle cx="50" cy="50" r="44" class="widget__ring-track" />
            <circle
              cx="50"
              cy="50"
              r="44"
              class="widget__ring-progress"
              :style="{ strokeDashoffset: 276 - 276 * pomodoro.progress }"
            />
          </svg>
          <span class="widget__timer-text">{{ pomodoro.minutes }}:{{ pomodoro.seconds }}</span>
        </div>
        <div class="widget__buttons">
          <button @click="pomodoro.toggle()">{{ pomodoro.isRunning ? '일시정지' : '시작' }}</button>
          <button class="widget__btn-ghost" @click="pomodoro.reset()">리셋</button>
        </div>
        <p class="widget__meta">완료한 세션 {{ pomodoro.completedFocusCount }}회</p>
      </section>

      <div class="widget__divider" />

      <!-- 라디오 -->
      <section class="widget__section">
        <p class="widget__label">{{ city.name }} 라디오</p>
        <p class="widget__station-name">
          {{ radio.loading ? '방송국 찾는 중…' : (radio.stationName || '재생 가능한 방송국이 없어요') }}
        </p>
        <p v-if="radio.autoplayBlocked && !radio.isPlaying" class="widget__hint">
          🔈 브라우저가 자동재생을 막았어요 — 재생 버튼을 한 번 눌러주세요
        </p>
        <div class="widget__buttons">
          <button :disabled="!radio.streamUrl" @click="radio.togglePlay()">
            {{ radio.isPlaying ? '⏸ 정지' : '▶ 재생' }}
          </button>
          <input
            class="widget__volume"
            type="range"
            min="0"
            max="1"
            step="0.05"
            :value="radio.volume"
            @input="radio.setVolume($event.target.valueAsNumber)"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.widget {
  position: fixed;
  right: clamp(16px, 3vw, 32px);
  bottom: clamp(16px, 3vw, 32px);
  z-index: 30;
  width: min(280px, 86vw);
  background: rgba(13, 15, 22, 0.72);
  border: 1px solid var(--color-line);
  border-radius: 18px;
  backdrop-filter: blur(14px);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.45);
  padding: 16px;
  transition: width 0.2s ease, padding 0.2s ease;
}

.widget--collapsed {
  width: 52px;
  padding: 0;
  border-radius: 50%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.widget__collapse-btn {
  position: absolute;
  top: 10px;
  right: 12px;
  background: none;
  border: none;
  color: var(--color-amber-dim);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
}

.widget--collapsed .widget__collapse-btn {
  position: static;
  font-size: 22px;
}

.widget__body {
  margin-top: 8px;
}

.widget__section {
  margin-bottom: 4px;
}

.widget__label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--color-amber-dim);
  margin: 0 0 10px;
}

.widget__timer {
  position: relative;
  width: 108px;
  height: 108px;
  margin: 0 auto 12px;
}

.widget__ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.widget__ring-track {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 6;
}

.widget__ring-progress {
  fill: none;
  stroke: var(--color-amber);
  stroke-width: 6;
  stroke-linecap: round;
  stroke-dasharray: 276;
  transition: stroke-dashoffset 1s linear;
}

.widget__timer-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 19px;
}

.widget__buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.widget__buttons button {
  background: var(--color-amber);
  color: #1c1a15;
  border: none;
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
}
.widget__buttons button:disabled {
  opacity: 0.4;
  cursor: default;
}
.widget__btn-ghost {
  background: transparent !important;
  color: var(--color-cream) !important;
  border: 1px solid var(--color-line) !important;
}

.widget__volume {
  width: 90px;
  accent-color: var(--color-amber);
}

.widget__meta {
  text-align: center;
  font-size: 11px;
  color: var(--color-amber-dim);
  margin: 8px 0 0;
}

.widget__station-name {
  text-align: center;
  font-size: 12px;
  margin: 0 0 10px;
  min-height: 16px;
  color: var(--color-cream);
}

.widget__hint {
  text-align: center;
  font-size: 11px;
  color: var(--color-amber);
  margin: -4px 0 10px;
}

.widget__divider {
  height: 1px;
  background: var(--color-line);
  margin: 16px 0;
}

@media (max-width: 640px) {
  .widget {
    left: 16px;
    right: 16px;
    width: auto;
    bottom: 16px;
  }
  .widget--collapsed {
    left: auto;
    width: 52px;
  }
}
</style>
