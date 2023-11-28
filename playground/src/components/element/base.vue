<script setup lang='ts'>
import { CURRENT_CHANGE_JSON } from '@/logic/edit/const'
</script>

<template>
  <template v-if="CURRENT_CHANGE_JSON">
    <div class="form-item">
      <label class="label">X</label>
      <input v-model="CURRENT_CHANGE_JSON.x" class="input">
    </div>
    <div class="form-item">
      <label class="label">Y</label>
      <input v-model="CURRENT_CHANGE_JSON.x" class="input">
    </div>
    <div class="form-item">
      <label class="label">宽度</label>
      <input v-model="CURRENT_CHANGE_JSON.width" class="input">
    </div>
    <div class="form-item">
      <label class="label">高度</label>
      <input v-model="CURRENT_CHANGE_JSON.height" class="input">
    </div>
  </template>
</template>

<style lang='scss' scoped>

</style>
