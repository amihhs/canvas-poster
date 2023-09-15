export type ColorString = string
export type RangeColor = [number, ColorString]

export type Color = PureColor | LineGradientColor | ConicGradientColor | RadialGradientColor
export type ColorType = 'pure' | 'line-gradient' | 'conic-gradient' | 'radial-gradient'
export interface PureColor {
  type: 'pure'
  color: string
}
export interface LineGradientColor {
  type: 'line-gradient'
  positions: [number, number, number, number][]
  colors: [number, string][]
}
export interface ConicGradientColor {
  type: 'conic-gradient'
  positions: [number, number, number][]
  colors: [number, string][]
}
export interface RadialGradientColor {
  type: 'radial-gradient'
  positions: [number, number, number, number, number, number][]
  colors: [number, string][]
}
