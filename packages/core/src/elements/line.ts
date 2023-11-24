import type { PosterContext, PosterLine } from '../types'

export function drawLine(ctx: PosterContext, options: PosterLine) {
  const { x, y, paths = [], color, lineWidth = 1, lineDash = [] } = options || {}

  const { context } = ctx

  context.save()
  context.beginPath()
  context.setLineDash(lineDash)
  context.moveTo(x, y)
  paths.forEach((item) => {
    if (item[2] === 'moveTo')
      context.moveTo(item[0], item[1])
    else
      context.lineTo(item[0], item[1])
  })
  context.lineWidth = lineWidth
  if (color)
    context.strokeStyle = color
  context.stroke()
  context.restore()
}
