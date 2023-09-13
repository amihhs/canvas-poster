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

const baseDefault: PosterBaseJson = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
}
const baseFont: FontConfig = {
  fontSize: 14,
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

const type = ref(PosterType.text)
const { addJson } = useControlJson()
const { setCurrentChangeJson } = useCurrentChangeJson()
function addHandler() {
  const item = addJson(baseForm[type.value])
  setCurrentChangeJson(item)
}
</script>

<template>
  <div class="py-sm">
    <form action="">
      <div class="form-item">
        <label class="label">类型</label>
        <select v-model="type" class="select">
          <option v-for="v in typeSelects" :key="v.value" :value="v.value">
            {{ v.type }}
          </option>
        </select>
      </div>
    </form>
    <button
      class="mt-10 text-center block w-full tracking-widest text-lg font-bold py-2 rounded-md bg-blue-5 text-white"
      @click="addHandler()"
    >
      添加
    </button>
  </div>
</template>

<style lang='scss' scoped>
@import url('@/assets/styles/add.scss');
</style>
