/* eslint-disable @typescript-eslint/ban-ts-comment */
import type {
  FontConfig,
  PosterBaseRect,
  PosterConfig,
  PosterContext,
  PosterEllipsisText,
  PosterImage,
  PosterJson,
  PosterRect,
  PosterText,
  ShadowConfig,
} from './types'
import {
  PosterType,
} from './types'
import { isFunction, transformFont } from './utils'
const DEFAULT_FONT: Required<FontConfig> = {
  fontSize: 14,
  fontFamily: 'sans-serif',
  fontWeight: 'normal',
  fontStyle: 'normal',
  lineHeight: 1,
}
export class Poster {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  width = 320
  height = 452
  DPI = 2
  content: PosterJson[] = []
  defaultFont: Required<FontConfig> = { ...DEFAULT_FONT }

  proxy?: (src: string) => Promise<string> = undefined

  constructor(config?: PosterConfig, canvasEl?: HTMLCanvasElement) {
    this.canvas = canvasEl || this.createCanvas()
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
    // image proxy loader
    this.proxy = config?.proxy

    this.canvas.width = this.setDPI(this.width)
    this.canvas.height = this.setDPI(this.height)
    this.defaultFont = formatDPI(DEFAULT_FONT, this.DPI)
  }

  drawImage = async (config: PosterImage) => {
    const { src } = config || {}
    const img = new Image()
    img.setAttribute('crossOrigin', 'anonymous')
    img.setAttribute('src', src)

    let isProxy = false
    let imageWidth = 0
    let imageHeight = 0

    await new Promise((resolve) => {
      img.onload = () => {
        this.context.save()

        // 绘制阴影
        this.drawShadow(config)
        // 绘制圆角矩形
        this.drawRadius(config, true)
        imageWidth = img.width
        imageHeight = img.height
        this.objectFitImage(config, img, imageWidth, imageHeight)
        this.context.restore()
        resolve(true)
      }
      img.onerror = async (error) => {
        if (isFunction(this.proxy) && !isProxy) {
          isProxy = true
          // eslint-disable-next-line no-console
          console.info('proxy image:', src)
          await this.proxy(src).then((res) => {
            // console.log('proxy image success:', res)
            img.setAttribute('src', res)
          }).catch((err) => {
            console.error('proxy image error:', err)
            resolve(false)
          })
        }
        else {
          console.error('error', error)
          resolve(false)
        }
      }
    })
  }

  drawTextLetterSpacing = (x: number, y: number, texts: { text: string; width: number }[], shadowConfig?: ShadowConfig) => {
    let currentX = x
    texts.forEach((item) => {
      this.drawShadow({ ...shadowConfig })
      this.context.fillText(item.text, currentX, y)
      currentX += item.width
    })
  }

  drawText = async (textConfig: PosterText) => {
    const { x, y, text, color, textBaseline, textAlign, ...shadowConfig } = textConfig || {}
    const font = transformFont(textConfig, this.defaultFont)
    this.context.save()
    this.context.font = font
    this.context.fillStyle = color

    textBaseline && this.setTextBaseline(textBaseline)
    textAlign && this.setTextAlign(textAlign)

    if (textConfig.letterSpacing) {
      const texts = this.generateTextSlice(text, font, textConfig.letterSpacing)
      this.drawTextLetterSpacing(x, y, texts, shadowConfig)
    }
    else {
      this.context.fillText(text, x, y)
    }
    this.context.restore()
  }

  /**
   * 绘制截取文本内容
   * 1. 确定的绘制区域宽高
   */
  drawEllipsisText = async (textConfig: PosterEllipsisText) => {
    const { x, y, text, color, width, height, letterSpacing = 0, ellipsis = '...' } = textConfig || {}
    const { fontSize = this.defaultFont.fontSize, lineHeight = this.defaultFont.lineHeight } = textConfig || {}
    const { textBaseline, textAlign } = textConfig || {}

    const font = transformFont(textConfig, this.defaultFont)
    const lineCount = Math.floor(height / (fontSize * lineHeight))
    const texts = this.generateTextSlice(text, font, letterSpacing)
    const lines = generateEllipsisTextLines(texts, width, { width: this.getTextWidth(ellipsis, font, letterSpacing), ellipsis }, lineCount)
    // console.log('lines', lines)
    this.context.save()
    this.context.font = font
    this.context.fillStyle = color

    textBaseline && this.setTextBaseline(textBaseline)
    textAlign && this.setTextAlign(textAlign)

    let drawY = y
    for (const line of lines) {
      if (!letterSpacing) {
        this.context.fillText(line, x, drawY)
      }
      else {
        let currentX = x
        texts.forEach((item) => {
          currentX += item.width
          this.context.fillText(item.text, currentX, y)
        })
      }
      drawY += fontSize * lineHeight
    }
    this.context.restore()
  }

  drawRect = async (rectConfig: PosterRect) => {
    const { bgColor = 'none', opacity = 1 } = rectConfig || {}
    this.context.save()

    // 绘制阴影
    this.drawShadow(rectConfig)

    // 绘制圆角矩形
    this.drawRadius(rectConfig)

    if (bgColor !== 'none') {
      this.context.fillStyle = bgColor
      this.setOpacity(opacity)
      this.context.fill()
    }

    this.context.restore()
  }

  // 绘制圆角矩形
  drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
    this.context.beginPath()
    this.context.moveTo(x + radius, y)
    this.context.lineTo(x + width - radius, y)
    this.context.arc(x + width - radius, y + radius, radius, 1.5 * Math.PI, 2 * Math.PI)
    this.context.lineTo(x + width, y + height - radius)
    this.context.arc(x + width - radius, y + height - radius, radius, 0, 0.5 * Math.PI)
    this.context.lineTo(x + radius, y + height)
    this.context.arc(x + radius, y + height - radius, radius, 0.5 * Math.PI, 1 * Math.PI)
    this.context.lineTo(x, y + radius)
    this.context.arc(x + radius, y + radius, radius, 1 * Math.PI, 1.5 * Math.PI)
    this.context.closePath()
  }

  drawRadius = <T extends PosterBaseRect >(config: T, isClip = false) => {
    const { x, y, width, height, boxRadius = 0 } = config || {}
    this.drawRoundedRect(x, y, width, height, boxRadius)
    if (isClip)
      this.context.clip()
  }

  drawShadow = <T extends ShadowConfig>(config: T) => {
    const { shadowColor, shadowBlur = 0, shadowOffsetX = 0, shadowOffsetY = 0 } = config || {}
    if (!shadowColor || !(shadowBlur || shadowOffsetX || shadowOffsetY))
      return
    this.context.shadowColor = shadowColor

    this.context.shadowOffsetX = shadowOffsetX
    this.context.shadowOffsetY = shadowOffsetY
    this.context.shadowBlur = shadowBlur
  }

  objectFitImage = (config: PosterImage, img: HTMLImageElement, imageWidth: number, imageHeight: number) => {
    const { x, y, width, height, objectFit } = config || {}
    const containerRatio = height / width
    const imageRatio = imageHeight / imageWidth
    const shortDirection = containerRatio > imageRatio ? 'y' : 'x'

    const d = {
      sx: 0,
      sy: 0,
      sw: imageWidth,
      sh: imageHeight,
      x,
      y,
      width,
      height,
    }
    // none
    switch (objectFit) {
      // 显示全部，短边留白
      case 'contain':{
        if (shortDirection === 'x') {
          d.x = x + (width - width * imageRatio) / 2
          d.width = width * imageRatio
        }
        else {
          d.y = y + (height - height / imageRatio) / 2
          d.height = height / imageRatio
        }
        break
      }
      // 短边填充，长边裁剪
      case 'cover':{
        const sameRatoImageSize = {
          width: imageWidth,
          height: imageWidth * containerRatio,
        }
        if (shortDirection === 'x') {
          d.sx = 0
          d.sy = (imageHeight - sameRatoImageSize.height) / 2
          d.sw = imageWidth
          d.sh = sameRatoImageSize.height
        }
        else {
          d.sx = (imageWidth - sameRatoImageSize.width) / 2
          d.sy = 0
          d.sw = sameRatoImageSize.width
          d.sh = imageHeight
        }
        break
      }
      // 压缩长边，全部显示
      default:{
        return this.context.drawImage(img, d.x, d.y, d.width, d.height)
      }
    }

    this.context.drawImage(img, d.sx, d.sy, d.sw, d.sh, d.x, d.y, d.width, d.height)
  }

  getTextWidth = (text: string, font: string, letterSpacing = 0) => {
    this.context.save()
    this.context.font = font
    let width = this.context.measureText(text).width
    if (letterSpacing)
      width = width + (text.length - 1) * letterSpacing

    this.context.restore()
    return width
  }

  getTextLineCount = (width: number, text: string, font: string, letterSpacing = 0) => {
    const texts = this.generateTextSlice(text, font, letterSpacing)
    const lines = []
    let line = []
    let lineWidth = 0
    for (const item of texts) {
      if (lineWidth + item.width > width) {
        lines.push(line)
        line = []
        lineWidth = 0
      }
      line.push(item)
      lineWidth += item.width
    }
    lines.push(line)
    return lines.length
  }

  /**
   * 切片文本内容
   */
  generateTextSlice = (text: string, font: string, letterSpacing = 0) => {
    const texts = []
    for (const t of text.split('')) {
      const textWidth = this.getTextWidth(t, font) + letterSpacing
      texts.push({
        text: t,
        width: textWidth,
      })
    }
    return texts
  }

  /**
   * 生成drawJson
   * @param callback
   */
  generateDraw = <T extends PosterJson | PosterJson[]>(callback: (context: PosterContext) => T) => {
    const context: PosterContext = {
      width: this.width,
      height: this.height,
      dpi: this.DPI,
      canvasContext: this.context,
      defaultFont: DEFAULT_FONT,
      font: (config: FontConfig) => transformFont(config, DEFAULT_FONT),
      getTextWidth: (text: string, font: string, letterSpacing = 0) => this.getTextWidth(text, font, letterSpacing),
      getTextLineCount: (
        width: number,
        text: string,
        font: string,
        letterSpacing = 0,
      ) => this.getTextLineCount(width, text, font, letterSpacing),
    }
    if (!isFunction(callback))
      throw new Error('generateDraw callback is not a function')
    return callback(context)
  }

  // 生成海报
  create = async (content: PosterJson[] = this.content) => {
    for (const i of content) {
      const item = formatDPI(i, this.DPI)
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

const needTransformKeys = ['x', 'y', 'width', 'height', 'fontSize', 'letterSpacing', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY', 'boxRadius']
function formatDPI<T extends {}>(item: T, dpi = 1): T {
  const newJson: T = { ...item }
  for (const key in item) {
    const value = item[key]
    if (typeof value === 'number' && needTransformKeys.includes(key))
      // @ts-expect-error
      newJson[key] = value * dpi
    else
      newJson[key] = value
  }

  return newJson
}

/**
   * 生成截取文本内容
   */
function generateEllipsisTextLines(
  texts: { text: string; width: number }[],
  width: number,
  ellipsisConfig: { width: number; ellipsis: string },
  lineCount: number,
) {
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
