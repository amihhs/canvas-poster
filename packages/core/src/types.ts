export type CanvasElement = HTMLCanvasElement
export type CanvasContext = CanvasRenderingContext2D

export interface PosterContext {
  config: _Config
  canvas: CanvasElement
  context: CanvasRenderingContext2D
  font: (config: FontConfig) => string
  updateConfig: (cfg: Partial<PosterConfig>) => void
  sliceText: (data: Omit<CalcTextLineCountOptions, 'width' | 'height' | 'direction'>) => SliceText[]
  calcDPI: (data: number) => number
  calcTextWidth: (text: string, font: string, letterSpacing?: number) => number
  calcTextLineCount: (options: CalcTextLineCountOptions) => number
}

export interface PosterConfig {
  debug?: boolean
  // default: 375
  width?: number
  // default: auto
  height?: number | 'auto'
  // default: 2
  dpi?: number
  // default font style for text
  defaultFont?: Partial<FontConfig>
  // default: '#000000'
  defaultColor?: ColorString
  // if true, will set crossOrigin to 'anonymous'; default: true
  cors?: boolean
  // when cors is true and image load error, will use this proxy to get image
  proxy?: ((src: string) => Promise<string>) | null
}

export interface _Config extends Required<Omit<PosterConfig, 'defaultFont'>> {
  defaultFont: Required<FontConfig>
  scaleWidth: number
  scaleHeight: number | 'auto'
}

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
  // default: 0
  letterSpacing?: number
}

export type Color = ColorString | CanvasGradient | CanvasPattern | CustomColor
export type CustomColor = PureColor | LineGradientColor | ConicGradientColor | RadialGradientColor | PatternColor
export enum ColorType {
  pure = 'pure',
  lineGradient = 'line-gradient',
  conicGradient = 'conic-gradient',
  radialGradient = 'radial-gradient',
  pattern = 'pattern',
}

export type ColorString = string
export interface PureColor {
  type: ColorType.pure
  color: ColorString
}

// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
export interface LineGradientColor {
  type: ColorType.lineGradient
  // createLinearGradient(x0, y0, x1, y1)
  positions: [number, number, number, number] // [x0, y0, x1, y1]
  // gradient.addColorStop(offset, color)
  colors: [number, string][]
}

// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createConicGradient
export interface ConicGradientColor {
  type: ColorType.conicGradient
  // createConicGradient(startAngle, x, y)
  positions: [number, number, number] // [startAngle, x, y]
  colors: [number, string][]
}

// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createRadialGradient
export interface RadialGradientColor {
  type: ColorType.radialGradient
  // createRadialGradient(x0, y0, r0, x1, y1, r1)
  positions: [number, number, number, number, number, number]
  colors: [number, string][]
}

// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createPattern
export interface PatternColor {
  type: ColorType.pattern
  // createPattern(image, repetition)
  src: string
  repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat'
}

export interface CalcTextLineCountOptions extends FontConfig {
  text: string
  width?: number
  height?: number
  lineHeight?: number
  direction?: 'horizontal' | 'vertical'
}
export interface SliceText {
  text: string
  width: number
  height: number
}

export enum PosterType {
  line = 'line',
  image = 'image',
  text = 'text',
  rect = 'rect',
}

export type PosterGenerateDrawFn = (context: PosterContext) => Promise<PosterJson>

/**
 * 画布元素
 */
export type PosterJson = PosterImage | PosterText | PosterRect | PosterLine

//  e.g. OmitJson<PosterJson, PosterType.rect> will get PosterImage | PosterText | PosterLine
export type OmitJson<T extends PosterJson, TYPE extends PosterType> = T extends { type: TYPE } ? never : T

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
  // radius default: 0
  boxRadius?: number
}
/**
 * box-shadow & text-shadow
 */
export interface ShadowConfig {
  shadowColor?: ColorString
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
}
export interface PosterBaseRect extends RadiusConfig, ShadowConfig, PosterBaseJson {
  clip?: boolean
}
export interface PosterRect extends PosterBaseRect {
  type: PosterType.rect
  // default: none
  bgColor?: Color
  // default: 1
  opacity?: number
}

export interface PosterLine {
  type: PosterType.line
  // [x, y][]
  paths: ([number, number, 'moveTo'] | [number, number])[]
  color?: Color
  // default: 1
  lineWidth?: number
  // 线条样式 default: [0, 0] 两个值分别表示虚线的长度和间距
  lineDash?: number[]
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
  color?: Color
  // 这是一个实验中的功能， default: 'inherit'
  // direction?: 'ltr' | 'rtl' | 'inherit'
  // default: 'left', direction 属性会对此属性产生影响, https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/textAlign
  textAlign?: CanvasTextAlign
  // default: 'alphabetic', https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/textBaseline
  textBaseline?: CanvasTextBaseline
  strokeColor?: Color
  // default: fill
  renderType?: 'fill' | 'stroke' | 'fillAndStroke' | 'strokeAndFill'
}
export interface PosterText extends PosterBaseText {
  type: PosterType.text
  // default: false. If true, will use '...' to replace the overflow text
  ellipsis?: string | boolean
}
