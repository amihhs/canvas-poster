<!-- eslint-disable ts/ban-ts-comment -->
<script setup lang='ts'>
import { PosterType } from '@amihhs/canvas-poster'
import { CURRENT_CHANGE_JSON } from '@/logic/edit/const'
</script>

<template>
  <div v-if="CURRENT_CHANGE_JSON && CURRENT_CHANGE_JSON.type === PosterType.text">
    <ElementBase />
    <div class="form-item ">
      <label class="label mb-sm">字体颜色</label>
      <UtilsColor v-model="CURRENT_CHANGE_JSON.color" />
    </div>
  </div>
</template>

<style lang='scss' scoped>
</style>
