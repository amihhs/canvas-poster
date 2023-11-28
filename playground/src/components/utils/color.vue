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
const colorRange = ref<RangeColor[]>()

const { x = 0, y = 0, width = 0, height = 0 } = CURRENT_CHANGE_JSON.value || {}

const pureForm = ref<PureColor>({
  type: ColorType.pure,
  color: '#000000',
})
const lineGradientForm = ref<LineGradientColor>({
  type: ColorType.lineGradient,
  positions: [x, y, width + x, height + y], // x0, y0, x1, y1
  colors: [],
})
const conicGradientForm = ref<ConicGradientColor>({
  type: ColorType.conicGradient,
  positions: [360, x + width / 2, y + height / 2], // startAngle, x, y
  colors: [],
})
const radialGradientForm = ref<RadialGradientColor>({
  type: ColorType.radialGradient,
  positions: [x, y, width, width + x, height + y, height], // x0, y0, r0, x1, y1, r1
  colors: [],
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
      colorRange.value = modelValue.value.colors
      break
    case ColorType.conicGradient:
      conicGradientForm.value = modelValue.value
      colorRange.value = modelValue.value.colors
      break
    case ColorType.radialGradient:
      radialGradientForm.value = modelValue.value
      colorRange.value = modelValue.value.colors
      break
    case ColorType.pattern:
      patternForm.value = modelValue.value
      break
  }

  if (!colorType.value)
    colorType.value = modelValue.value.type
  if (!colorRange.value)
    colorRange.value = defaultColorRange
}

watchEffect(() => {
  !colorType.value && format()

  const range: RangeColor[] = colorRange.value || defaultColorRange

  switch (colorType.value) {
    case ColorType.pure:
      modelValue.value = pureForm.value
      break
    case ColorType.lineGradient:
      modelValue.value = {
        ...lineGradientForm.value,
        colors: range,
      }
      break
    case ColorType.conicGradient:
      modelValue.value = {
        ...conicGradientForm.value,
        colors: range,
      }
      break
    case ColorType.radialGradient:
      modelValue.value = {
        ...radialGradientForm.value,
        colors: range,
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
    <div v-if="colorType === ColorType.pure" class="grid place-content-center">
      <input v-model="pureForm.color" type="color">
    </div>
    <div v-else-if="colorType === ColorType.lineGradient" class="grid grid-cols-2 gap-sm">
      <input
        v-for="tip, key in ['x0', 'y0', 'x1', 'y1']"
        :key="key"
        v-model="lineGradientForm.positions[key]"
        class="input"
        type="text"
        inputmode="numeric"
        pattern="\d*"
        :placeholder="tip"
        :title="tip"
      >
    </div>
    <div v-else-if="colorType === ColorType.conicGradient" class="grid grid-cols-3 gap-sm">
      <input
        v-for="tip, key in [t('setting.angle'), 'x', 'y']"
        :key="key"
        v-model="conicGradientForm.positions[key]"
        :data-key="conicGradientForm.positions[key]"
        :placeholder="tip"
        :title="tip"
        class="input"
        type="text"
        inputmode="numeric"
        pattern="\d*"
      >
    </div>
    <div v-else-if="colorType === ColorType.radialGradient" class="grid grid-cols-3 gap-3">
      <input
        v-for="tip, key in ['x0', 'y0', 'r0', 'x1', 'y1', 'r1']"
        :key="key"
        v-model="radialGradientForm.positions[key]"
        :placeholder="tip"
        :title="tip"
        class="input"
        type="text"
        inputmode="numeric"
        pattern="\d*"
      >
    </div>
    <div v-else-if="colorType === ColorType.pattern">
      <div class="form-item">
        <label>{{ t('setting.imagePath') }}</label>
        <input v-model="patternForm.src" class="input" type="text">
      </div>
      <div class="form-item">
        <label>{{ t('setting.repeat') }}</label>
        <select v-model="patternForm.repeat" class="input">
          <option value="repeat">
            repeat
          </option>
          <option value="repeat-x">
            repeat-x
          </option>
          <option value="repeat-y">
            repeat-y
          </option>
          <option value="no-repeat">
            no-repeat
          </option>
        </select>
      </div>
    </div>
    <UtilsColorRange
      v-if="colorType && ![ColorType.pure, ColorType.pattern].includes(colorType)"
      v-model="colorRange" mt-sm
    />
  </div>
</template>

<style lang='scss' scoped>

</style>
