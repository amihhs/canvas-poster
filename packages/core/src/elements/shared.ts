import type { PosterBaseRect, PosterContext, ShadowConfig } from '../types'

export function setOpacity(context: PosterContext['context'], opacity: number) {
  context.globalAlpha = opacity
}

export function setTextBaseline(context: PosterContext['context'], textBaseline: CanvasTextBaseline) {
  context.textBaseline = textBaseline
}

export function setTextAlign(context: PosterContext['context'], textAlign: CanvasTextAlign) {
  context.textAlign = textAlign
}

export function setShadow<T extends ShadowConfig>(context: PosterContext['context'], options: T) {
  const { shadowColor, shadowBlur = 0, shadowOffsetX = 0, shadowOffsetY = 0 } = options || {}

  if (!shadowColor || !(shadowBlur || shadowOffsetX || shadowOffsetY))
    return

  context.shadowColor = shadowColor

  context.shadowOffsetX = shadowOffsetX
  context.shadowOffsetY = shadowOffsetY
  context.shadowBlur = shadowBlur
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
