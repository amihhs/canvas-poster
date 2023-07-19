import { Poster, PosterType } from '@amihhs/canvas-poster'
import { v4 as uuidv4 } from 'uuid'
import { CanvasControl } from './event'
import type { BaseSetting, DrawJson } from '@/interface'

export function handler() {
  const canvasRef = ref<HTMLCanvasElement | null>(null)

  const { baseSetting, baseSettingUpdateHandler } = baseSettingHandler()
  const poster = shallowRef<Poster | null>(null)
  const posterControl = shallowRef<CanvasControl | null>(null)

  const json = reactive<DrawJson[]>([])

  function initHandler() {
    if (!canvasRef.value)
      return
    poster.value = new Poster({}, canvasRef.value)
    json.splice(0, json.length, ...baseSettingUpdateHandler(poster.value, baseSetting.value) || [])
    posterControl.value = new CanvasControl(canvasRef.value, json)
  }

  watch(canvasRef, initHandler, { immediate: true })
  watch(baseSetting, () => {
    if (!poster.value)
      return
    json.splice(0, json.length, ...baseSettingUpdateHandler(poster.value, baseSetting.value) || [])
  }, { deep: true, immediate: true })

  watch(json, () => {
    if (!poster.value || !posterControl.value)
      return
    poster.value.create(json)
    posterControl.value.updateDrawContext(json)
  }, { deep: true, immediate: true })

  return {
    canvasRef,
    baseSetting,
    json,
  }
}

export const baseSettingDefault: BaseSetting = {
  bgColor: '#ffffff',
  canvasWidth: 354,
  canvasHeight: 700,
  dpi: 2,
}
export function baseSettingHandler() {
  const baseSetting = ref<BaseSetting>(Object.assign(baseSettingDefault, {}))
  function baseSettingUpdateHandler(posterCxt: Poster | null, baseSetting: BaseSetting): DrawJson[] | undefined {
    if (!posterCxt)
      return
    posterCxt.resize({ width: baseSetting.canvasWidth, height: baseSetting.canvasHeight, scale: baseSetting.dpi })
    return [{
      id: uuidv4(),
      type: PosterType.rect,
      x: 0,
      y: 0,
      width: baseSetting.canvasWidth,
      height: baseSetting.canvasHeight,
      bgColor: baseSetting.bgColor,
    }, {
      id: uuidv4(),
      type: PosterType.text,
      x: 10,
      y: 10,
      textBaseline: 'top',
      width: 100,
      height: 100,
      color: '#000000',
      text: 'Hello World',
    }, {
      id: uuidv4(),
      type: PosterType.text,
      x: 20,
      y: 120,
      textBaseline: 'top',
      width: 100,
      height: 100,
      color: '#000000',
      text: 'Hello World',
    }]
  }
  return { baseSetting, baseSettingUpdateHandler }
}
