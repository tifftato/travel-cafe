<script setup>
import { ref } from 'vue'
import PomodoroPanel from './PomodoroPanel.vue'
import RadioPanel from './RadioPanel.vue'

const props = defineProps({
  city: { type: Object, required: true },
  showTimer: { type: Boolean, default: true },
  showRadio: { type: Boolean, default: true },
})

const collapsed = ref(false)
</script>

<template>
  <div class="widget" :class="{ 'widget--collapsed': collapsed }">
    <button
      class="widget__collapse-btn"
      :aria-label="collapsed ? '위젯 펼치기' : '위젯 접기'"
      :aria-expanded="!collapsed"
      @click="collapsed = !collapsed"
    >
      {{ collapsed ? '☕' : '—' }}
    </button>

    <div v-show="!collapsed" class="widget__body">
      <PomodoroPanel v-if="showTimer" />
      <div v-if="showTimer && showRadio" class="widget__divider" />
      <RadioPanel v-if="showRadio" :city="city" />
    </div>
  </div>
</template>

<style scoped>
.widget {
  position: fixed;
  right: clamp(16px, 3vw, 32px);
  bottom: clamp(16px, 3vw, 32px);
  z-index: 30;
  width: min(280px, 86vw);
  background: rgba(13, 15, 22, 0.72);
  border: 1px solid var(--color-line);
  border-radius: 18px;
  backdrop-filter: blur(14px);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.45);
  padding: 16px;
  transition: width 0.2s ease, padding 0.2s ease;
}

.widget--collapsed {
  width: 52px;
  padding: 0;
  border-radius: 50%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.widget__collapse-btn {
  position: absolute;
  top: 10px;
  right: 12px;
  background: none;
  border: none;
  color: var(--color-amber-dim);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
}

.widget--collapsed .widget__collapse-btn {
  position: static;
  font-size: 22px;
}

.widget__body {
  margin-top: 8px;
}

.widget__divider {
  height: 1px;
  background: var(--color-line);
  margin: 16px 0;
}

@media (max-width: 640px) {
  .widget {
    left: 16px;
    right: 16px;
    width: auto;
    bottom: 16px;
  }
  .widget--collapsed {
    left: auto;
    width: 52px;
  }
}
</style>
