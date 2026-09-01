<script setup>
import { useRadioStore } from '../../stores/radio'

defineProps({
  city: { type: Object, required: true },
})

const radio = useRadioStore()
</script>

<template>
  <section class="radio-panel">
    <p class="radio-panel__label">{{ city.name }} 라디오</p>
    <p class="radio-panel__station-name" role="status" aria-live="polite">
      {{ radio.loading ? '방송국 찾는 중…' : (radio.stationName || '재생 가능한 방송국이 없어요') }}
    </p>
    <p v-if="radio.autoplayBlocked && !radio.isPlaying" class="radio-panel__hint">
      🔈 재생 버튼을 한 번 눌러주세요
    </p>
    <div class="radio-panel__buttons">
      <button :disabled="!radio.streamUrl" @click="radio.togglePlay()">
        {{ radio.isPlaying ? '⏸ 정지' : '▶ 재생' }}
      </button>
      <label for="radio-volume" class="sr-only">라디오 볼륨</label>
      <input
        id="radio-volume"
        class="radio-panel__volume"
        type="range"
        min="0"
        max="1"
        step="0.05"
        :value="radio.volume"
        :aria-valuetext="`${Math.round(radio.volume * 100)}퍼센트`"
        @input="radio.setVolume($event.target.valueAsNumber)"
      />
    </div>
  </section>
</template>

<style scoped>
.radio-panel__label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--color-amber-dim);
  margin: 0 0 10px;
  text-align: center;
}

.radio-panel__station-name {
  text-align: center;
  font-size: 12px;
  margin: 0 0 6px;
  min-height: 16px;
  color: var(--color-cream);
}

.radio-panel__hint {
  text-align: center;
  font-size: 11px;
  color: var(--color-amber);
  margin: 0 0 10px;
}

.radio-panel__buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.radio-panel__buttons button {
  background: var(--color-amber);
  color: #1c1a15;
  border: none;
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
}
.radio-panel__buttons button:disabled {
  opacity: 0.4;
  cursor: default;
}

.radio-panel__volume {
  width: 90px;
  accent-color: var(--color-amber);
}
</style>
