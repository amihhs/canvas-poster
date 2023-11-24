import type { PosterContext, PosterRect } from '../types'
import { setOpacity, setRadius, setShadow } from './shared'

export function drawRect(ctx: PosterContext, options: PosterRect) {
  const { bgColor = 'none', opacity = 1 } = options || {}

  const { context } = ctx
  context.save()

  // 绘制阴影
  setShadow(context, options)

  // 绘制圆角矩形
  setRadius(context, options)

  if (bgColor !== 'none') {
    context.fillStyle = bgColor
    setOpacity(context, opacity)
    context.fill()
  }

  context.restore()
}
