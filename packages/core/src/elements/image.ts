import { createContext } from '../context'
import type { PosterContext, PosterImage } from '../types'
import { objectFitImage } from '../utils'
import { canSetShadow, createImage, setRadius, setShadow } from './shared'

export async function drawImage(ctx: PosterContext, options: PosterImage) {
  const { src } = options || {}
  if (!src)
    return

  const img = await createImage(ctx, src)
  if (!img) {
    console.error('image load error:', src)
    return
  }

  const { context } = ctx
  const imageWidth = img.width
  const imageHeight = img.height

  context.save()

  if (canSetShadow(options)) {
    const temp = createContext({ ...ctx.config, width: options.width, height: options.height })
    const { context: tempContext } = temp

    setRadius(tempContext, { ...options, x: 0, y: 0, clip: true })
    objectFitImage(tempContext, { ...options, x: 0, y: 0 }, img, imageWidth, imageHeight)

    // ? Why does this not take effect after placing it in drawImage?
    // Because the shadow just sets the context properties rather than drawing to the canvas
    setShadow(ctx, options)

    context.drawImage(temp.canvas, options.x, options.y, options.width, options.height)
  }
  else {
    setRadius(context, { ...options, clip: true })
    objectFitImage(context, options, img, imageWidth, imageHeight)
  }

  context.restore()
}
