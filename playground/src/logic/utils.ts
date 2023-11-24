import { PosterType } from '@amihhs/canvas-poster'
import type { CanvasControlLocationJson, DrawJson } from '@/interface'
import { toBase64 } from '@/shared'

export function isCanvasBgRect(data: CanvasControlLocationJson, canvas: HTMLCanvasElement) {
  return data.x === 0
    && data.y === 0
    && data.width === canvas?.clientWidth
    && data.height === canvas?.clientHeight
    && data.type === PosterType.rect
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

    if (x > data.x && x < data.x + data.width && y > data.y && y < data.y + data.height)
      items.push({ key: _, index: data.sort })
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
