<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useJourneyStore } from '../stores/journey'

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
  router.push({ name: 'boarding', params: { cityId } })
}

// STATUS는 전광판에 "새로 진입할 때"만 무작위로 정해지고, 보고 있는 동안은 고정됩니다.
// (도시를 선택해 나갔다가 다시 돌아오면 컴포넌트가 새로 마운트되면서 다시 뽑힙니다)
const STATUS_CYCLE = ['ON TIME', 'BOARDING', 'FINAL CALL']
const statusMap = ref({})

onMounted(() => {
  const map = {}
  journey.allCities.forEach((city) => {
    map[city.id] = STATUS_CYCLE[Math.floor(Math.random() * STATUS_CYCLE.length)]
  })
  statusMap.value = map
})

function statusFor(city) {
  // 사용자와 가장 가까운 도시는 항상 NOW BOARDING (이건 위치 기반이라 고정)
  if (city.id === journey.nearestCity?.id) return 'NOW BOARDING'
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
    <header class="billboard__header">
      <div class="billboard__brand">TRAVEL CAFÉ ✈ DEPARTURES</div>
      <input
        v-model="query"
        class="billboard__search"
        type="text"
        placeholder="도시 검색 (예: 파리, Tokyo, 이탈리아)"
        @input="onSearchInput"
      />
    </header>

    <div class="billboard__columns">
      <div class="col col--flight">FLIGHT</div>
      <div class="col col--city">DESTINATION</div>
      <div class="col col--gate">LANDMARK</div>
      <div class="col col--status">STATUS</div>
    </div>

    <ul class="billboard__list">
      <li
        v-for="(city, idx) in displayedCities"
        :key="city.id"
        class="billboard__row"
        :class="{ 'billboard__row--nearest': city.id === journey.nearestCity?.id }"
        @click="goToBoarding(city.id)"
      >
        <span class="col col--flight">TC{{ String(100 + idx) }}</span>
        <span class="col col--city">
          {{ city.name }} <span class="billboard__city-en">{{ city.nameEn }}</span>
        </span>
        <span class="col col--gate">{{ city.landmark }}</span>
        <span class="col col--status" :class="statusClass(statusFor(city))">
          {{ statusFor(city) }}
        </span>
      </li>
    </ul>

    <p v-if="query && !displayedCities.length" class="billboard__empty">
      "{{ query }}" 에 해당하는 도시를 찾을 수 없습니다.
    </p>
  </main>
</template>

<style scoped>
.billboard {
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
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  color: var(--color-amber);
  font-size: clamp(16px, 2.2vw, 22px);
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

.billboard__columns {
  display: grid;
  grid-template-columns: 90px 1fr 1fr 130px;
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
}

.billboard__row {
  display: grid;
  grid-template-columns: 90px 1fr 1fr 130px;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-line);
  font-family: var(--font-mono);
  color: var(--color-cream);
  cursor: pointer;
  transition: background 0.15s ease;
}

.billboard__row:hover {
  background: rgba(255, 179, 71, 0.08);
}

.billboard__row--nearest {
  color: var(--color-amber);
}

.billboard__city-en {
  color: var(--color-amber-dim);
  font-size: 12px;
  margin-left: 6px;
}

/* 상태별 색상: 공항 전광판 관례를 따름 (탑승중=초록/앰버, 마감임박=빨강, 정상=중립) */
.status--ontime {
  color: var(--color-cream);
  opacity: 0.7;
}
.status--soon {
  color: var(--color-amber);
}
.status--final {
  color: #ff6b5e;
  font-weight: 700;
  animation: status-blink 1.2s ease-in-out infinite;
}
.status--boarding {
  color: #7cf29c;
  font-weight: 700;
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

@media (max-width: 640px) {
  .billboard__columns .col--gate,
  .billboard__row .col--gate {
    display: none;
  }
  .billboard__columns {
    grid-template-columns: 70px 1fr 100px;
  }
  .billboard__row {
    grid-template-columns: 70px 1fr 100px;
  }
}
</style>
