<script setup lang='ts'>
import type { RangeColor } from '@/interface'

const modelValue = defineModel<RangeColor[]>()

function addRangeColor(index: number, startRange: number = 0, startColor: string = '#000000') {
  modelValue.value?.splice(index + 1, 0, [startRange, startColor])
}
</script>

<template>
  <div>
    <div v-for="v, i in modelValue" :key="i" class="flex items-center gap-sm mb-sm">
      <div class="flex-grow flex items-center gap-2">
        <input v-model="v[0]" type="range" max="1" min="0" step="0.01">
        <input
          v-model="v[0]" type="number" max="1" min="0" step="0.01"
          class="text-3 font-normal w-15 text-center border-(1 slate-2) rounded-md px-2 py-1"
        >
      </div>
      <input v-model="v[1]" type="color" class="flex-shrink-0">
      <span class="px-2 py-0.5 bg-slate-2 rounded-md flex-shrink-0 cursor-pointer" @click="addRangeColor(i, v[0], v[1])">
        <i class="i-material-symbols:add" />
      </span>
    </div>
  </div>
</template>
