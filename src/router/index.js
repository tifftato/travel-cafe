import { createRouter, createWebHistory } from 'vue-router'
import { ref } from 'vue'
import AirportBillboard from '../views/AirportBillboard.vue'
import BoardingPass from '../views/BoardingPass.vue'
import CafeWorkspace from '../views/CafeWorkspace.vue'
import { getCityById } from '../data/cities'

// SPA는 페이지 전체를 다시 안 불러오기 때문에, 브라우저 탭 제목과 스크린리더용 "페이지 이동" 안내를
// 라우트가 바뀔 때마다 직접 갱신해줘야 합니다 (안 그러면 스크린리더 사용자는 화면이 바뀐 걸 모릅니다).
// App.vue가 이 값을 읽어서 aria-live 영역에 표시합니다.
export const routeAnnouncement = ref('')

function titleFor(to) {
  const city = to.params.cityId ? getCityById(to.params.cityId) : null
  if (to.name === 'billboard') return '전광판'
  if (to.name === 'boarding' && city) return `${city.name} 탑승권`
  if (to.name === 'cafe' && city) return `${city.name} 카페`
  return ''
}

const routes = [
  {
    path: '/',
    name: 'billboard',
    component: AirportBillboard,
  },
  {
    path: '/boarding/:cityId',
    name: 'boarding',
    component: BoardingPass,
    props: true,
    beforeEnter: (to, from, next) => {
      // 존재하지 않는 도시로 직접 접근 시 빌보드로 돌려보냄
      getCityById(to.params.cityId) ? next() : next({ name: 'billboard' })
    },
  },
  {
    path: '/cafe/:cityId',
    name: 'cafe',
    component: CafeWorkspace,
    props: true,
    beforeEnter: (to, from, next) => {
      getCityById(to.params.cityId) ? next() : next({ name: 'billboard' })
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.afterEach((to) => {
  const label = titleFor(to)
  document.title = label ? `${label} · Travel Café` : 'Travel Café — 세계 도시 카페 워크스페이스'
  routeAnnouncement.value = label ? `${label} 화면으로 이동했습니다` : ''
})

export default router
