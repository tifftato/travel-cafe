<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { getCityById } from '../data/cities'

const props = defineProps({
  cityId: { type: String, required: true },
})

const router = useRouter()
const city = computed(() => getCityById(props.cityId))

const ticketRef = ref(null)
const stampRef = ref(null)
const progressRef = ref(null)
const stage = ref('printing') // printing -> stamping -> gate(자동 카운트다운) -> (카페로 이동)

// 실제 사운드 파일을 준비하면 public/sounds/ 밑에 넣고 경로만 바꾸면 됩니다.
function playSfx(path) {
  try {
    const audio = new Audio(path)
    audio.volume = 0.5
    audio.play().catch(() => {})
  } catch {
    /* 사운드 파일이 아직 없어도 애니메이션은 그대로 진행됩니다 */
  }
}

function enterCafe() {
  playSfx('/sounds/jet-takeoff.mp3')
  router.push({ name: 'cafe', params: { cityId: city.value.id } })
}

onMounted(() => {
  const tl = gsap.timeline()

  // 1) 발권: 티켓이 프린터에서 뽑혀 나오듯 아래에서 위로 슬라이드 + 페이드인
  tl.fromTo(
    ticketRef.value,
    { y: 60, opacity: 0, scale: 0.96 },
    { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' },
    0
  )
  tl.call(() => playSfx('/sounds/airport-chime.mp3'), null, 0.1)

  // 2) 탑승 확인 스탬프
  tl.call(() => {
    stage.value = 'stamping'
    playSfx('/sounds/stamp-thud.mp3')
  }, null, 1.1)
  tl.fromTo(
    stampRef.value,
    { scale: 2.4, opacity: 0, rotate: -18 },
    { scale: 1, opacity: 1, rotate: -12, duration: 0.35, ease: 'power4.in' },
    1.1
  )

  // 3) 도장이 찍힌 직후(스탬프 애니메이션 완료 시점)부터 2초 카운트다운 → 자동으로 카페 입장
  tl.call(() => {
    stage.value = 'gate'
  }, null, 1.45)
  tl.fromTo(
    progressRef.value,
    { scaleX: 0 },
    {
      scaleX: 1,
      duration: 2,
      ease: 'linear',
      transformOrigin: 'left center',
      onComplete: enterCafe,
    },
    1.45
  )
})
</script>

<template>
  <main v-if="city" class="boarding">
    <div ref="ticketRef" class="ticket">
      <div class="ticket__main">
        <div class="ticket__row ticket__row--brand">
          <span class="ticket__airline">TRAVEL CAFÉ AIRWAYS</span>
          <span class="ticket__class">ECONOMY · WORK CLASS</span>
        </div>

        <div class="ticket__route">
          <div class="ticket__place">
            <span class="ticket__code">HOME</span>
            <span class="ticket__city">내 자리</span>
          </div>
          <div class="ticket__path">
            <span class="ticket__plane">✈</span>
            <span class="ticket__dashes"></span>
          </div>
          <div class="ticket__place">
            <span class="ticket__code">{{ city.airportCode }}</span>
            <span class="ticket__city">{{ city.name }}</span>
          </div>
        </div>

        <div class="ticket__details">
          <div>
            <span class="ticket__label">LANDMARK</span>
            <span class="ticket__value">{{ city.landmark }}</span>
          </div>
          <div>
            <span class="ticket__label">SEAT</span>
            <span class="ticket__value">7A · WINDOW</span>
          </div>
          <div>
            <span class="ticket__label">GATE</span>
            <span class="ticket__value">A1</span>
          </div>
        </div>

        <div ref="stampRef" class="ticket__stamp" v-show="stage !== 'printing'">BOARDED</div>
      </div>

      <div class="ticket__perforation"></div>

      <div class="ticket__stub">
        <div class="ticket__barcode">
          <span v-for="n in 28" :key="n" class="ticket__bar" :style="{ opacity: (n % 3 === 0) ? 0.4 : 1 }"></span>
        </div>
        <span class="ticket__stub-code">{{ city.airportCode }}-{{ city.countryCode }}</span>
      </div>
    </div>

    <div class="boarding__action">
      <transition name="fade" mode="out-in">
        <div v-if="stage === 'gate'" key="gate" class="boarding__progress-wrap">
          <p class="boarding__hint">🛫 게이트 통과 중 · {{ city.name }} 카페로 이동합니다</p>
          <div class="boarding__progress-track">
            <div ref="progressRef" class="boarding__progress-bar"></div>
          </div>
        </div>
        <p v-else key="printing" class="boarding__hint">탑승권을 발권하고 있습니다…</p>
      </transition>
    </div>
  </main>
</template>

<style scoped>
.boarding {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  background: radial-gradient(circle at 50% 20%, #10131c 0%, #05060a 75%);
  padding: 24px;
}

.ticket {
  position: relative;
  display: flex;
  width: min(640px, 92vw);
  background: var(--color-cream);
  color: #1c1a15;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.45);
}

.ticket__main {
  position: relative;
  flex: 1;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ticket__row--brand {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #7a6a4a;
}

.ticket__route {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ticket__place {
  display: flex;
  flex-direction: column;
}

.ticket__code {
  font-family: var(--font-mono);
  font-size: clamp(22px, 5vw, 30px);
  font-weight: 700;
}

.ticket__city {
  font-size: 12px;
  color: #6b5d42;
}

.ticket__path {
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
  color: #b08a3e;
}

.ticket__dashes {
  flex: 1;
  border-top: 2px dashed #cbb98c;
  margin: 0 6px;
}

.ticket__details {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  border-top: 1px dashed #cbb98c;
  padding-top: 14px;
}

.ticket__label {
  display: block;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  color: #9a8a63;
}

.ticket__value {
  display: block;
  font-size: 14px;
  font-weight: 600;
}

.ticket__stamp {
  position: absolute;
  top: 18px;
  right: 20px;
  border: 4px solid #b3312c;
  color: #b3312c;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 20px;
  padding: 6px 14px;
  border-radius: 6px;
  transform: rotate(-12deg);
  letter-spacing: 0.08em;
  mix-blend-mode: multiply;
}

.ticket__perforation {
  width: 0;
  border-left: 2px dashed #cbb98c;
  position: relative;
}
.ticket__perforation::before,
.ticket__perforation::after {
  content: '';
  position: absolute;
  left: -9px;
  width: 18px;
  height: 18px;
  background: #05060a;
  border-radius: 50%;
}
.ticket__perforation::before {
  top: -9px;
}
.ticket__perforation::after {
  bottom: -9px;
}

.ticket__stub {
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 10px;
  background: #ece3cc;
}

.ticket__barcode {
  display: flex;
  gap: 2px;
  height: 60px;
  align-items: stretch;
}
.ticket__bar {
  width: 2px;
  background: #1c1a15;
}

.ticket__stub-code {
  font-family: var(--font-mono);
  font-size: 10px;
  color: #6b5d42;
}

.boarding__action {
  min-height: 52px;
  width: min(360px, 90vw);
  display: flex;
  align-items: center;
  justify-content: center;
}

.boarding__progress-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.boarding__progress-track {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.boarding__progress-bar {
  width: 100%;
  height: 100%;
  background: var(--color-amber);
  border-radius: 999px;
  transform: scaleX(0);
}

.boarding__hint {
  font-family: var(--font-mono);
  color: var(--color-amber-dim);
  letter-spacing: 0.05em;
  font-size: 13px;
  text-align: center;
  margin: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
