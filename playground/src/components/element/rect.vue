<script setup lang='ts'>
import { PosterType } from '@amihhs/canvas-poster'
import { CURRENT_CHANGE_JSON } from '@/logic/const'
import type { Color } from '@/interface'

const color = ref<Color>({
  type: 'pure',
  color: '#000000',
})
</script>

<template>
  <div v-if="CURRENT_CHANGE_JSON && CURRENT_CHANGE_JSON.type === PosterType.rect">
    <ElementBase />
    <div class="form-item ">
      <label class="label mb-sm">背景颜色</label>
      <UtilsColor v-model="color" />
    </div>
  </div>
</template>

<style lang='scss' scoped>
@import url('@/assets/styles/add.scss');
</style>
