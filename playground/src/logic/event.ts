import { PosterType } from '@amihhs/canvas-poster'
import type { PosterJson } from '@amihhs/canvas-poster'

export type CanvasControlLocationJson = PosterJson & { sort: number }
export class CanvasControl {
  canvas: HTMLCanvasElement | null = null
  context: CanvasRenderingContext2D | null = null
  drawContext: PosterJson[] = []
  drawContextMap = new Map<string, CanvasControlLocationJson>()

  constructor(canvas: HTMLCanvasElement, drawContext: PosterJson[] = []) {
    this.canvas = canvas
    this.context = canvas.getContext('2d')!
    this.drawContext = drawContext
    this._initHandler()
  }

  protected _initHandler = () => {
    if (!this.canvas)
      return console.warn('canvas is null')
    useEventListener(this.canvas, 'mousemove', this._mouseMoveHandler)
  }

  protected _mouseMoveHandler = (e: MouseEvent) => {
    // console.log({ x: e.offsetX, y: e.offsetY })
    const key = this.findCurrentHoveItemKey(e.offsetX, e.offsetY)

    if (!key)
      return
    const item = this.drawContextMap.get(key.key)
    // eslint-disable-next-line no-console
    console.log(item)
  }

  updateDrawContext = (json: PosterJson[]) => {
    this.diffUpdateDrawContext(json)
  }

  diffUpdateDrawContext = (json: PosterJson[]) => {
    this.drawContext = json
    const { newJsonMap } = diff(this.drawContextMap, json)
    this.drawContextMap = newJsonMap
  }

  private isCanvasBgRect = (data: CanvasControlLocationJson) => {
    return data.x === 0 && data.y === 0 && data.width === this.canvas?.clientWidth && data.height === this.canvas?.clientHeight && data.type === PosterType.rect
  }

  findCurrentHoveItemKey = (x: number, y: number) => {
    const items = []
    for (const [_, data] of this.drawContextMap) {
      if (this.isCanvasBgRect(data))
        continue
      if (x > data.x && x < data.x + data.width && y > data.y && y < data.y + data.height)
        items.push({ key: _, index: data.sort })
    }
    if (!items.length)
      return null
    return items.sort((a, b) => b.index - a.index)[0]
  }
}

function diff(oldJsonMap: Map<string, PosterJson>, newJson: PosterJson[]) {
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

export function toBase64(string: string) {
  return btoa(string)
}
