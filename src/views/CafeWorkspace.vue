<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
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

const router = useRouter()
const city = computed(() => getCityById(props.cityId))
const weather = useWeatherStore()
const radio = useRadioStore()
const config = useConfigStore()

function goToBillboard() {
  router.push({ name: 'billboard' })
}

// 날씨/카페 배경음 음소거 여부 (다음 방문에도 유지되도록 저장)
const soundMuted = ref(localStorage.getItem('travel-cafe:sound-muted') === 'true')
watch(soundMuted, (v) => localStorage.setItem('travel-cafe:sound-muted', String(v)))

// 창틀+테이블 오버레이 표시 여부 (끄면 배경 랜드마크만 화면 가득 보임)
// 베이크인 국가(hotspots 있는 나라)는 frame.png를 애초에 화면에 안 그리므로
// "창틀 숨기기"가 아무 의미가 없어서 이 기능/버튼 자체를 제공하지 않습니다.
const frameVisible = ref(localStorage.getItem('travel-cafe:frame-visible') !== 'false')
watch(frameVisible, (v) => localStorage.setItem('travel-cafe:frame-visible', String(v)))

const isBakedIn = computed(() => Boolean(city.value?.hotspots))
const hasCoffeeEffect = computed(() => Boolean(city.value?.hotspots?.coffee?.region))

function loadCityData() {
  if (!city.value) return
  weather.fetchWeather(city.value)
  radio.loadStationForCity(city.value)
}

onMounted(loadCityData)
watch(() => props.cityId, loadCityData)

// FrameForeground가 그림 속에 직접 그려낸 패널(타이머/라디오)은 플로팅 위젯에서 뺍니다.
// hotspots가 부분적으로만 채워진 나라(예: 타이머만 완성)도 자연스럽게 처리됩니다.
const hasTimerHotspot = computed(() => Boolean(city.value?.hotspots?.timer))
const hasRadioHotspot = computed(() => {
  const r = city.value?.hotspots?.radio
  return Boolean(r?.display || r?.power || r?.volume || r?.x != null)
})
const needsFloatingWidget = computed(() => !hasTimerHotspot.value || !hasRadioHotspot.value)
</script>

<template>
  <main v-if="city" class="cafe">
    <h1 class="sr-only">{{ city.name }} 카페 워크스페이스</h1>
    <SceneBackground :city="city" :is-night="weather.isNight" />
    <WeatherOverlay :condition="weather.condition" :is-night="weather.isNight" :city="city" />
    <AmbientSound :condition="weather.condition" :is-night="weather.isNight" :muted="soundMuted" />
    <FrameForeground :city="city" :visible="isBakedIn ? true : frameVisible" :is-night="weather.isNight">
      <TravelClock :city="city" />
    </FrameForeground>

    <div class="cafe__hud" role="status" aria-live="polite">
      <span v-if="weather.tempC !== null">
        🌤 {{ config.displayTemp(weather.tempC) }}{{ config.unitSymbol }} · {{ weather.description }}
      </span>
      <span v-else-if="city.timezone === 'relative'">⏳ 시간은 상대적이니까요</span>
      <span v-else-if="weather.loading">날씨 불러오는 중…</span>
      <span v-else-if="weather.error" class="cafe__hud--error">⚠️ 날씨를 불러오지 못했습니다</span>
    </div>

    <div class="cafe__top-right">
      <button v-if="!isBakedIn" class="cafe__sound-toggle" @click="frameVisible = !frameVisible" :aria-label="frameVisible ? '창틀 숨기기' : '창틀 보이기'">
        {{ frameVisible ? '🪟' : '🏞️' }}
      </button>
      <button
        v-if="hasCoffeeEffect"
        class="cafe__sound-toggle"
        @click="config.toggleCoffeeEffect()"
        :aria-label="config.coffeeEffectEnabled ? '커피 김/물방울 효과 끄기' : '커피 김/물방울 효과 켜기'"
      >
        {{ config.coffeeEffectEnabled ? '☕' : '🚫' }}
      </button>
      <button class="cafe__sound-toggle" @click="soundMuted = !soundMuted" :aria-label="soundMuted ? '배경음 켜기' : '배경음 끄기'">
        {{ soundMuted ? '🔇' : '🔊' }}
      </button>
      <UnitToggler />
    </div>

    <button class="cafe__bottom-left" @click="goToBillboard">✈ 다른 도시로</button>

    <!-- 그림 속에 타이머/라디오가 이미 그려진 만큼은 FrameForeground가 직접 표시하고,
         아직 커버되지 않은 나머지만 우하단 플로팅 위젯으로 보완합니다 -->
    <CafeWidget
      v-if="needsFloatingWidget"
      :city="city"
      :show-timer="!hasTimerHotspot"
      :show-radio="!hasRadioHotspot"
    />
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

/* "다른 도시로": 화면 좌측 하단 고정. 중앙 최하단의 시계(TravelClock)와는
   완전히 분리된 별도 요소라, 시계 쪽 크기/레이아웃에 영향을 주지 않습니다. */
.cafe__bottom-left {
  position: absolute;
  bottom: 20px;
  left: 24px;
  z-index: 6;
  background: rgba(13, 15, 22, 0.5);
  color: #ffffff;
  border: 1.5px solid rgba(255, 255, 255, 0.85);
  padding: 7px 15px;
  border-radius: 999px;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  transition: background 0.15s ease, border-color 0.15s ease;
}

.cafe__bottom-left:hover,
.cafe__bottom-left:focus-visible {
  background: rgba(255, 255, 255, 0.15);
  border-color: #ffffff;
}
</style>
