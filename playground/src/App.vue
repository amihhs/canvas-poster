<script setup lang="ts">
import { handler } from './logic/index'

const { canvasRef, baseSetting } = handler()

const style = computed(() => ({
  width: `${baseSetting.value.canvasWidth}px`,
  height: `${baseSetting.value.canvasHeight}px`,
}))
</script>

<template>
  <div class=" bg-gray-2 p-3">
    <div class="fixed left-3 top-3 w-25% flex-shrink-0 bg-white h-95vh overflow-auto p-3 rounded-md select-none">
      <h1 class="font-bold text-4.5 border-(b-1 gray-2) pb-3">
        资源
      </h1>
    </div>
    <div class="pt-5 grid place-content-center">
      <canvas ref="canvasRef" class="origin-top-center" :style="style" />
    </div>
    <div class="fixed right-3 top-3 w-25% flex-shrink-0 bg-white h-95vh overflow-auto p-3 rounded-md select-none">
      <h1 class="font-bold text-4 border-(b-1 gray-2) pb-3">
        基础设置
      </h1>
      <div>
        <div class="flex items-center justify-between border-(b-1 slate-1) p-3">
          <span class="text-3.5">背景颜色</span>
          <input v-model="baseSetting.bgColor" type="color" class="w-20 h-8">
        </div>
        <div class="flex items-center justify-between border-(b-1 slate-1) p-3">
          <span class="text-3.5">画布像素比</span>
          <input v-model.number="baseSetting.dpi" type="text" class="px-3 border-(2 slate-3) rounded-md h-8">
        </div>
        <div class="flex items-center justify-between border-(b-1 slate-1) p-3">
          <span class="text-3.5">画布宽</span>
          <input v-model.number="baseSetting.canvasWidth" type="text" class="px-3 border-(2 slate-3) rounded-md h-8">
        </div>
        <div class="flex items-center justify-between border-(b-1 slate-1) p-3">
          <span class="text-3.5">画布高</span>
          <input v-model.number="baseSetting.canvasHeight" type="text" class="px-3 border-(2 slate-3) rounded-md h-8">
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
html,body,#app {
  --at-apply: bg-gray-2;
}
</style>
