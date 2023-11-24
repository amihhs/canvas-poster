import type { PosterContext, PosterImage } from '../types'
import { isFunction, objectFitImage } from '../utils'
import { setRadius, setShadow } from './shared'

const proxyImageCache = new Map<string, string>()
export async function drawImage(ctx: PosterContext, options: PosterImage) {
  const { src } = options || {}
  if (!src)
    return

  const { config } = ctx

  let status = false
  if (config.proxy && config.cors) {
    try {
      await anonymousLoadImage(ctx, options)
      status = true
    }
    catch {
      status = false
    }
  }
  !status && await normalLoadImage(ctx, options)
}

function handler(ctx: PosterContext, options: PosterImage, data: {
  img: HTMLImageElement
  resolve: (value: unknown) => void
  status: boolean
}) {
  const { img, resolve, status } = data
  const { context } = ctx

  context.save()
  let imageWidth = 0
  let imageHeight = 0
  // 绘制阴影
  setShadow(context, options)
  // 绘制圆角矩形
  setRadius(context, { ...options, clip: true })

  imageWidth = img.width
  imageHeight = img.height
  objectFitImage(context, options, img, imageWidth, imageHeight)

  context.restore()
  resolve(status)
}
function anonymousLoadImage(ctx: PosterContext, options: PosterImage) {
  const { src } = options || {}

  return new Promise((resolve, reject) => {
    let isProxy = false
    const proxy = ctx.config.proxy
    const img = new Image()
    img.setAttribute('crossOrigin', 'anonymous')
    img.setAttribute('src', src)

    img.onload = () => {
      handler(ctx, options, { img, resolve, status: true })
    }
    img.onerror = async (error) => {
      if (!proxy || !isFunction(proxy) || isProxy) {
        console.error('error', error)
        return reject(error)
      }

      isProxy = true
      const cache = proxyImageCache.get(src)
      if (cache)
        return img.setAttribute('src', cache)

      // eslint-disable-next-line no-console
      console.info('proxy image:', src)
      await proxy(src).then((res) => {
        img.setAttribute('src', res)
        proxyImageCache.set(src, res)
      }).catch((err) => {
        console.error('proxy image error:', err)
        // handler(false)
        reject(error)
      })
    }
  })
}

function normalLoadImage(ctx: PosterContext, options: PosterImage) {
  const { src } = options || {}

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.setAttribute('src', src)
    img.onload = () => {
      handler(ctx, options, { img, resolve, status: true })
    }
    img.onerror = (error) => {
      reject(error)
    }
  })
}
