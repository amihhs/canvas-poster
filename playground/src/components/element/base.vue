<script setup lang='ts'>
import { CURRENT_CHANGE_JSON } from '@/logic/edit/const'

const { t } = useI18n()
</script>

<template>
  <template v-if="CURRENT_CHANGE_JSON">
    <div class="form-item">
      <label class="label">X</label>
      <input v-model="CURRENT_CHANGE_JSON.x" class="input">
    </div>
    <div class="form-item">
      <label class="label">Y</label>
      <input v-model="CURRENT_CHANGE_JSON.y" class="input">
    </div>
    <div class="form-item">
      <label class="label">{{ t('setting.width') }}</label>
      <input v-model="CURRENT_CHANGE_JSON.width" class="input">
    </div>
    <div class="form-item">
      <label class="label">{{ t('setting.height') }}</label>
      <input v-model="CURRENT_CHANGE_JSON.height" class="input">
    </div>
  </template>
</template>

<style lang='scss' scoped>

</style>
