export enum PosterType {
  image = 'image',
  text = 'text',
  textEllipsis = 'textEllipsis', // 截取文本绘制
  rect = 'rect',
}
export interface PosterConfig {
  // default: 320
  width?: number
  // default: 452
  height?: number
  // default: 2
  scale?: number
  content?: PosterJson[]
  proxy?: (src: string) => Promise<string>
}
export interface PosterContext {
  width: number
  height: number
  dpi: number
  canvasContext: CanvasRenderingContext2D
  defaultFont: Required<FontConfig>
  font: (config: FontConfig) => string
  getTextWidth: (text: string, font: string, letterSpacing?: number) => number
  getTextLineCount: (width: number, text: string, font: string, letterSpacing?: number) => number
}

export type PosterGenerateDrawFn = (context: PosterContext) => Promise<PosterJson>
export interface FontConfig {
  // default: 14
  fontSize?: number
  // default: 'sans-serif'
  fontFamily?: string
  // default: 'normal'
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number
  // default: 'normal'
  fontStyle?: 'normal' | 'italic' | 'oblique'
  // default: 1.2
  lineHeight?: number
}
/**
 * 画布元素
 */
export type PosterJson = PosterImage | PosterText | PosterEllipsisText | PosterRect
/**
 * 画布元素基础类型
 */
export interface PosterBaseJson {
  x: number
  y: number
  width: number
  height: number
}
/**
 * box-radius
 */
export interface RadiusConfig {
  // 圆角半径， default: 0
  boxRadius?: number
}
/**
 * box-shadow & text-shadow
 */
export interface ShadowConfig {
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
}
export interface PosterBaseRect extends RadiusConfig, ShadowConfig, PosterBaseJson {}
export interface PosterRect extends PosterBaseRect {
  type: PosterType.rect
  // default: none
  bgColor?: string | CanvasGradient | CanvasPattern
  // default: 1
  opacity?: number
}
/**
 * 画布元素：图片
 */
export type ObjectFit = 'none' | 'fill' | 'contain' | 'cover' | 'scale-down'

export interface PosterImage extends PosterBaseRect {
  type: PosterType.image
  src: string
  objectFit?: ObjectFit
}
/**
 * 画布元素：文本
 */
export interface PosterBaseText extends PosterBaseJson, ShadowConfig, FontConfig {
  text: string
  color: string
  letterSpacing?: number
  // 这是一个实验中的功能， default: 'inherit'
  // direction?: 'ltr' | 'rtl' | 'inherit'
  // default: 'left', direction 属性会对此属性产生影响, https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/textAlign
  textAlign?: CanvasTextAlign
  // default: 'alphabetic', https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/textBaseline
  textBaseline?: CanvasTextBaseline
}
export interface PosterText extends PosterBaseText {
  type: PosterType.text
}
export interface PosterEllipsisText extends PosterBaseText {
  type: PosterType.textEllipsis
  width: number
  height: number
  // default: '...'
  ellipsis?: string
}
