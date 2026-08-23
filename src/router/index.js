import { createRouter, createWebHistory } from 'vue-router'
import AirportBillboard from '../views/AirportBillboard.vue'
import BoardingPass from '../views/BoardingPass.vue'
import CafeWorkspace from '../views/CafeWorkspace.vue'
import { getCityById } from '../data/cities'

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

export default router
