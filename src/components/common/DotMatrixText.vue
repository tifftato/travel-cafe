<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { GLYPH_ROWS, glyphFor, measureCols } from '../../utils/dotMatrixFont'

// 공항 전광판식 도트 매트릭스 글자를 canvas로 그립니다.
// - 꺼진 점도 아주 흐리게 그려서 "LED 패널에 불이 들어온" 느낌을 냅니다.
// - DOM 노드를 점마다 만들면 도시 19개 × 수백 점이라 무거워서 canvas 한 장으로 그립니다.
// - 시각적 장식일 뿐이라 aria-hidden. 실제 읽을 텍스트는 부모가 aria-label로 제공합니다.
const props = defineProps({
  text: { type: String, default: '' },
  dot: { type: Number, default: 3 }, // 점 지름(px)
  gap: { type: Number, default: 1 }, // 점 사이 간격(px)
  color: { type: String, default: '#ffb347' },
  // 글자가 짧아도 이 열 수만큼은 폭을 확보(꺼진 점으로 채움) → 행마다 칸이 맞는 전광판 모양
  minCols: { type: Number, default: 0 },
  glow: { type: Boolean, default: true },
})

const canvasRef = ref(null)
const PAD = 4 // 글로우가 잘리지 않도록 캔버스에 두르는 여백

const cols = computed(() => Math.max(measureCols(props.text), props.minCols))
const cell = computed(() => props.dot + props.gap)
const cssW = computed(() => cols.value * cell.value - props.gap)
const cssH = computed(() => GLYPH_ROWS * cell.value - props.gap)

function hexToRgb(color) {
  const m = /^#?([0-9a-f]{6})$/i.exec(color)
  if (!m) return '255,179,71'
  const n = parseInt(m[1], 16)
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = Math.min(window.devicePixelRatio || 1, 3)
  const w = cssW.value + PAD * 2
  const h = cssH.value + PAD * 2
  // 크기가 바뀔 때만 버퍼를 다시 잡는다 (1초마다 호출돼도 가볍게)
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
  }
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)

  const r = props.dot / 2
  const rgb = hexToRgb(props.color)

  // 1) 꺼진 점 (전체 격자)
  ctx.fillStyle = `rgba(${rgb},0.09)`
  ctx.beginPath()
  for (let c = 0; c < cols.value; c++) {
    for (let row = 0; row < GLYPH_ROWS; row++) {
      const cx = PAD + c * cell.value + r
      const cy = PAD + row * cell.value + r
      ctx.moveTo(cx + r, cy)
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
    }
  }
  ctx.fill()

  // 2) 켜진 점
  ctx.fillStyle = props.color
  if (props.glow) {
    ctx.shadowColor = `rgba(${rgb},0.75)`
    ctx.shadowBlur = props.dot * 1.4
  }
  ctx.beginPath()
  let x = 0
  const chars = [...props.text]
  chars.forEach((ch, i) => {
    const g = glyphFor(ch)
    for (let row = 0; row < GLYPH_ROWS; row++) {
      for (let c = 0; c < g[row].length; c++) {
        if (g[row][c] !== '1') continue
        const cx = PAD + (x + c) * cell.value + r
        const cy = PAD + row * cell.value + r
        ctx.moveTo(cx + r, cy)
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
      }
    }
    x += g[0].length + (i < chars.length - 1 ? 1 : 0)
  })
  ctx.fill()
  ctx.shadowBlur = 0
}

onMounted(draw)
watch(() => [props.text, props.dot, props.gap, props.color, props.minCols, props.glow], draw)
</script>

<template>
  <!-- 캔버스가 PAD만큼 크므로 음수 마진으로 상쇄해서 레이아웃상 크기는 "점 격자 그대로" -->
  <span class="dotm" aria-hidden="true" :style="{ width: cssW + 'px', height: cssH + 'px' }">
    <canvas
      ref="canvasRef"
      class="dotm__canvas"
      :style="{ width: cssW + PAD * 2 + 'px', height: cssH + PAD * 2 + 'px', margin: -PAD + 'px' }"
    />
  </span>
</template>

<style scoped>
.dotm {
  display: inline-block;
  position: relative;
  max-width: 100%;
  vertical-align: middle;
  line-height: 0;
}
.dotm__canvas {
  display: block;
  pointer-events: none;
}
</style>
