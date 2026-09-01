<script setup>
import { useOptionalImage } from '../../composables/useOptionalImage'

const props = defineProps({
  city: { type: Object, required: true },
  isNight: { type: Boolean, default: false },
})

// public/assets/bg_{countryEn}.jpg (낮, 필수) + bg_{countryEn}-night.jpg (밤, 선택)
// 밤 사진이 있으면 그걸 그대로 쓰고, 없으면 낮 사진에 CSS 필터로 야간 톤을 입혀서 대체합니다.
const { url: bgDayUrl, exists: dayExists } = useOptionalImage('bg', props.city.countryEn, 'jpg')
const { url: bgNightUrl, exists: nightExists } = useOptionalImage('bg', `${props.city.countryEn}-night`, 'jpg')
</script>

<template>
  <div class="scene-bg" :class="{ 'scene-bg--night': isNight, 'scene-bg--filtered-night': isNight && !nightExists }">
    <!-- 낮 사진: 밤이면서 전용 야간 사진이 있는 경우가 아닐 때만 보임 -->
    <img
      v-show="dayExists && !(isNight && nightExists)"
      :src="bgDayUrl"
      :alt="city.landmark"
      class="scene-bg__img"
      @error="dayExists = false"
    />
    <!-- 밤 전용 사진: isNight && 파일이 있을 때만 -->
    <img
      v-if="isNight && nightExists"
      :src="bgNightUrl"
      :alt="city.landmark + ' (야간)'"
      class="scene-bg__img scene-bg__img--night-photo"
    />
    <div v-if="dayExists === false" class="scene-bg__placeholder">
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
  transition: filter 0.6s ease, opacity 0.6s ease;
}

/* 전용 야간 사진은 필터 없이 원본 그대로 (이미 밤 조명으로 촬영/생성됨) */
.scene-bg__img--night-photo {
  filter: none;
}

/* 전용 야간 사진이 없는 나라만: 낮 사진에 CSS로 야간 톤 흉내 */
.scene-bg--filtered-night .scene-bg__img {
  filter: brightness(0.55) saturate(1.15) hue-rotate(-6deg);
}
.scene-bg--filtered-night::after {
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
