<script setup>
import { inject } from 'vue'
import { useImageHotspot } from '../../composables/useImageHotspot'

const props = defineProps({
  x: { type: Number, required: true }, // 0~1
  y: { type: Number, required: true }, // 0~1
  label: { type: String, required: true }, // 스크린리더용 설명
  active: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])
const imgRef = inject('frameImgRef')
const { style } = useImageHotspot(imgRef, props.x, props.y)
</script>

<template>
  <button
    class="hotspot"
    :class="{ 'hotspot--active': active }"
    :style="style"
    :aria-label="label"
    :aria-expanded="active"
    @click="emit('click')"
  >
    <span class="hotspot__ring"></span>
  </button>
</template>

<style scoped>
.hotspot {
  position: absolute;
  transform: translate(-50%, -50%);
  width: clamp(36px, 6vw, 56px);
  height: clamp(36px, 6vw, 56px);
  border-radius: 50%;
  background: transparent;
  border: none;
  cursor: pointer;
  pointer-events: auto;
  transition: opacity 0.3s ease;
}

.hotspot__ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.15);
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.hotspot:hover .hotspot__ring,
.hotspot:focus-visible .hotspot__ring,
.hotspot--active .hotspot__ring {
  opacity: 1;
  transform: scale(1.08);
}

.hotspot--active .hotspot__ring {
  border-color: var(--color-amber);
  box-shadow: 0 0 0 4px rgba(255, 179, 71, 0.25);
}
</style>
