<script setup>
import { computed, inject } from 'vue'
import { useImageRegion } from '../../composables/useImageRegion'
import { useConfigStore } from '../../stores/config'

const props = defineProps({
  region: { type: Object, required: true }, // { x, y, width, height }
  iced: { type: Boolean, default: false },
})

const config = useConfigStore()
const imgRef = inject('frameImgRef')
const { style: regionStyle } = useImageRegion(imgRef, props.region)

// 물방울: 랜덤이지만 리렌더마다 위치가 안 바뀌도록 컴포넌트 생성 시 한 번만 계산
const droplets = computed(() =>
  Array.from({ length: 9 }, (_, i) => ({
    left: 8 + ((i * 37) % 84), // 0~100% 안에서 고르게 흩어지도록 의사난수 분포
    top: 15 + ((i * 53) % 70),
    size: 3 + (i % 4),
    delay: (i % 5) * 0.6,
  }))
)

// 김: 3~4가닥, 컵 위쪽 중앙에서 살짝 좌우로 퍼지게
const steams = computed(() => [
  { left: 30, delay: 0, duration: 3.2 },
  { left: 50, delay: 0.9, duration: 3.6 },
  { left: 70, delay: 1.6, duration: 3.0 },
])
</script>

<template>
  <div v-if="config.coffeeEffectEnabled" class="coffee-effect" :style="regionStyle" aria-hidden="true">
    <!-- 뜨거운 음료: 위로 피어오르는 김 -->
    <template v-if="!iced">
      <span
        v-for="(s, i) in steams"
        :key="i"
        class="coffee-effect__steam"
        :style="{ left: s.left + '%', animationDelay: s.delay + 's', animationDuration: s.duration + 's' }"
      ></span>
    </template>

    <!-- 아이스 음료: 잔에 맺힌 물방울 -->
    <template v-else>
      <span
        v-for="(d, i) in droplets"
        :key="i"
        class="coffee-effect__droplet"
        :style="{
          left: d.left + '%',
          top: d.top + '%',
          width: d.size + 'px',
          height: d.size * 1.3 + 'px',
          animationDelay: d.delay + 's',
        }"
      ></span>
    </template>
  </div>
</template>

<style scoped>
.coffee-effect {
  position: absolute;
  pointer-events: none;
  overflow: visible;
}

/* 김: 아래에서 위로 흔들리며 올라가다 옅어지는 블러 처리된 세로 줄기 */
.coffee-effect__steam {
  position: absolute;
  bottom: 55%;
  width: 3px;
  height: 60%;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0));
  border-radius: 999px;
  filter: blur(3px);
  transform-origin: bottom center;
  animation: steam-rise 3.2s ease-in infinite;
  opacity: 0;
}

@keyframes steam-rise {
  0% {
    transform: translateY(0) translateX(0) scaleX(1);
    opacity: 0;
  }
  15% {
    opacity: 0.7;
  }
  50% {
    transform: translateY(-55%) translateX(6px) scaleX(1.4);
    opacity: 0.5;
  }
  100% {
    transform: translateY(-110%) translateX(-8px) scaleX(1.8);
    opacity: 0;
  }
}

/* 물방울: 유리잔에 맺힌 결로, 은은하게 반짝이는 정적인 방울 + 아주 느린 흘러내림 */
.coffee-effect__droplet {
  position: absolute;
  background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.15) 60%, transparent 75%);
  border-radius: 50% 50% 50% 60%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  animation: droplet-drip 7s ease-in infinite;
}

@keyframes droplet-drip {
  0%, 70% {
    transform: translateY(0);
    opacity: 0.85;
  }
  95% {
    transform: translateY(10px);
    opacity: 0.3;
  }
  100% {
    transform: translateY(12px);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .coffee-effect__steam,
  .coffee-effect__droplet {
    animation: none;
    opacity: 0.5;
  }
}
</style>
