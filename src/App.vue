<script setup>
import { onMounted } from 'vue'
import { useJourneyStore } from './stores/journey'

const journey = useJourneyStore()

onMounted(() => {
  journey.initNearestCity()
})
</script>

<template>
  <div class="app-shell">
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition || 'fade'" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </transition>
    </router-view>
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
