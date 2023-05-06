import type { FontConfig } from './types'

export const isFunction = (val: unknown): val is Function => typeof val === 'function'

export function transformFont(config: FontConfig, defaultFont: Required<FontConfig>) {
  const {
    fontSize = defaultFont.fontSize,
    fontStyle = defaultFont.fontStyle,
    fontWeight = defaultFont.fontWeight,
    lineHeight = defaultFont.lineHeight,
  } = config || {}
  return `${fontStyle} ${fontWeight} ${fontSize}px/${lineHeight} sans-serif`
}
