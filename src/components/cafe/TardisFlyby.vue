<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { tardisPaths } from '../../data/tardisPaths'

const router = useRouter()
const tardisEl = ref(null)
const visible = ref(false)

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

let scheduleTimer = null
let currentAnimation = null

// 대략 1시간에 한 번, 앞뒤로 살짝 흔들리게(45~75분) 다음 비행을 예약합니다.
// 처음 접속했을 때 1시간을 꼬박 기다리게 하지 않으려고, 첫 비행만 1~3분 사이로 당겨서
// 이스터에그를 좀 더 쉽게 발견할 수 있게 했습니다.
function scheduleNext(isFirst = false) {
  if (prefersReducedMotion) return // 모션 최소화 환경에서는 날아다니는 연출 자체를 하지 않음
  clearTimeout(scheduleTimer)
  const delayMs = isFirst
    ? (60 + Math.random() * 120) * 1000 // 1~3분
    : (45 + Math.random() * 30) * 60 * 1000 // 45~75분
  scheduleTimer = setTimeout(flyOnce, delayMs)
}

function flyOnce() {
  const el = tardisEl.value
  if (!el) return

  const path = tardisPaths[Math.floor(Math.random() * tardisPaths.length)]
  const vw = window.innerWidth
  const vh = window.innerHeight

  const keyframes = path.points.map(([xVw, yVh], i) => ({
    transform: `translate(${(xVw / 100) * vw}px, ${(yVh / 100) * vh}px) rotateY(${
      i * 140 * path.spin
    }deg) rotateZ(${Math.sin(i) * 8}deg)`,
    offset: i / (path.points.length - 1),
  }))

  visible.value = true
  currentAnimation = el.animate(keyframes, {
    duration: path.duration * 1000,
    easing: 'ease-in-out',
    fill: 'forwards',
  })
  currentAnimation.onfinish = () => {
    visible.value = false
    scheduleNext()
  }
}

function handleClick() {
  currentAnimation?.pause()
  visible.value = false
  router.push({ name: 'boarding', params: { cityId: 'gallifrey' } })
}

function handleKeydown(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    handleClick()
  }
}

onMounted(() => scheduleNext(true))
onUnmounted(() => {
  clearTimeout(scheduleTimer)
  currentAnimation?.cancel()
})
</script>

<template>
  <div
    v-show="visible"
    ref="tardisEl"
    class="tardis"
    role="button"
    tabindex="0"
    aria-label="타디스가 하늘을 날고 있습니다 — 클릭하면 갈리프레이로 순간이동합니다"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <div class="tardis__box">
      <div class="tardis__face tardis__face--front">
        <span class="tardis__lamp"></span>
        <div class="tardis__panel"></div>
        <div class="tardis__panel"></div>
      </div>
      <div class="tardis__face tardis__face--back">
        <div class="tardis__panel"></div>
        <div class="tardis__panel"></div>
      </div>
      <div class="tardis__face tardis__face--left"></div>
      <div class="tardis__face tardis__face--right"></div>
      <div class="tardis__face tardis__face--top"></div>
    </div>
  </div>
</template>

<style scoped>
.tardis {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 40;
  width: 46px;
  height: 70px;
  margin: -35px 0 0 -23px; /* 좌표가 박스 중심을 가리키도록 보정 */
  cursor: pointer;
  perspective: 300px;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.5));
}

.tardis:focus-visible .tardis__box {
  outline: 2px solid var(--color-amber);
  outline-offset: 4px;
}

.tardis__box {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.tardis__face {
  position: absolute;
  background: #0b3d6e;
  border: 1px solid #062544;
}

.tardis__face--front {
  width: 46px;
  height: 70px;
  transform: translateZ(12px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 6px;
  gap: 3px;
}
.tardis__face--back {
  width: 46px;
  height: 70px;
  transform: translateZ(-12px) rotateY(180deg);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 6px;
  gap: 3px;
}
.tardis__face--left {
  width: 24px;
  height: 70px;
  transform: rotateY(-90deg) translateZ(12px);
  left: 11px;
}
.tardis__face--right {
  width: 24px;
  height: 70px;
  transform: rotateY(90deg) translateZ(12px);
  left: 11px;
}
.tardis__face--top {
  width: 46px;
  height: 24px;
  background: #082c52;
  transform: rotateX(90deg) translateZ(12px);
  top: 0;
}

.tardis__lamp {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff6cc, #ffd23f 60%, transparent);
  box-shadow: 0 0 6px 2px rgba(255, 210, 63, 0.8);
  margin-bottom: 2px;
}

.tardis__panel {
  width: 30px;
  height: 20px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
}
</style>
