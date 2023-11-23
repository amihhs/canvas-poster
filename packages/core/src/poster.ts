import type {
  FontConfig,
  PosterBaseRect,
  PosterConfig,
  PosterContext,
  PosterEllipsisText,
  PosterImage,
  PosterJson,
  PosterLine,
  PosterRect,
  PosterText,
  ShadowConfig,
} from './types'
import {
  PosterType,
} from './types'
import { analysisColor, gaussBlur, isFunction, objectFitImage, transformFont } from './utils'

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
  defaultColor = '#000'

  // image proxy是否开启
  cors = true
  proxy?: (src: string) => Promise<string> = undefined

  proxyImageCache: Map<string, string> = new Map()

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
    const {
      scale = this.DPI,
      content = this.content,
      width = this.width,
      height = this.height,
      proxy = this.proxy,
      cors = this.cors,
    } = config || {}

    this.cors = cors
    this.DPI = scale
    this.content = content
    this.width = width
    this.height = height
    // image proxy loader
    this.proxy = proxy

    this.canvas.width = this.setDPI(this.width)
    this.canvas.height = this.setDPI(this.height)

    this.defaultFont = formatDPI(this.defaultFont, this.DPI)
  }

  setDefault = (key: 'fontFamily' | 'color', value: string) => {
    switch (key) {
      case 'fontFamily':
        this.defaultFont.fontFamily = value
        break
      case 'color':
        this.defaultColor = value
        break
    }
  }

  drawImage = async (config: PosterImage) => {
    const { src } = config || {}
    if (!src)
      return

    let isProxy = false
    let imageWidth = 0
    let imageHeight = 0
    const handler = (img: HTMLImageElement, resolve: (value: unknown) => void, status = true) => {
      this.context.save()

      // 绘制阴影
      this.drawShadow(config)
      // 绘制圆角矩形
      this.drawRadius(config, true)
      imageWidth = img.width
      imageHeight = img.height
      objectFitImage(this.context, config, img, imageWidth, imageHeight)
      this.context.restore()
      resolve(status)
    }
    const anonymousLoadImage = () => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.setAttribute('crossOrigin', 'anonymous')
        img.setAttribute('src', src)

        img.onload = () => {
          handler(img, resolve, true)
        }
        img.onerror = async (error) => {
          if (!this.proxy || !isFunction(this.proxy) || isProxy) {
            console.error('error', error)
            return reject(error)
          }

          isProxy = true
          const cache = this.proxyImageCache.get(src)
          if (cache)
            return img.setAttribute('src', cache)

          // eslint-disable-next-line no-console
          console.info('proxy image:', src)
          await this.proxy(src).then((res) => {
            img.setAttribute('src', res)
            this.proxyImageCache.set(src, res)
          }).catch((err) => {
            console.error('proxy image error:', err)
            // handler(false)
            reject(error)
          })
        }
      })
    }

    const normalLoadImage = () => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.setAttribute('src', src)
        img.onload = () => {
          handler(img, resolve, true)
        }
        img.onerror = (error) => {
          reject(error)
        }
      })
    }
    let status = false
    if (this.proxy && this.cors) {
      try {
        await anonymousLoadImage()
        status = true
      }
      catch {
        status = false
      }
    }
    !status && await normalLoadImage()
  }

  renderText = (text: string, x: number, y: number, textConfig: PosterText | PosterEllipsisText) => {
    const {
      renderType = 'fill',
      color = this.defaultColor,
      strokeColor = this.defaultColor,
    } = textConfig
    switch (renderType) {
      case 'stroke':
        this.context.strokeStyle = strokeColor || color
        this.context.strokeText(text, x, y)
        break
      case 'fillAndStroke':
        this.context.strokeStyle = strokeColor || color
        this.context.fillStyle = color
        this.context.fillText(text, x, y)
        this.context.strokeText(text, x, y)
        break
      case 'strokeAndFill':{
        this.context.strokeStyle = strokeColor || color
        this.context.fillStyle = color
        this.context.strokeText(text, x, y)
        this.context.fillText(text, x, y)
        break
      }
      default:
        this.context.fillStyle = color
        this.context.fillText(text, x, y)
        break
    }
  }

  drawTextLetterSpacing = (x: number, y: number, texts: { text: string; width: number }[], textConfig: PosterText) => {
    let currentX = x
    texts.forEach((item) => {
      this.drawShadow({ ...textConfig })
      this.context.fillText(item.text, currentX, y)
      this.renderText(item.text, currentX, y, textConfig)
      currentX += item.width
    })
  }

  drawText = async (textConfig: PosterText) => {
    const { x, y, text, textBaseline, textAlign } = textConfig || {}
    const font = transformFont(textConfig, this.defaultFont)
    this.context.save()
    this.context.font = font
    textBaseline && this.setTextBaseline(textBaseline)
    textAlign && this.setTextAlign(textAlign)

    if (textConfig.letterSpacing) {
      const texts = this.generateTextSlice(text, font, textConfig.letterSpacing)
      this.drawTextLetterSpacing(x, y, texts, textConfig)
    }
    else {
      this.renderText(text, x, y, textConfig)
    }
    this.context.restore()
  }

  /**
   * 绘制截取文本内容
   * 1. 确定的绘制区域宽高
   */
  drawEllipsisText = async (textConfig: PosterEllipsisText) => {
    const { x, y, text, color = this.defaultColor, width, height, letterSpacing = 0, ellipsis = '...' } = textConfig || {}
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
        // this.context.fillText(line, x, drawY)
        this.renderText(line, x, drawY, textConfig)
      }
      else {
        let currentX = x
        texts.forEach((item) => {
          currentX += item.width
          // this.context.fillText(item.text, currentX, y)
          this.renderText(item.text, currentX, y, textConfig)
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

  drawLine = async (rectConfig: PosterLine) => {
    const { x, y, paths = [], color, lineWidth = 1, lineDash = [] } = rectConfig || {}

    this.context.save()
    this.context.beginPath()
    this.context.setLineDash(lineDash)
    this.context.moveTo(x, y)
    paths.forEach((item) => {
      if (item[2] === 'moveTo')
        this.context.moveTo(item[0], item[1])
      else
        this.context.lineTo(item[0], item[1])
    })
    this.context.lineWidth = lineWidth
    if (color)
      this.context.strokeStyle = color
    this.context.stroke()
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
      defaultFont: this.defaultFont,
      font: (config: FontConfig) => transformFont(config, this.defaultFont),
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

  generateDrawAsync = async <T extends PosterJson | PosterJson[]>(callback: (context: PosterContext) => Promise<T>) => {
    const context: PosterContext = {
      width: this.width,
      height: this.height,
      dpi: this.DPI,
      canvasContext: this.context,
      defaultFont: this.defaultFont,
      font: (config: FontConfig) => transformFont(config, this.defaultFont),
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
    return await callback(context)
  }

  // 生成海报
  create = async (content: PosterJson[] = this.content) => {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
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

      if (item.type === PosterType.line)
        await this.drawLine(item)
    }

    return this.canvas
  }
}

const baseTransformKeys = ['x', 'y', 'width', 'height']
const textTransformKeys = ['fontSize', 'letterSpacing']
const rectTransformKeys = ['shadowBlur', 'shadowOffsetX', 'shadowOffsetY', 'boxRadius']
const lineTransformKeys = ['lineDash', 'lineWidth', 'paths']
const needTransformKeys = [
  ...baseTransformKeys,
  ...textTransformKeys,
  ...rectTransformKeys,
  ...lineTransformKeys,
]
function formatDPI<T extends object>(item: T, dpi = 1): T {
  const newJson: T = { ...item }
  for (const key in item) {
    const value = item[key]
    if (needTransformKeys.includes(key))
      newJson[key] = transformDPI(value, dpi)
    else
      newJson[key] = value
  }

  return newJson
}
function transformDPI<T>(value: T, dpi = 1): T {
  if (typeof value === 'number')
    return value * dpi as T
  else if (Array.isArray(value))
    return value.map(v => transformDPI(v, dpi)) as T
  else
    return value
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
    const isLastText = texts[texts.length - 1] === item
    const checkWidth = (isLastLine && !isLastText) ? width - ellipsisWidth : width
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

export async function generateGaussBlurImage(options: {
  width: number
  height: number
  radius?: number
  sigma?: number
  src: string
  proxy?: (src: string) => Promise<string>
}): Promise<{ img: string; color: [number, number, number] }> {
  let isProxy = false
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = options.width
    canvas.height = options.height
    const img = new Image()
    img.setAttribute('crossOrigin', 'anonymous')
    img.setAttribute('src', options.src)
    img.onload = async () => {
      objectFitImage(context, {
        type: PosterType.image,
        x: 0,
        y: 0,
        src: options.src,
        width: options.width,
        height: options.height,
        objectFit: 'cover',
      },
      img,
      img.width,
      img.height)

      const data = context.getImageData(0, 0, options.width, options.height)
      const promises = [
        gaussBlur(data, options.radius, options.sigma),
        analysisColor(data),
      ] as const
      const [emptyData, color] = await Promise.all(promises)
      context.putImageData(emptyData, 0, 0)

      resolve({ img: canvas.toDataURL('image/jpg') || '', color })
    }
    img.onerror = async (error) => {
      if (!options.proxy || !isFunction(options.proxy) || isProxy) {
        console.error('error', error)
        return reject(error)
      }
      isProxy = true
      // eslint-disable-next-line no-console
      console.info('proxy image:', options.src)
      await options.proxy(options.src).then((res) => {
        img.setAttribute('src', res)
      }).catch((err) => {
        console.error('proxy image error:', err)
        reject(err)
      })
    }
  })
}
