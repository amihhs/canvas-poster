import type { PosterContext, PosterImage } from '../types'
import { objectFitImage } from '../utils'
import { createImage, setRadius, setShadow } from './shared'

export async function drawImage(ctx: PosterContext, options: PosterImage) {
  const { src } = options || {}
  if (!src)
    return

  const img = await createImage(ctx, src)
  if (!img)
    return

  const { context } = ctx

  context.save()
  let imageWidth = 0
  let imageHeight = 0
  // 绘制阴影
  setShadow(ctx, options)
  // 绘制圆角矩形
  setRadius(context, { ...options, clip: true })

  imageWidth = img.width
  imageHeight = img.height
  objectFitImage(context, options, img, imageWidth, imageHeight)

  context.restore()
}
