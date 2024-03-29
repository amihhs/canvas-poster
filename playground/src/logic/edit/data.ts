import type {
  FontConfig,
  PosterBaseJson,
  PosterBaseText,
  PosterImage,
  PosterJson,
  PosterLine,
  PosterRect,
  PosterText,
  ShadowConfig,
} from '@amihhs/canvas-poster'

import { PosterType } from '@amihhs/canvas-poster'

const baseDefault: PosterBaseJson = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
}
const baseFont: FontConfig = {
  fontSize: 14,
  fontWeight: 'normal',
  fontStyle: 'normal',
  lineHeight: 1,
  letterSpacing: 0,
}
const baseShadow: ShadowConfig = {
  shadowColor: '#000000',
  shadowBlur: undefined,
  shadowOffsetX: undefined,
  shadowOffsetY: undefined,
}
const baseText: PosterBaseText = {
  text: 'Hello World',
  ...baseFont,
  color: '#000',
  textAlign: 'left',
  textBaseline: 'top',
  renderType: 'fill',
  ...baseShadow,
  ...baseDefault,
  width: 80,
  height: (baseFont.fontSize || 14) * (baseFont.lineHeight || 1),
}

const lineDefaultForm: PosterLine = {
  type: PosterType.line,
  ...baseDefault,
  paths: [],
  color: '#000',
  lineWidth: 1,
  lineDash: [0, 0],
}
const imageDefaultForm: PosterImage = {
  type: PosterType.image,
  ...baseDefault,
  src: `${window.location.origin}/logo.svg`,
}
const rectDefaultForm: PosterRect = {
  type: PosterType.rect,
  ...baseDefault,
  ...baseShadow,
  boxRadius: 0,
  bgColor: '#000',
  opacity: 1,
}
const textDefaultForm: PosterText = {
  type: PosterType.text,
  ...baseText,
}

export const JSON_BASE_FORM = {
  line: lineDefaultForm,
  rect: rectDefaultForm,
  text: textDefaultForm,
  image: imageDefaultForm,
} as Record<PosterType, PosterJson>
