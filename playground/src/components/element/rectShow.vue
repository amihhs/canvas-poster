<script setup lang='ts'>
import type { PosterRect } from '@amihhs/canvas-poster'

withDefaults(defineProps<{
  value: PosterRect
}>(), {})
</script>

<template>
  <div class="flex items-center">
    <span class="text-3 text-slate-4 mr-1">BgColor</span>
    <span>{{ value.bgColor }}</span>
  </div>
</template>
