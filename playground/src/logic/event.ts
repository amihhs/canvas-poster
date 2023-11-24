/* eslint-disable no-console */
import { v4 as uuidv4 } from 'uuid'
import type {
  PosterJson,
} from '@amihhs/canvas-poster'
import type { CanvasControlLocationJson, DrawJson } from '@/interface'

export const EXCLUDE_SELECT_ID = ['baseSetting']
export function useCurrentChangeJson() {
  function setCurrentChangeJson(data: DrawJson | null) {
    CURRENT_CHANGE_JSON.value = data
  }
  function setJsonChangeDrawerVisible(visible: boolean) {
    CHANGE_JSON_DRAWER_VISIBLE.value = visible
  }
  function showChangeJson(index: number, visible = true) {
    const data = POSTER_JSON.value[index]

    setCurrentChangeJson(data)
    setJsonChangeDrawerVisible(visible)
  }

  return {
    setCurrentChangeJson,
    setJsonChangeDrawerVisible,
    showChangeJson,
  }
}

export function useControlJson() {
  function deleteJson(index: number, _confirm = false) {
    // if (_confirm && !window.confirm('确定删除吗？')) // eslint-disable-line no-alert
    //   return
    POSTER_JSON.value.splice(index, 1)
  }

  function changeJson<KEY extends keyof DrawJson>(index: number, key: KEY, data: DrawJson[KEY]): DrawJson {
    POSTER_JSON.value[index][key] = data

    return POSTER_JSON.value[index]
  }

  function updateJson(index: number, data: DrawJson): DrawJson {
    POSTER_JSON.value.splice(index, 1, data)
    return data
  }

  function addJson(data: PosterJson, index?: number): DrawJson {
    const id = uuidv4()
    const item = { ...data, id }
    if (index === undefined || POSTER_JSON.value.length === 0)
      POSTER_JSON.value.push(item)
    else
      POSTER_JSON.value.splice(index ?? POSTER_JSON.value.length, 0, item)

    return item
  }

  return {
    addJson,
    changeJson,
    updateJson,
    deleteJson,
  }
}

export function canvasBindEvent(canvas: HTMLCanvasElement) {
  function initHandler(canvas: HTMLCanvasElement) {
    if (!canvas)
      return console.error('canvas is null')
    _draw()

    useEventListener('click', (e) => {
      const target = e.target as HTMLElement
      console.log('click', target, target.tagName)
      if (target.tagName === 'CANVAS')
        return

      CURRENT_HOVER_KEY.value = null
      CURRENT_CHANGE_JSON.value = null
    })
  }

  function _draw() {
    let keyDown = false
    let item: CanvasControlLocationJson | null = null

    // const { setCurrentChangeJson } = useCurrentChangeJson()
    const downHandler = (e: MouseEvent) => {
      if (!CURRENT_HOVER_KEY.value) {
        CURRENT_HOVER_KEY.value = null
        CURRENT_CHANGE_JSON.value = null
        return
      }

      keyDown = true
      const { key, index } = CURRENT_HOVER_KEY.value
      // console.log('downHandler', e, POSTER_JSON)

      item = selectItem(key || '') || null
      CURRENT_CHANGE_JSON.value = POSTER_JSON.value[index]

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

      const { changeJson } = useControlJson()
      changeJson(index, 'x', item.x + offsetX)
      changeJson(index, 'y', item.y + offsetY)

      console.log(unref(CURRENT_CHANGE_JSON)?.x, unref(CURRENT_CHANGE_JSON)?.y)
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
