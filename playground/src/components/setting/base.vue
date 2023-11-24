<script setup lang='ts'>
import type { BaseSetting } from '@/interface'

const baseSetting = inject<Ref<BaseSetting>>(BASE_SETTING_KEY, ref(baseSettingDefault))
</script>

<template>
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
</template>
