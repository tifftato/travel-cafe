<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useJourneyStore } from '../stores/journey'
import DotMatrixText from '../components/common/DotMatrixText.vue'
import { formatDayDiff, getCityTime } from '../utils/worldTime'

const router = useRouter()
const journey = useJourneyStore()

const query = ref('')

const displayedCities = computed(() => {
  if (query.value.trim()) return journey.searchResults
  return journey.allCities
})

function onSearchInput() {
  journey.searchCities(query.value)
}

function goToBoarding(cityId) {
  // 순서: 보딩 클릭 → 비행기소리 시작 → 도장 쾅(BoardingPass.vue) → 카페로 전환
  try {
    const audio = new Audio('/sounds/jet-takeoff.mp3')
    audio.volume = 0.5
    audio.play().catch(() => {})
  } catch {
    /* 사운드 파일이 아직 없어도 화면 전환은 그대로 진행됩니다 */
  }
  router.push({ name: 'boarding', params: { cityId } })
}

// "어디로든" — 검색/목록 스크롤 없이 결정 피로 없이 바로 몰입 모드로.
// 검색어가 입력돼 있으면 그 검색 결과 안에서, 아니면 전체 도시 중에서 무작위로 고릅니다.
function goToRandom() {
  const pool = displayedCities.value.length ? displayedCities.value : journey.allCities
  if (!pool.length) return
  const city = pool[Math.floor(Math.random() * pool.length)]
  goToBoarding(city.id)
}

// STATUS는 전광판에 "새로 진입할 때"만 무작위로 정해지고, 보고 있는 동안은 고정됩니다.
// (도시를 선택해 나갔다가 다시 돌아오면 컴포넌트가 새로 마운트되면서 다시 뽑힙니다)
const STATUS_CYCLE = ['ON TIME', 'BOARDING', 'FINAL CALL', 'NOW BOARDING']
const statusMap = ref({})

// 도트 전광판의 현지 시각 — 1초마다 갱신(콜론 깜빡임용). 분이 바뀌는 순간을 놓치지 않으려고 1초 단위로 돕니다.
const now = ref(new Date())
let tickId = null

// 좁은 화면에선 점을 작게 그려야 "RIO DE JANEIRO" 같은 긴 이름이 줄 안에 들어옵니다.
const narrowMq = typeof window !== 'undefined' ? window.matchMedia('(max-width: 640px)') : null
const isNarrow = ref(narrowMq ? narrowMq.matches : false)
function onNarrowChange(e) {
  isNarrow.value = e.matches
}
const dot = computed(() => (isNarrow.value ? 1.6 : 3))
// STATUS는 가장 긴 문구(NOW BOARDING, 71열)가 칸에 들어가도록 한 단계 작은 점으로 그립니다.
const statusDot = computed(() => (isNarrow.value ? 1.2 : 2))

// 상태별 LED 색: 공항 전광판 관례 (탑승중=초록, 마감임박=빨강, 탑승준비=앰버, 정상=중립)
function statusColor(status) {
  if (status === 'NOW BOARDING') return '#7cf29c'
  if (status === 'FINAL CALL') return '#ff6b5e'
  if (status === 'BOARDING') return '#ffb347'
  return '#c9bfa6'
}

onMounted(() => {
  const map = {}
  journey.allCities.forEach((city) => {
    map[city.id] = STATUS_CYCLE[Math.floor(Math.random() * STATUS_CYCLE.length)]
  })
  statusMap.value = map

  tickId = setInterval(() => {
    now.value = new Date()
  }, 1000)
  narrowMq?.addEventListener('change', onNarrowChange)
})

onUnmounted(() => {
  clearInterval(tickId)
  narrowMq?.removeEventListener('change', onNarrowChange)
})

// 도트 글자는 영문/숫자만 그릴 수 있어서 시각은 "14:05", 도시명은 영문 대문자로 보여줍니다.
function timeInfo(city) {
  const t = getCityTime(city, now.value)
  const colon = now.value.getSeconds() % 2 === 0 ? ':' : ';'
  return {
    text: `${t.hh}${colon}${t.mm}`,
    plain: `${t.hh}:${t.mm}`,
    diff: formatDayDiff(t.dayDiff),
    relative: t.relative,
  }
}

function flightCode(idx) {
  return `TC${String(100 + idx)}`
}

function statusFor(city) {
  return statusMap.value[city.id] || 'ON TIME'
}

function statusClass(status) {
  if (status === 'NOW BOARDING') return 'status--boarding'
  if (status === 'FINAL CALL') return 'status--final'
  if (status === 'BOARDING') return 'status--soon'
  return 'status--ontime'
}
</script>

<template>
  <main class="billboard">
    <h1 class="sr-only">Travel Café 출발 전광판 — 여행할 도시를 선택하세요</h1>
    <header class="billboard__header">
      <div class="billboard__brand" aria-hidden="true">
        <DotMatrixText text="TRAVEL CAFÉ ✈" :dot="isNarrow ? 1.6 : 2.6" color="#c98a3a" />
        <DotMatrixText text="DEPARTURES" :dot="isNarrow ? 2.4 : 4" />
      </div>
      <label for="city-search" class="sr-only">도시 검색</label>
      <input
        id="city-search"
        v-model="query"
        class="billboard__search"
        type="text"
        placeholder="도시 검색 (예: 파리, Tokyo, 이탈리아)"
        @input="onSearchInput"
      />
      <button
        class="billboard__random"
        type="button"
        @click="goToRandom"
        :aria-label="query ? '검색 결과 중 무작위로 한 곳 선택' : '오늘은 어디로 갈까요? 무작위로 한 곳 선택'"
      >
        🎲 어디로든
      </button>
    </header>

    <div class="billboard__columns" aria-hidden="true">
      <div class="col col--flight">FLIGHT</div>
      <div class="col col--city">DESTINATION</div>
      <div class="col col--time">LOCAL TIME</div>
      <div class="col col--status">STATUS</div>
    </div>

    <ul class="billboard__list">
      <li
        v-for="(city, idx) in displayedCities"
        :key="city.id"
        class="billboard__row--flap"
        :style="{ '--flap-delay': `${idx * 45}ms` }"
      >
        <button
          class="billboard__row"
          :aria-label="`${city.name}, 항공편 ${flightCode(idx)}, 현지 시각 ${timeInfo(city).plain}, 상태 ${statusFor(city)}. 클릭하면 탑승 절차가 시작됩니다.`"
          @click="goToBoarding(city.id)"
        >
          <span class="col col--flight" aria-hidden="true">
            <DotMatrixText :text="flightCode(idx)" :dot="dot" />
          </span>
          <span class="col col--city" aria-hidden="true">
            <DotMatrixText :text="city.nameEn" :dot="dot" />
            <span class="billboard__city-ko">{{ city.name }}</span>
          </span>
          <span class="col col--time" aria-hidden="true">
            <DotMatrixText :text="timeInfo(city).text" :dot="dot" />
            <span class="billboard__time-note">{{ timeInfo(city).relative ? 'RELATIVE' : timeInfo(city).diff }}</span>
          </span>
          <span class="col col--status" :class="statusClass(statusFor(city))" aria-hidden="true">
            <DotMatrixText :text="statusFor(city)" :dot="statusDot" :color="statusColor(statusFor(city))" :min-cols="71" />
          </span>
        </button>
      </li>
    </ul>

    <p v-if="query && !displayedCities.length" class="billboard__empty" role="status" aria-live="polite">
      "{{ query }}" 에 해당하는 도시를 찾을 수 없습니다.
    </p>
  </main>
</template>

<style scoped>
.billboard {
  /* FLIGHT | DESTINATION | LOCAL TIME | STATUS — 도트 글자 폭(점 4px × 열 수)에 맞춰 잡은 폭 */
  --board-cols: 150px minmax(0, 1fr) 170px 230px;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 0%, #0f1420 0%, #05060a 70%);
  padding: clamp(16px, 4vw, 48px);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.billboard__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.billboard__brand {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 18px;
}

.billboard__search {
  background: var(--color-panel);
  border: 1px solid var(--color-line);
  color: var(--color-cream);
  padding: 10px 16px;
  border-radius: 4px;
  font-family: var(--font-mono);
  min-width: 260px;
}

.billboard__random {
  background: transparent;
  border: 1px solid var(--color-amber-dim);
  color: var(--color-amber);
  padding: 10px 16px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.billboard__random:hover,
.billboard__random:focus-visible {
  background: rgba(255, 179, 71, 0.12);
  border-color: var(--color-amber);
}

.billboard__columns {
  display: grid;
  grid-template-columns: var(--board-cols);
  font-family: var(--font-mono);
  color: var(--color-amber-dim);
  font-size: 12px;
  letter-spacing: 0.1em;
  padding: 8px 20px;
  border-bottom: 1px solid var(--color-line);
}

.billboard__list {
  list-style: none;
  margin: 0;
  padding: 0;
  perspective: 800px;
}

.billboard__row {
  display: grid;
  grid-template-columns: var(--board-cols);
  align-items: center;
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-bottom: 1px solid var(--color-line);
  border-radius: 0;
  background: transparent;
  font-family: var(--font-mono);
  font-size: inherit;
  text-align: left;
  color: var(--color-cream);
  cursor: pointer;
  transition: background 0.15s ease;
}

.billboard__row:hover,
.billboard__row:focus-visible {
  background: rgba(255, 179, 71, 0.08);
}

/* 도시/시각은 아래에 부제(한글명, +1D)가 붙어 키가 더 커서, 편명도 같은 윗선에 맞추고 나머지 텍스트만 가운데 정렬 */
.billboard__row .col--flight,
.billboard__row .col--city,
.billboard__row .col--time {
  align-self: start;
}
.billboard__row .col--status {
  align-self: center;
}

/* 초기 진입 시 위에서부터 순서대로 "팔락" 접히며 나타나는 플립보드 효과.
   실제 값이 계속 바뀌는 게 아니라, 페이지에 처음 들어올 때 한 번만 재생됩니다. */
.billboard__row--flap {
  transform-origin: top center;
  animation: flap-in 0.5s cubic-bezier(0.2, 0.9, 0.3, 1) both;
  animation-delay: var(--flap-delay, 0ms);
}

@keyframes flap-in {
  0% {
    opacity: 0;
    transform: rotateX(-90deg) scaleY(0.6);
  }
  60% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    transform: rotateX(0deg) scaleY(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .billboard__row--flap {
    animation: none;
  }
}

.billboard__city-ko {
  display: block;
  margin-top: 6px;
  color: var(--color-amber-dim);
  font-size: 12px;
}

.billboard__time-note {
  display: block;
  margin-top: 6px;
  min-height: 1em; /* 날짜 차이가 없는 행도 높이가 같도록 */
  color: var(--color-amber-dim);
  font-size: 11px;
  letter-spacing: 0.06em;
}

/* 색은 도트 글자(statusColor)가 정하고, 여기서는 상태별 효과만: 마감임박은 깜빡임, 정상은 살짝 어둡게 */
.status--ontime {
  opacity: 0.7;
}
.status--final {
  animation: status-blink 1.2s ease-in-out infinite;
}
@keyframes status-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.billboard__empty {
  margin-top: 40px;
  text-align: center;
  color: var(--color-amber-dim);
  font-family: var(--font-mono);
}

/* 좁은 화면: 한 줄에 다 못 담으니 2줄 카드로. (1줄: 도시 + 현지시각 / 2줄: 편명 + 상태) */
@media (max-width: 640px) {
  .billboard__columns {
    display: none;
  }
  .billboard__row {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      'city time'
      'flight status';
    gap: 10px 12px;
    padding: 14px 8px;
  }
  .billboard__row .col--city {
    grid-area: city;
  }
  .billboard__row .col--time {
    grid-area: time;
    text-align: right;
  }
  .billboard__row .col--flight {
    grid-area: flight;
  }
  .billboard__row .col--status {
    grid-area: status;
    text-align: right;
    font-size: 12px;
  }
}
</style>
