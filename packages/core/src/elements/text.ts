import type { PosterContext, PosterText, SliceText } from '../types'
import { transformFont } from '../utils'
import { setShadow, setTextAlign, setTextBaseline } from './shared'

/**
 * draw text
 * support: text, textEllipsis
 */
export function drawText(ctx: PosterContext, options: PosterText) {
  if (!options.ellipsis)
    return renderText(ctx, options)

  renderEllipsisText(ctx, options)
}

function renderBaseText(ctx: PosterContext, options: PosterText) {
  const { context, config } = ctx
  const { defaultColor } = config

  const {
    text = '',
    renderType = 'fill',
    color = defaultColor,
    strokeColor = defaultColor,
    x = 0,
    y = 0,
  } = options

  if (!text)
    return

  switch (renderType) {
    case 'stroke':
      context.strokeStyle = strokeColor || color
      context.strokeText(text, x, y)
      break
    case 'fillAndStroke':
      context.strokeStyle = strokeColor || color
      context.fillStyle = color
      context.fillText(text, x, y)
      context.strokeText(text, x, y)
      break
    case 'strokeAndFill':{
      context.strokeStyle = strokeColor || color
      context.fillStyle = color
      context.strokeText(text, x, y)
      context.fillText(text, x, y)
      break
    }
    default:
      context.fillStyle = color
      context.fillText(text, x, y)
      break
  }
}

function renderText(ctx: PosterContext, options: PosterText) {
  const { context, config } = ctx
  const { text, textBaseline, textAlign, letterSpacing } = options || {}
  const font = transformFont(options, config.defaultFont)

  context.save()

  context.font = font

  textBaseline && setTextBaseline(context, textBaseline)
  textAlign && setTextAlign(context, textAlign)

  if (!letterSpacing) {
    renderBaseText(ctx, options)
    context.restore()
    return
  }

  const texts = ctx.sliceText({
    text,
    font: options,
    letterSpacing,
  })
  renderLetterSpacingText(texts, ctx, options)
  context.restore()
}

function renderEllipsisText(ctx: PosterContext, options: PosterText) {
  const { context, config } = ctx
  const { defaultColor } = config

  const {
    x,
    y,
    text,
    color = defaultColor,
    width,
    height,
    letterSpacing = 0,
    fontSize = config.defaultFont.fontSize,
    lineHeight = config.defaultFont.lineHeight,
    textBaseline,
    textAlign,
  } = options

  const ellipsis = (typeof options.ellipsis === 'boolean' || !options.ellipsis) ? '...' : options.ellipsis

  const font = transformFont(options, config.defaultFont)
  const lineCount = Math.floor(height / (fontSize * lineHeight))
  const texts = ctx.sliceText({
    text,
    font: options,
    letterSpacing,
  })
  const lines = generateEllipsisTextLines(
    texts,
    width,
    { width: ctx.calcTextWidth(ellipsis, font, letterSpacing), ellipsis },
    lineCount,
  )
  // console.log('lines', lines)
  context.save()
  context.font = font
  context.fillStyle = color

  textBaseline && setTextBaseline(context, textBaseline)
  textAlign && setTextAlign(context, textAlign)

  let drawY = y
  for (const line of lines) {
    if (!letterSpacing) {
      renderText(ctx, { ...options, text: line, x, y: drawY })
    }
    else {
      let currentX = x
      texts.forEach((item) => {
        currentX += item.width
        renderText(ctx, { ...options, text: item.text, x: currentX, y: drawY })
      })
    }
    drawY += fontSize * lineHeight
  }
  context.restore()
}

function renderLetterSpacingText(texts: SliceText[], ctx: PosterContext, options: PosterText) {
  const { context } = ctx
  const { x, y } = options
  let currentX = x
  texts.forEach((item) => {
    setShadow(context, options)
    renderBaseText(ctx, { ...options, text: item.text, x: currentX, y })
    currentX += item.width
  })
}

/**
 * 生成截取文本内容
 */
function generateEllipsisTextLines(
  texts: { text: string, width: number }[],
  width: number,
  ellipsisConfig: { width: number, ellipsis: string },
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
