<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  city: { type: Object, required: true }, // 여행지(도착지)
})

const router = useRouter()

// 1초마다 갱신되는 현재 시각
const now = ref(new Date())
let timerId = null
onMounted(() => {
  timerId = setInterval(() => {
    now.value = new Date()
  }, 1000)
})
onUnmounted(() => clearInterval(timerId))

// 사용자 위치(브라우저 로컬 타임존) 시간
const localTime = computed(() =>
  now.value.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
)

// 여행지(도착지) 타임존 시간
// 갈리프레이처럼 실제 타임존이 없는 곳은 city.timezone === 'relative'로 표시해두고,
// "타임로드에게 시간은 상대적"이라는 설정으로 사용자의 현지 시간을 그대로 보여줍니다.
const destTime = computed(() => {
  if (props.city.timezone === 'relative') return localTime.value
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: props.city.timezone,
    }).format(now.value)
  } catch {
    return '--:--'
  }
})

// 출발지: 위치 기반 추정 없이 고정 라벨로 표시
const originCode = computed(() => 'HOME')
const destCode = computed(() => props.city.airportCode)

function goToBillboard() {
  router.push({ name: 'billboard' })
}
</script>

<template>
  <div class="clock">
    <div class="clock__times" role="group" :aria-label="`현재 위치 시간 ${localTime}, ${city.name} 시간 ${destTime}`">
      <span class="clock__time" aria-hidden="true">{{ localTime }}</span>
      <span class="clock__sep" aria-hidden="true">|</span>
      <span class="clock__time" aria-hidden="true">{{ destTime }}</span>
    </div>
    <div class="clock__route" aria-hidden="true">{{ originCode }} → {{ destCode }}</div>
    <button class="clock__btn" @click="goToBillboard">✈ 다른 도시로</button>
  </div>
</template>

<style scoped>
.clock {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  /* 배경/테두리/블러 없이 완전히 투명 — 대비는 텍스트 자체의 그림자로 확보 */
  background: transparent;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
}

.clock__times {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-family: var(--font-mono);
  font-weight: 800;
  font-size: clamp(24px, 4.4vw, 38px);
  color: #ffffff;
  line-height: 1;
  /* 밝은 배경/어두운 배경 모두에서 읽히도록 다중 레이어 그림자로 고대비 처리 */
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.95),
    0 2px 10px rgba(0, 0, 0, 0.85),
    0 0 24px rgba(0, 0, 0, 0.6);
}

.clock__sep {
  color: var(--color-amber);
  font-weight: 400;
  opacity: 0.85;
}

.clock__route {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #ffffff;
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.95),
    0 2px 8px rgba(0, 0, 0, 0.8);
}

.clock__btn {
  margin-top: 6px;
  background: transparent;
  color: #ffffff;
  border: 1.5px solid rgba(255, 255, 255, 0.85);
  padding: 7px 15px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  transition: background 0.15s ease, border-color 0.15s ease;
}

.clock__btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #ffffff;
}

@media (max-width: 480px) {
  .clock {
    gap: 4px;
  }
}
</style>
