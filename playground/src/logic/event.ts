/* eslint-disable no-console */
import { PosterType } from '@amihhs/canvas-poster'
import type { DrawJson } from '@/interface'

export type CanvasControlLocationJson = DrawJson & { sort: number }
export class CanvasControl {
  canvas: HTMLCanvasElement | null = null
  context: CanvasRenderingContext2D | null = null
  drawContext: DrawJson[] = []
  drawContextMap = new Map<string, CanvasControlLocationJson>()

  currentHoverKey: { key: string; index: number } | null = null
  constructor(canvas: HTMLCanvasElement, drawContext: DrawJson[] = []) {
    this.canvas = canvas
    this.context = canvas.getContext('2d')!
    this.drawContext = drawContext
    this._initHandler()
  }

  protected _initHandler = () => {
    if (!this.canvas)
      return console.error('canvas is null')
    useEventListener(this.canvas, 'mousemove', this._mouseMoveHandler)
    useEventListener(this.canvas, 'click', this._clickHandler)
  }

  protected _mouseMoveHandler = (e: MouseEvent) => {
    // console.log({ x: e.offsetX, y: e.offsetY })
    const key = this.findCurrentHoveItemKey(e.offsetX, e.offsetY)
    this.currentHoverKey = key || null
  }

  protected _clickHandler = (e: MouseEvent) => {
    const key = this.findCurrentHoveItemKey(e.offsetX, e.offsetY)
    if (!key)
      return
    this.selectItem(key.key)
  }

  selectItem = (key: string) => {
    const item = this.drawContextMap.get(key)
    console.log(item)
  }

  updateDrawContext = (json: DrawJson[]) => {
    this.diffUpdateDrawContext(json)
  }

  diffUpdateDrawContext = (json: DrawJson[]) => {
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
      // if (this.isCanvasBgRect(data))
      //   continue
      if (x > data.x && x < data.x + data.width && y > data.y && y < data.y + data.height)
        items.push({ key: _, index: data.sort })
    }
    if (!items.length)
      return null
    return items.sort((a, b) => b.index - a.index)[0]
  }
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

export function toBase64(string: string) {
  return btoa(string)
}
