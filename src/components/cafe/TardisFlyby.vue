<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { tardisPaths } from '../../data/tardisPaths'

const router = useRouter()
const tardisEl = ref(null)
const canvasEl = ref(null)
const visible = ref(false)
// 3D 모델 로딩에 성공하면 true → 캔버스를 보여주고, 실패(WebGL 미지원/네트워크)하면
// 예전 CSS 박스 타디스로 폴백합니다. 이스터에그라 어떤 환경에서도 "깨져 보이지" 않게 하기 위함.
const glReady = ref(false)

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

let scheduleTimer = null
let currentAnimation = null

// ───────── 3D 타디스 (2005 Police Box OBJ, three.js) ─────────
// three(~700KB)와 모델/텍스처(~1MB)는 이스터에그에만 쓰이므로 첫 비행 직전에 동적 import로 불러옵니다.
// 메인 번들엔 들어가지 않아서 전광판/카페 첫 로딩이 느려지지 않습니다.
const MODEL_DIR = '/assets/tardis/'
const GL_W = 84 // 캔버스 CSS 크기(px). 모델 비율(폭:높이 ≈ 1:2)에 맞춤
const GL_H = 150
let gl = null // { THREE, renderer, scene, camera, model }
let glPromise = null
let rafId = null

function loadGl() {
  if (glPromise) return glPromise
  glPromise = (async () => {
    const THREE = await import('three')
    const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js')

    const renderer = new THREE.WebGLRenderer({ canvas: canvasEl.value, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(GL_W, GL_H, false)
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const scene = new THREE.Scene()
    // 모델은 높이 약 63, 폭 약 32(Y-up, 바닥이 y=0). 세로로 꽉 차게 프레이밍.
    const camera = new THREE.PerspectiveCamera(28, GL_W / GL_H, 1, 600)
    camera.position.set(0, 34, 150)
    camera.lookAt(0, 31.5, 0)

    scene.add(new THREE.AmbientLight(0xffffff, 1.25))
    const key = new THREE.DirectionalLight(0xffffff, 2.2)
    key.position.set(40, 80, 90)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x9ec8ff, 1.1)
    rim.position.set(-60, 40, -70)
    scene.add(rim)

    const loader = new THREE.TextureLoader()
    const tex = (file) => {
      const t = loader.load(MODEL_DIR + file)
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 4
      return t
    }
    // 원본 MTL은 Source 엔진용(투명도 d 0.36 등)이라 쓰지 않고, OBJ의 머티리얼 이름으로 직접 매핑합니다.
    // 2005 본체 텍스처가 어두운 회청색이라, 같은 텍스처를 약하게 발광시켜(emissive) 어두운 배경 위에서도 푸른 기가 살도록 함
    const bodyTex = tex('2005out.jpg')
    const materials = {
      '2005': new THREE.MeshStandardMaterial({
        map: bodyTex,
        emissiveMap: bodyTex,
        emissive: 0x4a6a9a,
        roughness: 0.55,
        metalness: 0.05,
      }),
      '2005_NONE': new THREE.MeshStandardMaterial({ color: 0x0a3a6b, emissive: 0x0a2a55, roughness: 0.6 }),
      doorsign: new THREE.MeshStandardMaterial({ map: tex('doorsignout.jpg'), roughness: 0.7 }),
      policeboxsign: new THREE.MeshStandardMaterial({ map: tex('policeboxsign.jpg'), roughness: 0.7 }),
      // 창문은 안에서 불이 켜진 것처럼 자체 발광으로 (조명 영향 없이 밝게)
      windows: new THREE.MeshBasicMaterial({ map: tex('windowsout.jpg') }),
    }

    const model = await new Promise((resolve, reject) =>
      new OBJLoader().load(MODEL_DIR + 'tardis.obj', resolve, undefined, reject)
    )
    model.traverse((o) => {
      if (!o.isMesh) return
      const key = String(o.material?.name || '').split('/').pop()
      o.material = materials[key] || materials['2005_NONE']
    })
    // 회전 중심이 박스 한가운데가 되도록 pivot 그룹으로 감쌉니다.
    const pivot = new THREE.Group()
    pivot.add(model)
    scene.add(pivot)

    gl = { THREE, renderer, scene, camera, pivot }
    renderer.render(scene, camera)
    return gl
  })().catch((err) => {
    console.warn('[tardis] 3D 모델을 불러오지 못해 CSS 타디스로 대체합니다:', err)
    glPromise = null
    return null
  })
  return glPromise
}

function renderLoop() {
  if (!gl || !currentAnimation) return
  const timing = currentAnimation.effect?.getComputedTiming?.()
  const progress = timing?.progress ?? 0
  // 예전 CSS 구현(waypoint마다 140° 회전)과 같은 총 회전량을 3D 모델의 Y축 회전으로 재현
  gl.pivot.rotation.y = (progress * flightSpinDeg * Math.PI) / 180
  gl.renderer.render(gl.scene, gl.camera)
  rafId = requestAnimationFrame(renderLoop)
}

let flightSpinDeg = 0

// 대략 1시간에 한 번, 앞뒤로 살짝 흔들리게(45~75분) 다음 비행을 예약합니다.
// 처음 접속했을 때 1시간을 꼬박 기다리게 하지 않으려고, 첫 비행만 1~3분 사이로 당겨서
// 이스터에그를 좀 더 쉽게 발견할 수 있게 했습니다.
function scheduleNext(isFirst = false) {
  if (prefersReducedMotion) return // 모션 최소화 환경에서는 날아다니는 연출 자체를 하지 않음
  clearTimeout(scheduleTimer)
  const delayMs = isFirst
    ? (60 + Math.random() * 120) * 1000 // 1~3분
    : (45 + Math.random() * 30) * 60 * 1000 // 45~75분
  scheduleTimer = setTimeout(flyOnce, delayMs)
}

async function flyOnce() {
  if (!tardisEl.value) return

  // 3D 모델 준비 (실패하면 null → CSS 박스 폴백)
  const g = await loadGl()
  glReady.value = !!g
  await nextTick()

  const el = tardisEl.value
  if (!el) return

  const path = tardisPaths[Math.floor(Math.random() * tardisPaths.length)]
  const vw = window.innerWidth
  const vh = window.innerHeight

  // 3D일 땐 회전을 모델 자체가 하므로 CSS에선 이동 + 살짝 흔들림(rotateZ)만 적용합니다.
  // (캔버스는 평면이라 CSS rotateY를 걸면 납작하게 접혀 보임)
  flightSpinDeg = (path.points.length - 1) * 140 * path.spin
  const keyframes = path.points.map(([xVw, yVh], i) => ({
    transform: `translate(${(xVw / 100) * vw}px, ${(yVh / 100) * vh}px) ${
      g ? '' : `rotateY(${i * 140 * path.spin}deg) `
    }rotateZ(${Math.sin(i) * 8}deg)`,
    offset: i / (path.points.length - 1),
  }))

  visible.value = true
  currentAnimation = el.animate(keyframes, {
    duration: path.duration * 1000,
    easing: 'ease-in-out',
    fill: 'forwards',
  })
  if (g) renderLoop()
  currentAnimation.onfinish = () => {
    cancelAnimationFrame(rafId)
    visible.value = false
    scheduleNext()
  }
}

function handleClick() {
  cancelAnimationFrame(rafId)
  currentAnimation?.pause()
  visible.value = false
  router.push({ name: 'boarding', params: { cityId: 'gallifrey' } })
}

function handleKeydown(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    handleClick()
  }
}

onMounted(() => scheduleNext(true))
onUnmounted(() => {
  clearTimeout(scheduleTimer)
  cancelAnimationFrame(rafId)
  currentAnimation?.cancel()
  gl?.renderer.dispose() // WebGL 컨텍스트 누수 방지
  gl = null
})

// 개발/테스트용: 1시간을 기다리지 않고 바로 날려보기
defineExpose({ flyOnce })
</script>

<template>
  <div
    v-show="visible"
    ref="tardisEl"
    class="tardis"
    :class="{ 'tardis--gl': glReady }"
    role="button"
    tabindex="0"
    aria-label="타디스가 하늘을 날고 있습니다 — 클릭하면 갈리프레이로 순간이동합니다"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <!-- 3D 모델 (로딩 성공 시). 실패하면 아래 CSS 박스가 대신 보입니다 -->
    <canvas v-show="glReady" ref="canvasEl" class="tardis__canvas" :width="GL_W" :height="GL_H"></canvas>
    <div v-show="!glReady" class="tardis__box">
      <div class="tardis__face tardis__face--front">
        <span class="tardis__lamp"></span>
        <div class="tardis__panel"></div>
        <div class="tardis__panel"></div>
      </div>
      <div class="tardis__face tardis__face--back">
        <div class="tardis__panel"></div>
        <div class="tardis__panel"></div>
      </div>
      <div class="tardis__face tardis__face--left"></div>
      <div class="tardis__face tardis__face--right"></div>
      <div class="tardis__face tardis__face--top"></div>
    </div>
  </div>
</template>

<style scoped>
.tardis {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 40;
  --w: 46px;
  --h: 70px;
  width: var(--w);
  height: var(--h);
  margin: calc(var(--h) / -2) 0 0 calc(var(--w) / -2); /* 좌표가 중심을 가리키도록 보정 */
  cursor: pointer;
  perspective: 300px;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.5));
}

.tardis--gl {
  --w: 84px;
  --h: 150px;
  perspective: none;
}

.tardis__canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.tardis:focus-visible .tardis__box,
.tardis:focus-visible .tardis__canvas {
  outline: 2px solid var(--color-amber);
  outline-offset: 4px;
}

.tardis__box {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.tardis__face {
  position: absolute;
  background: #0b3d6e;
  border: 1px solid #062544;
}

.tardis__face--front {
  width: 46px;
  height: 70px;
  transform: translateZ(12px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 6px;
  gap: 3px;
}
.tardis__face--back {
  width: 46px;
  height: 70px;
  transform: translateZ(-12px) rotateY(180deg);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 6px;
  gap: 3px;
}
.tardis__face--left {
  width: 24px;
  height: 70px;
  transform: rotateY(-90deg) translateZ(12px);
  left: 11px;
}
.tardis__face--right {
  width: 24px;
  height: 70px;
  transform: rotateY(90deg) translateZ(12px);
  left: 11px;
}
.tardis__face--top {
  width: 46px;
  height: 24px;
  background: #082c52;
  transform: rotateX(90deg) translateZ(12px);
  top: 0;
}

.tardis__lamp {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff6cc, #ffd23f 60%, transparent);
  box-shadow: 0 0 6px 2px rgba(255, 210, 63, 0.8);
  margin-bottom: 2px;
}

.tardis__panel {
  width: 30px;
  height: 20px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
}
</style>
