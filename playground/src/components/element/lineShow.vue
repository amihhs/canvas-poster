<script setup lang='ts'>
import type { PosterLine } from '@amihhs/canvas-poster'

withDefaults(defineProps<{
  value: PosterLine
}>(), {})
</script>

<template>
  <div class="flex items-center">
    <span class="text-3 text-slate-4 mr-1">Paths</span>
    <span>{{ value.paths }}</span>
  </div>
</template>
