import type { PosterContext, PosterLine } from '../types'
import { parseColor } from './shared'

export async function drawLine(ctx: PosterContext, options: PosterLine) {
  const { paths = [], color, lineWidth = 1, lineDash = [] } = options || {}
  if (paths.length === 0)
    return

  const { context } = ctx

  context.save()
  context.beginPath()
  context.setLineDash(lineDash)
  context.moveTo(paths[0][0], (paths[0][1]))
  paths.slice(1).forEach((item) => {
    if (item[2] === 'moveTo')
      context.moveTo(item[0], item[1])
    else
      context.lineTo(item[0], item[1])
  })
  context.lineWidth = lineWidth
  if (color)
    context.strokeStyle = await parseColor(ctx, color)
  context.stroke()
  context.restore()
}
