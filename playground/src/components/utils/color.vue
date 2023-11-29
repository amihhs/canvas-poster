<script setup lang='ts'>
import { ColorType } from '@amihhs/canvas-poster'
import type { Color, ConicGradientColor, LineGradientColor, PatternColor, PureColor, RadialGradientColor } from '@amihhs/canvas-poster'
import type { RangeColor } from '@/interface'
import { CURRENT_CHANGE_JSON } from '@/logic/edit/const'

const modelValue = defineModel<Color>({
  default: {
    type: ColorType.pure,
    color: '#000000',
  },
})

const { t } = useI18n()
const colorTypeOptions = [
  {
    label: t('color.pure'),
    value: ColorType.pure,
  },
  {
    label: t('color.lineGradient'),
    value: ColorType.lineGradient,
  },
  {
    label: t('color.conicGradient'),
    value: ColorType.conicGradient,
  },
  {
    label: t('color.radialGradient'),
    value: ColorType.radialGradient,
  },
  {
    label: t('color.pattern'),
    value: ColorType.pattern,
  },
]
const defaultColorRange: RangeColor[] = [[0, '#000000'], [1, '#ffffff']]
const colorType = ref<ColorType>()

const pureForm = ref<PureColor>({
  type: ColorType.pure,
  color: '#000000',
})
const lineGradientForm = ref<LineGradientColor>({
  type: ColorType.lineGradient,
  positions: [0, 0, 0, 0], // x0, y0, x1, y1
  colors: Array.from(defaultColorRange),
})
const conicGradientForm = ref<ConicGradientColor>({
  type: ColorType.conicGradient,
  positions: [0, 0, 0], // startAngle, x, y
  colors: Array.from(defaultColorRange),
})
const radialGradientForm = ref<RadialGradientColor>({
  type: ColorType.radialGradient,
  positions: [0, 0, 0, 0, 0, 0], // x0, y0, r0, x1, y1, r1
  colors: Array.from(defaultColorRange),
})
const patternForm = ref<PatternColor>({
  type: ColorType.pattern,
  src: '/logo.svg',
  repeat: 'repeat',
})

function format() {
  if (
    typeof modelValue.value === 'string'
      || modelValue.value instanceof CanvasGradient
      || modelValue.value instanceof CanvasPattern
  ) {
    modelValue.value = {
      type: ColorType.pure,
      color: typeof modelValue.value === 'string' ? modelValue.value : '#000000',
    }
  }

  switch (modelValue.value.type) {
    case ColorType.pure:
      pureForm.value = modelValue.value
      break
    case ColorType.lineGradient:
      lineGradientForm.value = modelValue.value
      break
    case ColorType.conicGradient:
      conicGradientForm.value = modelValue.value
      break
    case ColorType.radialGradient:
      radialGradientForm.value = modelValue.value
      break
    case ColorType.pattern:
      patternForm.value = modelValue.value
      break
  }

  if (!colorType.value)
    colorType.value = modelValue.value.type
}
watch(colorType, (nv, ov) => {
  if (!colorType.value)
    format()

  if (!ov || !CURRENT_CHANGE_JSON.value)
    return

  const { x = 0, y = 0, width = 0, height = 0 } = CURRENT_CHANGE_JSON.value
  switch (nv) {
    case ColorType.lineGradient:
      lineGradientForm.value.positions = [x, y, width + x, height + y]
      break
    case ColorType.conicGradient:
      conicGradientForm.value.positions = [360, x + width / 2, y + height / 2]
      break
    case ColorType.radialGradient:
      radialGradientForm.value.positions = [x, y, width, width + x, height + y, height]
      break
  }
}, { immediate: true })
watchEffect(() => {
  switch (colorType.value) {
    case ColorType.pure:
      modelValue.value = pureForm.value
      break
    case ColorType.lineGradient:
      modelValue.value = {
        ...lineGradientForm.value,
      }
      break
    case ColorType.conicGradient:
      modelValue.value = {
        ...conicGradientForm.value,
      }
      break
    case ColorType.radialGradient:
      modelValue.value = {
        ...radialGradientForm.value,
      }
      break
    case ColorType.pattern:
      modelValue.value = patternForm.value
      break
  }
})
</script>

<template>
  <div>
    <div class="font-normal mb-2">
      <button
        v-for="v in colorTypeOptions" :key="v.value"
        class="px-sm py-1 mr-2 mb-1 rounded-md text-3 border-(1 slate-2) "
        :class="[colorType === v.value ? 'bg-teal-6 text-white' : '']"
        @click="colorType = v.value"
      >
        {{ v.label }}
      </button>
    </div>
    <input v-if="colorType === ColorType.pure" v-model="pureForm.color" type="color" w-full>
    <template v-else-if="colorType === ColorType.lineGradient">
      <div class="grid grid-cols-2 gap-sm">
        <input
          v-for="tip, key in ['x0', 'y0', 'x1', 'y1']"
          :key="key"
          v-model.number="lineGradientForm.positions[key]"
          class="input"
          type="text"
          inputmode="numeric"
          pattern="\d*"
          :placeholder="tip"
          :title="tip"
        >
      </div>
      <UtilsColorRange v-model="lineGradientForm.colors" mt-sm />
    </template>
    <template v-else-if="colorType === ColorType.conicGradient">
      <div class="grid grid-cols-3 gap-sm">
        <input
          v-for="tip, key in [t('setting.angle'), 'x', 'y']"
          :key="key"
          v-model.number="conicGradientForm.positions[key]"
          :placeholder="tip"
          :title="tip"
          class="input"
          type="text"
          inputmode="numeric"
          pattern="\d*"
        >
      </div>
      <UtilsColorRange v-model="conicGradientForm.colors" mt-sm />
    </template>
    <template v-else-if="colorType === ColorType.radialGradient">
      <div class="grid grid-cols-3 gap-3">
        <input
          v-for="tip, key in ['x0', 'y0', 'r0', 'x1', 'y1', 'r1']"
          :key="key"
          v-model.number="radialGradientForm.positions[key]"
          :placeholder="tip"
          :title="tip"
          class="input"
          type="text"
          inputmode="numeric"
          pattern="\d*"
        >
      </div>
      <UtilsColorRange v-model="radialGradientForm.colors" mt-sm />
    </template>
    <div v-else-if="colorType === ColorType.pattern">
      <div class="px-3">
        <div class="mb-2">
          {{ t('setting.imagePath') }}
        </div>
        <UtilsFile v-model="patternForm.src" class="px-3 " />
        <img v-parse-url w-20 h-20 block m-auto mt-2 :src="patternForm.src">
      </div>
      <div class="form-item">
        <label>{{ t('setting.repeat') }}</label>
        <select v-model="patternForm.repeat" class="input">
          <option
            v-for="v in ['repeat', 'repeat-x', 'repeat-y', 'no-repeat']"
            :key="v"
            :value="v"
          >
            {{ v }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<style lang='scss' scoped>

</style>
