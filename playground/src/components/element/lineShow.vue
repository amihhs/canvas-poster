<script setup lang='ts'>
import type { PosterLine } from '@amihhs/canvas-poster'

withDefaults(defineProps<{
  value: PosterLine
}>(), {})
</script>

<template>
  <div class="flex items-center">
    <span class="show-label">Paths</span>
    <span>{{ value.paths }}</span>
  </div>
</template>
