<script setup lang='ts'>
import { PosterType } from '@amihhs/canvas-poster'
import { CURRENT_CHANGE_JSON } from '@/logic/edit/const'

const { t } = useI18n()
</script>

<template>
  <div v-if="CURRENT_CHANGE_JSON && CURRENT_CHANGE_JSON.type === PosterType.rect">
    <ElementBase />
    <div class="p-3">
      <div class="mb-2 font-bold">
        {{ t('setting.background') }}
      </div>
      <UtilsColor v-model="CURRENT_CHANGE_JSON.bgColor" />
    </div>
    <div class="form-item">
      <label class="label">Opacity</label>
      <input v-model.number="CURRENT_CHANGE_JSON.opacity" class="w-full" type="range" max="1" min="0" step="0.01">
    </div>
    <div class="form-item">
      <label class="label">Radius</label>
      <input v-model.number="CURRENT_CHANGE_JSON.boxRadius" class="input" type="number">
    </div>
    <ElementShadow />
  </div>
</template>

<style lang='scss' scoped>
</style>
