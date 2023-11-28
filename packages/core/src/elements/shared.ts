import { ColorType } from '../types'
import { isFunction } from '../utils'
import type {
  Color,
  ConicGradientColor,
  LineGradientColor,
  PatternColor,
  PosterBaseRect,
  PosterContext,
  PosterImage,
  RadialGradientColor,
  ShadowConfig,
} from '../types'

const proxyImageCache = new Map<string, string>()

export function setOpacity(context: PosterContext['context'], opacity: number) {
  context.globalAlpha = opacity
}

export function setTextBaseline(context: PosterContext['context'], textBaseline: CanvasTextBaseline) {
  context.textBaseline = textBaseline
}

export function setTextAlign(context: PosterContext['context'], textAlign: CanvasTextAlign) {
  context.textAlign = textAlign
}

export async function setShadow<T extends ShadowConfig>(context: PosterContext, options: T) {
  const { shadowColor, shadowBlur = 0, shadowOffsetX = 0, shadowOffsetY = 0 } = options || {}

  const { context: canvasContext } = context

  if (!shadowColor || typeof shadowColor !== 'string' || !(shadowBlur || shadowOffsetX || shadowOffsetY))
    return

  canvasContext.shadowOffsetX = shadowOffsetX
  canvasContext.shadowOffsetY = shadowOffsetY
  canvasContext.shadowBlur = shadowBlur
}

export function setRadius<T extends PosterBaseRect>(context: PosterContext['context'], options: T) {
  const { clip = false } = options || {}
  drawRoundedRect(context, options)
  if (clip)
    context.clip()
}

export function drawRoundedRect<T extends PosterBaseRect>(context: PosterContext['context'], options: T) {
  const { x, y, width, height, boxRadius: radius = 0 } = options || {}
  context.beginPath()
  context.moveTo(x + radius, y)
  context.lineTo(x + width - radius, y)
  context.arc(x + width - radius, y + radius, radius, 1.5 * Math.PI, 2 * Math.PI)
  context.lineTo(x + width, y + height - radius)
  context.arc(x + width - radius, y + height - radius, radius, 0, 0.5 * Math.PI)
  context.lineTo(x + radius, y + height)
  context.arc(x + radius, y + height - radius, radius, 0.5 * Math.PI, 1 * Math.PI)
  context.lineTo(x, y + radius)
  context.arc(x + radius, y + radius, radius, 1 * Math.PI, 1.5 * Math.PI)
  context.closePath()
}

function parseLineGradient(context: PosterContext['context'], color: LineGradientColor) {
  const { positions, colors } = color
  const gradient = context.createLinearGradient(...positions)
  colors.forEach(([offset, color]) => gradient.addColorStop(offset, color))
  return gradient
}

function parseConicGradient(context: PosterContext['context'], color: ConicGradientColor) {
  const { positions, colors } = color
  const gradient = context.createConicGradient(...positions)
  colors.forEach(([offset, color]) => gradient.addColorStop(offset, color))
  return gradient
}

function parseRadialGradient(context: PosterContext['context'], color: RadialGradientColor) {
  const { positions, colors } = color
  const gradient = context.createRadialGradient(...positions)
  colors.forEach(([offset, color]) => gradient.addColorStop(offset, color))
  return gradient
}

async function parsePattern(context: PosterContext, color: PatternColor) {
  const { context: ctx } = context
  const { src, repeat = 'no-repeat' } = color
  if (!src)
    return context.config.defaultColor
  const image = await createImage(context, src)
  return ctx.createPattern(image, repeat) || context.config.defaultColor
}

// TODO: cache color parse result
export async function parseColor(context: PosterContext, color: Color) {
  const { defaultColor } = context.config
  const { context: canvasContext } = context
  if (typeof color === 'string' || color instanceof CanvasGradient || color instanceof CanvasPattern)
    return color

  switch (color.type) {
    case ColorType.pure:
      return color.color
    case ColorType.lineGradient:
      return parseLineGradient(canvasContext, color)
    case ColorType.conicGradient:
      return parseConicGradient(canvasContext, color)
    case ColorType.radialGradient:
      return parseRadialGradient(canvasContext, color)
    case ColorType.pattern:
      return color.src ? await parsePattern(context, color) : defaultColor
    default:
      console.warn(`Unknown color type, Use defaultColor: ${canvasContext}`, color)
      return defaultColor
  }
}

function getSrc(options: PosterImage | string) {
  if (typeof options === 'string')
    return options
  return options?.src || ''
}
function anonymousLoadImage(ctx: PosterContext, options: PosterImage | string): Promise<{ img: HTMLImageElement, isProxy: boolean }> {
  return new Promise((resolve, reject) => {
    let isProxy = false
    const src = getSrc(options)
    const proxy = ctx.config.proxy
    const img = new Image()
    img.setAttribute('crossOrigin', 'anonymous')
    img.setAttribute('src', src)

    img.onload = () => {
      resolve({ img, isProxy })
    }
    img.onerror = async (error) => {
      if (!proxy || !isFunction(proxy) || isProxy) {
        console.error('error', error)
        return reject(error)
      }

      isProxy = true
      const cache = proxyImageCache.get(src)
      if (cache)
        return img.setAttribute('src', cache)

      // eslint-disable-next-line no-console
      console.info('proxy image:', src)
      await proxy(src).then((res) => {
        img.setAttribute('src', res)
        proxyImageCache.set(src, res)
      }).catch((err) => {
        console.error('proxy image error:', err)
        // handler(false)
        reject(error)
      })
    }
  })
}

function normalLoadImage(options: PosterImage | string): Promise<{ img: HTMLImageElement, isProxy: boolean }> {
  return new Promise((resolve, reject) => {
    const src = getSrc(options)
    const img = new Image()
    img.setAttribute('src', src)
    img.onload = () => {
      resolve({ img, isProxy: false })
    }
    img.onerror = (error) => {
      reject(error)
    }
  })
}

export async function createImage(ctx: PosterContext, src: string) {
  const { config } = ctx

  try {
    if (config.proxy && config.cors) {
      const { img } = await anonymousLoadImage(ctx, src)
      return img
    }
  }
  catch {}

  const { img } = await normalLoadImage(src)
  return img
}
