<script setup lang='ts'>
import type { PosterImage } from '@amihhs/canvas-poster'

withDefaults(defineProps<{
  value: PosterImage
}>(), {})
</script>

<template>
  <div class="flex items-center">
    <span class="text-3 text-slate-4 mr-1">Image</span>
    <span>{{ value.src }}</span>
  </div>
</template>
