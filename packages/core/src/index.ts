/* eslint-disable @typescript-eslint/ban-ts-comment */
import type {
  FontConfig,
  PosterConfig,
  PosterContext,
  PosterEllipsisText,
  PosterImage,
  PosterJson,
  PosterRect,
  PosterText,
} from './types'
import {
  PosterType,
} from './types'
import { isFunction } from './utils'

export class Poster {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  width = 320
  height = 452
  DPI = 2
  content: PosterJson[] = []
  defaultFont: Required<FontConfig> = {
    fontSize: 14,
    fontFamily: 'sans-serif',
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 1.2,
  }

  constructor(config?: PosterConfig) {
    this.canvas = this.createCanvas()
    this.context = this.canvas.getContext('2d')!

    this.resize(config)
  }

  private createCanvas = () => {
    if (!document)
      throw new Error('document is not found')
    const canvas = document.createElement('canvas')
    return canvas
  }

  private setDPI = (data: number) => {
    return data * this.DPI
  }

  private setOpacity = (opacity: number) => {
    this.context.globalAlpha = opacity
  }

  private setTextAlign = (textAlign: CanvasTextAlign) => {
    this.context.textAlign = textAlign
  }

  private setTextBaseline = (textBaseline: CanvasTextBaseline) => {
    this.context.textBaseline = textBaseline
  }

  // 画布大小和状态变化
  resize = (config?: PosterConfig) => {
    const { scale = this.DPI, content = this.content, width = this.width, height = this.height } = config || {}
    this.DPI = scale
    this.content = content
    this.width = width
    this.height = height
    this.canvas.width = this.setDPI(this.width)
    this.canvas.height = this.setDPI(this.height)
  }

  drawImage = async (config: PosterImage) => {
    const { src, x, y, width, height, boxRadius = 0 } = config || {}
    const img = new Image()
    img.src = src
    await new Promise((resolve) => {
      img.onload = () => {
        this.context.save()

        // 绘制圆角矩形
        if (boxRadius) {
          this.drawRoundedRect(x, y, width, height, boxRadius)
          this.context.clip()
        }
        this.context.drawImage(img, x, y, width, height)

        this.context.restore()
        resolve(true)
      }
    })
  }

  drawText = async (textConfig: PosterText) => {
    const { x, y, text, color } = textConfig || {}
    this.context.save()
    this.context.font = this.font(textConfig)
    this.context.fillStyle = color
    this.context.fillText(text, x, y)
    this.context.restore()
  }

  /**
   * 绘制截取文本内容
   * 1. 确定的绘制区域宽高
   */
  drawEllipsisText = async (textConfig: PosterEllipsisText) => {
    const { x, y, text, color, width, height, ellipsis = '...' } = textConfig || {}
    const { fontSize = this.defaultFont.fontSize, lineHeight = this.defaultFont.lineHeight } = textConfig || {}
    const { textBaseline, textAlign } = textConfig || {}

    const font = this.font(textConfig)
    const lineCount = Math.floor(height / (fontSize * lineHeight))
    const texts = this.drawTextSlice(text, font)
    const lines = this.generateEllipsisTextLines(texts, width, { width: this.getTextWidth(ellipsis, font), ellipsis }, lineCount)

    this.context.save()
    this.context.font = font
    this.context.fillStyle = color

    textBaseline && this.setTextBaseline(textBaseline)
    textAlign && this.setTextAlign(textAlign)

    let drawY = y
    for (const line of lines) {
      this.context.fillText(line, x, drawY)
      drawY += fontSize * lineHeight
    }
    this.context.restore()
  }

  /**
   * 切片绘制文本内容
   */
  drawTextSlice = (text: string, font: string) => {
    const texts = []
    for (const t of text.split('')) {
      const textWidth = this.getTextWidth(t, font)
      texts.push({
        text: t,
        width: textWidth,
      })
    }
    return texts
  }

  /**
   * context font
   */
  font(config: FontConfig) {
    const {
      fontSize = this.defaultFont.fontSize,
      fontStyle = this.defaultFont.fontStyle,
      fontWeight = this.defaultFont.fontWeight,
      lineHeight = this.defaultFont.lineHeight,
    } = config || {}
    return `${fontStyle} ${fontWeight} ${fontSize}px/${lineHeight} sans-serif`
  }

  /**
   * 生成截取文本内容
   */
  generateEllipsisTextLines = (
    texts: { text: string; width: number }[],
    width: number,
    ellipsisConfig: { width: number; ellipsis: string },
    lineCount: number,
  ) => {
    const { width: ellipsisWidth, ellipsis } = ellipsisConfig
    const lines = []
    let line = ''
    let lineWidth = 0
    for (const item of texts) {
      const isLastLine = lines.length === lineCount - 1
      const checkWidth = isLastLine ? width - ellipsisWidth : width
      if (lineWidth + item.width > checkWidth) {
        lines.push(line)
        line = ''
        lineWidth = 0
        if (lines.length >= lineCount) {
          lines[lines.length - 1] += ellipsis
          break
        }
      }
      line += item.text
      lineWidth += item.width
    }
    line && lines.push(line)
    return lines
  }

  drawRect = async (rectConfig: PosterRect) => {
    const { x, y, width, height, bgColor = 'none', opacity = 1 } = rectConfig || {}
    this.context.save()
    if (bgColor !== 'none') {
      this.context.fillStyle = bgColor
      this.setOpacity(opacity)
    }
    this.context.fillRect(x, y, width, height)
    this.context.restore()
  }

  // 绘制圆角矩形
  drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
    this.context.moveTo(x + radius, y)
    this.context.lineTo(x + width - radius, y)
    this.context.arc(x + width - radius, y + radius, radius, 1.5 * Math.PI, 2 * Math.PI)
    this.context.lineTo(x + width, y + height - radius)
    this.context.arc(x + width - radius, y + height - radius, radius, 0, 0.5 * Math.PI)
    this.context.lineTo(x + radius, y + height)
    this.context.arc(x + radius, y + height - radius, radius, 0.5 * Math.PI, 1 * Math.PI)
    this.context.lineTo(x, y + radius)
    this.context.arc(x + radius, y + radius, radius, 1 * Math.PI, 1.5 * Math.PI)
  }

  getTextWidth = (text: string, font: string) => {
    this.context.save()
    this.context.font = font
    const width = this.context.measureText(text).width
    this.context.restore()
    return width
  }

  /**
   * 生成drawJson
   * @param callback
   */
  generateDraw = (callback: (context: PosterContext) => PosterJson) => {
    const context: PosterContext = {
      width: this.width,
      height: this.height,
      dpi: this.DPI,
      canvasContext: this.context,
      defaultFont: this.defaultFont,
    }
    if (!isFunction(callback))
      throw new Error('generateDraw callback is not a function')
    return callback(context)
  }

  formatDPI = <T extends PosterJson>(item: T) => {
    const newJson: T = {
      ...item,
      x: item.x * this.DPI,
      y: item.y * this.DPI,
      width: item.width * this.DPI,
      height: item.height * this.DPI,
    }
    if (PosterType.text === item.type || PosterType.textEllipsis === item.type) {
      if (item.fontSize)
      // @ts-expect-error
        newJson.fontSize = item.fontSize * this.DPI
    }
    if (item.type === PosterType.image || item.type === PosterType.rect) {
      if (item.boxRadius)
      // @ts-expect-error
        newJson.boxRadius = item.boxRadius * this.DPI
    }

    return newJson
  }

  // 生成海报
  create = async (content: PosterJson[] = this.content) => {
    for (const i of content) {
      const item = this.formatDPI(i)
      if (item.type === PosterType.image)
        await this.drawImage(item)

      if (item.type === PosterType.text)
        await this.drawText(item)

      if (item.type === PosterType.textEllipsis)
        await this.drawEllipsisText(item)

      if (item.type === PosterType.rect)
        await this.drawRect(item)
    }

    return this.canvas
  }
}
