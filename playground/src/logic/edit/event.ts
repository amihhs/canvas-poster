/* eslint-disable no-console */
import { PosterType } from '@amihhs/canvas-poster'
import type { CanvasControlLocationJson, DrawJson } from '@/interface'

export const EXCLUDE_SELECT_ID = ['baseSetting']
export function useCurrentChangeJson(posterJson: Ref<DrawJson[]> = ref([])) {
  function setCurrentChangeJson(data: DrawJson | null) {
    CURRENT_CHANGE_JSON.value = data
  }
  function setJsonChangeDrawerVisible(visible: boolean) {
    CHANGE_JSON_DRAWER_VISIBLE.value = visible
  }
  function showChangeJson(index: number, visible = true) {
    const data = posterJson.value[index]
    console.log('showChangeJson', data)
    setCurrentChangeJson(data)
    setJsonChangeDrawerVisible(visible)
  }

  return {
    setCurrentChangeJson,
    setJsonChangeDrawerVisible,
    showChangeJson,
  }
}

export function changeStartContextHandler(data: typeof CHANGE_START_CONTEXT.value) {
  CHANGE_START_CONTEXT.value = data
}

export function selectItem(key: string) {
  const item = unref(DRAW_CONTEXT_MAP).get(key)
  return item
}

export function updateDrawContext(json: DrawJson[]) {
  const { newJsonMap } = diff(unref(DRAW_CONTEXT_MAP), json)
  DRAW_CONTEXT_MAP.value = newJsonMap
}

export function canvasBindEvent(
  canvas: HTMLCanvasElement,
  posterJson: Ref<DrawJson[]> = ref([]),
) {
  const { changeJson } = useControlJson(posterJson)

  function initHandler(canvas: HTMLCanvasElement) {
    if (!canvas)
      return console.error('canvas is null')
    _draw()

    useEventListener('mousedown', (e) => {
      const target = e.target as HTMLElement
      // console.log('click', target, target.tagName)
      if (target.tagName === 'DIV' && target.id === 'container') {
        CURRENT_HOVER_KEY.value = null
        CURRENT_CHANGE_JSON.value = null
      }
    })
  }
  function _draw() {
    let keyDown = false
    let item: CanvasControlLocationJson | null = null

    const downHandler = (e: MouseEvent) => {
      if (!CURRENT_HOVER_KEY.value) {
        CURRENT_HOVER_KEY.value = null
        CURRENT_CHANGE_JSON.value = null
        return
      }

      keyDown = true
      const { key, index } = CURRENT_HOVER_KEY.value

      item = selectItem(key || '') || null
      CURRENT_CHANGE_JSON.value = posterJson.value[index]

      console.log('down', posterJson, CURRENT_CHANGE_JSON.value)

      const id = CURRENT_CHANGE_JSON.value.id
      if (EXCLUDE_SELECT_ID.includes(id)) {
        CURRENT_CHANGE_JSON.value = null
        return
      }

      changeStartContextHandler({
        x: e.offsetX,
        y: e.offsetY,
        item: Object.assign({}, item),
      })
    }

    const moveHandler = (e: MouseEvent) => {
      if (!keyDown) {
        const key = findCurrentHoveItemKey(unref(DRAW_CONTEXT_MAP), e.offsetX, e.offsetY)
        CURRENT_HOVER_KEY.value = key || null
      }

      const { x, y, item } = CHANGE_START_CONTEXT.value

      if (!keyDown || !item || !CURRENT_HOVER_KEY.value)
        return
      const { index } = CURRENT_HOVER_KEY.value

      const offsetX = e.offsetX - x
      const offsetY = e.offsetY - y
      if (item.type !== PosterType.line) {
        const itemX = parseInput(item.x) + offsetX
        const itemY = parseInput(item.y) + offsetY
        changeJson(index, 'x', itemX)
        changeJson(index, 'y', itemY)
        console.log(item.x, item.y)
      }
    }

    const upHandler = () => {
      keyDown = false
    }

    const leaveHandler = () => {
      keyDown = false
    }

    useEventListener(canvas, 'mouseleave', leaveHandler)

    useEventListener(canvas, 'mousedown', downHandler)
    useEventListener(canvas, 'mousemove', moveHandler)
    useEventListener(canvas, 'mouseup', upHandler)

    useEventListener(canvas, 'touchstart', downHandler)
    useEventListener(canvas, 'touchmove', moveHandler)
    useEventListener(canvas, 'touchend', upHandler)
  }

  initHandler(canvas)
}
