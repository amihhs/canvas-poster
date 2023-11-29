<script setup lang='ts'>
import { PosterType } from '@amihhs/canvas-poster'
import { CURRENT_CHANGE_JSON } from '@/logic/edit/const'
</script>

<template>
  <div v-if="CURRENT_CHANGE_JSON && CURRENT_CHANGE_JSON.type === PosterType.image">
    <ElementBase />
    <div class="p-3">
      <div class="mb-2 font-bold">
        Image
      </div>
      <UtilsFile v-model="CURRENT_CHANGE_JSON.src" class="px-3 " />
      <img v-parse-url w-20 h-20 block m-auto mt-2 :src="CURRENT_CHANGE_JSON.src">
    </div>
    <div class="form-item">
      <label class="label">Object Fit</label>
      <select v-model="CURRENT_CHANGE_JSON.objectFit" class="input">
        <option
          v-for="v in ['none', 'fill', 'contain', 'cover', 'scale-down']"
          :key="v"
          :value="v"
        >
          {{ v }}
        </option>
      </select>
    </div>
    <div class="form-item">
      <label class="label">Radius</label>
      <input v-model.number="CURRENT_CHANGE_JSON.boxRadius" class="input">
    </div>
    <ElementShadow />
  </div>
</template>

<style lang='scss' scoped>

</style>
