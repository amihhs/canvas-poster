import type { PosterLine } from '@amihhs/canvas-poster'
import { PosterType, formatItem } from '@amihhs/canvas-poster'
import type { CanvasControlLocationJson, DrawJson } from '@/interface'
import { toBase64 } from '@/shared'

function isPointInLine(paths: PosterLine['paths'], x: number, y: number) {
  const { length } = paths
  let isPointInLine = false
  for (let i = 0; i < length - 1; i++) {
    const [x1, y1] = paths[i]
    const [x2, y2] = paths[i + 1]
    const slope = (y2 - y1) / (x2 - x1)
    const diffY = slope * x + y1 - slope * x1
    const offset = 5
    if (diffY + offset > y && diffY - offset < y) {
      isPointInLine = true
      break
    }
  }
  return isPointInLine
}

export const BASE_CONFIG_KEY = ['x', 'y', 'width', 'height'] as const
export function isBaseConfigKey(key: string): key is typeof BASE_CONFIG_KEY[number] {
  return BASE_CONFIG_KEY.includes(key as any)
}

export function isCanvasBgRect(data: CanvasControlLocationJson, canvas: HTMLCanvasElement) {
  return data.type === PosterType.rect
    && data.x === 0
    && data.y === 0
    && data.width === canvas?.clientWidth
    && data.height === canvas?.clientHeight
}

export function findCurrentHoveItemKey(
  DRAW_CONTEXT_MAP: Map<string, CanvasControlLocationJson>,
  x: number,
  y: number,
) {
  const items = []
  for (const [_, data] of unref(DRAW_CONTEXT_MAP)) {
    if (EXCLUDE_SELECT_ID.includes(data.id))
      continue

    const item = formatItem(data)
    if (item.type !== PosterType.line) {
      const { x: itemX, y: itemY, width: itemW, height: itemH } = item

      if (x > itemX && x < itemX + itemW && y > itemY && y < itemY + itemH)
        items.push({ key: _, index: data.sort })
    }

    else if (item.type === PosterType.line && isPointInLine(item.paths, x, y)) {
      items.push({ key: _, index: data.sort })
    }
  }

  if (!items.length)
    return null
  return items.sort((a, b) => b.index - a.index)[0]
}

export function diff(oldJsonMap: Map<string, DrawJson>, newJson: DrawJson[]) {
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
