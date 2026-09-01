<script setup>
import { useConfigStore } from '../../stores/config'

const config = useConfigStore()
</script>

<template>
  <button
    class="unit-toggler"
    :aria-label="`현재 ${config.unitSymbol} 단위 표시 중. 클릭하면 ${config.unitSymbol === '°C' ? '화씨' : '섭씨'}로 전환합니다.`"
    @click="config.toggleUnit()"
  >
    {{ config.unitSymbol }}
  </button>
</template>

<style scoped>
.unit-toggler {
  background: rgba(13, 15, 22, 0.5);
  border: 1px solid var(--color-line);
  color: var(--color-cream);
  padding: 6px 12px;
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 12px;
  backdrop-filter: blur(4px);
}
</style>
