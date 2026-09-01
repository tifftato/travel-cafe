<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  condition: { type: String, default: 'clear' }, // clear | clouds | rain | snow | thunderstorm | fog
  isNight: { type: Boolean, default: false },
  city: { type: Object, default: null }, // 있으면 mask_{country}.png로 창문 모양에 날씨를 클리핑
})

// mask_{country}.png = frame_{country}.png의 알파를 반전한 흑백 이미지
// (창문이었던 곳=흰색=날씨가 보임, 소품·벽이었던 곳=검정=날씨가 가려짐)
// frame.png 자체를 화면에 그리지 않고도 날씨를 창문 모양대로만 클리핑할 수 있어서,
// 배경(bg_{country}.jpg, 소품까지 포함된 원본 베이크)이 이중 합성 없이 그대로 보입니다.
//
// isNight는 라우트 이동 없이 실시간으로 바뀔 수 있는 값이라(같은 도시에서 날씨 API가
// 갱신되며 낮→밤 전환), 마스크 URL과 존재 여부를 매번 다시 확인합니다. 마스크 파일이
// 없는 나라(아직 베이크인 이미지가 없는 나라)는 CSS mask를 아예 안 걸어서 날씨가
// 화면 전체에 정상적으로 보이도록 안전하게 처리합니다 (mask-image가 404면 브라우저마다
// 동작이 달라 날씨가 통째로 사라질 수 있어서, 존재를 확인한 뒤에만 적용합니다).
//
// 밤 전용 마스크(mask_{country}-night.png)가 없으면 낮 마스크로 자동 폴백합니다.
const maskExists = ref(false)
const maskUrl = ref(null)
const maskNaturalSize = ref(null) // { w, h } — cover 계산에 필요

function tryLoadMask(url, onSuccess, onFail) {
  const img = new Image()
  img.onload = () => onSuccess({ w: img.naturalWidth, h: img.naturalHeight })
  img.onerror = onFail
  img.src = url
}

watch(
  () => [props.city?.countryEn, props.isNight],
  () => {
    if (!props.city) {
      maskExists.value = false
      return
    }
    const dayUrl = `/assets/mask_${props.city.countryEn}.png`
    const nightUrl = `/assets/mask_${props.city.countryEn}-night.png`

    if (!props.isNight) {
      tryLoadMask(
        dayUrl,
        (size) => { maskUrl.value = dayUrl; maskNaturalSize.value = size; maskExists.value = true },
        () => { maskExists.value = false }
      )
      return
    }

    // 밤: 전용 마스크 먼저 시도, 없으면 낮 마스크로 폴백
    tryLoadMask(
      nightUrl,
      (size) => { maskUrl.value = nightUrl; maskNaturalSize.value = size; maskExists.value = true },
      () => {
        tryLoadMask(
          dayUrl,
          (size) => { maskUrl.value = dayUrl; maskNaturalSize.value = size; maskExists.value = true },
          () => { maskExists.value = false }
        )
      }
    )
  },
  { immediate: true }
)

// CSS mask-size:cover / mask-position:center bottom 키워드에 기대는 대신,
// 핫스팟 좌표 계산(useImageRegion.js)과 완전히 같은 object-fit:cover 공식을 그대로
// JS로 재계산해서 px 단위로 박아 넣습니다 — 배경(SceneBackground, object-fit:cover +
// object-position:center bottom)과 픽셀 단위로 반드시 같은 자리에 맞도록 보장하기 위함입니다.
const viewport = ref({ w: window.innerWidth, h: window.innerHeight })
function updateViewport() {
  viewport.value = { w: window.innerWidth, h: window.innerHeight }
}
onMounted(() => window.addEventListener('resize', updateViewport))
onUnmounted(() => window.removeEventListener('resize', updateViewport))

const maskStyle = computed(() => {
  if (!maskExists.value || !maskUrl.value || !maskNaturalSize.value) return {}

  const { w: naturalW, h: naturalH } = maskNaturalSize.value
  const { w: containerW, h: containerH } = viewport.value
  if (!naturalW || !naturalH || !containerW || !containerH) return {}

  // object-fit: cover; object-position: center bottom; 과 동일한 스케일/오프셋 계산
  const scale = Math.max(containerW / naturalW, containerH / naturalH)
  const displayedW = naturalW * scale
  const displayedH = naturalH * scale
  const offsetX = (containerW - displayedW) / 2
  const offsetY = containerH - displayedH // 바닥 정렬

  const maskImage = `url(${maskUrl.value})`
  const maskSize = `${displayedW}px ${displayedH}px`
  const maskPosition = `${offsetX}px ${offsetY}px`

  return {
    WebkitMaskImage: maskImage,
    maskImage,
    WebkitMaskSize: maskSize,
    maskSize,
    WebkitMaskPosition: maskPosition,
    maskPosition,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
  }
})

const rainDrops = computed(() =>
  Array.from({ length: 60 }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 1.2,
    duration: 0.5 + Math.random() * 0.4,
  }))
)

const snowFlakes = computed(() =>
  Array.from({ length: 40 }, () => ({
    left: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 6 + Math.random() * 5,
    size: 3 + Math.random() * 4,
  }))
)

const clouds = computed(() =>
  Array.from({ length: 4 }, (_, i) => ({
    top: 8 + i * 12 + Math.random() * 6,
    delay: i * -8,
    duration: 40 + Math.random() * 20,
    scale: 0.7 + Math.random() * 0.6,
  }))
)

// 맑은 밤: 반짝이는 별
const stars = computed(() =>
  Array.from({ length: 70 }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 55, // 하늘 영역(위쪽)에만 분포
    delay: Math.random() * 4,
    duration: 2 + Math.random() * 3,
    size: 1 + Math.random() * 1.8,
  }))
)
</script>

<template>
  <div class="weather" :style="maskStyle" aria-hidden="true">
    <!-- 맑은 밤: 별 -->
    <div v-if="condition === 'clear' && isNight" class="weather__stars">
      <span
        v-for="(s, i) in stars"
        :key="i"
        class="weather__star"
        :style="{
          left: s.left + '%',
          top: s.top + '%',
          width: s.size + 'px',
          height: s.size + 'px',
          animationDelay: s.delay + 's',
          animationDuration: s.duration + 's',
        }"
      />
    </div>

    <!-- 비 -->
    <div v-if="condition === 'rain' || condition === 'thunderstorm'" class="weather__rain">
      <span
        v-for="(d, i) in rainDrops"
        :key="i"
        class="weather__drop"
        :style="{ left: d.left + '%', animationDelay: d.delay + 's', animationDuration: d.duration + 's' }"
      />
    </div>

    <!-- 천둥 번쩍임 -->
    <div v-if="condition === 'thunderstorm'" class="weather__flash" />

    <!-- 눈 -->
    <div v-if="condition === 'snow'" class="weather__snow">
      <span
        v-for="(f, i) in snowFlakes"
        :key="i"
        class="weather__flake"
        :style="{
          left: f.left + '%',
          width: f.size + 'px',
          height: f.size + 'px',
          animationDelay: f.delay + 's',
          animationDuration: f.duration + 's',
        }"
      />
    </div>

    <!-- 구름 -->
    <div v-if="condition === 'clouds'" class="weather__clouds">
      <span
        v-for="(c, i) in clouds"
        :key="i"
        class="weather__cloud"
        :style="{
          top: c.top + '%',
          animationDelay: c.delay + 's',
          animationDuration: c.duration + 's',
          transform: `scale(${c.scale})`,
        }"
      />
    </div>

    <!-- 안개 -->
    <div v-if="condition === 'fog'" class="weather__fog" />
  </div>
</template>

<style scoped>
.weather {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

/* 비 */
.weather__drop {
  position: absolute;
  top: -10%;
  width: 1px;
  height: 60px;
  background: linear-gradient(to bottom, transparent, rgba(190, 210, 255, 0.55));
  animation: rain-fall linear infinite;
}
@keyframes rain-fall {
  to {
    transform: translateY(120vh);
  }
}

.weather__flash {
  position: absolute;
  inset: 0;
  background: white;
  opacity: 0;
  animation: flash 6s infinite;
}
@keyframes flash {
  0%, 96%, 100% { opacity: 0; }
  97% { opacity: 0.35; }
  98% { opacity: 0; }
  99% { opacity: 0.2; }
}

/* 눈 */
.weather__flake {
  position: absolute;
  top: -5%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  animation: snow-fall linear infinite;
}
@keyframes snow-fall {
  from {
    transform: translateY(0) translateX(0);
  }
  to {
    transform: translateY(110vh) translateX(20px);
  }
}

/* 구름 */
.weather__cloud {
  position: absolute;
  left: -20%;
  width: 160px;
  height: 50px;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 999px;
  filter: blur(4px);
  animation: cloud-drift linear infinite;
}
@keyframes cloud-drift {
  from { transform: translateX(0); }
  to { transform: translateX(140vw); }
}

/* 안개 */
.weather__fog {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(220, 220, 220, 0.05), rgba(220, 220, 220, 0.35) 70%);
  backdrop-filter: blur(1.5px);
}

/* 맑은 밤: 별 */
.weather__star {
  position: absolute;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 4px 1px rgba(255, 255, 255, 0.7);
  animation: star-twinkle ease-in-out infinite;
}
@keyframes star-twinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
</style>
