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
  const canvas = canvasEl || createCanvas(config)
  const context = canvas.getContext('2d')!

  function updateConfig(cfg: Partial<PosterConfig>) {
    config = resolveConfig(cfg)

    canvas.width = calcDPI(config.width)
    canvas.height = calcDPI(config.height === 'auto' ? config.width : config.height)
    context.scale(config.dpi, config.dpi)
  }

  function calcDPI(data: number) {
    return data * config.dpi
  }
  const calcTextWidth = (text: string, font: string, letterSpacing = 0) => {
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
  const sliceText = (data: Omit<CalcTextLineCountOptions, 'width' | 'height' | 'direction'>) => {
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

  const calcTextLineCount = (data: CalcTextLineCountOptions) => {
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

  return {
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
}

export function createCanvas(config: Required<PosterConfig>): CanvasElement {
  const canvasEl = document.createElement('canvas')
  canvasEl.width = config.width * config.dpi
  // when height is auto, use width temporarily and then modify it dynamically according to the content
  canvasEl.height = (config.height === 'auto' ? canvasEl.width : config.height) * config.dpi
  return canvasEl
}
