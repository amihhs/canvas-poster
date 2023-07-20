import type { FontConfig } from './types'

export const isFunction = (val: unknown): val is Function => typeof val === 'function'

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
  return `${fontStyle} ${fontWeight} ${fontSize}px/${lineHeight} ${fontFamily}`
}
