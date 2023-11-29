<script setup lang='ts'>
import type { RangeColor } from '@/interface'

const modelValue = defineModel<RangeColor[]>()

function addRangeColor(index: number = -1, startRange: number = 0, startColor: string = '#000000') {
  modelValue.value?.splice(index + 1, 0, [startRange, startColor])
}
function removeRangeColor(index: number) {
  modelValue.value?.splice(index, 1)
}
</script>

<template>
  <div>
    <div v-for="v, i in modelValue" :key="i" class="flex items-center gap-sm mb-sm">
      <div class="flex-grow flex items-center gap-2">
        <input v-model.number="v[0]" class="w-30" type="range" max="1" min="0" step="0.01">
        <input
          v-model.number="v[0]"
          type="number"
          max="1" min="0" step="0.01"
          class="text-3 font-normal w-16 text-center border-(1 slate-2) rounded-md px-2 py-1"
        >
      </div>
      <input v-model="v[1]" type="color" class="flex-shrink-0">
      <div class="flex items-center gap-1 text-white">
        <span class="p-1 text-0 bg-teal-5 rounded-md flex-shrink-0 cursor-pointer" @click="addRangeColor(i, v[0], v[1])">
          <i class="i-material-symbols:add text-3" />
        </span>
        <span class="p-1 text-0 bg-red-5 rounded-md flex-shrink-0 cursor-pointer" @click="removeRangeColor(i)">
          <i class="i-material-symbols:close text-2.75 " />
        </span>
      </div>
    </div>
    <span class="py-1 px-sm bg-teal-5 rounded-md cursor-pointer block text-center text-white" @click="addRangeColor()">
      <i class="i-material-symbols:add text-3.5" />
    </span>
  </div>
</template>
