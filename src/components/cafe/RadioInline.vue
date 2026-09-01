<script setup>
import { useRadioStore } from '../../stores/radio'
import { useImageHotspot } from '../../composables/useImageHotspot'
import { useImageRegion } from '../../composables/useImageRegion'
import RotaryKnob from './RotaryKnob.vue'

const props = defineProps({
  imgRef: { type: Object, required: true },
  // hotspots.radio = { display: {x,y,width,height}, power: {x,y}, volume: {x,y} }
  config: { type: Object, required: true },
})

const radio = useRadioStore()

const { style: displayStyle } = props.config.display
  ? useImageRegion(props.imgRef, props.config.display)
  : { style: { value: {} } }

const { style: powerStyle } = props.config.power
  ? useImageHotspot(props.imgRef, props.config.power.x, props.config.power.y)
  : { style: { value: {} } }

const { style: volumeStyle } = props.config.volume
  ? useImageHotspot(props.imgRef, props.config.volume.x, props.config.volume.y)
  : { style: { value: {} } }
</script>

<template>
  <!-- 방송국 이름: 라디오 본체의 빈 주파수 표시창 영역에 직접 삽입 -->
  <div v-if="config.display" class="radio-inline__display" :style="displayStyle" role="status" aria-live="polite">
    <span class="radio-inline__display-text">
      {{ radio.loading ? '탐색 중…' : (radio.stationName || '방송국 없음') }}
    </span>
  </div>

  <!-- 재생/정지: 전원 버튼 위 투명 핫스팟, 재생 중엔 은은한 글로우로만 상태 표현 -->
  <button
    v-if="config.power"
    class="radio-inline__power"
    :class="{ 'radio-inline__power--on': radio.isPlaying }"
    :style="powerStyle"
    :disabled="!radio.streamUrl"
    :aria-label="radio.isPlaying ? '라디오 정지' : '라디오 재생'"
    @click="radio.togglePlay()"
  >
    <span class="radio-inline__power-glow"></span>
  </button>

  <!-- 볼륨: 노브 위 드래그 회전 컨트롤 -->
  <RotaryKnob
    v-if="config.volume"
    :model-value="radio.volume"
    :style="volumeStyle"
    @update:model-value="radio.setVolume($event)"
  />

  <p v-if="radio.autoplayBlocked && !radio.isPlaying" class="radio-inline__hint" :style="powerStyle">
    🔈 눌러서 재생
  </p>
</template>

<style scoped>
.radio-inline__display {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  overflow: hidden;
}

.radio-inline__display-text {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: clamp(9px, 1.1vw, 13px);
  color: #ffffff;
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.95),
    0 2px 8px rgba(0, 0, 0, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  padding: 0 4px;
}

.radio-inline__power {
  position: absolute;
  transform: translate(-50%, -50%);
  width: clamp(30px, 5vw, 46px);
  height: clamp(30px, 5vw, 46px);
  border-radius: 50%;
  background: transparent;
  border: none;
  cursor: pointer;
  pointer-events: auto;
}

.radio-inline__power:focus-visible {
  outline: 2px solid var(--color-amber);
  outline-offset: 3px;
}

.radio-inline__power-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(255, 179, 71, 0);
  transition: box-shadow 0.3s ease;
}

.radio-inline__power--on .radio-inline__power-glow {
  box-shadow: 0 0 14px 4px rgba(255, 179, 71, 0.65);
  animation: power-pulse 2.4s ease-in-out infinite;
}

@keyframes power-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.radio-inline__hint {
  position: absolute;
  transform: translate(-50%, calc(-100% - 8px));
  font-family: var(--font-mono);
  font-size: 11px;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
  white-space: nowrap;
  pointer-events: none;
}
</style>
