/* eslint-disable no-console */
import { v4 as uuidv4 } from 'uuid'
import { ColorType, PosterType, isCustomColor } from '@amihhs/canvas-poster'
import type { Color, PosterJson } from '@amihhs/canvas-poster'
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

const needSyncChangeColorKeys = ['x', 'y', 'width', 'height'] as const
const isNeedSyncChangeColorKey = (key: string): key is typeof needSyncChangeColorKeys[number] => needSyncChangeColorKeys.includes(key as any)
export function syncChangeColor<KEY extends typeof needSyncChangeColorKeys[number]>(
  color: Color,
  item: DrawJson,
  key: KEY,
  data: number,
): Color | undefined {
  if (item.type === PosterType.line)
    return

  const d = Number(data)
  if (
    !color
    || Number.isNaN(d)
    || !isCustomColor(color)
    || [ColorType.pure, ColorType.pattern].includes(color.type)
  )
    return color

  switch (color.type) {
    case ColorType.lineGradient:{
      if (key === 'x') {
        const offset = d - item.x
        color.positions[0] = color.positions[0] + offset
        color.positions[2] = color.positions[2] + offset
      }
      else if (key === 'y') {
        const offset = d - item.y
        color.positions[1] = color.positions[1] + offset
        color.positions[3] = color.positions[3] + offset
      }
      else if (key === 'width') {
        color.positions[2] = color.positions[0] + d
      }
      else if (key === 'height') {
        color.positions[3] = color.positions[1] + d
      }

      return color
    }
    case ColorType.conicGradient:{
      if (key === 'x') {
        const offset = d - item.x
        color.positions[1] = color.positions[1] + offset
      }
      else if (key === 'y') {
        const offset = d - item.y
        color.positions[2] = color.positions[2] + offset
      }
      else if (key === 'width' || key === 'height') {
        const index = key === 'width' ? 1 : 2
        const offset = d - (item[key] as number)
        color.positions[index] = color.positions[index] + offset / 2
      }

      return color
    }
    case ColorType.radialGradient: {
      if (key === 'x') {
        const offset = d - item.x
        color.positions[0] = color.positions[0] + offset
        color.positions[3] = color.positions[3] + offset
      }
      else if (key === 'y') {
        const offset = d - item.y
        color.positions[1] = color.positions[1] + offset
        color.positions[4] = color.positions[4] + offset
      }
      else if (key === 'width' || key === 'height') {
        const index = key === 'width' ? [0, 3] : [2, 4]
        const offset = d - (item[key] as number)
        index.forEach((i) => {
          color.positions[i] = color.positions[i] + offset / 2
        })
      }
      return color
    }
    default:
      return color
  }
}
export function useControlJson(posterJson: Ref<DrawJson[]> = ref([])) {
  function deleteJson(index: number, _confirm = false) {
    // if (_confirm && !window.confirm('确定删除吗？')) // eslint-disable-line no-alert
    //   return
    posterJson.value.splice(index, 1)
  }

  function changeJson(index: number, key: string, data: any): DrawJson {
    // when change x or y ..., sync to change color
    const d = Number(data)
    if (isNeedSyncChangeColorKey(key) && !Number.isNaN(d)) {
      const item = posterJson.value[index]
      if (item.type === PosterType.text) {
        item.color = syncChangeColor(item.color as Color, item, key, data)
        item.strokeColor = syncChangeColor(item.strokeColor as Color, item, key, data)
      }
      else if (item.type === PosterType.rect) {
        item.bgColor = syncChangeColor(item.bgColor as Color, item, key, data)
      }
      else if (item.type === PosterType.line) {
        item.color = syncChangeColor(item.color as Color, item, key, data)
      }
    }

    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error
    posterJson.value[index][key] = data

    return posterJson.value[index]
  }

  function updateJson(index: number, data: DrawJson): DrawJson {
    posterJson.value.splice(index, 1, data)
    return data
  }

  function addJson(data: PosterJson, index?: number): DrawJson {
    const id = uuidv4()
    const item = { ...data, id }
    if (index === undefined || posterJson.value.length === 0)
      posterJson.value.push(item)
    else
      posterJson.value.splice(index ?? posterJson.value.length, 0, item)

    return item
  }

  return {
    addJson,
    changeJson,
    updateJson,
    deleteJson,
  }
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

    // const { setCurrentChangeJson } = useCurrentChangeJson()
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
        changeJson(index, 'x', item.x + offsetX)
        changeJson(index, 'y', item.y + offsetY)
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
