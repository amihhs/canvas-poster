<script setup lang='ts'>
import { PosterType } from '@amihhs/canvas-poster'
import { CURRENT_CHANGE_JSON } from '@/logic/edit/const'
</script>

<template>
  <div v-if="CURRENT_CHANGE_JSON && CURRENT_CHANGE_JSON.type === PosterType.rect">
    <ElementBase />
    <div class="p-3">
      <div class="mb-2 flex-shrink-0">
        背景颜色
      </div>
      <UtilsColor v-model="CURRENT_CHANGE_JSON.bgColor" />
    </div>
  </div>
</template>

<style lang='scss' scoped>
</style>
