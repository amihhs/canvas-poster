import type { FontConfig, PosterConfig, _Config } from './types'

export const DEFAULT_FONT: Required<FontConfig> = {
  fontSize: 14,
  fontFamily: 'sans-serif',
  fontWeight: 'normal',
  fontStyle: 'normal',
  lineHeight: 1,
}
export const DEFAULT_CONFIG: _Config = {
  width: 375,
  height: 'auto',
  dpi: 2,
  cors: true,
  defaultFont: Object.assign({}, DEFAULT_FONT),
  proxy: null,
  scaleWidth: 375 * 2,
  scaleHeight: 'auto',
}
export function resolveConfig(config: PosterConfig = {}) {
  const font = Object.assign({}, DEFAULT_FONT, config.defaultFont)

  const _config: _Config = Object.assign({}, DEFAULT_CONFIG, config)
  _config.defaultFont = font
  _config.scaleWidth = _config.width * _config.dpi
  _config.scaleHeight = _config.height === 'auto' ? 'auto' : _config.height * _config.dpi

  return _config
}
