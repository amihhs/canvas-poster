<script setup lang='ts'>
import type {
  FontConfig,
  PosterBaseJson,
  PosterBaseText,
  PosterJson,
  PosterLine,
  PosterRect,
  PosterText,
  ShadowConfig,
} from '@amihhs/canvas-poster'
import { PosterType } from '@amihhs/canvas-poster'
import { ADD_FROM_KEY } from '@/logic/const'

const baseDefault: PosterBaseJson = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
}
const baseFont: FontConfig = {
  fontSize: 12,
  fontFamily: '',
  fontWeight: 'normal',
  fontStyle: 'normal',
  lineHeight: 1,
}
const baseShadow: ShadowConfig = {
  shadowColor: '#000',
  shadowBlur: undefined,
  shadowOffsetX: undefined,
  shadowOffsetY: undefined,
}
const baseText: PosterBaseText = {
  text: 'Hello World',
  ...baseFont,
  color: '#000',
  textAlign: 'left',
  textBaseline: 'top',
  letterSpacing: 1,
  ...baseShadow,
  ...baseDefault,
}

const lineDefaultForm: PosterLine = {
  type: PosterType.line,
  ...baseDefault,
  paths: [],
  color: '#000',
  lineWidth: 1,
  lineDash: [0, 0],
}
const rectDefaultForm: PosterRect = {
  type: PosterType.rect,
  ...baseDefault,
  ...baseShadow,
  boxRadius: 0,
  bgColor: '#000',
  opacity: 1,
}
const textDefaultForm: PosterText = {
  type: PosterType.text,
  ...baseText,
}

const typeSelects = [
  { type: 'Line', value: PosterType.line },
  { type: 'Rect', value: PosterType.rect },
  { type: 'Text', value: PosterType.text },
  { type: 'TextEllipsis', value: PosterType.textEllipsis },
  { type: 'Image', value: PosterType.image },
] as const

const baseForm = {
  line: lineDefaultForm,
  rect: rectDefaultForm,
  text: textDefaultForm,
  textEllipsis: lineDefaultForm,
  image: lineDefaultForm,
} as Record<PosterType, PosterJson>

const components = {
  line: defineAsyncComponent(() => import('@/components/add/line.vue')),
  rect: defineAsyncComponent(() => import('@/components/add/rect.vue')),
  text: defineAsyncComponent(() => import('@/components/add/text.vue')),
  textEllipsis: defineAsyncComponent(() => import('@/components/add/text-ellipsis.vue')),
  image: defineAsyncComponent(() => import('@/components/add/image.vue')),
} as Record<PosterType, Component>

const formData = ref({
  type: PosterType.text,
})
watch(() => formData.value.type, (type) => {
  const currentKeys = Object.keys(formData.value)
  const needKeys = Object.keys(baseForm[type])
  switch (type) {
    case PosterType.line:
      provide(ADD_FROM_KEY, lineDefaultForm)
      break
  }
})
provide(ADD_FROM_KEY, formData)
</script>

<template>
  <div class="py-sm">
    <form action="">
      <div class="form-item">
        <label class="label">类型</label>
        <select v-model="formData.type" class="select">
          <option v-for="v in typeSelects" :key="v.value" :value="v.value">
            {{ v.type }}
          </option>
        </select>
      </div>
      <component :is="components[formData.type]" />
    </form>
  </div>
</template>

<style lang='scss' scoped>
@import url('@/assets/styles/add.scss');
</style>
