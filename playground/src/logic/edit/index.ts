import type { Color, PosterInstance } from '@amihhs/canvas-poster'
import { ColorType, PosterType, createPoster, isCustomColor } from '@amihhs/canvas-poster'
import { v4 as uuidv4 } from 'uuid'
import type { BaseSetting, DrawJson, PosterJsonDB } from '@/interface'

const transformCache = new Map<string, string>()
async function transformSource(posterJson: DrawJson[]) {
  const oldJson = unref(posterJson) || []
  const json = []
  const promises = []

  async function replace(src: string, cb: (url: string) => void = () => {}) {
    if (transformCache.has(src)) {
      const url = transformCache.get(src) as string
      cb(url)
      return
    }

    const url = await parseSourceUrl(src)
    transformCache.set(src, url)
    cb(url)
  }

  for (let i = 0; i < oldJson.length; i++) {
    const item = JSON.parse(JSON.stringify(oldJson[i])) as DrawJson
    if (item.type === 'image' && item.src.startsWith('image|')) {
      promises.push(replace(item.src, src => item.src = src))
    }
    else if (item.type === PosterType.rect || item.type === PosterType.text) {
      const keys = {
        [PosterType.rect]: ['bgColor'],
        [PosterType.text]: ['color', 'strokeColor'],
      }
      for (const key of keys[item.type]) {
        // @ts-expect-error eslint-disable-line ts/ban-ts-comment
        const color = item[key] as Color
        if (!color || !isCustomColor(color))
          continue
        if (color.type === ColorType.pattern)
          promises.push(replace(color.src, src => color.src = src))
      }
    }

    json.push(item)
  }
  await Promise.all(promises)
  return json
}

function transformPresetValue(posterJson: DrawJson[]) {
  const oldJson = unref(posterJson) || []
  const json: DrawJson[] = []

  for (let i = 0; i < oldJson.length; i++) {
    const item = JSON.parse(JSON.stringify(oldJson[i])) as DrawJson
    if (item.type !== PosterType.line) {
      for (const key of Object.keys(item)) {
        if (['type', 'id'].includes(key))
          continue

        // @ts-expect-error eslint-disable-line ts/ban-ts-comment
        const value = parsePresetValue({ value: item[key], json: oldJson })
        if (Number.isNaN(Number(value)))
        // @ts-expect-error eslint-disable-line ts/ban-ts-comment
          item[key] = value
        else
        // @ts-expect-error eslint-disable-line ts/ban-ts-comment
          item[key] = Number(value)
      }
    }

    json.push(item)
  }

  // eslint-disable-next-line no-console
  console.log('transformPresetValue', json, oldJson)
  return json
}

export function posterDetailHandler() {
  const route = useRoute()
  const state = ref<'init' | 'null' | 'success'>('init')
  const posterId = computed(() => Number(route.query.id as string))
  const posterJson = ref<DrawJson[]>([])
  const baseSetting = ref<BaseSetting>(Object.assign({}, baseSettingDefault))

  const { canvasRef, posterInstance, createPosterInitHandler } = createPosterHandler()

  async function updateRender() {
    if (!posterInstance.value)
      return

    const { context, render } = posterInstance.value

    if (state.value === 'success')
      updatePosterHandler()
    // transform source url
    let json = await transformSource(posterJson.value)

    json = transformPresetValue(json)

    render(context, json)
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
    baseSetting.value = Object.assign({}, baseSettingDefault, poster.base)
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

  let stops: (() => void)[] | null = null
  function addWatchHandler() {
    stops = [
      watch(posterId, getPosterHandler),
      watch(canvasRef, () => {
        if (!canvasRef.value)
          return

        canvasBindEvent(canvasRef.value, posterJson)
        createPosterInitHandler(baseSetting.value)
      }, { immediate: true }),
      watch(posterJson, updateRender, { deep: true, immediate: true }),
      watch(baseSetting, () => {
        if (!posterInstance.value)
          return
        baseSettingUpdateHandler(posterInstance.value, baseSetting.value)
        updateRender()
      }, { deep: true }),
    ]
  }

  async function initHandler() {
    await getPosterHandler(posterId.value)
    addWatchHandler()
  }
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
    initHandler,
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
  const posterInstance = ref<PosterInstance | null>(null)

  function createPosterInitHandler(baseSetting: BaseSetting | null) {
    if (!canvasRef.value)
      return

    posterInstance.value = createPoster(baseSetting || { debug: true }, canvasRef.value)
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
  const posterDetail = await getPoster(posterId)
  if (!posterDetail)
    throw new Error('poster not found')

  const url = posterDetail.poster ? posterDetail.poster : `image|${URL.createObjectURL(blob)}`
  await addSource({
    url,
    blob,
  })

  updatePoster(posterId, { poster: url })
}
