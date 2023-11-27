import type { PosterInstance } from '@amihhs/canvas-poster'
import { createPoster } from '@amihhs/canvas-poster'
import { v4 as uuidv4 } from 'uuid'
import type { BaseSetting, DrawJson, PosterJsonDB } from '@/interface'

export function posterDetailHandler() {
  const route = useRoute()
  const state = ref<'init' | 'null' | 'success'>('init')
  const posterId = computed(() => Number(route.query.id as string))
  const posterJson = ref<DrawJson[]>([])
  const baseSetting = ref<BaseSetting>(Object.assign({}, baseSettingDefault))

  const { canvasRef, posterInstance, createPosterInitHandler } = createPosterHandler()

  function updateRender() {
    if (!posterInstance.value)
      return

    const { context, render } = posterInstance.value

    if (state.value === 'success')
      updatePosterHandler()

    render(context, unref(posterJson) || [])
    updateDrawContext(unref(posterJson) || [])
  }

  async function getPosterHandler(posterId: number) {
    if (!posterId)
      return

    const p = await getPoster(posterId)
    if (!p) {
      state.value = 'null'
      return
    }

    let poster = await getPosterJson(posterId)

    if (!poster)
      poster = await createPosterJson(posterId)

    posterJson.value = poster.json.map((item) => {
      return { ...item, id: item?.id || uuidv4() }
    })
    baseSetting.value = Object.assign({}, poster.base, baseSettingDefault)
    state.value = 'success'
  }

  async function createPosterJson(posterId: number) {
    await addPosterJson({
      posterId,
      json: [],
      base: baseSettingDefault,
    })

    return await getPosterJson(posterId) as PosterJsonDB
  }

  async function updatePosterHandler() {
    await updatePosterJson(posterId.value, {
      json: unref(posterJson) || [],
      base: unref(baseSetting) || baseSettingDefault,
    })
  }
  const stops = [
    watch(posterId, getPosterHandler, { immediate: true }),
    watch(canvasRef, () => {
      if (!canvasRef.value)
        return

      canvasBindEvent(canvasRef.value, posterJson)
      createPosterInitHandler()
      baseSettingUpdateHandler(posterInstance.value, baseSetting.value)
    }, { immediate: true }),
    watch(() => [posterJson.value, posterInstance.value], updateRender, { deep: true, immediate: true }),
    watch(baseSetting, () => {
      if (!posterInstance.value)
        return
      baseSettingUpdateHandler(posterInstance.value, baseSetting.value)
      updateRender()
    }, { deep: true, immediate: true }),
  ]
  onBeforeUnmount(() => {
    stops?.forEach(stop => stop?.())
  })
  return {
    posterId,
    state,
    canvasRef,
    posterJson,
    baseSetting,
    updateRender,
  }
}

export function baseSettingUpdateHandler(posterCxt: PosterInstance | null, baseSetting: BaseSetting | null): void {
  if (!posterCxt)
    return
  const { context } = posterCxt
  context.updateConfig(baseSetting || {})
}

export function createPosterHandler() {
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const posterInstance = shallowRef<PosterInstance | null>(null)

  function createPosterInitHandler() {
    if (!canvasRef.value)
      return

    posterInstance.value = createPoster({}, canvasRef.value)
  }

  return {
    canvasRef,
    posterInstance,
    createPosterInitHandler,
  }
}

/**
 * Update poster cover image
 */
export async function updatePosterPictureHandler(posterId: number, blob: Blob) {
  const poster = await getPoster(posterId)
  if (!poster)
    throw new Error('poster not found')

  const sourceId = poster.poster
  if (sourceId) {
    const b = await getSource(sourceId)
    if (b) {
      updateSource(sourceId, { blob, type: 'image', tags: ['poster'] })
      return
    }
  }
  const id = await addSource({
    blob,
    type: 'image',
    tags: ['poster'],
  })

  id && updatePoster(posterId, { poster: id as number })
}
