<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { routeAnnouncement } from './router'
import TardisFlyby from './components/cafe/TardisFlyby.vue'

const route = useRoute()

// 라우트가 바뀔 때마다 포커스를 페이지 컨테이너로 되돌립니다. SPA는 브라우저가 자동으로
// 포커스를 초기화해주지 않아서, 안 그러면 키보드/스크린리더 사용자의 포커스가 사라진
// 이전 화면의 버튼 위치에 그대로 남아 다음 상호작용이 엉뚱하게 동작할 수 있습니다.
watch(
  () => route.fullPath,
  () => {
    document.getElementById('app-main')?.focus()
  }
)
</script>

<template>
  <div class="app-shell">
    <!-- 브라우저 탭 제목과 별개로, 화면이 바뀌었다는 사실 자체를 스크린리더에 알려줍니다 -->
    <div role="status" aria-live="polite" class="sr-only">{{ routeAnnouncement }}</div>

    <router-view v-slot="{ Component, route: r }">
      <transition :name="r.meta.transition || 'fade'" mode="out-in">
        <component :is="Component" :key="r.fullPath" id="app-main" tabindex="-1" />
      </transition>
    </router-view>

    <!-- 이스터에그: 어느 화면에서든 1시간에 한 번쯤 타디스가 화면을 가로질러 날아갑니다.
         클릭하면 갈리프레이 탑승 절차로 이동합니다 -->
    <TardisFlyby />
  </div>
</template>

<style>
.app-shell {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: #05060a;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
