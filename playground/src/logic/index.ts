import { Poster } from '@amihhs/canvas-poster'
import type { BaseSetting, DrawJson } from '@/interface'

export const baseSettingDefault: BaseSetting = {
  bgColor: '#ffffff',
  canvasWidth: 354,
  canvasHeight: 700,
  dpi: 3,
}
export const POSTER_JSON = useLocalStorage<DrawJson[]>('json', [])

export function globalInitHandler() {
  const canvasRef = ref<HTMLCanvasElement | null>(null)

  const { baseSetting, baseSettingUpdateHandler } = baseSettingHandler()
  const poster = shallowRef<Poster | null>(null)

  function initHandler() {
    if (!canvasRef.value)
      return
    poster.value = new Poster({}, canvasRef.value)
    baseSettingUpdateHandler(poster.value, baseSetting.value)
    canvasBindEvent(canvasRef.value)
  }

  function updateRender() {
    if (!poster.value)
      return
    poster.value.create(unref(POSTER_JSON))
    updateDrawContext(unref(POSTER_JSON))
  }

  watch(canvasRef, initHandler, { immediate: true })
  watch(() => [POSTER_JSON.value, poster.value], updateRender, { deep: true, immediate: true })
  watch(baseSetting, () => {
    if (!poster.value)
      return
    baseSettingUpdateHandler(poster.value, baseSetting.value)
    updateRender()
  }, { deep: true, immediate: true })

  return {
    canvasRef,
    baseSetting,
  }
}

export function baseSettingHandler() {
  const baseSetting = useLocalStorage<BaseSetting>('baseSetting', baseSettingDefault)
  function baseSettingUpdateHandler(posterCxt: Poster | null, baseSetting: BaseSetting): void {
    if (!posterCxt)
      return
    posterCxt.resize({
      width: baseSetting.canvasWidth,
      height: baseSetting.canvasHeight,
      scale: baseSetting.dpi,
    })
  }
  return { baseSetting, baseSettingUpdateHandler }
}

// {
//   id: uuidv4(),
//   type: PosterType.rect,
//   x: 0,
//   y: 0,
//   width: baseSetting.canvasWidth,
//   height: baseSetting.canvasHeight,
//   bgColor: baseSetting.bgColor,
// }, {
//   id: uuidv4(),
//   type: PosterType.text,
//   x: 10,
//   y: 10,
//   textBaseline: 'top',
//   width: 100,
//   height: 100,
//   color: '#000000',
//   text: 'Hello World',
// }, {
//   id: uuidv4(),
//   type: PosterType.text,
//   x: 20,
//   y: 120,
//   textBaseline: 'top',
//   width: 100,
//   height: 100,
//   color: '#000000',
//   text: 'Hello World',
// }
