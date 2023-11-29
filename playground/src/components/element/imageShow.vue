<script setup lang='ts'>
import type { PosterImage } from '@amihhs/canvas-poster'

withDefaults(defineProps<{
  value: PosterImage
}>(), {})
</script>

<template>
  <div class="flex items-center">
    <span class="show-label">Image</span>
    <span>{{ value.src }}</span>
  </div>
</template>
