<script setup lang='ts'>
import type { PosterRect } from '@amihhs/canvas-poster'
import { isCustomColor } from '@amihhs/canvas-poster'

withDefaults(defineProps<{
  value: PosterRect
}>(), {})
</script>

<template>
  <div class="flex items-center">
    <span class="show-label">BgColor</span>
    <span>{{ value.bgColor && isCustomColor(value.bgColor) ? value.bgColor.type : value.bgColor }}</span>
  </div>
</template>
