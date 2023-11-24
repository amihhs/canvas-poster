import type { PosterConfig, PosterContext, PosterJson } from './types'
import { PosterType } from './types'
import { isFunction } from './utils'
import { resolveConfig } from './config'
import { createContext } from './context'
import { drawImage, drawLine, drawRect, drawText } from './elements'

export function createPoster(options: PosterConfig = {}, canvasEl?: HTMLCanvasElement) {
  const config = resolveConfig(options)
  const context = createContext(config, canvasEl)

  const render = async (ctx: PosterContext, content: PosterJson[] = []) => {
    const { context, canvas } = ctx
    context.clearRect(0, 0, canvas.width, canvas.height)
    for (const i of content) {
      const item = i
      if (item.type === PosterType.image)
        await drawImage(ctx, item)

      else if (item.type === PosterType.text)
        drawText(ctx, item)

      else if (item.type === PosterType.rect)
        drawRect(ctx, item)

      else if (item.type === PosterType.line)
        drawLine(ctx, item)
    }

    return canvas
  }

  const generateDraw = <T extends PosterJson | PosterJson[]>(callback: (context: PosterContext) => T) => {
    if (!isFunction(callback))
      throw new Error('generateDraw callback is not a function')
    return callback(context)
  }

  const generateDrawAsync = async <T extends PosterJson | PosterJson[]>(callback: (context: PosterContext) => Promise<T>) => {
    if (!isFunction(callback))
      throw new Error('generateDraw callback is not a function')
    return await callback(context)
  }
  return {
    context,
    render,
    generateDraw,
    generateDrawAsync,
  }
}
