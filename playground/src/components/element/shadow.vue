<script setup lang='ts'>
import { PosterType } from '@amihhs/canvas-poster'
import { CURRENT_CHANGE_JSON } from '@/logic/edit/const'

const { t } = useI18n()
</script>

<template>
  <div
    v-if="CURRENT_CHANGE_JSON && CURRENT_CHANGE_JSON.type !== PosterType.line"
    class="p-3"
  >
    <div class="mb-2 font-bold">
      {{ t('setting.shadow') }}
    </div>
    <div class="form-item">
      <label class="label">
        Color
        <UtilsTips to="https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowColor" />
      </label>
      <input v-model="CURRENT_CHANGE_JSON.shadowColor" type="color">
    </div>
    <div class="form-item">
      <label class="label">
        Blur
        <UtilsTips to="https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowBlur" />
      </label>
      <input v-model.number="CURRENT_CHANGE_JSON.shadowBlur" class="input">
    </div>
    <div class="form-item">
      <label class="label">OffsetX</label>
      <input v-model.number="CURRENT_CHANGE_JSON.shadowOffsetX" class="input">
    </div>
    <div class="form-item">
      <label class="label">OffsetY</label>
      <input v-model.number="CURRENT_CHANGE_JSON.shadowOffsetY" class="input">
    </div>
  </div>
</template>

<style lang='scss' scoped>

</style>
