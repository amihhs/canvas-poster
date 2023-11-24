<script setup lang='ts'>
import type { PosterText } from '@amihhs/canvas-poster'

withDefaults(defineProps<{
  value: PosterText
}>(), {})
</script>

<template>
  <div class="flex items-center">
    <span class="text-3 text-slate-4 mr-1">Text</span>
    <span>{{ value.text }}</span>
  </div>
</template>
