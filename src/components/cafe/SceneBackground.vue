<script setup>
import { useOptionalImage } from '../../composables/useOptionalImage'

const props = defineProps({
  city: { type: Object, required: true },
  isNight: { type: Boolean, default: false },
})

// public/assets/bg_{countryEn}.jpg 하나만 사용하고,
// 밤에는 별도 이미지 없이 CSS 필터로 야간 톤을 입힙니다.
const { url: bgUrl, exists } = useOptionalImage('bg', props.city.countryEn, 'jpg')
</script>

<template>
  <div class="scene-bg" :class="{ 'scene-bg--night': isNight }">
    <img
      v-show="exists"
      :src="bgUrl"
      :alt="city.landmark"
      class="scene-bg__img"
      @error="exists = false"
    />
    <div v-if="exists === false" class="scene-bg__placeholder">
      <span class="scene-bg__landmark-icon">🏙️</span>
      <span class="scene-bg__landmark-name">{{ city.landmark }}</span>
      <span class="scene-bg__hint">public/assets/bg_{{ city.countryEn }}.jpg 를 추가해주세요</span>
    </div>
  </div>
</template>

<style scoped>
.scene-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.scene-bg__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: filter 0.6s ease;
}

/* 밤: 별도 이미지 없이 어둡게 톤다운 + 푸른 톤 오버레이 */
.scene-bg--night .scene-bg__img {
  filter: brightness(0.55) saturate(1.15) hue-rotate(-6deg);
}
.scene-bg--night::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10, 15, 40, 0.25), rgba(10, 15, 40, 0.45));
  pointer-events: none;
}

.scene-bg__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  padding: 24px;
  background: linear-gradient(180deg, #7fb8e0 0%, #bfe0ec 55%, #e8dcc0 100%);
  color: #26364a;
}

.scene-bg--night .scene-bg__placeholder {
  background: linear-gradient(180deg, #0a0f2a 0%, #1c2650 60%, #2c3560 100%);
  color: #dfe6ff;
}

.scene-bg__landmark-icon {
  font-size: clamp(48px, 8vw, 96px);
}

.scene-bg__landmark-name {
  font-family: var(--font-mono);
  font-size: clamp(14px, 2.2vw, 20px);
  letter-spacing: 0.03em;
  max-width: 400px;
}

.scene-bg__hint {
  font-size: 11px;
  opacity: 0.6;
  max-width: 320px;
}
</style>
