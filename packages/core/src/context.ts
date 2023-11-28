import type {
  CalcTextLineCountOptions,
  CanvasElement,
  FontConfig,
  PosterConfig,
  PosterContext,
  SliceText,
  _Config,
} from './types'
import { transformFont } from './utils'
import { resolveConfig } from './config'

export function createContext(config: _Config, canvasEl?: CanvasElement): PosterContext {
  const canvas = canvasEl || createCanvas()
  const context = canvas.getContext('2d')!

  const _ctx = {
    config,
    canvas,
    context,
    updateConfig,
    font: (cfg: FontConfig) => transformFont(cfg, config.defaultFont),
    sliceText,
    calcDPI,
    calcTextWidth,
    calcTextLineCount,
  }
  updateConfig(config)

  function updateConfig(cfg: Partial<PosterConfig>) {
    resolveConfig(cfg, config)

    canvas.width = calcDPI(config.width)
    canvas.height = calcDPI(config.height === 'auto' ? config.width : config.height)
    context.scale(config.dpi, config.dpi)
  }

  function calcDPI(data: number) {
    return data * config.dpi
  }
  function calcTextWidth(text: string, font: string, letterSpacing = 0) {
    context.save()
    context.font = font
    let width = context.measureText(text).width
    if (letterSpacing)
      width = width + (text.length - 1) * letterSpacing

    context.restore()
    return width
  }

  /**
   * Sliced text content
   */
  function sliceText(data: Omit<CalcTextLineCountOptions, 'width' | 'height' | 'direction'>) {
    const { text = '', font = {}, letterSpacing = 0 } = data

    const fontConfig = Object.assign({}, config.defaultFont, font)
    const textFont = transformFont(font, config.defaultFont)
    const lineHeight = fontConfig.fontSize * (data.lineHeight || fontConfig.lineHeight)

    const texts: SliceText[] = []
    for (const t of text.split('')) {
      const textWidth = calcTextWidth(t, textFont, letterSpacing)
      const textHeight = lineHeight

      texts.push({
        text: t,
        width: textWidth,
        height: textHeight,
      })
    }
    return texts
  }

  function calcTextLineCount(data: CalcTextLineCountOptions) {
    const texts = sliceText(data)

    const { width = config.width, height = config.height } = data

    const key = data.direction === 'vertical' ? 'height' : 'width'
    const value = data.direction === 'vertical' ? width : height

    // if height is auto, return 1
    if (value === 'auto')
      return 1

    const lines = []
    let line = []
    let lineSize = 0
    for (const item of texts) {
      if (lineSize + item[key] > value) {
        lines.push(line)
        line = []
        lineSize = 0
      }
      line.push(item)
      lineSize += item[key]
    }
    lines.push(line)
    return lines.length
  }

  return _ctx
}

export function createCanvas(): CanvasElement {
  const canvasEl = document.createElement('canvas')
  return canvasEl
}
