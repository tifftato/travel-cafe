<script setup>
import { ref, computed } from 'vue'
import { coffeeFortunes } from '../../data/coffeeFortunes'

const props = defineProps({
  cityId: { type: String, required: true },
})
const emit = defineEmits(['close'])

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

// 오늘 날짜 + 도시를 섞어서 하나를 결정적으로 고릅니다 — 새로고침해도 오늘 안엔 같은 문구.
// "다시 보기"를 누르면 오늘 하루에 한해 다시 뽑을 수 있습니다.
function pickIndex(seedExtra = 0) {
  const seed = `${todayKey()}:${props.cityId}:${seedExtra}`
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return hash % coffeeFortunes.length
}

const rerollCount = ref(0)
const fortune = computed(() => coffeeFortunes[pickIndex(rerollCount.value)])

function reroll() {
  rerollCount.value += 1
}
</script>

<template>
  <div class="fortune-backdrop" @click.self="emit('close')">
    <div class="fortune-card" role="dialog" aria-label="오늘의 커피점">
      <button class="fortune-card__close" aria-label="닫기" @click="emit('close')">✕</button>
      <p class="fortune-card__eyebrow">☕ 오늘의 커피점</p>
      <p class="fortune-card__text">{{ fortune }}</p>
      <button class="fortune-card__reroll" @click="reroll">🔮 다시 보기</button>
    </div>
  </div>
</template>

<style scoped>
.fortune-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 8, 5, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  animation: fortune-fade-in 0.2s ease;
}

@keyframes fortune-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fortune-card {
  position: relative;
  width: min(340px, 86vw);
  padding: 32px 26px 24px;
  background: radial-gradient(circle at 30% 20%, #4a3324, #2a1c12 75%);
  border: 1px solid rgba(255, 179, 71, 0.25);
  border-radius: 14px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.5), inset 0 0 40px rgba(255, 179, 71, 0.06);
  animation: fortune-pop-in 0.25s cubic-bezier(0.2, 0.9, 0.3, 1.2);
}

@keyframes fortune-pop-in {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.fortune-card__close {
  position: absolute;
  top: 8px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 16px;
  color: rgba(255, 235, 210, 0.5);
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
}
.fortune-card__close:hover,
.fortune-card__close:focus-visible {
  color: rgba(255, 235, 210, 0.9);
}

.fortune-card__eyebrow {
  margin: 0 0 14px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-align: center;
  color: var(--color-amber);
}

.fortune-card__text {
  margin: 0 0 20px;
  font-size: 17px;
  line-height: 1.7;
  color: rgba(255, 245, 235, 0.92);
  text-align: center;
}

.fortune-card__reroll {
  display: block;
  margin: 0 auto;
  background: rgba(255, 179, 71, 0.12);
  border: 1px solid rgba(255, 179, 71, 0.3);
  color: var(--color-amber);
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
}
.fortune-card__reroll:hover,
.fortune-card__reroll:focus-visible {
  background: rgba(255, 179, 71, 0.2);
}

@media (prefers-reduced-motion: reduce) {
  .fortune-backdrop,
  .fortune-card {
    animation: none;
  }
}
</style>
