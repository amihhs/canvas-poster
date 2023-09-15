<script setup lang='ts'>
import type { Color, ConicGradientColor, LineGradientColor, PureColor, RadialGradientColor, RangeColor } from '@/interface'

const modelValue = defineModel<Color>({
  default: {
    type: 'pure',
    color: '#000000',
  },
})

const colorTypeOptions = [
  {
    label: '纯色',
    value: 'pure',
  },
  {
    label: '线性渐变',
    value: 'line-gradient',
  },
  {
    label: '锥形渐变',
    value: 'conic-gradient',
  },
  {
    label: '径向渐变',
    value: 'radial-gradient',
  },
]

const colorType = ref('pure')
const colorRange = ref<RangeColor[]>([[0, '#000000'], [1, '#ffffff']])

const pureForm = ref<PureColor>({
  type: 'pure',
  color: '#000000',
})
const LineGradientForm = ref<LineGradientColor>({
  type: 'line-gradient',
  positions: [], // x0, y0, x1, y1
  colors: [],
})
const ConicGradientForm = ref<ConicGradientColor>({
  type: 'conic-gradient',
  positions: [], // startAngle, x, y
  colors: [],
})
const RadialGradientForm = ref<RadialGradientColor>({
  type: 'radial-gradient',
  positions: [], // x0, y0, r0, x1, y1, r1
  colors: [],
})

watchEffect(() => {
  switch (colorType.value) {
    case 'pure':
      modelValue.value = pureForm.value
      break
    case 'line-gradient':
      modelValue.value = {
        ...LineGradientForm.value,
        colors: colorRange.value,
      }
      break
    case 'conic-gradient':
      modelValue.value = {
        ...ConicGradientForm.value,
        colors: colorRange.value,
      }
      break
    case 'radial-gradient':
      modelValue.value = {
        ...RadialGradientForm.value,
        colors: colorRange.value,
      }
      break
  }
})
</script>

<template>
  <div>
    <div class="font-normal mb-sm">
      <button
        v-for="v in colorTypeOptions" :key="v.value"
        class="px-sm py-1 mr-2 rounded-md text-3 border-(1 slate-2) "
        :class="[colorType === v.value ? 'bg-teal-6 text-white' : '']"
        @click="colorType = v.value"
      >
        {{ v.label }}
      </button>
    </div>
    <div v-if="colorType === 'pure'" class="grid place-content-center">
      <input v-model="pureForm.color" type="color">
    </div>
    <div v-else-if="colorType === 'line-gradient'">
      <!-- x0,y0,x1,y1 [number, color][] -->
      <div class="flex items-center mb-sm">
        <label class="label flex-shrink-0">起始点</label>
        <div class="flex items-center gap-3 w-0 flex-grow">
          <input v-model="LineGradientForm.positions[0]" placeholder="X0" type="text" inputmode="numeric" pattern="\d*" class="input min-w-10">
          <input v-model="LineGradientForm.positions[1]" placeholder="Y0" type="text" inputmode="numeric" pattern="\d*" class="input min-w-10">
        </div>
      </div>
      <div class="flex items-center  mb-sm">
        <label class="label flex-shrink-0">终止点</label>
        <div class="flex items-center gap-3 w-0 flex-grow">
          <input v-model="LineGradientForm.positions[2]" placeholder="X1" type="text" inputmode="numeric" pattern="\d*" class="input min-w-10">
          <input v-model="LineGradientForm.positions[3]" placeholder="Y1" type="text" inputmode="numeric" pattern="\d*" class="input min-w-10">
        </div>
      </div>
    </div>
    <div v-else-if="colorType === 'conic-gradient'" class="flex items-center mb-sm">
      <!-- startAngle,x,y [number, color][] -->
      <label class="label flex-shrink-0">起始点/角度</label>
      <div class="flex items-center gap-3 w-0 flex-grow">
        <input v-model="ConicGradientForm.positions[0]" type="text" inputmode="numeric" pattern="\d*" max="360" min="0" placeholder="角度" class="input min-w-10">
        <input v-model="ConicGradientForm.positions[1]" type="text" inputmode="numeric" pattern="\d*" placeholder="X0" class="input min-w-10">
        <input v-model="ConicGradientForm.positions[2]" type="text" inputmode="numeric" pattern="\d*" placeholder="Y0" class="input min-w-10">
      </div>
    </div>
    <div v-else-if="colorType === 'radial-gradient'">
      <!-- x0,y0,r0,x1,y1,r1 [number, color][] -->
      <div class="flex items-center mb-sm">
        <label class="label flex-shrink-0">起始点</label>
        <div class="flex items-center gap-3 w-0 flex-grow">
          <input v-model="ConicGradientForm.positions[3]" type="text" inputmode="numeric" pattern="\d*" placeholder="X0" class="input min-w-10">
          <input v-model="ConicGradientForm.positions[4]" type="text" inputmode="numeric" pattern="\d*" placeholder="Y0" class="input min-w-10">
          <input v-model="ConicGradientForm.positions[5]" type="text" inputmode="numeric" pattern="\d*" placeholder="R0" class="input min-w-10">
        </div>
      </div>
      <div class="flex items-center  mb-sm">
        <label class="label flex-shrink-0">终止点</label>
        <div class="flex items-center gap-3 w-0 flex-grow">
          <input v-model="RadialGradientForm.positions[0]" type="text" inputmode="numeric" pattern="\d*" placeholder="X1" class="input min-w-10">
          <input v-model="RadialGradientForm.positions[1]" type="text" inputmode="numeric" pattern="\d*" placeholder="Y1" class="input min-w-10">
          <input v-model="RadialGradientForm.positions[2]" type="text" inputmode="numeric" pattern="\d*" placeholder="R1" class="input min-w-10">
        </div>
      </div>
    </div>
    <UtilsColorRange v-if="colorType !== 'pure'" v-model="colorRange" />
  </div>
</template>

<style lang='scss' scoped>
@import url('@/assets/styles/add.scss');
</style>
