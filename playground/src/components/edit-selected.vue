<script setup lang='ts'>
import { PosterType } from '@amihhs/canvas-poster'
import { CURRENT_CHANGE_JSON } from '@/logic/edit/const'

const canvasRef = inject<Ref<HTMLCanvasElement | null>>(CANVAS_EL_KEY, ref(null))
const selectStyle = computed(() => {
  if (!CURRENT_CHANGE_JSON.value || !canvasRef.value)
    return {}
  const offset = CURRENT_CHANGE_JSON.value.type === PosterType.text ? 4 : 0

  const { offsetLeft, offsetTop } = canvasRef.value
  return {
    left: `${CURRENT_CHANGE_JSON.value.x + offsetLeft - offset}px`,
    top: `${CURRENT_CHANGE_JSON.value.y + offsetTop - offset}px`,
    width: `${CURRENT_CHANGE_JSON.value.width + offset * 2}px`,
    height: `${CURRENT_CHANGE_JSON.value.height + offset * 2}px`,
  }
})
</script>

<template>
  <div
    v-if="CURRENT_CHANGE_JSON"
    class="absolute bg-teal-6 bg-opacity-40 select-none pointer-events-none border-(1 teal-6)"
    :style="selectStyle"
  >
    <span class="dit -top-1 -left-1" @click="console.log('1')" />
    <span class="dit -top-1 -right-1" />
    <span class="dit -bottom-1 -left-1" />
    <span class="dit -bottom-1 -right-1" />
  </div>
</template>

<style lang='scss' scoped>
.dit {
  --uno: w-2 h-2 inline-block bg-teal-6  absolute pointer-events-auto rounded-full;
}
</style>
