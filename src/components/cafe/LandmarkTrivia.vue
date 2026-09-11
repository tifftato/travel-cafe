<script setup>
import { ref, computed, onMounted } from 'vue'
import { landmarkTrivia } from '../../data/landmarkTrivia'
import { dailyPick } from '../../utils/dailyPick'

const props = defineProps({
  cityId: { type: String, required: true },
})

const trivia = computed(() => dailyPick(landmarkTrivia[props.cityId], `${props.cityId}:trivia`))

// 도착하고 살짝 뜸 들인 뒤 나타났다가, 몇 초 뒤 저절로 사라집니다.
// 놓쳤거나 다시 보고 싶으면 남아있는 작은 ℹ️ 아이콘을 눌러 언제든 다시 펼칠 수 있어요.
const visible = ref(false)
const everShown = ref(false)
let showTimer = null
let hideTimer = null

function show() {
  clearTimeout(showTimer)
  clearTimeout(hideTimer)
  visible.value = true
  everShown.value = true
  hideTimer = setTimeout(() => {
    visible.value = false
  }, 8000)
}

onMounted(() => {
  if (!trivia.value) return
  showTimer = setTimeout(show, 1500)
})

function dismiss() {
  clearTimeout(hideTimer)
  visible.value = false
}
</script>

<template>
  <div v-if="trivia" class="landmark-trivia">
    <transition name="lt-fade">
      <div v-if="visible" class="landmark-trivia__badge" role="status">
        <span class="landmark-trivia__text">{{ trivia }}</span>
        <button class="landmark-trivia__close" aria-label="닫기" @click="dismiss">✕</button>
      </div>
    </transition>

    <!-- 자동으로 사라진 뒤에도 다시 볼 수 있는 작은 아이콘 -->
    <button
      v-if="everShown && !visible"
      class="landmark-trivia__reopen"
      aria-label="랜드마크 트리비아 다시 보기"
      @click="show"
    >
      ℹ️
    </button>
  </div>
</template>

<style scoped>
.landmark-trivia {
  position: absolute;
  top: 64px;
  left: 24px;
  z-index: 6;
}

.landmark-trivia__badge {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: min(360px, 70vw);
  background: rgba(13, 15, 22, 0.72);
  border: 1px solid var(--color-line);
  color: var(--color-cream);
  padding: 10px 12px;
  border-radius: 10px;
  backdrop-filter: blur(6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.landmark-trivia__text {
  font-size: 13px;
  line-height: 1.5;
}

.landmark-trivia__close {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: var(--color-amber-dim);
  cursor: pointer;
  font-size: 13px;
  padding: 2px 4px;
  line-height: 1;
}
.landmark-trivia__close:hover,
.landmark-trivia__close:focus-visible {
  color: var(--color-cream);
}

.landmark-trivia__reopen {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(13, 15, 22, 0.5);
  border: 1px solid var(--color-line);
  color: var(--color-cream);
  font-size: 13px;
  cursor: pointer;
  backdrop-filter: blur(4px);
}
.landmark-trivia__reopen:hover,
.landmark-trivia__reopen:focus-visible {
  background: rgba(13, 15, 22, 0.75);
}

.lt-fade-enter-active,
.lt-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.lt-fade-enter-from,
.lt-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .lt-fade-enter-active,
  .lt-fade-leave-active {
    transition: none;
  }
}
</style>
