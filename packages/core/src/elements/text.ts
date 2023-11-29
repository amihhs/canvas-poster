import type { PosterContext, PosterText, SliceText } from '../types'
import { transformFont } from '../utils'
import { canSetShadow, parseColor, setShadow, setTextAlign, setTextBaseline } from './shared'

/**
 * draw text
 * support: text, textEllipsis
 */
export async function drawText(ctx: PosterContext, options: PosterText) {
  const { context } = ctx
  context.save()
  if (!options.ellipsis)
    await renderText(ctx, options)
  else
    await renderEllipsisText(ctx, options)
  context.restore()
}

async function renderBaseText(ctx: PosterContext, options: PosterText) {
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

  if (['fillAndStroke', 'strokeAndFill', 'stroke'].includes(renderType))
    context.strokeStyle = await parseColor(ctx, strokeColor)

  if (renderType !== 'stroke')
    context.fillStyle = await parseColor(ctx, color)

  switch (renderType) {
    case 'stroke':
      context.strokeText(text, x, y)
      break
    case 'fillAndStroke':
      context.fillText(text, x, y)
      context.strokeText(text, x, y)
      break
    case 'strokeAndFill':
      context.strokeText(text, x, y)
      context.fillText(text, x, y)
      break
    default:
      context.fillText(text, x, y)
      break
  }
}

async function renderText(ctx: PosterContext, options: PosterText) {
  const { context, config } = ctx
  const { text, textBaseline, textAlign, letterSpacing } = options || {}
  const font = transformFont(options, config.defaultFont)

  context.font = font

  textBaseline && setTextBaseline(context, textBaseline)
  textAlign && setTextAlign(context, textAlign)

  if (!letterSpacing) {
    await renderBaseText(ctx, options)
    return
  }

  const texts = ctx.sliceText({ text, font: options, letterSpacing })
  await renderLetterSpacingText(texts, ctx, options)
}

async function renderEllipsisText(ctx: PosterContext, options: PosterText) {
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
  context.save()
  context.font = font
  context.fillStyle = await parseColor(ctx, color)

  textBaseline && setTextBaseline(context, textBaseline)
  textAlign && setTextAlign(context, textAlign)

  const promises: any[] = []
  let drawY = y
  for (const line of lines) {
    if (!letterSpacing) {
      promises.push(renderBaseText(ctx, { ...options, text: line, x, y: drawY }))
    }
    else {
      let currentX = x
      const lineTexts = ctx.sliceText({ text: line, font: options, letterSpacing })
      lineTexts.forEach((item) => {
        promises.push(renderBaseText(ctx, { ...options, text: item.text, x: currentX, y: drawY }))
        currentX += item.width
      })
    }
    drawY += fontSize * lineHeight
  }

  await Promise.all(promises)

  context.restore()
}

async function renderLetterSpacingText(texts: SliceText[], ctx: PosterContext, options: PosterText) {
  const promises: any[] = []
  const { x, y, letterSpacing = 0 } = options
  let currentX = x

  texts.forEach((item) => {
    canSetShadow(options) && setShadow(ctx, options)
    promises.push(renderBaseText(ctx, { ...options, text: item.text, x: currentX, y }))
    currentX += item.width + letterSpacing
  })

  await Promise.all(promises)
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

  let maxOverIndex = texts.length
  let overWidth = 0
  for (const index in texts.reverse()) {
    const item = texts[index]
    if (overWidth > ellipsisWidth)
      break
    overWidth += item.width
    maxOverIndex -= 1
  }

  for (const index in texts.reverse()) {
    const item = texts[index]
    const isLastLine = lines.length === lineCount - 1
    const isLastText = texts[texts.length - 1] === item
    const checkWidth = (isLastLine && !isLastText) ? width - ellipsisWidth : width

    if (lineWidth + item.width > checkWidth && Number(index) < maxOverIndex) {
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
