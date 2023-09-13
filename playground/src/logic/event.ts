/* eslint-disable no-console */
import { PosterType } from '@amihhs/canvas-poster'
import type { DrawJson } from '@/interface'

export type CanvasControlLocationJson = DrawJson & { sort: number }

const defaultChangeContext = {
  x: 0,
  y: 0,
  item: null as CanvasControlLocationJson | null,
}
export const drawContextMap = ref<Map<string, CanvasControlLocationJson>>(new Map())
export const currentHoverKey = ref<{ key: string;index: number } | null>(null)
/**
 * @description 当前正在修改的json
 */
export const currentChangeJson = ref<DrawJson | null>(null)
/**
 * @description 当前正在修改的json的可见性
 */
export const jsonChangeDrawerVisible = ref<boolean>(false)

export const changeStartContext = ref(Object.assign({}, defaultChangeContext))

export function canvasBindEvent(canvas: HTMLCanvasElement) {
  function initHandler(canvas: HTMLCanvasElement) {
    if (!canvas)
      return console.error('canvas is null')
    useEventListener(canvas, 'mousemove', _mouseMoveHandler)
    _draw()
  }

  function _draw() {
    let keyDown = false
    let item: CanvasControlLocationJson | null = null

    const downHandler = (e: MouseEvent) => {
      if (!currentHoverKey.value)
        return
      keyDown = true
      const { key, index } = currentHoverKey.value
      // console.log('downHandler', e, POSTER_JSON)

      item = selectItem(key || '') || null
      currentChangeJson.value = POSTER_JSON.value[index]

      changeStartContextHandler({
        x: e.offsetX,
        y: e.offsetY,
        item: Object.assign({}, item),
      })
    }

    const moveHandler = (e: MouseEvent) => {
      const { x, y, item } = changeStartContext.value

      if (!keyDown || !item || !currentHoverKey.value)
        return

      const { index } = currentHoverKey.value

      const offsetX = e.offsetX - x
      const offsetY = e.offsetY - y

      const { changeJson } = useControlJson()
      changeJson(index, 'x', item.x + offsetX)
      changeJson(index, 'y', item.y + offsetY)

      console.log(unref(currentChangeJson)?.x, unref(currentChangeJson)?.y)
    }

    const upHandler = (e: MouseEvent) => {
      console.log('upHandler', e)
      keyDown = false
    }

    useEventListener(canvas, 'mousedown', downHandler)
    useEventListener(canvas, 'mousemove', moveHandler)
    useEventListener(canvas, 'mouseup', upHandler)

    useEventListener(canvas, 'touchstart', downHandler)
    useEventListener(canvas, 'touchmove', moveHandler)
    useEventListener(canvas, 'touchend', upHandler)
  }
  function _mouseMoveHandler(e: MouseEvent) {
    const key = findCurrentHoveItemKey(e.offsetX, e.offsetY)
    currentHoverKey.value = key || null
    // console.log({ x: e.offsetX, y: e.offsetY }, this.currentHoverKey)
  }

  initHandler(canvas)
}

export function changeStartContextHandler(data: typeof changeStartContext.value) {
  changeStartContext.value = data
}

export function useCurrentChangeJson() {
  function setCurrentChangeJson(data: DrawJson | null) {
    currentChangeJson.value = data
  }
  function setJsonChangeDrawerVisible(visible: boolean) {
    jsonChangeDrawerVisible.value = visible
  }
  function showChangeJson(index: number, visible = true) {
    const data = POSTER_JSON.value[index]

    setCurrentChangeJson(data)
    setJsonChangeDrawerVisible(visible)
  }

  return {
    currentChangeJson,
    jsonChangeDrawerVisible,
    setCurrentChangeJson,
    setJsonChangeDrawerVisible,
    showChangeJson,
  }
}

export function findCurrentHoveItemKey(x: number, y: number) {
  const items = []
  for (const [_, data] of unref(drawContextMap)) {
    if (x > data.x && x < data.x + data.width && y > data.y && y < data.y + data.height)
      items.push({ key: _, index: data.sort })
  }
  if (!items.length)
    return null
  return items.sort((a, b) => b.index - a.index)[0]
}

export function selectItem(key: string) {
  const item = unref(drawContextMap).get(key)
  return item
}

export function updateDrawContext(json: DrawJson[]) {
  diffUpdateDrawContext(json)
}
export function isCanvasBgRect(data: CanvasControlLocationJson, canvas: HTMLCanvasElement) {
  return data.x === 0
  && data.y === 0
  && data.width === canvas?.clientWidth
  && data.height === canvas?.clientHeight
  && data.type === PosterType.rect
}

export function toBase64(string: string) {
  return btoa(string)
}

function diffUpdateDrawContext(json: DrawJson[]) {
  const { newJsonMap } = diff(unref(drawContextMap), json)
  drawContextMap.value = newJsonMap
}

function diff(oldJsonMap: Map<string, DrawJson>, newJson: DrawJson[]) {
  const diffJson: CanvasControlLocationJson[] = []
  const newJsonMap = new Map<string, CanvasControlLocationJson>()
  newJson.forEach((item, index) => {
    const data = { ...item, sort: index }
    newJsonMap.set(`${toBase64(JSON.stringify(data))}`, data)
  })

  for (const [key] of newJsonMap) {
    if (oldJsonMap.has(key))
      continue
    diffJson.push(newJsonMap.get(key)!)
  }

  return {
    diffJson,
    newJsonMap,
    removeJsonKeys: Array.from(oldJsonMap.keys()).filter(key => !newJsonMap.has(key)),
  }
}
