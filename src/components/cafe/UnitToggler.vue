<script setup>
import { useConfigStore } from '../../stores/config'

const config = useConfigStore()
</script>

<template>
  <button class="unit-toggler" @click="config.toggleUnit()">
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
