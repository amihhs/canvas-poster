import { PosterType } from './types'
import type { CanvasContext, Color, CustomColor, FontConfig, PosterImage } from './types'

export const isFunction = (val: unknown): val is (...args: any[]) => any => typeof val === 'function'

export function isCustomColor(color: Color): color is CustomColor {
  if (typeof color === 'string' || color instanceof CanvasGradient || color instanceof CanvasPattern)
    return false

  return true
}
// 使用字体时需要先加载字体，否则会使用默认字体
// const myFont = new FontFace('myFont', 'url(./custom.ttf)')
// myFont.load().then(font => {
//   document.fonts.add(font)
// }).then(() => {
//   const cvs = document.querySelector('canvas')
//   const ctx = cvs.getContext('2d')
//   ctx.font = '30px myFont'
//   ctx.fillText('测试', 50, 50)
// })
export function transformFont(config: FontConfig, defaultFont: Required<FontConfig>) {
  const {
    fontSize = defaultFont.fontSize,
    fontStyle = defaultFont.fontStyle,
    fontWeight = defaultFont.fontWeight,
    lineHeight = defaultFont.lineHeight,
    fontFamily = defaultFont.fontFamily,
  } = config || {}
  return `${fontStyle} ${fontWeight} ${fontSize}px/${lineHeight} ${fontFamily || defaultFont.fontFamily}`
}
export function objectFitImage(
  context: CanvasContext,
  config: PosterImage,
  img: HTMLImageElement,
  imageWidth: number,
  imageHeight: number,
) {
  const { x, y, width, height, objectFit } = config || {}
  const containerRatio = height / width
  const imageRatio = imageHeight / imageWidth
  const shortDirection = containerRatio > imageRatio ? 'y' : 'x'

  const d = {
    sx: 0,
    sy: 0,
    sw: imageWidth,
    sh: imageHeight,
    x,
    y,
    width,
    height,
  }
  // none
  switch (objectFit) {
    // 显示全部，短边留白
    case 'contain':{
      if (shortDirection === 'x') {
        d.x = x + (width - width * imageRatio) / 2
        d.width = width * imageRatio
      }
      else {
        d.y = y + (height - height / imageRatio) / 2
        d.height = height / imageRatio
      }
      break
    }
    // 短边填充，长边裁剪
    case 'cover':{
      if (shortDirection === 'x') {
        const sameRatoImageSize = {
          width: imageWidth,
          height: imageWidth * containerRatio,
        }
        d.sx = 0
        d.sy = (imageHeight - sameRatoImageSize.height) / 2
        d.sw = imageWidth
        d.sh = sameRatoImageSize.height
      }
      else {
        const sameRatoImageSize = {
          width: imageHeight / containerRatio,
          height: imageHeight,
        }
        d.sx = (imageWidth - sameRatoImageSize.width) / 2
        d.sy = 0
        d.sw = sameRatoImageSize.width
        d.sh = imageHeight
      }
      break
    }
    // 压缩长边，全部显示
    default:{
      return context.drawImage(img, d.x, d.y, d.width, d.height)
    }
  }
  context.drawImage(img, d.sx, d.sy, d.sw, d.sh, d.x, d.y, d.width, d.height)
}

export function gaussBlur(imgData: ImageData, radius: number = 200, sigma: number = 200): Promise<ImageData> {
  return new Promise((resolve) => {
    const pixes = imgData.data
    const width = imgData.width
    const height = imgData.height
    const gaussMatrix = []
    let gaussSum = 0
    let x
    let y
    let r
    let g
    let b
    let a
    let i
    let j
    let k
    let len

    a = 1 / (Math.sqrt(2 * Math.PI) * sigma)
    b = -1 / (2 * sigma * sigma)

    // 生成高斯矩阵
    for (i = 0, x = -radius; x <= radius; x++, i++) {
      g = a * Math.exp(b * x * x)
      gaussMatrix[i] = g
      gaussSum += g
    }

    // 归一化, 保证高斯矩阵的值在[0,1]之间
    for (i = 0, len = gaussMatrix.length; i < len; i++)
      gaussMatrix[i] /= gaussSum

    // x 方向一维高斯运算
    for (y = 0; y < height; y++) {
      for (x = 0; x < width; x++) {
        r = g = b = a = 0
        gaussSum = 0
        for (j = -radius; j <= radius; j++) {
          k = x + j
          if (k >= 0 && k < width) { // 确保 k 没超出 x 的范围
            // r,g,b,a 四个一组
            i = (y * width + k) * 4
            r += pixes[i] * gaussMatrix[j + radius]
            g += pixes[i + 1] * gaussMatrix[j + radius]
            b += pixes[i + 2] * gaussMatrix[j + radius]
            // a += pixes[i + 3] * gaussMatrix[j];
            gaussSum += gaussMatrix[j + radius]
          }
        }
        i = (y * width + x) * 4
        // 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
        // console.log(gaussSum)
        pixes[i] = r / gaussSum
        pixes[i + 1] = g / gaussSum
        pixes[i + 2] = b / gaussSum
        // pixes[i + 3] = a ;
      }
    }
    // y 方向一维高斯运算
    for (x = 0; x < width; x++) {
      for (y = 0; y < height; y++) {
        r = g = b = a = 0
        gaussSum = 0
        for (j = -radius; j <= radius; j++) {
          k = y + j
          if (k >= 0 && k < height) { // 确保 k 没超出 y 的范围
            i = (k * width + x) * 4
            r += pixes[i] * gaussMatrix[j + radius]
            g += pixes[i + 1] * gaussMatrix[j + radius]
            b += pixes[i + 2] * gaussMatrix[j + radius]
            // a += pixes[i + 3] * gaussMatrix[j];
            gaussSum += gaussMatrix[j + radius]
          }
        }
        i = (y * width + x) * 4
        pixes[i] = r / gaussSum
        pixes[i + 1] = g / gaussSum
        pixes[i + 2] = b / gaussSum
      }
    }

    resolve(imgData)
  })
}
export async function generateGaussBlurImage(options: {
  width: number
  height: number
  radius?: number
  sigma?: number
  src: string
  proxy?: (src: string) => Promise<string>
}): Promise<{ img: string, color: [number, number, number] }> {
  let isProxy = false
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = options.width
    canvas.height = options.height
    const img = new Image()
    img.setAttribute('crossOrigin', 'anonymous')
    img.setAttribute('src', options.src)
    img.onload = async () => {
      objectFitImage(context, {
        type: PosterType.image,
        x: 0,
        y: 0,
        src: options.src,
        width: options.width,
        height: options.height,
        objectFit: 'cover',
      }, img, img.width, img.height)

      const data = context.getImageData(0, 0, options.width, options.height)
      const promises = [
        gaussBlur(data, options.radius, options.sigma),
        analysisColor(data),
      ] as const
      const [emptyData, color] = await Promise.all(promises)
      context.putImageData(emptyData, 0, 0)

      resolve({ img: canvas.toDataURL('image/jpg') || '', color })
    }
    img.onerror = async (error) => {
      if (!options.proxy || !isFunction(options.proxy) || isProxy) {
        console.error('error', error)
        return reject(error)
      }
      isProxy = true
      // eslint-disable-next-line no-console
      console.info('proxy image:', options.src)
      await options.proxy(options.src).then((res) => {
        img.setAttribute('src', res)
      }).catch((err) => {
        console.error('proxy image error:', err)
        reject(err)
      })
    }
  })
}

/**
 * 获取与图片相近的颜色
 * @param data
 */
export async function analysisColor(data: ImageData): Promise<[number, number, number]> {
  return new Promise((resolve) => {
    const scaleRect = data.width * data.height
    let sumR = 0
    let sumG = 0
    let sumB = 0
    for (let i = 0; i < data.data.length; i += 4) {
      sumR += data.data[i]
      sumG += data.data[i + 1]
      sumB += data.data[i + 2]
    }
    const avgR = Math.round(sumR / scaleRect)
    const avgG = Math.round(sumG / scaleRect)
    const avgB = Math.round(sumB / scaleRect)

    resolve([avgR, avgG, avgB])
  })
}
