<script setup lang='ts'>
import { canvasSelectedController } from '@/logic/edit/selected'

const { selectedRef } = canvasSelectedController()
</script>

<template>
  <div id="canvasSelected" ref="selectedRef" />
</template>
