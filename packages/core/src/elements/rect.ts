import type { PosterContext, PosterRect } from '../types'
import { canSetShadow, parseColor, setOpacity, setRadius, setShadow } from './shared'

export async function drawRect(ctx: PosterContext, options: PosterRect) {
  const { bgColor = 'none', opacity = 1 } = options || {}

  const { context } = ctx
  context.save()

  // 绘制阴影
  canSetShadow(options) && setShadow(ctx, options)

  // 绘制圆角矩形
  setRadius(context, options)

  if (bgColor !== 'none') {
    context.fillStyle = await parseColor(ctx, bgColor)
    setOpacity(context, opacity)
    context.fill()
  }

  context.restore()
}
