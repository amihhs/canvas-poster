import type { PosterInstance } from '@amihhs/canvas-poster'
import { createPoster } from '@amihhs/canvas-poster'
import type { BaseSetting } from '@/interface'

export function globalInitHandler() {
  const canvasRef = ref<HTMLCanvasElement | null>(null)

  const { baseSetting, baseSettingUpdateHandler } = baseSettingHandler()
  const poster = shallowRef<PosterInstance | null>(null)

  function initHandler() {
    if (!canvasRef.value)
      return

    poster.value = createPoster({}, canvasRef.value)
    baseSettingUpdateHandler(poster.value, baseSetting.value)
    canvasBindEvent(canvasRef.value)
  }

  function updateRender() {
    if (!poster.value)
      return
    poster.value.render(poster.value.context, unref(POSTER_JSON))
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
  function baseSettingUpdateHandler(posterCxt: PosterInstance | null, baseSetting: BaseSetting): void {
    if (!posterCxt)
      return
    posterCxt.context.updateConfig({
      width: baseSetting.canvasWidth,
      height: baseSetting.canvasHeight,
      dpi: baseSetting.dpi,
    })
  }
  return { baseSetting, baseSettingUpdateHandler }
}
