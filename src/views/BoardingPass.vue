<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { getCityById } from '../data/cities'
import DotMatrixText from '../components/common/DotMatrixText.vue'

const props = defineProps({
  cityId: { type: String, required: true },
})

const router = useRouter()
const city = computed(() => getCityById(props.cityId))

const ticketRef = ref(null)
const printerRef = ref(null)
const stampRef = ref(null)
const pathRef = ref(null)
const planeRef = ref(null)
const trailRef = ref(null)
const stage = ref('printing') // printing -> stamping -> gate(자동 카운트다운) -> (카페로 이동)

// 프린터 창(LCD)에 띄우는 도트 문구. 단계가 바뀔 때마다 같이 바뀝니다.
const lcdText = computed(() => {
  if (stage.value === 'printing') return 'PRINTING'
  if (stage.value === 'stamping') return 'ISSUED'
  return 'GATE A1'
})

// 포물선 궤적을 그릴 SVG 좌표계(px). 실제 렌더 크기를 재서 쓰기 때문에 화면 폭이 달라져도 비행기가 선 위에 정확히 얹힙니다.
// (viewBox를 고정 비율로 늘려 쓰면 비행기 회전각이 찌그러져서 px 좌표계를 직접 씁니다.)
const arc = ref({ w: 120, h: 44 })
let resizeObserver = null

function measureArc() {
  const el = pathRef.value
  if (!el) return
  // offsetWidth/Height는 transform 영향을 안 받음 → 티켓이 슬라이드 중이어도 값이 안정적
  // 좁은 화면에서 호가 텐트처럼 뾰족해지지 않도록 높이를 폭의 절반까지만 허용
  const w = el.offsetWidth || 120
  arc.value = { w, h: Math.max(24, Math.min(el.offsetHeight || 44, w * 0.5)) }
}

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
  router.push({ name: 'cafe', params: { cityId: city.value.id } })
}

// 출발지(왼쪽 끝, 바닥) → 도착지(오른쪽 끝, 바닥)를 잇는 포물선 위에 비행기를 올립니다.
//   y(t) = h·(1 − 4t(1−t))   (t=0.5에서 꼭대기)
// 비행기 기수 방향은 접선 (dx, dy) = (w, −4h(1−2t))로 구해서 곡선을 따라 자연스럽게 기울어집니다.
const PLANE = 24
function placePlane(t) {
  const { w, h } = arc.value
  const x = w * t
  const y = h * (1 - 4 * t * (1 - t))
  const angle = (Math.atan2(-4 * h * (1 - 2 * t), w) * 180) / Math.PI
  gsap.set(planeRef.value, { x: x - PLANE / 2, y: y - PLANE / 2, rotation: angle })
  // 지나온 자리를 따라 실선이 이어 그려지는 꼬리 (pathLength=1 기준)
  if (trailRef.value) trailRef.value.style.strokeDasharray = `${t} 2`
}

let ctx = null

onMounted(async () => {
  await nextTick()
  measureArc()
  if (pathRef.value && 'ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(measureArc)
    resizeObserver.observe(pathRef.value)
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  ctx = gsap.context(() => {
    const tl = gsap.timeline()

    // 비행기 소리는 전광판에서 도시를 클릭하는 순간 이미 시작됩니다 (AirportBillboard.vue 참고).
    // 순서: 보딩 클릭 → 비행기소리 시작 → 프린터가 탑승권 인쇄 → 도장 쾅 → 카페로 전환

    // 1) 발권: 프린터 슬롯에서 티켓이 "끊어서" 밀려 올라옵니다.
    //    steps()로 한 칸씩 끊어 올려 감열 프린터가 줄 단위로 종이를 보내는 느낌을 냅니다.
    const PRINT_AT = 0.15
    const PRINT_DUR = reduce ? 0.01 : 1.3
    tl.fromTo(
      ticketRef.value,
      { yPercent: 100 },
      { yPercent: 0, duration: PRINT_DUR, ease: reduce ? 'none' : 'steps(13)' },
      PRINT_AT
    )
    if (!reduce) {
      // 인쇄 중 본체가 살짝 떠는 진동 (짝수 번 왕복해서 끝나면 원위치)
      tl.fromTo(
        printerRef.value,
        { y: 0 },
        { y: 1.5, duration: 0.05, repeat: Math.floor(PRINT_DUR / 0.05 / 2) * 2 - 1, yoyo: true, ease: 'none' },
        PRINT_AT
      )
      tl.set(printerRef.value, { y: 0 }, PRINT_AT + PRINT_DUR)
    }

    // 2) 탑승 확인 스탬프
    const STAMP_AT = PRINT_AT + PRINT_DUR + 0.15
    tl.call(() => {
      stage.value = 'stamping'
      playSfx('/sounds/stamp-thud.mp3')
    }, null, STAMP_AT)
    tl.fromTo(
      stampRef.value,
      { scale: 2.4, opacity: 0, rotate: -18 },
      { scale: 1, opacity: 1, rotate: -12, duration: 0.35, ease: 'power4.in' },
      STAMP_AT
    )

    // 3) 도장이 찍힌 직후(스탬프 애니메이션 완료 시점)부터 2초 카운트다운 → 자동으로 카페 입장
    const GATE_AT = STAMP_AT + 0.35
    tl.call(() => {
      stage.value = 'gate'
    }, null, GATE_AT)
    // 진행 막대는 CSS 애니메이션(.boarding__progress-bar)이 채우고, 이동 타이밍만 여기서 잡습니다.
    // (막대는 gate 단계에서야 v-if로 생겨서, 마운트 시점에 gsap 타깃으로 잡으면 ref가 null이라 안 차던 문제가 있었음)
    tl.call(enterCafe, null, GATE_AT + 2)

    // 마이크로 인터랙션: 티켓의 HOME → 도착지 위를 비행기가 포물선으로 날아가고, 끝나면 잠깐 쉬었다가 다시 출발.
    // 티켓 윗부분이 나온 직후(프린트 40% 지점)부터 시작해서 인쇄가 끝나기 전에 이미 날고 있습니다.
    if (reduce) {
      gsap.set(planeRef.value, { opacity: 1 })
      placePlane(0.5) // 모션 감소 설정이면 꼭대기에 멈춰 있는 정지 컷만
    } else {
      const flight = { t: 0 }
      const fly = gsap.timeline({ repeat: -1, repeatDelay: 0.35, delay: PRINT_AT + PRINT_DUR * 0.4 })
      fly
        .set(planeRef.value, { opacity: 0 })
        .set(trailRef.value, { opacity: 1 })
        .call(() => placePlane(0))
        .to(planeRef.value, { opacity: 1, duration: 0.2 })
        .fromTo(
          flight,
          { t: 0 },
          { t: 1, duration: 2.2, ease: 'sine.inOut', onUpdate: () => placePlane(flight.t) },
          0.1
        )
        .to([planeRef.value, trailRef.value], { opacity: 0, duration: 0.3 }, '>-0.25')
    }
  })
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  ctx?.revert() // 무한 반복하는 비행 타임라인이 화면을 떠난 뒤에도 돌지 않게 정리
})
</script>

<template>
  <main v-if="city" class="boarding">
    <h1 class="sr-only">{{ city.name }} 탑승권 발권 중</h1>

    <div class="printer-stack">
      <!-- 티켓은 프린터 윗면 슬롯에서 올라옵니다. 슬롯 아래로는 클립되어 "기계 안에서 나오는" 것처럼 보입니다. -->
      <div class="printer__out">
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
              <div ref="pathRef" class="ticket__path" aria-hidden="true">
                <div class="ticket__arc-box" :style="{ width: arc.w + 'px', height: arc.h + 'px' }">
                  <svg
                    class="ticket__arc"
                    :viewBox="`0 0 ${arc.w} ${arc.h}`"
                    :width="arc.w"
                    :height="arc.h"
                  >
                    <!-- 점선 포물선(기본 항로) + 비행기가 지나온 만큼 채워지는 실선 꼬리 -->
                    <path
                      class="ticket__arc-line"
                      :d="`M0 ${arc.h} Q${arc.w / 2} ${-arc.h} ${arc.w} ${arc.h}`"
                    />
                    <path
                      ref="trailRef"
                      class="ticket__arc-trail"
                      pathLength="1"
                      :d="`M0 ${arc.h} Q${arc.w / 2} ${-arc.h} ${arc.w} ${arc.h}`"
                    />
                  </svg>
                  <!-- 기수가 +x(오른쪽)를 향하는 탑뷰 비행기. 회전은 placePlane()이 접선 방향으로 계산합니다 -->
                  <svg ref="planeRef" class="ticket__plane" viewBox="0 0 24 24" :width="24" :height="24">
                    <g fill="currentColor">
                      <path d="M3 11.2H20C22 11.2 23.5 11.7 23.5 12C23.5 12.3 22 12.8 20 12.8H3Z" />
                      <path d="M10 11.2L6.5 4H9L15.5 11.2Z" />
                      <path d="M10 12.8L6.5 20H9L15.5 12.8Z" />
                      <path d="M3 11.2L1.5 8H3.6L5.5 11.2Z" />
                      <path d="M3 12.8L1.5 16H3.6L5.5 12.8Z" />
                    </g>
                  </svg>
                </div>
              </div>
              <div class="ticket__place ticket__place--dest">
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
      </div>

      <div ref="printerRef" class="printer" aria-hidden="true">
        <div class="printer__slot"></div>
        <div class="printer__panel">
          <div class="printer__id">
            <span class="printer__brand">TC-PRINT 3000</span>
            <span class="printer__leds">
              <i class="led led--green" :class="{ 'led--blink': stage === 'printing', 'led--on': stage !== 'printing' }"></i>
              <i class="led led--amber" :class="{ 'led--on': stage === 'gate' }"></i>
            </span>
          </div>
          <!-- 프린터 정면의 LCD 창: 인쇄 상태와 도착지 공항 코드를 도트로 표시 -->
          <div class="printer__window">
            <DotMatrixText :text="lcdText" :dot="2.4" :min-cols="47" />
            <DotMatrixText :text="city.airportCode" :dot="2.4" color="#7cf29c" />
          </div>
        </div>
      </div>
    </div>

    <div class="boarding__action" role="status" aria-live="polite">
      <transition name="fade" mode="out-in">
        <div v-if="stage === 'gate'" key="gate" class="boarding__progress-wrap">
          <p class="boarding__hint">🛫 게이트 통과 중 · {{ city.name }} 카페로 이동합니다</p>
          <div class="boarding__progress-track">
            <div class="boarding__progress-bar"></div>
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
  gap: 28px;
  background: radial-gradient(circle at 50% 20%, #10131c 0%, #05060a 75%);
  padding: 24px;
}

/* ───────── 프린터 (슬롯 + LCD 창) ───────── */
.printer-stack {
  --ticket-inset: 44px; /* 티켓이 프린터 폭보다 좁게 들어가는 좌우 여백 */
  width: min(720px, 94vw);
  display: flex;
  flex-direction: column;
}

/* 티켓이 슬롯 아래로 내려가면 잘리도록 "아래쪽만" 클립. (위/좌우는 그림자가 안 잘리게 열어둠)
   margin-bottom 음수 = 슬롯 두께의 절반만큼 겹쳐서, 종이가 슬롯 "안으로" 들어가는 듯 보이게 함 */
.printer__out {
  position: relative;
  margin: 0 var(--ticket-inset) -7px;
  clip-path: inset(-120px -60px 0 -60px);
}

.printer {
  position: relative;
  border-radius: 16px;
  background: linear-gradient(180deg, #2b2f3b 0%, #191c25 55%, #12141b 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 28px 50px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.14),
    inset 0 -3px 8px rgba(0, 0, 0, 0.45);
  padding: 26px 22px 18px;
}

.printer__slot {
  position: absolute;
  top: -7px;
  left: calc(var(--ticket-inset) - 14px);
  right: calc(var(--ticket-inset) - 14px);
  height: 14px;
  border-radius: 7px;
  background: #020307;
  box-shadow:
    inset 0 3px 6px #000,
    0 1px 0 rgba(255, 255, 255, 0.16);
  z-index: 2; /* 티켓보다 위 → 종이가 슬롯 입구에 끼어 올라오는 모양 */
}

.printer__panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.printer__id {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.printer__brand {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  color: rgba(244, 236, 216, 0.55);
}

.printer__leds {
  display: flex;
  gap: 8px;
}

.led {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #262a33;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.7);
  transition: background 0.2s ease, box-shadow 0.2s ease;
}
.led--green.led--on,
.led--green.led--blink {
  background: #7cf29c;
  box-shadow: 0 0 8px #7cf29c;
}
.led--amber.led--on {
  background: var(--color-amber);
  box-shadow: 0 0 8px var(--color-amber);
}
.led--blink {
  animation: led-blink 0.35s steps(2) infinite;
}
@keyframes led-blink {
  50% {
    opacity: 0.25;
  }
}

/* LCD 창: 유리 느낌의 어두운 패널 안에 도트 글자 */
.printer__window {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 12px 16px;
  border-radius: 8px;
  background: linear-gradient(180deg, #05070b, #0a0d13);
  border: 3px solid #0b0d12;
  box-shadow:
    inset 0 0 14px rgba(0, 0, 0, 0.9),
    0 0 0 1px rgba(255, 255, 255, 0.07),
    0 1px 0 rgba(255, 255, 255, 0.12);
  min-width: 0;
}

.ticket {
  position: relative;
  display: flex;
  width: 100%;
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
  position: relative;
  flex: 1;
  align-self: stretch;
  min-height: 44px;
  margin: 0 6px;
  color: #b08a3e;
}

.ticket__arc-box {
  position: absolute;
  left: 0;
  bottom: 0; /* 호의 양 끝이 항상 라벨 바닥선에 닿도록 아래 기준으로 붙임 */
}

.ticket__arc {
  position: absolute;
  inset: 0;
  overflow: visible;
}
.ticket__arc-line {
  fill: none;
  stroke: #cbb98c;
  stroke-width: 2;
  stroke-dasharray: 4 5;
}
.ticket__arc-trail {
  fill: none;
  stroke: #b08a3e;
  stroke-width: 2;
  stroke-dasharray: 0 2; /* 비행 중엔 JS가 지나온 길이만큼 갱신 */
}

.ticket__plane {
  position: absolute;
  top: 0;
  left: 0;
  color: #8a5a12;
  transform-origin: 50% 50%;
  will-change: transform;
  filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.6));
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
  transform-origin: left center;
  /* 게이트 문구가 페이드인(0.4s)된 뒤에 막대가 생기므로 2s에서 그만큼 뺀 길이로 채워서 이동 타이밍과 맞춤 */
  animation: gate-fill 1.6s linear forwards;
}
@keyframes gate-fill {
  to {
    transform: scaleX(1);
  }
}

.boarding__hint {
  font-family: var(--font-mono);
  color: var(--color-amber-dim);
  letter-spacing: 0.05em;
  font-size: 13px;
  text-align: center;
  margin: 0;
}

@media (max-width: 520px) {
  .printer-stack {
    --ticket-inset: 14px;
  }
  .printer {
    padding: 24px 14px 14px;
  }
  .printer__panel {
    flex-direction: column;
    align-items: stretch;
  }
  .printer__id {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .printer__window {
    justify-content: space-between;
  }
  .ticket__stub {
    width: 84px;
    padding: 12px 6px;
  }
  .ticket__barcode {
    gap: 1px;
  }
  .ticket__bar {
    width: 1px;
  }
  .ticket__stamp {
    font-size: 15px;
    padding: 4px 10px;
    right: 12px;
  }
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
