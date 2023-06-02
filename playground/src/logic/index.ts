import type { PosterJson } from '@amihhs/canvas-poster'
import { Poster, PosterType } from '@amihhs/canvas-poster'
import { CanvasControl } from './event'

export function handler() {
  const canvasRef = ref<HTMLCanvasElement | null>(null)

  const { baseSetting, baseSettingUpdateHandler } = baseSettingHandler()
  const poster = shallowRef<Poster | null>(null)
  const posterControl = shallowRef<CanvasControl | null>(null)

  const json = ref<PosterJson[]>([])

  function initHandler() {
    if (!canvasRef.value)
      return
    poster.value = new Poster({}, canvasRef.value)
    json.value = baseSettingUpdateHandler(poster.value, baseSetting.value) || []
    posterControl.value = new CanvasControl(canvasRef.value, json.value)
  }

  watch(canvasRef, initHandler, { immediate: true })
  watch(baseSetting, () => {
    if (!poster.value)
      return
    json.value = baseSettingUpdateHandler(poster.value, baseSetting.value) || []
  }, { deep: true, immediate: true })

  watch(json, () => {
    if (!poster.value || !posterControl.value)
      return
    poster.value.create(json.value)
    posterControl.value.updateDrawContext(json.value)
  }, { deep: true, immediate: true })

  return {
    canvasRef,
    baseSetting,
  }
}

export interface BaseSetting {
  bgColor: string
  canvasWidth: number
  canvasHeight: number
  dpi: number
}
export function baseSettingHandler() {
  const baseSetting = ref<BaseSetting>({
    bgColor: '#ffffff',
    canvasWidth: 354,
    canvasHeight: 700,
    dpi: 2,
  })
  function baseSettingUpdateHandler(posterCxt: Poster | null, baseSetting: BaseSetting) {
    if (!posterCxt)
      return
    posterCxt.resize({ width: baseSetting.canvasWidth, height: baseSetting.canvasHeight, scale: baseSetting.dpi })
    return [{
      type: PosterType.rect,
      x: 0,
      y: 0,
      width: baseSetting.canvasWidth,
      height: baseSetting.canvasHeight,
      bgColor: baseSetting.bgColor,
    }, {
      type: PosterType.text,
      x: 10,
      y: 10,
      textBaseline: 'top',
      width: 100,
      height: 100,
      color: '#000000',
      text: 'Hello World',
    }] as PosterJson[]
  }
  return { baseSetting, baseSettingUpdateHandler }
}
