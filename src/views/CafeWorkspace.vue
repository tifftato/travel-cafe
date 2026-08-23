<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { getCityById } from '../data/cities'
import { useWeatherStore } from '../stores/weather'
import { useRadioStore } from '../stores/radio'
import { useConfigStore } from '../stores/config'
import SceneBackground from '../components/cafe/SceneBackground.vue'
import WeatherOverlay from '../components/cafe/WeatherOverlay.vue'
import FrameForeground from '../components/cafe/FrameForeground.vue'
import TravelClock from '../components/cafe/TravelClock.vue'
import CafeWidget from '../components/cafe/CafeWidget.vue'
import UnitToggler from '../components/cafe/UnitToggler.vue'
import AmbientSound from '../components/cafe/AmbientSound.vue'

const props = defineProps({
  cityId: { type: String, required: true },
})

const city = computed(() => getCityById(props.cityId))
const weather = useWeatherStore()
const radio = useRadioStore()
const config = useConfigStore()

// 날씨/카페 배경음 음소거 여부 (다음 방문에도 유지되도록 저장)
const soundMuted = ref(localStorage.getItem('travel-cafe:sound-muted') === 'true')
watch(soundMuted, (v) => localStorage.setItem('travel-cafe:sound-muted', String(v)))

// 창틀+테이블 오버레이 표시 여부 (끄면 배경 랜드마크만 화면 가득 보임)
const frameVisible = ref(localStorage.getItem('travel-cafe:frame-visible') !== 'false')
watch(frameVisible, (v) => localStorage.setItem('travel-cafe:frame-visible', String(v)))

function loadCityData() {
  if (!city.value) return
  weather.fetchWeather(city.value)
  radio.loadStationForCity(city.value)
}

onMounted(loadCityData)
watch(() => props.cityId, loadCityData)
</script>

<template>
  <main v-if="city" class="cafe">
    <SceneBackground :city="city" :is-night="weather.isNight" />
    <WeatherOverlay :condition="weather.condition" :is-night="weather.isNight" />
    <AmbientSound :condition="weather.condition" :is-night="weather.isNight" :muted="soundMuted" />
    <FrameForeground :city="city" :visible="frameVisible">
      <TravelClock :city="city" />
    </FrameForeground>

    <div class="cafe__hud">
      <span v-if="weather.tempC !== null">
        🌤 {{ config.displayTemp(weather.tempC) }}{{ config.unitSymbol }} · {{ weather.description }}
      </span>
      <span v-else-if="weather.loading">날씨 불러오는 중…</span>
      <span v-else-if="weather.error" class="cafe__hud--error">⚠️ 날씨를 불러오지 못했습니다</span>
    </div>

    <div class="cafe__top-right">
      <button class="cafe__sound-toggle" @click="frameVisible = !frameVisible" :aria-label="frameVisible ? '창틀 숨기기' : '창틀 보이기'">
        {{ frameVisible ? '🪟' : '🏞️' }}
      </button>
      <button class="cafe__sound-toggle" @click="soundMuted = !soundMuted" :aria-label="soundMuted ? '배경음 켜기' : '배경음 끄기'">
        {{ soundMuted ? '🔇' : '🔊' }}
      </button>
      <UnitToggler />
    </div>

    <!-- 포모도로 + 라디오: 화면 전체에 어울리는 플로팅 위젯 -->
    <CafeWidget :city="city" />
  </main>
</template>

<style scoped>
.cafe {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.cafe__hud {
  position: absolute;
  top: 20px;
  left: 24px;
  z-index: 6;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-cream);
  background: rgba(13, 15, 22, 0.5);
  padding: 6px 12px;
  border-radius: 999px;
  backdrop-filter: blur(4px);
}

.cafe__hud--error {
  color: #ff6b5e;
}

.cafe__top-right {
  position: absolute;
  top: 20px;
  right: 24px;
  z-index: 6;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cafe__sound-toggle {
  background: rgba(13, 15, 22, 0.5);
  border: 1px solid var(--color-line);
  color: var(--color-cream);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 14px;
  backdrop-filter: blur(4px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
