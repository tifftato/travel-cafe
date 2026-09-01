<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: Number, required: true }, // 0~1
  style: { type: Object, required: true }, // useImageHotspot의 style (left/top, 노브 중심)
  size: { type: Number, default: 46 }, // 히트 영역 지름(px)
})
const emit = defineEmits(['update:modelValue'])

const dragging = ref(false)

// 노브는 보통 시계 7시~5시 방향(약 300도)으로만 회전하는 오디오 볼륨 놀브를 흉내냅니다.
const START_DEG = -210 // 7시 방향
const END_DEG = 30 // 5시 방향

function angleFromEvent(e, centerEl) {
  const rect = centerEl.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = e.clientX - cx
  const dy = e.clientY - cy
  return (Math.atan2(dy, dx) * 180) / Math.PI // -180~180
}

function valueFromAngle(deg) {
  // atan2는 -180~180만 반환하는데, 노브 시작각(START_DEG=-210)은 그 범위를 벗어나므로
  // -180 근처 값들을 +360 해서 START_DEG~END_DEG 연속 구간으로 맞춰준다.
  let normalized = deg
  if (normalized < START_DEG) normalized += 360
  const clamped = Math.max(START_DEG, Math.min(END_DEG, normalized))
  return (clamped - START_DEG) / (END_DEG - START_DEG)
}

function onPointerDown(e) {
  dragging.value = true
  e.target.setPointerCapture(e.pointerId)
}

function onPointerMove(e) {
  if (!dragging.value) return
  const deg = angleFromEvent(e, e.currentTarget)
  emit('update:modelValue', Math.max(0, Math.min(1, valueFromAngle(deg))))
}

function onPointerUp() {
  dragging.value = false
}

// 현재 값(0~1) → 호(arc) SVG path
const RADIUS = 20
function arcPath(value) {
  const deg = START_DEG + (END_DEG - START_DEG) * value
  const toRad = (d) => (d * Math.PI) / 180
  const start = { x: 24 + RADIUS * Math.cos(toRad(START_DEG)), y: 24 + RADIUS * Math.sin(toRad(START_DEG)) }
  const end = { x: 24 + RADIUS * Math.cos(toRad(deg)), y: 24 + RADIUS * Math.sin(toRad(deg)) }
  const largeArc = deg - START_DEG > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`
}
</script>

<template>
  <div
    class="rotary-knob"
    :style="{ ...style, width: size + 'px', height: size + 'px' }"
    role="slider"
    aria-label="볼륨"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="Math.round(modelValue * 100)"
    :aria-valuetext="`${Math.round(modelValue * 100)}퍼센트`"
    tabindex="0"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @keydown.left="emit('update:modelValue', Math.max(0, modelValue - 0.05))"
    @keydown.right="emit('update:modelValue', Math.min(1, modelValue + 0.05))"
  >
    <svg viewBox="0 0 48 48" class="rotary-knob__svg">
      <path :d="arcPath(1)" class="rotary-knob__track" />
      <path :d="arcPath(modelValue)" class="rotary-knob__fill" />
    </svg>
  </div>
</template>

<style scoped>
.rotary-knob {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: grab;
  touch-action: none;
  pointer-events: auto;
}
.rotary-knob:active {
  cursor: grabbing;
}

.rotary-knob__svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.rotary-knob__track {
  fill: none;
  stroke: rgba(255, 255, 255, 0.25);
  stroke-width: 3;
  stroke-linecap: round;
}

.rotary-knob__fill {
  fill: none;
  stroke: var(--color-amber);
  stroke-width: 3;
  stroke-linecap: round;
  filter: drop-shadow(0 0 3px rgba(255, 179, 71, 0.8));
}
</style>
