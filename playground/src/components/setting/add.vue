<script setup lang='ts'>
import { PosterType } from '@amihhs/canvas-poster'

const typeSelects = [
  { type: 'Line', value: PosterType.line },
  { type: 'Rect', value: PosterType.rect },
  { type: 'Text', value: PosterType.text },
  { type: 'Image', value: PosterType.image },
] as const

const { addJson } = useControlJson()
const { setCurrentChangeJson } = useCurrentChangeJson()
function addHandler(type: PosterType = PosterType.text) {
  const item = addJson(JSON_BASE_FORM[type])
  setCurrentChangeJson(item)
}
</script>

<template>
  <div class="grid grid-cols-2 gap-lg py-sm">
    <div
      v-for="v in typeSelects" :key="v.value"
      class="w-full aspect-1/1 grid place-content-center font-bold border-(2 slate-2) rounded-md cursor-pointer"
      hover="bg-teal-6 text-white"
      @click="addHandler(v.value)"
    >
      {{ v.type }}
    </div>
  </div>
</template>

<style lang='scss' scoped>
@import url('@/assets/styles/add.scss');
</style>
