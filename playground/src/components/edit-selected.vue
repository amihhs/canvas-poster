<script setup lang='ts'>
import { CURRENT_CHANGE_JSON } from '@/logic/edit/const'

const canvasRef = inject<Ref<HTMLCanvasElement | null>>(CANVAS_EL_KEY, ref(null))
const selectStyle = computed(() => {
  if (!CURRENT_CHANGE_JSON.value || !canvasRef.value)
    return {}

  const { offsetLeft, offsetTop } = canvasRef.value
  return {
    left: `${CURRENT_CHANGE_JSON.value.x + offsetLeft}px`,
    top: `${CURRENT_CHANGE_JSON.value.y + offsetTop}px`,
    width: `${CURRENT_CHANGE_JSON.value.width}px`,
    height: `${CURRENT_CHANGE_JSON.value.height}px`,
  }
})
</script>

<template>
  <div
    v-if="CURRENT_CHANGE_JSON"
    class="absolute bg-teal-6 bg-opacity-40 select-none pointer-events-none border-(1 teal-6)"
    :style="selectStyle"
  >
    <span class="dit top-0 left-0" @click="console.log('1')" />
    <span class="dit top-0 right-0" />
    <span class="dit bottom-0 left-0" />
    <span class="dit bottom-0 right-0" />
  </div>
</template>

<style lang='scss' scoped>
.dit {
  --uno: w-2 h-2 inline-block bg-teal-6  absolute pointer-events-auto;
}
</style>
