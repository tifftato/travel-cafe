<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  condition: { type: String, default: 'clear' },
  isNight: { type: Boolean, default: false },
  muted: { type: Boolean, default: false },
})

// condition(+낮/밤) → 재생할 파일 경로. 파일이 없는 조건은 null로 두면
// (예: 낮에 맑음) 별도 날씨음 없이 cafe-murmur 기본음만 흐릅니다.
function soundKeyFor(condition, isNight) {
  if (condition === 'clear') return isNight ? 'clear-night-loop' : null
  if (condition === 'clouds') return 'clouds-loop'
  if (condition === 'rain') return 'rain-loop'
  if (condition === 'thunderstorm') return 'thunderstorm-loop'
  if (condition === 'snow') return 'snow-loop'
  if (condition === 'fog') return 'fog-loop'
  return null
}

const AMBIENT_VOLUME = 0.35
const CAFE_VOLUME = 0.18
const FADE_MS = 1200

let cafeAudio = null
let weatherAudio = null
let thunderTimer = null
let fadeRaf = null

function fadeTo(audioEl, targetVolume, duration = FADE_MS) {
  if (!audioEl) return
  cancelAnimationFrame(fadeRaf)
  const start = audioEl.volume
  const startTime = performance.now()
  function step(now) {
    const t = Math.min(1, (now - startTime) / duration)
    audioEl.volume = start + (targetVolume - start) * t
    if (t < 1) fadeRaf = requestAnimationFrame(step)
    else if (targetVolume === 0) audioEl.pause()
  }
  if (targetVolume > 0 && audioEl.paused) {
    audioEl.volume = 0
    audioEl.play().catch(() => {})
  }
  fadeRaf = requestAnimationFrame(step)
}

function tryLoad(path) {
  try {
    const el = new Audio(path)
    el.loop = true
    el.volume = 0
    return el
  } catch {
    return null
  }
}

function playThunderOnce() {
  try {
    const hit = new Audio('/sounds/weather/thunder-hit.mp3')
    hit.volume = 0.6
    hit.play().catch(() => {})
  } catch {
    /* 파일 없으면 조용히 무시 */
  }
}

function applyCondition() {
  const key = soundKeyFor(props.condition, props.isNight)

  // 기존 날씨음 페이드아웃 후 정리
  if (weatherAudio) {
    fadeTo(weatherAudio, 0)
    const old = weatherAudio
    setTimeout(() => old.pause(), FADE_MS + 100)
    weatherAudio = null
  }

  clearInterval(thunderTimer)

  if (key) {
    const el = tryLoad(`/sounds/weather/${key}.mp3`)
    if (el) {
      weatherAudio = el
      if (!props.muted) fadeTo(el, AMBIENT_VOLUME)
    }
  }

  if (props.condition === 'thunderstorm') {
    // CSS 번쩍임 애니메이션(6초 주기, 97% 지점)과 대략 맞춰 천둥음 트리거
    thunderTimer = setInterval(() => {
      if (!props.muted) playThunderOnce()
    }, 6000)
  }
}

watch(() => [props.condition, props.isNight], applyCondition)

watch(
  () => props.muted,
  (muted) => {
    if (cafeAudio) fadeTo(cafeAudio, muted ? 0 : CAFE_VOLUME)
    if (weatherAudio) fadeTo(weatherAudio, muted ? 0 : AMBIENT_VOLUME)
  }
)

onMounted(() => {
  cafeAudio = tryLoad('/sounds/cafe-murmur-loop.mp3')
  if (cafeAudio && !props.muted) fadeTo(cafeAudio, CAFE_VOLUME)
  applyCondition()
})

onUnmounted(() => {
  cancelAnimationFrame(fadeRaf)
  clearInterval(thunderTimer)
  cafeAudio?.pause()
  weatherAudio?.pause()
})
</script>

<template>
  <!-- 화면에 아무것도 그리지 않는 오디오 전용 컴포넌트 -->
  <div class="ambient-sound" aria-hidden="true"></div>
</template>

<style scoped>
.ambient-sound {
  display: none;
}
</style>
