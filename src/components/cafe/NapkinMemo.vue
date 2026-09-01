<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  cityId: { type: String, required: true },
})
const emit = defineEmits(['close'])

const STORAGE_PREFIX = 'travel-cafe:napkin:'
const text = ref('')
const textareaRef = ref(null)

onMounted(() => {
  try {
    text.value = localStorage.getItem(STORAGE_PREFIX + props.cityId) || ''
  } catch {
    // localStorage를 못 쓰는 환경(시크릿 모드 등)이어도 조용히 무시하고 빈 메모로 시작
  }
  // 열리자마자 바로 적을 수 있게 포커스
  requestAnimationFrame(() => textareaRef.value?.focus())
})

let saveTimer = null
watch(text, (val) => {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + props.cityId, val)
    } catch {
      /* 저장 실패해도 화면에서 계속 쓸 수는 있어야 하므로 무시 */
    }
  }, 400)
})
</script>

<template>
  <div class="napkin-backdrop" @click.self="emit('close')">
    <div class="napkin-card" role="dialog" aria-label="오늘의 집중 메모">
      <button class="napkin-card__close" aria-label="메모 닫기" @click="emit('close')">✕</button>
      <p class="napkin-card__label">오늘 집중할 목표 1가지</p>
      <textarea
        ref="textareaRef"
        v-model="text"
        class="napkin-card__textarea"
        placeholder="여기에 끄적여보세요..."
        maxlength="120"
        rows="4"
      ></textarea>
    </div>
  </div>
</template>

<style scoped>
.napkin-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 8, 5, 0.45);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  animation: napkin-fade-in 0.2s ease;
}

@keyframes napkin-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.napkin-card {
  position: relative;
  width: min(340px, 86vw);
  padding: 28px 26px 22px;
  background-image: url('/assets/napkin-texture.jpg');
  background-size: cover;
  background-position: center;
  border-radius: 4px;
  box-shadow:
    0 18px 45px rgba(0, 0, 0, 0.45),
    0 2px 6px rgba(0, 0, 0, 0.3);
  transform: rotate(-1.2deg);
  animation: napkin-drop-in 0.25s cubic-bezier(0.2, 0.9, 0.3, 1.2);
}

@keyframes napkin-drop-in {
  from {
    opacity: 0;
    transform: rotate(-1.2deg) scale(0.9) translateY(10px);
  }
  to {
    opacity: 1;
    transform: rotate(-1.2deg) scale(1) translateY(0);
  }
}

.napkin-card__close {
  position: absolute;
  top: 8px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 16px;
  color: rgba(60, 40, 20, 0.55);
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
}
.napkin-card__close:hover,
.napkin-card__close:focus-visible {
  color: rgba(60, 40, 20, 0.9);
}

.napkin-card__label {
  margin: 0 0 10px;
  font-family: 'East Sea Dokdo', cursive;
  font-size: 22px;
  color: rgba(50, 32, 15, 0.85);
  text-align: center;
}

.napkin-card__textarea {
  width: 100%;
  min-height: 110px;
  background: transparent;
  border: none;
  resize: none;
  font-family: 'Nanum Pen Script', cursive;
  font-size: 26px;
  line-height: 1.5;
  color: rgba(35, 20, 8, 0.92);
  caret-color: rgba(35, 20, 8, 0.8);
  text-align: center;
}

.napkin-card__textarea::placeholder {
  color: rgba(60, 40, 20, 0.4);
  font-family: 'Nanum Pen Script', cursive;
}

.napkin-card__textarea:focus {
  outline: none;
}

@media (prefers-reduced-motion: reduce) {
  .napkin-backdrop,
  .napkin-card {
    animation: none;
  }
}
</style>
