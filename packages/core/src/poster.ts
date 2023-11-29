/* eslint-disable no-console */
import type { PosterConfig, PosterContext, PosterJson } from './types'
import { PosterType } from './types'
import { isFunction } from './utils'
import { resolveConfig } from './config'
import { createContext } from './context'
import { drawImage, drawLine, drawRect, drawText } from './elements'

export type PosterInstance = ReturnType<typeof createPoster>
export function createPoster(options: PosterConfig = {}, canvasEl?: HTMLCanvasElement) {
  const cfg = resolveConfig(options)
  const context = createContext(cfg, canvasEl)

  const render = async (ctx: PosterContext, content: PosterJson[] = []) => {
    const { context, canvas, config } = ctx

    const { debug } = config
    debug && console.log('[debug] Render', content)

    // fix: flashes as move the picture
    const temp = createContext(config)

    for (const i of content) {
      const item = i
      if (item.type === PosterType.image)
        await drawImage(temp, item)

      else if (item.type === PosterType.text)
        await drawText(temp, item)

      else if (item.type === PosterType.rect)
        await drawRect(temp, item)

      else if (item.type === PosterType.line)
        await drawLine(temp, item)
    }

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(
      temp.canvas,
      0,
      0,
      ctx.config.width,
      ctx.config.height === 'auto' ? ctx.config.width : ctx.config.height,
    )

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
